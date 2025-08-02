// src/routes/idiom.routes.js
const express = require('express');
const { getIdiomLibrary } = require('../controllers/idiom.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Bảo vệ tất cả các route trong file này
router.use(protect);

router.get('/', getIdiomLibrary);

module.exports = router;