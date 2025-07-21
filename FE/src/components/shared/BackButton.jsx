// src/components/shared/BackButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../../hooks/useTranslations';

const BackArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

/**
 * @param {object} props
 * @param {string} [props.to]
 * @param {string} [props.className]
 */
const BackButton = ({ to, className, ...props }) => {
    const navigate = useNavigate();
    const t = useTranslations();

    const handleClick = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors ${className}`}
            {...props}
        >
            <BackArrowIcon />
            <span>{props.children || t.back_to_home}</span>
        </button>
    );
};

export default BackButton;