// File: src/routes/lesson.routes.js
const express = require('express');
const { 
    getLessonList, 
    startLesson, 
    updateProgress,
    getNextTranslationQuestion,
    submitTranslationAnswer
} = require('../controllers/lesson.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', getLessonList);
router.get('/:lessonId/start', startLesson);
router.put('/progress/:progressId', updateProgress);

router.get('/translation/:lessonId/next-question', getNextTranslationQuestion);
router.post('/translation/submit-answer', submitTranslationAnswer);


module.exports = router;