// File: controllers/auth.controller.js
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user,
    });
};

// @desc    Auth user with Google
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
    const { token } = req.body; // Đây là ID Token từ frontend

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, sub } = ticket.getPayload(); // sub là Google ID

        let user = await User.findOne({ googleId: sub });

        if (!user) {
            // Nếu không tìm thấy bằng googleId, thử tìm bằng email
            // (cho trường hợp người dùng đã đăng ký bằng email trước đó)
            user = await User.findOne({ email: email });

            if (user) {
                // Nếu tìm thấy, liên kết tài khoản này với Google ID
                user.googleId = sub;
                await user.save();
            } else {
                // Nếu không có tài khoản nào, tạo mới
                user = await User.create({
                    googleId: sub,
                    username: name,
                    email: email,
                });
            }
        }
        
        // Trả về token của ứng dụng
        res.status(200).json({
            success: true,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(400).json({ success: false, message: 'Google authentication failed' });
    }
};