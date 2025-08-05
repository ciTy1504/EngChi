// File: src/routes/progress.routes.js
const express = require('express');
const { updateProgress } = require('../controllers/progress.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();
router.use(protect);

router.put('/:progressId', updateProgress);

module.exports = router;