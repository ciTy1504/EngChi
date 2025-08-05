// File: src/routes/lesson.routes.js
const express = require('express');
const { getLessonList, startLesson } = require('../controllers/lesson.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', getLessonList);
router.get('/:lessonId/start', startLesson);

module.exports = router;