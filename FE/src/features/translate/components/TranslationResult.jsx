// src/features/translate/components/TranslationResult.jsx
import React from 'react';
import { useTranslations } from '../../../hooks/useTranslations'; 
import { Accordion } from '../../../components/shared/Accordion'; 

const TranslationResult = ({ result }) => {
    const t = useTranslations();
    const { score, suggestedTranslation, feedback } = result;

    const getScoreColor = () => {
        if (score >= 85) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="w-full animate-fade-in space-y-4">
            <div className="text-center bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-bold">{t.translate_result_score}</h3>
                <p className={`text-6xl font-bold ${getScoreColor()}`}>
                    {score}
                    <span className="text-3xl text-gray-500">/100</span>
                </p>
            </div>

            <Accordion title={t.translate_result_suggested} defaultOpen={true}>
                <p className="text-lg leading-relaxed">{suggestedTranslation}</p>
            </Accordion>

            <Accordion title={t.translate_result_feedback}>
                <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: feedback }}
                />
            </Accordion>
        </div>
    );
};

export default TranslationResult;