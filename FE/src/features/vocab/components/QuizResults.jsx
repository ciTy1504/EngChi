// File: src/features/vocab/components/QuizResults.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../../../hooks/useTranslations';
import QuestionNavigator from './QuestionNavigator';
import { apiService } from '../../../api/apiService';
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
                initialActions[result.wordData.word] = 'keep';
            }
        });
        setWordActions(initialActions);
    }, [results]);


    const handleActionChange = (word, newAction) => {
        setWordActions(prev => ({ ...prev, [word]: newAction }));
    };

    const handleUpdateProgress = async () => {
        setIsUpdating(true);
        try {
            const wordsToDeleteByLesson = {};
            const wordsToReviewByLesson = {};
            const wordsToRemoveFromReview = {}; 

            results.forEach(result => {
                if (result.isCorrect) {
                    const action = wordActions[result.wordData.word];
                    const lessonId = isReviewMode ? result.masterLessonId : lesson._id;

                    if (action === 'delete') {
                        if (!wordsToDeleteByLesson[lessonId]) wordsToDeleteByLesson[lessonId] = [];
                        wordsToDeleteByLesson[lessonId].push(result.wordData.word);
                    } 
                    else if (action === 'review') {
                        if (!wordsToReviewByLesson[lessonId]) wordsToReviewByLesson[lessonId] = [];
                        wordsToReviewByLesson[lessonId].push({ word: result.wordData.word, masterLessonId: lessonId });
                    }
                    else if (action === 'review_and_delete') {
                        if (!wordsToDeleteByLesson[lessonId]) wordsToDeleteByLesson[lessonId] = [];
                        if (!wordsToReviewByLesson[lessonId]) wordsToReviewByLesson[lessonId] = [];
                        wordsToDeleteByLesson[lessonId].push(result.wordData.word);
                        wordsToReviewByLesson[lessonId].push({ word: result.wordData.word, masterLessonId: lessonId });
                    }

                    if (isReviewMode && (action === 'delete' || action === 'review_and_delete')) {
                        if (!wordsToRemoveFromReview[lessonId]) wordsToRemoveFromReview[lessonId] = [];
                        wordsToRemoveFromReview[lessonId].push(result.wordData.word);
                    }
                }
            });

            const updatePromises = [];
            const progressIdsCache = {}; 

            const getProgressId = async (lessonId) => {
                if (progressIdsCache[lessonId]) return progressIdsCache[lessonId];
                if (!isReviewMode) {
                    progressIdsCache[lessonId] = progressId;
                    return progressId;
                }
                const res = await apiService(`/lessons/${lessonId}/start`);
                const pId = res.userProgress?._id;
                progressIdsCache[lessonId] = pId;
                return pId;
            };

            for (const lessonId in wordsToDeleteByLesson) {
                const pId = await getProgressId(lessonId);
                if (pId) updatePromises.push(apiService(`/lessons/progress/${pId}`, { method: 'PUT', body: JSON.stringify({ action: 'delete_words', payload: { words: wordsToDeleteByLesson[lessonId] } }) }));
            }
            for (const lessonId in wordsToReviewByLesson) {
                const pId = await getProgressId(lessonId);
                if (pId) updatePromises.push(apiService(`/lessons/progress/${pId}`, { method: 'PUT', body: JSON.stringify({ action: 'review_words', payload: { words: wordsToReviewByLesson[lessonId] } }) }));
            }
            if (isReviewMode) {
                for (const lessonId in wordsToRemoveFromReview) {
                    const pId = await getProgressId(lessonId);
                    if (pId) updatePromises.push(apiService(`/lessons/progress/${pId}`, { method: 'PUT', body: JSON.stringify({ action: 'remove_review_words', payload: { words: wordsToRemoveFromReview[lessonId] } }) }));
                }
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

    if (!results || results.length === 0) {
        return <div>{t.loading_results}</div>;
    }

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
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <span className="font-semibold mr-4 text-sm text-gray-700">{t.quiz_results_word_action_prompt}</span>
                                <div className="flex items-center gap-3 mt-1">
                                    <ActionButton
                                        text={t.quiz_results_action_keep}
                                        icon={<RepeatIcon />}
                                        onClick={() => handleActionChange(result.wordData.word, 'keep')}
                                        isSelected={wordActions[result.wordData.word] === 'keep'}
                                        colorClasses={{ selectedBg: 'bg-blue-500', selectedText: 'text-white', selectedBorder: 'border-blue-600' }}
                                    />

                                    <ActionButton
                                        text={t.quiz_results_action_review}
                                        icon={<BookmarkIcon />}
                                        onClick={() => {
                                            const currentAction = wordActions[result.wordData.word];
                                            let newAction;
                                            if (currentAction === 'review') {
                                                newAction = 'keep'; 
                                            } else if (currentAction === 'review_and_delete') {
                                                newAction = 'delete'; 
                                            } else if (currentAction === 'delete') {
                                                newAction = 'review_and_delete'; 
                                            } else {
                                                newAction = 'review';
                                            }
                                            handleActionChange(result.wordData.word, newAction);
                                        }}
                                        isSelected={wordActions[result.wordData.word] === 'review' || wordActions[result.wordData.word] === 'review_and_delete'}
                                        colorClasses={{ selectedBg: 'bg-purple-500', selectedText: 'text-white', selectedBorder: 'border-purple-600' }}
                                    />

                                    <ActionButton
                                        text={t.quiz_results_action_delete}
                                        icon={<CheckIcon />}
                                        onClick={() => {
                                            const currentAction = wordActions[result.wordData.word];
                                            let newAction;
                                            if (currentAction === 'delete') {
                                                newAction = 'keep'; 
                                            } else if (currentAction === 'review_and_delete') {
                                                newAction = 'review'; 
                                            } else if (currentAction === 'review') {
                                                newAction = 'review_and_delete';
                                            } else {
                                                newAction = 'delete'; 
                                            }
                                            handleActionChange(result.wordData.word, newAction);
                                        }}
                                        isSelected={wordActions[result.wordData.word] === 'delete' || wordActions[result.wordData.word] === 'review_and_delete'}
                                        colorClasses={{ selectedBg: 'bg-green-500', selectedText: 'text-white', selectedBorder: 'border-green-600' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
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