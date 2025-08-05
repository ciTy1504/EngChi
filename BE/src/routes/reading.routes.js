// File: src/routes/reading.routes.js
const express = require('express');
const { getNextArticle, submitReadingAnswers } = require('../controllers/reading.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(protect);

router.get('/:lessonId/next-article', getNextArticle);
router.post('/submit-answers', submitReadingAnswers);

module.exports = router;