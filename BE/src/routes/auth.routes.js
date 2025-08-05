// File: src/routes/auth.routes.js
const express = require('express');
const { check } = require('express-validator');
const { protect, protectSetup } = require('../middleware/auth.middleware');
const { register, login, getMe, googleLogin, completeProfile } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('aiApiKey', 'AI API Key is required').not().isEmpty(),
], register);

router.post('/login', [ 
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], login);

router.get('/me', protect, getMe);
router.post('/google', googleLogin);

router.post('/complete-profile', protectSetup, completeProfile);

module.exports = router;