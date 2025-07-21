// src/features/reading/components/QuestionRenderer.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom'; 
import { LanguageContext } from '../../../contexts/LanguageContext'; 
import { useTranslations } from '../../../hooks/useTranslations'; 

const getResultClass = (isSubmitted, isCorrect) => {
    if (!isSubmitted) return 'border-gray-300';
    return isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
};

const QuestionRenderer = ({ question, index, userAnswer, onAnswerChange, isSubmitted, result, showTheoryLinkOnWrong = false }) => {
    const { language } = useContext(LanguageContext);
    const t = useTranslations();
    
    const isDisabled = isSubmitted;

    const handleSingleChoiceChange = (optionId) => {
        onAnswerChange(question._id, [optionId]);
    };

    const handleMultipleChoiceChange = (optionId) => {
        const newAnswer = userAnswer ? [...userAnswer] : [];
        const currentIndex = newAnswer.indexOf(optionId);

        if (currentIndex === -1) {
            newAnswer.push(optionId);
        } else {
            newAnswer.splice(currentIndex, 1);
        }
        onAnswerChange(question._id, newAnswer);
    };

    const handleFillInBlankChange = (e) => {
        onAnswerChange(question._id, e.target.value);
    };
    
    const renderResult = () => {
        if (!isSubmitted || !result) return null;
        return (
            <div className="mt-4 text-sm p-3 rounded-md bg-gray-100 border border-gray-200">
                {result.isCorrect ? (
                    <p className="text-green-700 font-semibold">✓ {t.correct}</p>
                ) : (
                    <div>
                        <p className="text-red-700 font-semibold">✗ {t.incorrect}</p>
                        <p className="text-gray-600 mt-1">
                            <span className="font-medium">{t.correct_answer_is}:</span> {result.correctAnswer}
                        </p>
                    </div>
                )}
                {!result.isCorrect && showTheoryLinkOnWrong && question.relatedTheoryId && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                        <Link
                            to={`/${language}/grammar/theory?focus=${question.relatedTheoryId}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {t.review_theory_button || "Review theory"}
                        </Link>
                    </div>
                )}
            </div>
        );
    };

    const renderQuestionType = () => {
        switch (question.qType) {
            case 'multiple_choice_single':
                return (
                    <div className="space-y-2 mt-2">
                        {question.options?.map(opt => (
                            <label key={opt._id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name={question._id}
                                    checked={userAnswer && userAnswer[0] === opt._id}
                                    onChange={() => handleSingleChoiceChange(opt._id)}
                                    disabled={isDisabled}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-3 text-gray-700">{opt.text}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'multiple_choice_multiple':
                 return (
                    <div className="space-y-2 mt-2">
                        {question.options?.map(opt => (
                            <label key={opt._id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={userAnswer && userAnswer.includes(opt._id)}
                                    onChange={() => handleMultipleChoiceChange(opt._id)}
                                    disabled={isDisabled}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-3 text-gray-700">{opt.text}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'fill_in_blank': {
                const inputValue = (typeof userAnswer === 'string') ? userAnswer : '';
                return (
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleFillInBlankChange}
                        disabled={isDisabled}
                        placeholder="Type your answer here..."
                        className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                );
            }
            default:
                return <p className="text-red-500">Unsupported question type.</p>;
        }
    };
    
    return (
        <div className={`p-4 border-l-4 rounded-r-lg ${getResultClass(isSubmitted, result?.isCorrect)}`}>
            <p className="font-semibold text-gray-800">{index + 1}. {question.prompt}</p>
            {renderQuestionType()}
            {renderResult()}
        </div>
    );
};

export default QuestionRenderer;