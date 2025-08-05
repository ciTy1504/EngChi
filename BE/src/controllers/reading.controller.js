const MasterLesson = require('../models/masterLesson.model');
const UserProgress = require('../models/userProgress.model');
const asyncHandler = require('express-async-handler');

exports.getNextArticle = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const masterLesson = await MasterLesson.findById(lessonId).lean();
    if (!masterLesson || masterLesson.type !== 'reading') {
        return res.status(404).json({ success: false, message: "Reading lesson not found." });
    }

    const userProgress = await UserProgress.findOne({ user: userId, lesson: lessonId });
    if (!userProgress) {
        return res.status(404).json({ success: false, message: "User progress not found. Please start the lesson first." });
    }
    
    if (!userProgress.progressData.articleProgress) {
        userProgress.progressData.articleProgress = [];
    }

    const progressItems = userProgress.progressData.articleProgress;
    if (progressItems.length === 0) {
        return res.status(200).json({ success: true, data: null, message: "No articles in this lesson." });
    }

    const minCounter = Math.min(...progressItems.map(item => item.counter));
    const potentialArticleIds = progressItems.filter(item => item.counter === minCounter).map(item => item.articleId);
    
    const randomId = potentialArticleIds[Math.floor(Math.random() * potentialArticleIds.length)];
    const nextArticle = masterLesson.content.articles.find(a => a._id.toString() === randomId.toString());
    
    res.status(200).json({ success: true, data: nextArticle });
});

exports.submitReadingAnswers = asyncHandler(async (req, res) => {
    const { lessonId, articleId, answers } = req.body;
    const userId = req.user.id;

    if (!lessonId || !articleId || !answers) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

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
});