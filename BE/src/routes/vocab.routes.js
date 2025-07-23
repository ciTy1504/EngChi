// File: src/routes/vocab.routes.js
const express = require('express');
const { getReviewWords, getReviewWordCount } = require('../controllers/vocab.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/review-words', getReviewWords);
router.get('/review-count', getReviewWordCount);

module.exports = router;