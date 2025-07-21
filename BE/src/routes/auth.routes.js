// File: src/routes/auth.routes.js
const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { register, login, getMe, googleLogin } = require('../controllers/auth.controller');

const router = express.Router();

// Các route public, không cần đăng nhập
router.post('/register', register);
router.post('/login', login);

// Route private, cần đăng nhập để lấy thông tin user
router.get('/me', protect, getMe);

router.post('/google', googleLogin); 

module.exports = router;