import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import { useTranslations } from '../../hooks/useTranslations';
import { apiService } from '../../api/apiService';

const LevelButton = ({ lesson, lang }) => (
    <Link to={`/${lang}/translate/${lesson._id}`}>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
            <h3 className="text-2xl font-bold text-gray-800">{lesson.level.toUpperCase()}</h3>
            <p className="text-sm text-gray-500">{lesson.title}</p>
        </div>
    </Link>
);

const TranslateLevelSelectionPage = () => {
    const { language } = useContext(LanguageContext);
    const navigate = useNavigate();
    const t = useTranslations();

    const [lessons, setLessons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLevels = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiService(`/lessons?type=translation&language=${language}`);
                setLessons(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLevels();
    }, [language]);

    if (isLoading) return <div>{t.loading_levels}</div>;
    if (error) return <div className="text-red-500">{t.error_prefix}: {error}</div>;

    return (
        <div className="max-w-4xl mx-auto p-8">
            <button onClick={() => navigate(`/${language}`)} className="mb-8 text-blue-600 hover:underline">
                {t.back_to_home}
            </button>
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
                {t.translate_level_selection_title}
            </h1>
            <p className="text-lg text-center text-gray-500 mb-12">
                {t.translate_level_selection_subtitle}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {lessons.map(lesson => (
                    <LevelButton key={lesson._id} lesson={lesson} lang={language} />
                ))}
            </div>
        </div>
    );
};

export default TranslateLevelSelectionPage;