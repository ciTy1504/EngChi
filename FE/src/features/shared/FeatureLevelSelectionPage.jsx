// File: src/features/shared/FeatureLevelSelectionPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import { useTranslations } from '../../hooks/useTranslations';
import { apiService } from '../../api/apiService';
import FeaturePageLayout from './FeaturePageLayout';

// Component Nút Ôn tập
const ReviewModeButton = ({ count, lang }) => {
    const t = useTranslations();
    return (
        <Link
            to={`/${lang}/vocab/review`}
            className="group block bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 text-center text-white"
        >
            <h3 className="text-xl font-bold">{t.review_mode_title}</h3>
            <p className="mt-1 font-semibold">{t.review_mode_subtitle.replace('{count}', count)}</p>
        </Link>
    );
};


// Component Nút chuyển chế độ dịch
const TranslationModeToggle = ({ mode, onModeChange }) => {
    const { language } = useContext(LanguageContext);
    const t = useTranslations();
    const isReverseMode = mode === 'vi-to-foreign';

    const foreignLangText = language === 'en' ? t.lang_en_short : t.lang_zh_short;
    const vietnameseText = t.lang_vi;

    const buttonText = isReverseMode
        ? `${vietnameseText} ➔ ${foreignLangText}`
        : `${foreignLangText} ➔ ${vietnameseText}`;
    
    return (
        <div className="flex items-center justify-center mb-8">
            <span className="mr-4 text-gray-600 font-medium">{t.translation_mode_label}</span>
            <button
                onClick={() => onModeChange(isReverseMode ? 'foreign-to-vi' : 'vi-to-foreign')}
                className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-colors duration-200 bg-white border hover:bg-gray-50 hover:border-gray-300"
            >
                {buttonText}
            </button>
        </div>
    );
};


const FeatureLevelSelectionPage = ({ featureType, featurePath, pageTitleKey, pageSubtitleKey, backButtonPath }) => {
    const { language } = useContext(LanguageContext);
    const t = useTranslations();

    const [lessons, setLessons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [translationMode, setTranslationMode] = useState('foreign-to-vi');
    const [reviewCount, setReviewCount] = useState(0);

    useEffect(() => {
        const fetchLevels = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const endpoint = `/lessons?type=${featureType}&language=${language}&sort=order,level`;
                const response = await apiService(endpoint);
                setLessons(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLevels();

        if (featureType === 'vocab') {
            const fetchReviewCount = async () => {
                try {
                    const res = await apiService(`/vocab/review-count?language=${language}`);
                    setReviewCount(res.data.count);
                } catch (err) {
                    console.error("Failed to fetch review count:", err);
                }
            };
            fetchReviewCount();
        }
    }, [language, featureType]);

    if (isLoading) return <div className="text-center p-10">{t.loading_levels}</div>;
    if (error) return <div className="text-center p-10 text-red-500">{t.error_prefix}: {error}</div>;

    return (
        <FeaturePageLayout
            pageTitle={t[pageTitleKey]}
            pageSubtitle={t[pageSubtitleKey]}
            backButtonPath={backButtonPath}
        >
            {featureType === 'translation' && (
                <TranslationModeToggle mode={translationMode} onModeChange={setTranslationMode} />
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {featureType === 'vocab' && reviewCount > 0 && (
                    <ReviewModeButton count={reviewCount} lang={language} />
                )}

                {lessons.map(lesson => (
                    <Link
                        key={lesson._id}
                        to={featureType === 'translation' ? `/${language}${featurePath}/${lesson._id}?mode=${translationMode}` : `/${language}${featurePath}/${lesson._id}`}
                        className="group block bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-center border-t-4 border-transparent hover:border-blue-500"
                    >
                        <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-blue-600">
                            {(lesson.level || lesson.title).toUpperCase()}
                        </h3>
                        <p className="text-gray-500 mt-1 truncate">
                            {lesson.description || lesson.title}
                        </p>
                    </Link>
                ))}
            </div>
        </FeaturePageLayout>
    );
};

export default FeatureLevelSelectionPage;