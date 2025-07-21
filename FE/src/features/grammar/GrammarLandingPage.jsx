// src/features/grammar/GrammarLandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../../hooks/useTranslations';
import FeaturePageLayout from '../shared/FeaturePageLayout';

const TheoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const PracticeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;

const ChoiceCard = ({ icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="group w-full max-w-sm p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center border-t-4 border-transparent hover:border-blue-500"
    >
        <div className="text-blue-500 mb-4 transition-transform duration-300 group-hover:scale-110">{icon}</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
    </button>
);


const GrammarLandingPage = () => {
    const navigate = useNavigate();
    const t = useTranslations();

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <FeaturePageLayout
            pageTitle={t.feature_name_grammar}
            pageSubtitle={t.grammar_landing_subtitle}
        >
            <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12">
                <ChoiceCard 
                    icon={<TheoryIcon />}
                    title={t.grammar_theory_button}
                    description={t.grammar_theory_desc}
                    onClick={() => handleNavigate('theory')}
                />
                <ChoiceCard 
                    icon={<PracticeIcon />}
                    title={t.grammar_practice_button}
                    description={t.grammar_practice_desc}
                    onClick={() => handleNavigate('practice')}
                />
            </div>
        </FeaturePageLayout>
    );
};

export default GrammarLandingPage;