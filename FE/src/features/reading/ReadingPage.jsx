// src/features/reading/ReadingPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import { useTranslations } from '../../hooks/useTranslations';
import { apiService } from '../../api/apiService';
import QuestionRenderer from './components/QuestionRenderer';
import BackButton from '../../components/shared/BackButton';
import { toast } from 'react-hot-toast';
import { normalizeMongoData } from '../../utils/dataUtils';

const ReadingPage = () => {
    const { lessonId } = useParams();
    const { language } = useContext(LanguageContext);
    const t = useTranslations();

    const [article, setArticle] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchNextArticle = async () => {
        setIsLoading(true);
        setError(null);
        setArticle(null);
        setResults(null);
        setUserAnswers({});
        try {
            const response = await apiService(`/lessons/reading/${lessonId}/next-article`);
            if (response.data) {
                const normalizedArticle = normalizeMongoData(response.data);
                console.log("Data after normalization:", normalizedArticle);
                setArticle(normalizedArticle);
            } else {
                setError(t.reading_no_articles);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch article.');
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNextArticle();
    }, [lessonId]);

    const handleAnswerChange = (questionId, answer) => {
        console.log('Updating answer for:', { questionId, answer });
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        if (!article) return;
        setIsSubmitting(true);
        try {
            const payload = {
                lessonId: lessonId,
                articleId: article._id,
                answers: userAnswers
            };
            console.log('Submitting payload:', payload);
            const response = await apiService(`/lessons/reading/submit-answers`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            setResults(response.data.results);
            toast.success("Answers submitted successfully!");
        } catch (err) {
            toast.error(err.message || "Failed to submit answers.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const allQuestionsAnswered = article && article.questions && article.questions.every(q => userAnswers[q._id] !== undefined);

    if (isLoading) return <div className="text-center p-10">{t.reading_loading_article}</div>;

    if (error) {
        return (
            <div className="text-center p-10">
                <p className="font-bold text-red-500 mb-4">{error}</p>
                <BackButton to={`/${language}/reading`} />
            </div>
        );
    }

    if (!article) return null;

    console.log("Rendering with article data:", article);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <BackButton to={`/${language}/reading`} className="mb-8">
                {t.back_to_level_selection}
            </BackButton>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cột bài đọc */}
                <div className="lg:sticky top-8 self-start">
                    <div className="bg-white p-6 rounded-lg shadow-md max-h-[80vh] overflow-y-auto">
                        <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
                        <div className="prose max-w-none text-justify">
                            {article.articleText?.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cột câu hỏi + nút */}
                <div>
                    <div className="space-y-6">
                        {article.questions?.map((q, index) => (
                            <QuestionRenderer
                                key={q._id}
                                question={q}
                                index={index}
                                userAnswer={userAnswers[q._id]}
                                onAnswerChange={handleAnswerChange}
                                isSubmitted={!!results}
                                result={results ? results[q._id] : null}
                            />
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        {results ? (
                            <button
                                onClick={fetchNextArticle}
                                className="w-full md:w-auto bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                {t.reading_next_article}
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !allQuestionsAnswered}
                                className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            >
                                {isSubmitting ? t.reading_submitting : t.reading_submit_answers}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReadingPage;
