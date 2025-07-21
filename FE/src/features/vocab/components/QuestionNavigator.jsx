// src/features/vocab/components/QuestionNavigator.jsx
import React from 'react';
import { useTranslations } from '../../../hooks/useTranslations';

const QuestionNavigator = ({ questions, currentIndex, onNavigate, isRevealingResults, onNavigateEnabled = true }) => {
    const t = useTranslations();

    const getButtonClass = (question, index) => {
        let baseClass = "w-10 h-10 flex items-center justify-center rounded-md font-bold text-sm transition-all duration-200 focus:outline-none";

        if (isRevealingResults) {
            if (question.isCorrect === true) {
                baseClass += ' bg-green-500 text-white';
            } else if (question.isCorrect === false) {
                baseClass += ' bg-red-500 text-white';
            } else {
                baseClass += ' bg-gray-200 text-gray-700';
            }
        } else {
            const isAttempted = question.status !== 'unanswered';
            if (isAttempted) {
                baseClass += ' bg-blue-600 text-white'; 
            } else {
                baseClass += ' bg-gray-200 text-gray-700 hover:bg-gray-300';
            }
        }
        
        if (index === currentIndex) {
            baseClass += ' ring-2 ring-offset-2 ring-indigo-500'; 
        }

        if (!onNavigateEnabled) {
            baseClass += ' cursor-default';
        }

        return baseClass;
    };

    return (
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-5 gap-2 p-4 bg-white rounded-lg shadow-md">
            {questions.map((q, index) => (
                <button 
                    key={index}
                    onClick={() => onNavigateEnabled && onNavigate(index)}
                    className={getButtonClass(q, index)}
                    aria-label={t.navigator_go_to_question.replace('{number}', index + 1)}
                    disabled={!onNavigateEnabled}
                >
                    {index + 1}
                </button>
            ))}
        </div>
    );
};

export default QuestionNavigator;