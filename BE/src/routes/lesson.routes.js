// File: src/routes/lesson.routes.js
const express = require('express');
const { 
    getLessonList, 
    startLesson, 
    updateProgress,
    getNextTranslationQuestion,
    submitTranslationAnswer,
    getNextArticle,
    submitReadingAnswers,
    getGrammarLibrary,
    getGrammarQuizQuestions
} = require('../controllers/lesson.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', getLessonList);
router.get('/:lessonId/start', startLesson);
router.put('/progress/:progressId', updateProgress);

router.get('/translation/:lessonId/next-question', getNextTranslationQuestion);
router.post('/translation/submit-answer', submitTranslationAnswer);

router.get('/reading/:lessonId/next-article', getNextArticle);
router.post('/reading/submit-answers', submitReadingAnswers);

router.get('/grammar/library', getGrammarLibrary);
router.get('/:lessonId/quiz-questions', getGrammarQuizQuestions);

module.exports = router;