const express = require('express');
const { performAICheck } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/check', performAICheck);

module.exports = router;