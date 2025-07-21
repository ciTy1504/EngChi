// src/features/grammar/GrammarQuizPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import { useTranslations } from '../../hooks/useTranslations';
import { apiService } from '../../api/apiService';
import BackButton from '../../components/shared/BackButton';
import QuestionRenderer from '../reading/components/QuestionRenderer'; // Tái sử dụng
import { toast } from 'react-hot-toast';

const GrammarQuizPage = () => {
    const { lessonId } = useParams();
    const { language } = useContext(LanguageContext);
    const t = useTranslations();

    const [questions, setQuestions] = useState([]);
    const [topicTitle, setTopicTitle] = useState('');
    const [userAnswers, setUserAnswers] = useState({});
    const [results, setResults] = useState(null); // State để lưu kết quả sau khi chấm
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); // State để vô hiệu hóa nút khi đang chấm
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuizQuestions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiService(`/lessons/${lessonId}/quiz-questions`);
                setQuestions(response.data.questions);
                setTopicTitle(response.data.topicTitle);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuizQuestions();
    }, [lessonId]);

    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    // --- LOGIC MỚI: XỬ LÝ VIỆC CHẤM BÀI ---
    const handleSubmit = () => {
        setIsSubmitting(true);
        
        const newResults = {};
        questions.forEach(q => {
            const questionIdStr = q._id;
            const userAnswer = userAnswers[questionIdStr];
            let isCorrect = false;
            let correctAnswerText = '';

            switch (q.qType) {
                case 'multiple_choice_single': {
                    const correctOption = q.options.find(opt => opt.isCorrect);
                    isCorrect = userAnswer && userAnswer[0] === correctOption?._id;
                    correctAnswerText = correctOption?.text || 'N/A';
                    break;
                }
                case 'multiple_choice_multiple': {
                    const correctOptionIds = new Set(q.options.filter(opt => opt.isCorrect).map(opt => opt._id));
                    const userAnswerIds = new Set(userAnswer || []);
                    isCorrect = correctOptionIds.size === userAnswerIds.size && [...correctOptionIds].every(id => userAnswerIds.has(id));
                    correctAnswerText = q.options.filter(opt => opt.isCorrect).map(opt => opt.text).join(', ');
                    break;
                }
                case 'fill_in_blank': {
                    // Chuyển cả đáp án và câu trả lời về chữ thường, bỏ khoảng trắng để so sánh
                    const correctAnswers = q.answers.map(a => a.toLowerCase().trim());
                    isCorrect = correctAnswers.includes((userAnswer || '').toLowerCase().trim());
                    correctAnswerText = q.answers.join(' / ');
                    break;
                }
                default:
                    break;
            }

            // Kết quả cho mỗi câu hỏi sẽ bao gồm: đúng/sai và đáp án đúng.
            // Component QuestionRenderer sẽ tự dùng 'explanation' từ data gốc nếu có.
            newResults[questionIdStr] = { isCorrect, correctAnswer: correctAnswerText };
        });

        setResults(newResults);
        setIsSubmitting(false);
        toast.success("Answers submitted!");
        
        // Cuộn lên đầu trang để người dùng thấy kết quả câu đầu tiên
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading) return <div className="text-center p-10">{t.loading}</div>;
    if (error) return <div className="text-center p-10 text-red-500">{t.error_prefix}: {error}</div>;

    const allQuestionsAnswered = questions.every(q => userAnswers[q._id] !== undefined && userAnswers[q._id] !== '' && userAnswers[q._id]?.length !== 0);

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <BackButton to={`/${language}/grammar/practice`} className="mb-8" />
            
            <h1 className="text-3xl font-bold text-center mb-8">
                {t.grammar_quiz_title.replace('{topic}', topicTitle)}
            </h1>
            <div className="space-y-6">
                {questions.map((q, index) => (
                    <QuestionRenderer
                        key={q._id}
                        question={q}
                        index={index}
                        userAnswer={userAnswers[q._id]}
                        onAnswerChange={handleAnswerChange}
                        isSubmitted={!!results} // Trạng thái đã nộp bài
                        result={results ? results[q._id] : null} 
                        showTheoryLinkOnWrong={true}
                    />
                ))}
            </div>
            <div className="mt-8 text-center">
                {/* Chỉ hiển thị nút Submit khi chưa có kết quả */}
                {!results && (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !allQuestionsAnswered}
                        className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? t.reading_submitting : t.reading_submit_answers}
                    </button>
                )}
            </div>
        </div>
    );
};

export default GrammarQuizPage;