// src/pages/Translate/TranslatePage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import { useTranslations } from '../../hooks/useTranslations';
import { apiService } from '../../api/apiService';
import TranslationResult from '../../components/translate/TranslationResult';

const TranslatePage = () => {
    const { levelId } = useParams();
    const { language } = useContext(LanguageContext);
    const t = useTranslations();
    const navigate = useNavigate();

    const [question, setQuestion] = useState(null);
    const [userTranslation, setUserTranslation] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const resultsRef = useRef(null);

    const fetchNextQuestion = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);
        setUserTranslation('');
        setQuestion(null);
        try {
            const response = await apiService(`/lessons/translation/${levelId}/next-question`);
            if (response.data) {
                setQuestion(response.data);
            } else {
                setError(t.translate_no_questions);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch the next question.');
        } finally {
            setIsLoading(false);
        }
    };

    const initializeAndFetchFirstQuestion = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await apiService(`/lessons/${levelId}/start`);
            const response = await apiService(`/lessons/translation/${levelId}/next-question`);
            if (response.data) {
                setQuestion(response.data);
            } else {
                 setError(t.translate_no_questions);
            }
        } catch (err) {
            setError(err.message || 'Failed to initialize the lesson.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        initializeAndFetchFirstQuestion();
    }, [levelId]);

    useEffect(() => {
        if (result && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

    const handleSubmit = async () => {
        if (!userTranslation.trim() || !question) return;
        setIsSubmitting(true);
        setResult(null);
        try {
            const response = await apiService('/lessons/translation/submit-answer', {
                method: 'POST',
                body: JSON.stringify({
                    lessonId: levelId,
                    questionId: question._id,
                    userTranslation: userTranslation
                })
            });
            setResult(response.data);
        } catch (err) {
            setError(err.message || 'An error occurred while checking the translation.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">{t.translate_loading_question}</div>;
    }
    
    if (error) {
        return (
            <div className="text-center p-10">
                <p className="font-bold text-red-500">{error}</p>
                 <button onClick={() => navigate(`/${language}/translate`)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                    {t.back_to_level_selection}
                </button>
            </div>
        )
    }
    
    if (!question) {
        return (
            <div className="text-center p-10">
                <p>{t.translate_no_questions}</p>
                 <button onClick={() => navigate(`/${language}/translate`)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                    {t.back_to_level_selection}
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full max-w-7xl mx-auto p-4">
            <div className="flex justify-center mb-4">
                {result ? (
                    <button
                        onClick={fetchNextQuestion}
                        className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {t.translate_next_question}
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !userTranslation.trim()}
                        className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                        {isSubmitting ? t.translate_submitting : t.translate_submit}
                    </button>
                )}
            </div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold text-gray-500 mb-2">{t.translate_source_text}</h2>
                    <div className="h-full overflow-y-auto pr-2">
                        <p className="text-xl leading-relaxed">{question.source}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold text-gray-500 mb-2">{t.translate_your_translation}</h2>
                    <textarea
                        value={userTranslation}
                        onChange={(e) => setUserTranslation(e.target.value)}
                        placeholder={t.translate_placeholder}
                        className="w-full h-full max-h-[calc(100%-2rem)] flex-grow bg-transparent text-xl leading-relaxed resize-none focus:outline-none"
                        disabled={isSubmitting || !!result}
                    />
                </div>
            </div>

            <div className="mt-6"ref={resultsRef}>
                {isSubmitting && <div className="text-center">{t.translate_submitting}...</div>}
                {result && <TranslationResult result={result} />}
            </div>
        </div>
    );
};

export default TranslatePage;