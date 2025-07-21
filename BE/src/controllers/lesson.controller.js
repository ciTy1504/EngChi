const MasterLesson = require('../models/masterLesson.model');
const UserProgress = require('../models/userProgress.model');
const { gradeTranslation } = require('./ai.controller');

// --- CONTROLLER startLesson ĐƯỢC CẬP NHẬT ---
exports.startLesson = async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user.id;

    try {
        const masterLesson = await MasterLesson.findById(lessonId).lean();
        if (!masterLesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        // --- GRAMMAR SẼ KHÔNG SỬ DỤNG USERPROGRESS Ở ĐÂY ---
        if (masterLesson.type === 'grammar') {
            // Đối với Grammar, chúng ta chỉ cần trả về masterLesson,
            // việc random questions sẽ được xử lý bởi getGrammarQuizQuestions riêng.
            // StartLesson chỉ đảm bảo lesson tồn tại.
            return res.status(200).json({ success: true, masterLesson });
        }


        let userProgress = await UserProgress.findOne({ user: userId, lesson: lessonId });

        // A. Xử lý khi người dùng chưa có tiến trình (lần đầu học)
        if (!userProgress) {
            let initialProgressData = {};
            
            if (masterLesson.type === 'vocab') {
                initialProgressData = { deletedWords: [], reviewWords: [] };
            } else if (masterLesson.type === 'reading') {
                initialProgressData = { articleProgress: [] };
            } else if (masterLesson.type === 'translation') { // Chỉ áp dụng cho translation
                const questionIds = masterLesson.content.questions?.map(q => q._id.toString()) || [];
                initialProgressData = { items: questionIds.map(id => ({ questionId: id, counter: 0 })) };
            } else {
                 return res.status(400).json({ success: false, message: 'Invalid lesson type for UserProgress initialization' });
            }
            
            userProgress = await UserProgress.create({
                user: userId,
                lesson: lessonId,
                progressData: initialProgressData
            });
        } 
        // B. Xử lý khi người dùng đã có tiến trình -> Đồng bộ hóa (chỉ cho translation/reading)
        else {
            let needsSave = false;
            
            if (masterLesson.type === 'translation') {
                const masterQuestionIds = new Set(masterLesson.content.questions?.map(q => q._id.toString()) || []);
                const userQuestionItems = userProgress.progressData.items || [];
                const userQuestionIds = new Set(userQuestionItems.map(item => item.questionId.toString()));
                
                masterQuestionIds.forEach(id => {
                    if (!userQuestionIds.has(id)) {
                        userProgress.progressData.items.push({ questionId: id, counter: 0 });
                        needsSave = true;
                    }
                });
            }
            else if (masterLesson.type === 'reading') {
                const masterArticleIds = new Set(masterLesson.content.articles?.map(a => a._id.toString()) || []);
                const userArticleProgress = userProgress.progressData.articleProgress || [];
                const userArticleIds = new Set(userArticleProgress.map(p => p.articleId.toString()));
                
                const currentMinCounter = userArticleProgress.length > 0
                    ? Math.min(...userArticleProgress.map(item => item.counter))
                    : 0;

                masterArticleIds.forEach(id => {
                    if (!userArticleIds.has(id)) {
                        userProgress.progressData.articleProgress.push({ articleId: id, counter: currentMinCounter });
                        needsSave = true;
                    }
                });
            }

            if (needsSave) {
                await userProgress.save();
            }
        }
        
        // Trả về masterLesson và userProgress (hoặc null nếu không cần)
        res.status(200).json({ success: true, masterLesson, userProgress: userProgress || null });

    } catch (error) {
        console.error("Start Lesson Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLessonList = async (req, res) => {
    try {
        const query = { ...req.query };
        const fields = query.fields ? query.fields.split(',').join(' ') : '-content';
        const sortBy = query.sort ? query.sort.split(',').join(' ') : 'order level title'; // Mặc định sắp xếp theo order

        delete query.fields;
        delete query.sort;
        
        const lessons = await MasterLesson.find(query)
                                          .sort(sortBy)
                                          .select(fields);

        res.status(200).json({ success: true, count: lessons.length, data: lessons });
    } catch (error) {
        console.error("Get Lesson List Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getGrammarLibrary = async (req, res) => {
    const { language } = req.query;
    if (!language) {
        return res.status(400).json({ success: false, message: 'Language query parameter is required.' });
    }
    try {
        const library = await MasterLesson.find({ type: 'grammar', language: language })
                                           .sort({ order: 1, _id: 1 }) // Luôn sắp xếp theo order
                                           .select('title description order content.grammarTheory');

        res.status(200).json({ success: true, data: library });
    } catch (error) {
        console.error("Get Grammar Library Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getGrammarQuizQuestions = async (req, res) => {
    const { lessonId } = req.params;
    try {
        // --- SỬA LẠI: THÊM 'type' VÀO .select() ---
        const lesson = await MasterLesson.findById(lessonId)
                                         .select('title type content.grammarQuestions')
                                         .lean();

        if (!lesson || lesson.type !== 'grammar' || !lesson.content.grammarQuestions) {
            return res.status(404).json({ success: false, message: 'Grammar lesson or questions not found.' });
        }

        const allQuestions = lesson.content.grammarQuestions;
        // Đảm bảo không trả về quá 50 câu nếu có ít hơn 50 câu
        const quizQuestionsCount = Math.min(50, allQuestions.length); 
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        const quizQuestions = shuffled.slice(0, quizQuestionsCount);

        res.status(200).json({ 
            success: true, 
            data: {
                topicTitle: lesson.title,
                questions: quizQuestions
            }
        });
    } catch (error) {
        console.error("Get Grammar Quiz Questions Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProgress = async (req, res) => {
    const { progressId } = req.params;
    const { action, payload } = req.body;
    try {
        const progress = await UserProgress.findById(progressId);
        if (!progress) return res.status(404).json({ success: false, message: 'Progress not found' });
        if (progress.user.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

        switch (action) {
            case 'delete_words':
                progress.progressData.deletedWords.addToSet(...(payload.words || []));
                break;
            case 'review_words':
                progress.progressData.reviewWords.addToSet(...(payload.words || []));
                break;
            default:
                return res.status(400).json({ success: false, message: `Invalid action: ${action}` });
        }
        
        await progress.save();
        res.status(200).json({ success: true, data: progress });
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
};

exports.getNextTranslationQuestion = async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user.id;
    try {
        const [masterLesson, userProgress] = await Promise.all([
            MasterLesson.findById(lessonId).lean(),
            UserProgress.findOne({ user: userId, lesson: lessonId })
        ]);
        if (!masterLesson) return res.status(404).json({ success: false, message: "Lesson not found." });
        if (!userProgress || !userProgress.progressData.items) return res.status(404).json({ success: false, message: "User progress not initialized correctly for this lesson type." });
        
        const progressItems = userProgress.progressData.items;
        if (progressItems.length === 0) return res.status(200).json({ success: true, data: null });

        const minCounter = Math.min(...progressItems.map(item => item.counter));
        const potentialQuestionIds = progressItems.filter(item => item.counter === minCounter).map(item => item.questionId);
        if (potentialQuestionIds.length === 0) return res.status(200).json({ success: true, data: null });

        const randomId = potentialQuestionIds[Math.floor(Math.random() * potentialQuestionIds.length)];
        const nextQuestion = masterLesson.content.questions.find(q => q._id === randomId);
        res.status(200).json({ success: true, data: nextQuestion });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.submitTranslationAnswer = async (req, res) => {
    const { lessonId, questionId, userTranslation, mode = 'foreign-to-vi' } = req.body;
    const userId = req.user.id;
    if (!lessonId || !questionId || !userTranslation) return res.status(400).json({ success: false, message: 'Missing required fields.' });
    try {
        const masterLesson = await MasterLesson.findById(lessonId).lean();
        const question = masterLesson?.content?.questions.find(q => q._id === questionId);
        if (!question) return res.status(404).json({ success: false, message: "Question not found." });

        const isReverseMode = mode === 'vi-to-foreign';
        const sourceForAI = isReverseMode ? question.suggestedTranslation : question.source;
        const suggestedForAI = isReverseMode ? question.source : question.suggestedTranslation;

        const aiResult = await gradeTranslation(sourceForAI, userTranslation, suggestedForAI);
        
        await UserProgress.updateOne(
            { user: userId, lesson: lessonId, "progressData.items.questionId": questionId },
            { $inc: { "progressData.items.$.counter": 1 } }
        );

        const finalResult = { 
            ...aiResult, 
            suggestedTranslation: suggestedForAI 
        };
        res.status(200).json({ success: true, data: finalResult });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getNextArticle = async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user.id;

    try {
        const masterLesson = await MasterLesson.findById(lessonId).lean();
        if (!masterLesson || masterLesson.type !== 'reading') {
            return res.status(404).json({ success: false, message: "Reading lesson not found." });
        }

        let userProgress = await UserProgress.findOne({ user: userId, lesson: lessonId });
        
        if (!userProgress) {
            userProgress = await UserProgress.create({
                user: userId,
                lesson: lessonId,
                progressData: { articleProgress: [] }
            });
        }
        
        // ĐẢM BẢO AN TOÀN: Nếu articleProgress không tồn tại, hãy tạo nó.
        if (!userProgress.progressData.articleProgress) {
            userProgress.progressData.articleProgress = [];
        }

        const masterArticleIds = new Set(masterLesson.content.articles.map(a => a._id.toString()));
        const userArticleProgress = userProgress.progressData.articleProgress; // Bây giờ chắc chắn là một mảng
        const userArticleIds = new Set(userArticleProgress.map(p => p.articleId));
        
        // ... phần còn lại của hàm giữ nguyên ...
        let needsSave = false;
        
        const currentMinCounter = userArticleProgress.length > 0
            ? Math.min(...userArticleProgress.map(item => item.counter))
            : 0;

        masterArticleIds.forEach(id => {
            if (!userArticleIds.has(id)) {
                userProgress.progressData.articleProgress.push({ 
                    articleId: id, 
                    counter: currentMinCounter
                });
                needsSave = true;
            }
        });

        if (needsSave) {
            await userProgress.save();
        }
        
        const progressItems = userProgress.progressData.articleProgress;
        if (progressItems.length === 0) {
            return res.status(200).json({ success: true, data: null, message: "No articles in this lesson." });
        }

        const minCounter = Math.min(...progressItems.map(item => item.counter));
        const potentialArticleIds = progressItems.filter(item => item.counter === minCounter).map(item => item.articleId);
        
        const randomId = potentialArticleIds[Math.floor(Math.random() * potentialArticleIds.length)];
        
        const nextArticle = masterLesson.content.articles.find(a => a._id.toString() === randomId);
        
        res.status(200).json({ success: true, data: nextArticle });

    } catch (error) {
        console.error("Get Next Article Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.submitReadingAnswers = async (req, res) => {
    const { lessonId, articleId, answers } = req.body;
    const userId = req.user.id;

    if (!lessonId || !articleId || !answers) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    try {
        const masterLesson = await MasterLesson.findById(lessonId).lean();
        const article = masterLesson?.content.articles.find(a => a._id.toString() === articleId);

        if (!article) {
            return res.status(404).json({ success: false, message: "Article not found in this lesson." });
        }

        const results = {};

        for (const question of article.questions) {
            const questionIdStr = question._id.toString();
            const userAnswer = answers[questionIdStr];
            let isCorrect = false;
            let correctAnswerText = '';

            switch (question.qType) {
                case 'multiple_choice_single': {
                    const correctOption = question.options.find(opt => opt.isCorrect);
                    isCorrect = userAnswer && userAnswer[0] === correctOption?._id.toString();
                    correctAnswerText = correctOption?.text;
                    break;
                }
                case 'multiple_choice_multiple': {
                    const correctOptionIds = new Set(question.options.filter(opt => opt.isCorrect).map(opt => opt._id.toString()));
                    const userAnswerIds = new Set(userAnswer || []);
                    isCorrect = correctOptionIds.size === userAnswerIds.size && [...correctOptionIds].every(id => userAnswerIds.has(id));
                    correctAnswerText = question.options.filter(opt => opt.isCorrect).map(opt => opt.text).join(', ');
                    break;
                }
                case 'fill_in_blank': {
                    const correctAnswers = question.answers.map(a => a.toLowerCase().trim());
                    isCorrect = correctAnswers.includes((userAnswer || '').toLowerCase().trim());
                    correctAnswerText = question.answers.join(' / ');
                    break;
                }
            }

            results[questionIdStr] = { isCorrect, correctAnswer: correctAnswerText };
        }
        
        await UserProgress.updateOne(
            { user: userId, lesson: lessonId, "progressData.articleProgress.articleId": articleId },
            { $inc: { "progressData.articleProgress.$.counter": 1 } }
        );

        res.status(200).json({ success: true, data: { results } });

    } catch (error) {
        console.error("Submit Reading Answers Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};