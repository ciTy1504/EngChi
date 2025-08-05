const MasterLesson = require('../models/masterLesson.model');
const UserProgress = require('../models/userProgress.model');
const { gradeTranslation } = require('./ai.controller');
const asyncHandler = require('express-async-handler');

exports.getNextTranslationQuestion = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user.id;
    
    const [masterLesson, userProgress] = await Promise.all([
        MasterLesson.findById(lessonId).lean(),
        UserProgress.findOne({ user: userId, lesson: lessonId })
    ]);
    if (!masterLesson) return res.status(404).json({ success: false, message: "Lesson not found." });
    if (!userProgress || !userProgress.progressData.items) return res.status(404).json({ success: false, message: "User progress not initialized correctly for this lesson type." });
    
    const progressItems = userProgress.progressData.items;
    if (progressItems.length === 0) return res.status(200).json({ success: true, data: null, message: "No questions in this lesson." });

    const minCounter = Math.min(...progressItems.map(item => item.counter));
    const potentialQuestionIds = progressItems.filter(item => item.counter === minCounter).map(item => item.questionId);
    if (potentialQuestionIds.length === 0) return res.status(200).json({ success: true, data: null, message: "No more questions available." });

    const randomId = potentialQuestionIds[Math.floor(Math.random() * potentialQuestionIds.length)];
    const nextQuestion = masterLesson.content.questions.find(q => q._id.toString() === randomId.toString());
    res.status(200).json({ success: true, data: nextQuestion });
});

exports.submitTranslationAnswer = asyncHandler(async (req, res) => {
    const { lessonId, questionId, userTranslation, mode = 'foreign-to-vi' } = req.body;
    const userId = req.user.id;
    if (!lessonId || !questionId || !userTranslation) return res.status(400).json({ success: false, message: 'Missing required fields.' });

    const masterLesson = await MasterLesson.findById(lessonId).lean();
    const question = masterLesson?.content?.questions.find(q => q._id.toString() === questionId.toString());
    if (!question) return res.status(404).json({ success: false, message: "Question not found." });

    const isReverseMode = mode === 'vi-to-foreign';
    const sourceForAI = isReverseMode ? question.suggestedTranslation : question.source;
    const suggestedForAI = isReverseMode ? question.source : question.suggestedTranslation;

    const apiKey = req.user.getDecryptedApiKey();
    const aiResult = await gradeTranslation(sourceForAI, userTranslation, suggestedForAI, apiKey);
    
    await UserProgress.updateOne(
        { user: userId, lesson: lessonId, "progressData.items.questionId": questionId },
        { $inc: { "progressData.items.$.counter": 1 } }
    );

    const finalResult = { 
        ...aiResult, 
        suggestedTranslation: suggestedForAI 
    };
    res.status(200).json({ success: true, data: finalResult });
});