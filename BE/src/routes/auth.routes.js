// File: src/routes/auth.routes.js
const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Các route public, không cần đăng nhập
router.post('/register', register);
router.post('/login', login);

// Route private, cần đăng nhập để lấy thông tin user
router.get('/me', protect, getMe);

module.exports = router;