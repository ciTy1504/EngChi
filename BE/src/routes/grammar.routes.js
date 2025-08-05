// File: src/routes/grammar.routes.js
const express = require('express');
const { getGrammarLibrary, getGrammarQuizQuestions } = require('../controllers/grammar.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(protect);

router.get('/library', getGrammarLibrary);
router.get('/:lessonId/quiz-questions', getGrammarQuizQuestions);

module.exports = router;