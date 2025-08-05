// File: src/routes/translation.routes.js
const express = require('express');
const { getNextTranslationQuestion, submitTranslationAnswer } = require('../controllers/translation.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(protect);

router.get('/:lessonId/next-question', getNextTranslationQuestion);
router.post('/submit-answer', submitTranslationAnswer);

module.exports = router;