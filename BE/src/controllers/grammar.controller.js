const MasterLesson = require('../models/masterLesson.model');
const asyncHandler = require('express-async-handler');

exports.getGrammarLibrary = asyncHandler(async (req, res) => {
    const { language } = req.query;
    if (!language) {
        return res.status(400).json({ success: false, message: 'Language query parameter is required.' });
    }
    
    const library = await MasterLesson.find({ type: 'grammar', language: language })
                                       .sort({ order: 1, _id: 1 })
                                       .select('title description order content.grammarTheory');

    res.status(200).json({ success: true, data: library });
});

exports.getGrammarQuizQuestions = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;
    
    const lesson = await MasterLesson.findById(lessonId).lean();

    if (!lesson || lesson.type !== 'grammar' || !lesson.content.grammarQuestions) {
        return res.status(404).json({ success: false, message: 'Grammar lesson or questions not found.' });
    }

    const allQuestions = lesson.content.grammarQuestions;
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
});