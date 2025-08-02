// File: src/routes/auth.routes.js
const express = require('express');
const { check } = require('express-validator'); // <-- Import
const { protect } = require('../middleware/auth.middleware');
const { register, login, getMe, googleLogin } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], register);

router.post('/login', [ 
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], login);

router.get('/me', protect, getMe);
router.post('/google', googleLogin);

module.exports = router;