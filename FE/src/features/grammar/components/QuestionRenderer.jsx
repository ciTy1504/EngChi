// src/features/grammar/components/QuestionRenderer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslations } from '../../../hooks/useTranslations';

const CorrectIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const IncorrectIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TheoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const QuestionOption = ({ question, option, userAnswer, isSubmitted, onAnswerChange }) => {
    const isMultipleChoice = question.qType === 'multiple_choice_multiple';
    const isSelected = userAnswer?.includes(option._id);
    const isCorrectOption = option.isCorrect;

    const handleSelect = () => {
        if (isMultipleChoice) {
            const newAnswer = isSelected
                ? userAnswer.filter(id => id !== option._id)
                : [...(userAnswer || []), option._id];
            onAnswerChange(question._id, newAnswer);
        } else {
            onAnswerChange(question._id, [option._id]);
        }
    };

    return (
        <div 
            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                isSubmitted ? '' : 'hover:bg-gray-50'
            }`}
        >
            <label className="flex items-center cursor-pointer w-full">
                <input
                    type={isMultipleChoice ? 'checkbox' : 'radio'}
                    name={question._id}
                    checked={isSelected}
                    onChange={handleSelect}
                    disabled={isSubmitted}
                    className={isMultipleChoice 
                        ? 'form-checkbox h-5 w-5 text-blue-600' 
                        : 'form-radio h-5 w-5 text-blue-600'}
                />
                <span className="ml-3 text-gray-700">{option.text}</span>
            </label>
            {isSubmitted && (
                <>
                    {isCorrectOption && <CorrectIcon />}
                    {isSelected && !isCorrectOption && <IncorrectIcon />}
                </>
            )}
        </div>
    );
};

const QuestionRenderer = ({
    question,
    index,
    userAnswer,
    onAnswerChange,
    isSubmitted,
    result,
    showTheoryLinkOnWrong
}) => {
    const t = useTranslations();
    const borderClass = isSubmitted
        ? result.isCorrect
            ? 'border-green-400 bg-green-50'
            : 'border-red-400 bg-red-50'
        : 'border-gray-200 bg-white';

    const renderQuestionBody = () => {
        switch (question.qType) {
            case 'multiple_choice_single':
            case 'multiple_choice_multiple':
                return (
                    <div className="space-y-3 mt-4">
                        {question.options.map(opt => (
                            <QuestionOption
                                key={opt._id}
                                question={question}
                                option={opt}
                                userAnswer={userAnswer}
                                isSubmitted={isSubmitted}
                                onAnswerChange={onAnswerChange}
                            />
                        ))}
                    </div>
                );
            case 'fill_in_blank':
                return (
                    <input
                        type="text"
                        value={userAnswer || ''}
                        onChange={(e) => onAnswerChange(question._id, e.target.value)}
                        disabled={isSubmitted}
                        className="mt-4 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                );
            default:
                return <p>Unsupported question type</p>;
        }
    };

    return (
        <div className={`p-6 rounded-xl shadow-sm border ${borderClass} transition-colors duration-300`}>
            <p className="text-lg font-semibold text-gray-800">
                {index + 1}. {question.prompt}
            </p>
            {renderQuestionBody()}
            
            {isSubmitted && (
                <div className="mt-4 pt-4 border-t border-dashed space-y-3">
                    {!result.isCorrect && question.qType === 'fill_in_blank' && (
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">{t.correct_answer}: </span>
                            {result.correctAnswer}
                        </p>
                    )}

                    {question.explanation && (
                         <div className="text-sm bg-gray-100 p-3 rounded-md">
                            <p className="font-bold text-gray-900 mb-1">{t.explanation}</p>
                            <p className="text-gray-700">{question.explanation}</p>
                        </div>
                    )}

                     {!result.isCorrect && showTheoryLinkOnWrong && question.relatedTheoryId && (
                        <div>
                            <Link 
                                to={`/${t.lang}/grammar/theory?focus=${question.relatedTheoryId}`}
                                className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                            >
                               <TheoryIcon />
                               <span>{t.grammar_theory_button || 'View Theory'}</span>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionRenderer;