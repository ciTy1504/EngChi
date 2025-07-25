// src/features/grammar/GrammarQuizPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import { useTranslations } from '../../hooks/useTranslations';
import { apiService } from '../../api/apiService';
import BackButton from '../../components/shared/BackButton';
// THAY ĐỔI: Import QuestionRenderer từ vị trí mới
import QuestionRenderer from './components/QuestionRenderer'; 
import { toast } from 'react-hot-toast';

const GrammarQuizPage = () => {
    const { lessonId } = useParams();
    const { language } = useContext(LanguageContext);
    const t = useTranslations();

    const [questions, setQuestions] = useState([]);
    const [topicTitle, setTopicTitle] = useState('');
    const [userAnswers, setUserAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuizQuestions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Giả sử API trả về câu hỏi cho một chủ đề cụ thể
                // Ví dụ: /lessons/grammar/parts-of-speech/quiz
                // Trong thực tế, bạn sẽ cần một endpoint để lấy câu hỏi theo ID hoặc slug
                const response = await apiService(`/lessons/${lessonId}/quiz-questions`);
                setQuestions(response.data.questions);
                setTopicTitle(response.data.topicTitle);
                // Khởi tạo userAnswers
                const initialAnswers = {};
                response.data.questions.forEach(q => {
                    initialAnswers[q._id] = q.qType === 'multiple_choice_multiple' ? [] : undefined;
                });
                setUserAnswers(initialAnswers);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuizQuestions();
    }, [lessonId]);

    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        
        const newResults = {};
        questions.forEach(q => {
            const questionIdStr = q._id;
            const userAnswer = userAnswers[questionIdStr];
            let isCorrect = false;
            let correctAnswerText = '';

            switch (q.qType) {
                case 'multiple_choice_single': {
                    const correctOption = q.options.find(opt => opt.isCorrect);
                    isCorrect = userAnswer && userAnswer[0] === correctOption?._id;
                    correctAnswerText = correctOption?.text || 'N/A';
                    break;
                }
                case 'multiple_choice_multiple': {
                    const correctOptionIds = new Set(q.options.filter(opt => opt.isCorrect).map(opt => opt._id));
                    const userAnswerIds = new Set(userAnswer || []);
                    isCorrect = correctOptionIds.size === userAnswerIds.size && [...correctOptionIds].every(id => userAnswerIds.has(id));
                    correctAnswerText = q.options.filter(opt => opt.isCorrect).map(opt => opt.text).join(', ');
                    break;
                }
                case 'fill_in_blank': {
                    const correctAnswers = q.answers.map(a => a.toLowerCase().trim());
                    isCorrect = correctAnswers.includes((userAnswer || '').toLowerCase().trim());
                    correctAnswerText = q.answers.join(' / ');
                    break;
                }
                default:
                    break;
            }

            newResults[questionIdStr] = { isCorrect, correctAnswer: correctAnswerText };
        });

        setResults(newResults);
        setIsSubmitting(false);
        toast.success(t.answers_submitted);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) return <div className="text-center p-10">{t.loading}</div>;
    if (error) return <div className="text-center p-10 text-red-500">{t.error_prefix}: {error}</div>;

    const allQuestionsAnswered = questions.every(q => {
        const answer = userAnswers[q._id];
        if (answer === undefined || answer === null) return false;
        if (Array.isArray(answer)) return answer.length > 0;
        return String(answer).trim() !== '';
    });

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <BackButton to={`/${language}/grammar/practice`} className="mb-8" />
            
            <h1 className="text-3xl font-bold text-center mb-8">
                {t.grammar_quiz_title.replace('{topic}', topicTitle)}
            </h1>
            <div className="space-y-6">
                {questions.map((q, index) => (
                    <QuestionRenderer
                        key={q._id}
                        question={q}
                        index={index}
                        userAnswer={userAnswers[q._id]}
                        onAnswerChange={handleAnswerChange}
                        isSubmitted={!!results}
                        result={results ? results[q._id] : null} 
                        showTheoryLinkOnWrong={true}
                    />
                ))}
            </div>
            <div className="mt-8 text-center">
                {!results && (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !allQuestionsAnswered}
                        className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? t.reading_submitting : t.reading_submit_answers}
                    </button>
                )}
            </div>
        </div>
    );
};

export default GrammarQuizPage;