// File: src/features/vocab/QuizPage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { checkVocabulary } from '../../api/aiAPI';
import { LanguageContext } from '../../contexts/LanguageContext';
import { useTranslations } from '../../hooks/useTranslations';
import QuestionNavigator from './components/QuestionNavigator';
import QuizResults from './components/QuizResults.jsx';
import { apiService } from '../../api/apiService';

const shuffleArray = (array) => [...array].sort(() => 0.5 - Math.random());

const BATCH_SIZE = 10;

const QuizPage = ({ isReviewMode = false }) => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { language } = useContext(LanguageContext);
    const t = useTranslations();
    const inputRef = useRef(null);

    const [quizState, setQuizState] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [isRevealingResults, setIsRevealingResults] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [pageTitle, setPageTitle] = useState('');

    const aiCheckQueue = useRef(new Map());
    const isCheckingBatch = useRef(false);

    const [progressId, setProgressId] = useState(null);
    const [masterLesson, setMasterLesson] = useState(null);

    useEffect(() => {
        const fetchVocabAndInitState = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                let quizData = [];
                if (isReviewMode) {
                    setPageTitle("Chế độ ôn tập");
                    const response = await apiService('/vocab/review-words');
                    quizData = response.data;
                    setMasterLesson(null);
                    setProgressId(null);
                } else {
                    const response = await apiService(`/lessons/${lessonId}/start`);
                    const { masterLesson, userProgress } = response;
                    
                    setMasterLesson(masterLesson);
                    setProgressId(userProgress._id);
                    setPageTitle(t.quiz_title.replace('{level}', masterLesson.level.toUpperCase()));

                    const deletedWordsSet = new Set(userProgress.progressData.deletedWords);
                    const wordsToLearn = masterLesson.content.words.filter(word => !deletedWordsSet.has(word.word));
                    
                    const selectedWords = shuffleArray(wordsToLearn).slice(0, 50);
                    quizData = selectedWords.map(word => ({ wordData: word, masterLessonId: masterLesson._id }));
                }

                if (quizData.length > 0) {
                    const initialState = shuffleArray(quizData).map(item => ({
                        wordData: item.wordData,
                        masterLessonId: item.masterLessonId, 
                        userAnswer: '',
                        status: 'unanswered',
                        isCorrect: null,
                        error: null,
                    }));
                    setQuizState(initialState);
                } else {
                    setQuizState([]);
                }
            } catch (err) {
                setFetchError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVocabAndInitState();
    }, [lessonId, isReviewMode, t.quiz_title, language]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [currentIndex]);
    
    // Các hàm xử lý logic (giữ nguyên, không cần sửa)
    const triggerAIBatchCheck = async (force = false) => {
        if (isCheckingBatch.current) return;
        if (aiCheckQueue.current.size === 0) return;
        if (aiCheckQueue.current.size < BATCH_SIZE && !force) return;

        isCheckingBatch.current = true;
        const batchToProcess = new Map(aiCheckQueue.current);
        aiCheckQueue.current.clear();

        const wordPairs = Array.from(batchToProcess.entries()).map(([word, answer]) => ({
            sourceWord: word, userInput: answer,
        }));
        
        try {
            setQuizState(prevState => {
                const newState = [...prevState];
                wordPairs.forEach(pair => {
                    const qIndex = newState.findIndex(q => q.wordData.word === pair.sourceWord);
                    if (qIndex !== -1) {
                         newState[qIndex] = { ...newState[qIndex], status: 'checking_ai' };
                    }
                });
                return newState;
            });

            const apiResult = await checkVocabulary(wordPairs, language);
            
            setQuizState(prevState => {
                const newState = [...prevState];
                wordPairs.forEach((pair, index) => {
                    const qIndex = newState.findIndex(q => q.wordData.word === pair.sourceWord);
                    if (qIndex !== -1) {
                        const isCorrect = apiResult.results?.[index]?.isCorrect ?? false;
                        const error = apiResult.error ? (apiResult.error || "Error checking answer.") : null;
                        newState[qIndex] = { ...newState[qIndex], status: 'checked_final', isCorrect, error };
                    }
                });
                return newState;
            });
        } catch (err) {
            console.error("Error during batch check:", err);
             setQuizState(prevState => {
                const newState = [...prevState];
                wordPairs.forEach(pair => {
                    const qIndex = newState.findIndex(q => q.wordData.word === pair.sourceWord);
                    if (qIndex !== -1) {
                        newState[qIndex] = { ...newState[qIndex], status: 'checked_final', isCorrect: false, error: 'API Error during check.' };
                    }
                });
                return newState;
            });
        } finally {
            isCheckingBatch.current = false;
        }
    };
    
    const handleQuestionSubmit = () => {
        const questionIndex = currentIndex;
        const question = quizState[questionIndex];
        const userAnswer = question.userAnswer.trim();

        if (!userAnswer) {
            if (questionIndex < quizState.length - 1) navigateToQuestion(questionIndex + 1);
            return;
        }

        let updatedQuestionState = {};
        const correctAnswer = question.wordData.meaning.trim();

        if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
            updatedQuestionState = { status: 'checked_correct', isCorrect: true };
            aiCheckQueue.current.delete(question.wordData.word);
        } else {
            updatedQuestionState = { status: 'submitted_ai', isCorrect: null };
            aiCheckQueue.current.set(question.wordData.word, userAnswer);
        }
        setQuizState(prevState => 
            prevState.map((q, i) => i === questionIndex ? { ...q, ...updatedQuestionState, userAnswer } : q)
        );
        triggerAIBatchCheck();
        if (questionIndex < quizState.length - 1) {
            navigateToQuestion(questionIndex + 1);
        }
    };

    const handleInputChange = (e) => {
        setQuizState(prevState => prevState.map((q, i) => 
            i === currentIndex ? { ...q, userAnswer: e.target.value } : q
        ));
    };

    const navigateToQuestion = (index) => {
        if (index >= 0 && index < quizState.length) {
            setCurrentIndex(index);
        }
    };

    const handleFinishQuiz = () => {
        triggerAIBatchCheck(true); 
        setIsRevealingResults(true);
    };

    const handleGoToSummary = () => setIsFinished(true);


    if (isLoading) {
        return <div className="text-center p-10">{t.loading}</div>;
    }

    if (fetchError) {
        return <div className="text-center p-10 font-bold text-red-600">{t.error_prefix}: {fetchError}</div>;
    }
    
    if (isFinished) {
        return <QuizResults 
            results={quizState}
            progressId={progressId} 
            lesson={masterLesson} 
            language={language}
            isReviewMode={isReviewMode}
        />;
    }

    // Xử lý trường hợp không có từ vựng để học/ôn tập
    if (quizState.length === 0) {
        const congratsBody = isReviewMode
            ? "Bạn không có từ nào cần ôn tập. Hãy tiếp tục học bài mới!"
            : t.quiz_congrats_body.replace('{level}', masterLesson?.level?.toUpperCase() || '');

        return (
             <div className="text-center p-10">
                <h2 className="text-2xl font-bold mb-4">{t.quiz_congrats_title}</h2>
                <p className="text-gray-600">{congratsBody}</p>
                <button onClick={() => navigate(`/${language}/vocab`)} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    {t.quiz_choose_another_level}
                </button>
            </div>
        );
    }
    
    // Nếu có quizState, chúng ta chắc chắn có thể render giao diện
    const currentQuestion = quizState[currentIndex];
    const showPronounce = !isReviewMode && masterLesson && masterLesson.language !== 'zh';
    const allQuestionsAttempted = quizState.every(q => q.status !== 'unanswered');

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg-w-2/5 xl:w-1/3">
                    <QuestionNavigator 
                        questions={quizState}
                        currentIndex={currentIndex}
                        onNavigate={navigateToQuestion}
                        isRevealingResults={isRevealingResults}
                    />
                    <div className="mt-4 text-center">
                        {!isRevealingResults ? (
                            <button 
                                onClick={handleFinishQuiz}
                                className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                disabled={!allQuestionsAttempted || isCheckingBatch.current}
                            >
                                { isCheckingBatch.current ? t.quiz_checking_all : (allQuestionsAttempted ? t.quiz_finish_and_review : t.quiz_please_answer_all) }
                            </button>
                        ) : (
                            <button 
                                onClick={handleGoToSummary}
                                className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                {t.quiz_view_summary}
                            </button>
                        )}
                    </div>
                </div>

                <div className="w-full lg-w-3/5 xl:w-2/3">
                    <h1 className="text-3xl font-bold text-center mb-6">{pageTitle}</h1>
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center sticky top-8">
                        <p className="text-sm font-semibold text-gray-500 mb-2">
                            {t.quiz_question_progress.replace('{current}', currentIndex + 1).replace('{total}', quizState.length)}
                        </p>
                        <h2 className="text-5xl sm:text-6xl font-bold text-gray-800 break-words mb-8">
                            {currentQuestion.wordData.word}
                        </h2>

                        {showPronounce && (
                            <p className="text-lg sm:text-xl text-gray-500 -mt-6 mb-8">
                                /{currentQuestion.wordData.pronounce}/
                            </p>
                        )}
                        
                        <input
                            ref={inputRef}
                            type="text"
                            value={currentQuestion.userAnswer}
                            onChange={handleInputChange}
                            placeholder={t.vocab_placeholder || "Type the meaning here..."}
                            className="w-full max-w-md p-3 border-2 border-gray-300 rounded-lg text-lg text-center focus:border-blue-500 focus:ring-blue-500 transition"
                            onKeyDown={(e) => { if (e.key === 'Enter') handleQuestionSubmit(); }}
                            disabled={isRevealingResults}
                        />

                        <div className="h-24 mt-4">
                            {isRevealingResults && ['checked_correct', 'submitted_ai', 'checking_ai', 'checked_final'].includes(currentQuestion.status) && (
                                <div className={`p-3 rounded-md text-left animate-fade-in ${currentQuestion.isCorrect ? 'bg-green-100' : currentQuestion.isCorrect === false ? 'bg-red-100' : 'bg-yellow-100'}`}>
                                    {currentQuestion.status === 'checking_ai' || (currentQuestion.status === 'submitted_ai' && currentQuestion.isCorrect === null) ? (
                                        <p className="font-semibold text-yellow-800">{t.quiz_awaiting_final_results}</p>
                                    ) : currentQuestion.isCorrect ? (
                                        <p className="font-bold text-green-700">{t.quiz_correct}</p>
                                    ) : (
                                        <div>
                                            <p className="font-bold text-red-700">{t.quiz_incorrect}</p>
                                            <p><span className="font-semibold">{t.quiz_results_correct_answer}</span> {currentQuestion.wordData.meaning}</p>
                                        </div>
                                    )}
                                    {currentQuestion.error && <p className="text-red-600 font-semibold mt-2">{currentQuestion.error}</p>}
                                </div>
                            )}
                        </div>

                        {!isRevealingResults && (
                            <button
                                onClick={handleQuestionSubmit}
                                className="mt-2 w-full max-w-md px-8 py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
                            >
                                {t.quiz_submit_and_next}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizPage;