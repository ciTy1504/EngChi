// File: src/features/vocab/QuizResults.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../../hooks/useTranslations';
import QuestionNavigator from './QuestionNavigator';
import { apiService } from '../../api/apiService';
import { toast } from 'react-hot-toast'; 

const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const BookmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
const RepeatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>;

const ActionButton = ({ text, icon, onClick, isSelected, colorClasses }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
            isSelected
                ? `${colorClasses.selectedBg} ${colorClasses.selectedText} ${colorClasses.selectedBorder} shadow-md`
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
    >
        {icon}
        <span>{text}</span>
    </button>
);

const QuizResults = ({ results, progressId, lesson, language, isReviewMode }) => {
    const t = useTranslations();
    const navigate = useNavigate();
    const itemRefs = useRef([]);
    const [wordActions, setWordActions] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const initialActions = {};
        results.forEach(result => {
            if (result.isCorrect) {
                // THAY ĐỔI 1: Cấu trúc state mới
                // Mặc định: Giữ lại (keep) và không review (review: false)
                initialActions[result.wordData.word] = {
                    mainAction: isReviewMode ? 'keep' : 'delete', // Logic cũ của bạn, có thể thay đổi thành 'keep' cho cả 2 nếu muốn
                    review: false
                };
            }
        });
        setWordActions(initialActions);
    }, [results, isReviewMode]);


    // THAY ĐỔI 2: Logic xử lý click nút mới
    const handleActionChange = (word, actionClicked) => {
        setWordActions(prev => {
            const currentActions = { ...prev[word] }; // Lấy state hiện tại của từ

            if (actionClicked === 'review') {
                // Đảo ngược trạng thái review
                currentActions.review = !currentActions.review;
            } else {
                // 'keep' và 'delete' là các hành động chính, loại trừ lẫn nhau
                currentActions.mainAction = actionClicked;
            }
            
            return { ...prev, [word]: currentActions };
        });
    };

    const handleUpdateProgress = async () => {
        setIsUpdating(true);
        try {
            const wordsToMaster = [];
            const wordsToReviewLater = [];

            results.forEach(result => {
                if (!result.isCorrect) return; 

                // THAY ĐỔI 3: Đọc từ cấu trúc state mới
                const actions = wordActions[result.wordData.word];
                if (!actions) return; // Bỏ qua nếu không có action nào được set

                const wordData = { word: result.wordData.word, lessonId: result.masterLessonId };
                
                // Nếu mainAction là 'delete', nó sẽ được master
                if (actions.mainAction === 'delete') { 
                    wordsToMaster.push(wordData);
                } 
                
                // Nếu 'review' được chọn (là true), thêm vào danh sách review
                // Điều này độc lập với mainAction
                if (actions.review) { 
                    wordsToReviewLater.push(wordData);
                }
            });

            // Logic API phía dưới giữ nguyên vì nó đã được thiết kế để xử lý 2 mảng riêng biệt
            const updatePromises = [];
            if (!isReviewMode && wordsToReviewLater.length > 0) {
                const payload = {
                    action: 'review_words',
                    payload: { words: wordsToReviewLater.map(w => ({ word: w.word, masterLessonId: w.lessonId })) }
                };
                updatePromises.push(
                    apiService(`/progress/${progressId}`, { method: 'PUT', body: JSON.stringify(payload) })
                );
            }

            if (wordsToMaster.length > 0) {
                if (isReviewMode) {
                    const wordsByLesson = wordsToMaster.reduce((acc, word) => {
                        acc[word.lessonId] = acc[word.lessonId] || [];
                        acc[word.lessonId].push(word.word);
                        return acc;
                    }, {});

                    for (const lessonId in wordsByLesson) {
                        const progressResponse = await apiService(`/lessons/${lessonId}/start`);
                        const pId = progressResponse.userProgress?._id;
                        if (pId) {
                            const payload = {
                                action: 'remove_review_words',
                                payload: { words: wordsByLesson[lessonId] }
                            };
                            updatePromises.push(
                                apiService(`/progress/${pId}`, { method: 'PUT', body: JSON.stringify(payload) })
                            );
                        }
                    }
                } else {
                    const payload = {
                        action: 'delete_words',
                        payload: { words: wordsToMaster.map(w => w.word) }
                    };
                    updatePromises.push(
                        apiService(`/progress/${progressId}`, { method: 'PUT', body: JSON.stringify(payload) })
                    );
                }
            }
            
            if (updatePromises.length > 0) {
                await Promise.all(updatePromises);
            }

            toast.success(t.quiz_results_save_success);
            navigate(`/${language}/vocab`);

        } catch (error)
        {
            console.error("Error saving progress:", error);
            toast.error(`${t.quiz_results_save_error} ${error.message}`);
        } finally {
            setIsUpdating(false);
        }
    };
    
    const handleNavigate = (index) => {
        itemRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const correctCount = results.filter(r => r.isCorrect).length;
    const totalCount = results.length;

    if (!results || results.length === 0) return <div>{t.loading_results}</div>;

    const pageTitle = isReviewMode 
        ? "Kết quả Ôn tập" 
        : t.quiz_results_title.replace('{level}', lesson?.level?.toUpperCase() || '...');
    
    return (
        <div className="w-full max-w-6xl mx-auto p-4 animate-fade-in bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-2">{pageTitle}</h1>
            <p className="text-center text-5xl font-bold mb-6">{correctCount} / {totalCount}</p>
            <div className="max-w-xl mx-auto mb-8">
                <QuestionNavigator questions={results} onNavigate={handleNavigate} isRevealingResults={true} />
            </div>
            
            <div className="space-y-4">
                {results.map((result, index) => {
                    const currentWordActions = wordActions[result.wordData.word];
                    return (
                        <div key={result.wordData.word} ref={el => itemRefs.current[index] = el} className={`p-4 rounded-lg border-l-4 ${result.isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                            <p className="font-bold text-lg">{index + 1}. {result.wordData.word}</p>
                            {result.wordData.pronounce && (
                                <p className="text-gray-500 text-base">/{result.wordData.pronounce}/</p>
                            )}
                            <p>
                                <span className="font-semibold">{t.quiz_results_your_answer} </span>
                                <span className={result.isCorrect ? 'text-green-700' : 'text-red-700'}>{result.userAnswer || t.quiz_results_unanswered}</span>
                            </p>
                            <p><span className="font-semibold">{t.quiz_results_correct_answer}</span> {result.wordData.meaning}</p>
                            
                            {result.isCorrect && currentWordActions && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <span className="font-semibold mr-4 text-sm text-gray-700">{t.quiz_results_word_action_prompt}</span>
                                    <div className="flex items-center gap-3 mt-1">
                                        <ActionButton
                                            text={t.quiz_results_action_keep}
                                            icon={<RepeatIcon />}
                                            onClick={() => handleActionChange(result.wordData.word, 'keep')}
                                            // THAY ĐỔI 4: Điều kiện isSelected mới
                                            isSelected={currentWordActions.mainAction === 'keep'}
                                            colorClasses={{ selectedBg: 'bg-blue-500', selectedText: 'text-white', selectedBorder: 'border-blue-600' }}
                                        />
                                        
                                        {!isReviewMode && (
                                            <ActionButton
                                                text={t.quiz_results_action_review}
                                                icon={<BookmarkIcon />}
                                                onClick={() => handleActionChange(result.wordData.word, 'review')}
                                                // THAY ĐỔI 4: Điều kiện isSelected mới
                                                isSelected={currentWordActions.review}
                                                colorClasses={{ selectedBg: 'bg-purple-500', selectedText: 'text-white', selectedBorder: 'border-purple-600' }}
                                            />
                                        )}

                                        <ActionButton
                                            text={t.quiz_results_action_delete}
                                            icon={<CheckIcon />}
                                            onClick={() => handleActionChange(result.wordData.word, 'delete')}
                                            // THAY ĐỔI 4: Điều kiện isSelected mới
                                            isSelected={currentWordActions.mainAction === 'delete'}
                                            colorClasses={{ selectedBg: 'bg-green-500', selectedText: 'text-white', selectedBorder: 'border-green-600' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            
            <div className="mt-8 mb-8 p-4 bg-gray-100 rounded-lg text-center max-w-2xl mx-auto">
                 <p className="mb-2 text-sm text-gray-600">{isReviewMode ? t.quiz_results_instructions_review : t.quiz_results_instructions}</p>
                 <button 
                    onClick={handleUpdateProgress}
                    className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                    disabled={isUpdating}
                 >
                    {isUpdating ? t.quiz_results_saving : t.quiz_results_save_and_finish}
                 </button>
            </div>

            <div className="mt-8 text-center">
                 <button onClick={() => navigate(`/${language}/vocab`)} className="text-blue-600 hover:underline font-semibold">
                    {t.quiz_choose_another_level}
                 </button>
            </div>
        </div>
    );
};

export default QuizResults;