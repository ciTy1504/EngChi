// src/components/quiz/QuizResults.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../../hooks/useTranslations';
import QuestionNavigator from './QuestionNavigator';
import { apiService } from '../../api/apiService';
import { toast } from 'react-hot-toast'; // Import toast for better notifications

const QuizResults = ({ results, progressId, lesson, language }) => {
    const t = useTranslations();
    const navigate = useNavigate();
    const itemRefs = useRef([]);
    const [wordActions, setWordActions] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const initialActions = {};
        results.forEach(result => {
            if (result.isCorrect) {
                initialActions[result.wordData.word] = 'keep';
            }
        });
        setWordActions(initialActions);
    }, [results]);

    const handleActionChange = (word, action) => {
        setWordActions(prev => ({ ...prev, [word]: action }));
    };

    const handleUpdateProgress = async () => {
        setIsUpdating(true);
        const wordsToDelete = [];
        const wordsToReview = [];

        results.forEach(result => {
            if (result.isCorrect) {
                const action = wordActions[result.wordData.word];
                if (action === 'delete') {
                    wordsToDelete.push(result.wordData.word);
                } else if (action === 'review') {
                    wordsToReview.push(result.wordData.word);
                }
            }
        });

        try {
            const updatePromises = [];
            if (wordsToDelete.length > 0) {
                updatePromises.push(
                    apiService(`/lessons/progress/${progressId}`, {
                        method: 'PUT',
                        body: JSON.stringify({ action: 'delete_words', payload: { words: wordsToDelete } })
                    })
                );
            }
            if (wordsToReview.length > 0) {
                updatePromises.push(
                    apiService(`/lessons/progress/${progressId}`, {
                        method: 'PUT',
                        body: JSON.stringify({ action: 'review_words', payload: { words: wordsToReview } })
                    })
                );
            }
            
            await Promise.all(updatePromises);

            toast.success(t.quiz_results_save_success);
            navigate(`/${language}/vocab`);
        } catch (error) {
            console.error("Error saving progress:", error);
            toast.error(`${t.quiz_results_save_error} ${error.message}`);
        } finally {
            setIsUpdating(false);
        }
    };
    
    const handleNavigate = (index) => {
        itemRefs.current[index]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    };

    const correctCount = results.filter(r => r.isCorrect).length;
    const totalCount = results.length;

    if (!lesson || !progressId) {
        return <div>{t.loading_results}</div>;
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4 animate-fade-in bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-2">{t.quiz_results_title.replace('{level}', lesson.level.toUpperCase())}</h1>
            <p className="text-center text-5xl font-bold mb-6">
                {correctCount} / {totalCount}
            </p>

            <div className="max-w-xl mx-auto mb-8">
                 <QuestionNavigator 
                    questions={results}
                    onNavigate={handleNavigate}
                    isRevealingResults={true}
                />
            </div>
            
            <div className="space-y-4">
                {results.map((result, index) => (
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
                        
                         {result.isCorrect && (
                            <div className="mt-2 pt-2 border-t border-green-200">
                                <span className="font-semibold mr-4 text-sm text-gray-700">{t.quiz_results_word_action_prompt}</span>
                                <div className="inline-flex rounded-md shadow-sm mt-1" role="group">
                                    <button onClick={() => handleActionChange(result.wordData.word, 'keep')} type="button" className={`px-4 py-1 text-sm font-medium border ${wordActions[result.wordData.word] === 'keep' ? 'bg-blue-600 text-white z-10 ring-2 ring-blue-500' : 'bg-white text-gray-900 hover:bg-gray-100'} border-gray-200 rounded-l-lg`}>
                                        {t.quiz_results_action_keep}
                                    </button>
                                    <button onClick={() => handleActionChange(result.wordData.word, 'review')} type="button" className={`px-4 py-1 text-sm font-medium border-t border-b ${wordActions[result.wordData.word] === 'review' ? 'bg-purple-600 text-white z-10 ring-2 ring-purple-500' : 'bg-white text-gray-900 hover:bg-gray-100'} border-gray-200`}>
                                        {t.quiz_results_action_review}
                                    </button>
                                    <button onClick={() => handleActionChange(result.wordData.word, 'delete')} type="button" className={`px-4 py-1 text-sm font-medium border ${wordActions[result.wordData.word] === 'delete' ? 'bg-red-600 text-white z-10 ring-2 ring-red-500' : 'bg-white text-gray-900 hover:bg-gray-100'} border-gray-200 rounded-r-md`}>
                                        {t.quiz_results_action_delete}
                                    </button>
                                </div>
                            </div>
                         )}
                    </div>
                ))}
            </div>
            
            <div className="mt-8 mb-8 p-4 bg-gray-100 rounded-lg text-center max-w-2xl mx-auto">
                 <p className="mb-2">{t.quiz_results_instructions}</p>
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