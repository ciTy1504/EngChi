// File: controllers/auth.controller.js
const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// [THÊM MỚI] Token tạm thời để hoàn thành hồ sơ
const generateSetupToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SETUP_SECRET, {
    expiresIn: '15m', // Chỉ có hiệu lực trong 15 phút
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  // [SỬA ĐỔI] Thêm aiApiKey
  const { username, email, password, aiApiKey } = req.body;

  if (!username || !email || !password || !aiApiKey) {
      res.status(400);
      throw new Error('Please provide username, email, password, and AI API Key');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    username,
    email,
    password,
    aiApiKey, // [SỬA ĐỔI]
  });

  if (user) {
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => { 
  const { email, password } = req.body;

  if (!email || !password) {
      res.status(400); 
      throw new Error('Please provide email and password'); 
  }

  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    // [THÊM MỚI] Kiểm tra xem user có cần hoàn thành hồ sơ không
    if (!user.aiApiKey || !user.password) {
        res.status(200).json({
            success: true,
            profileComplete: false,
            setupToken: generateSetupToken(user._id),
        });
        return;
    }
    
    res.json({
      success: true,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials'); 
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
    // [SỬA ĐỔI] Không trả về aiApiKey
    const user = await User.findById(req.user.id).select('-password -aiApiKey');

    if (!user) {
        res.status(404); 
        throw new Error('User not found');
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc    Auth user with Google
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        res.status(400).throw(new Error('Google token is required'));
    }

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, sub } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId: sub }, { email: email }] });

    if (user) {
        // User đã tồn tại. Kiểm tra xem hồ sơ đã hoàn chỉnh chưa.
        if (!user.googleId) {
            user.googleId = sub;
            await user.save({ validateBeforeSave: false }); // Bỏ qua validation vì có thể thiếu password/apikey
        }

        if (user.password && user.aiApiKey) {
            // Hồ sơ hoàn chỉnh, đăng nhập và trả về token thật
            res.status(200).json({
                success: true,
                token: generateToken(user._id),
                profileComplete: true,
            });
        } else {
            // Hồ sơ chưa hoàn chỉnh, trả về token tạm thời
            res.status(200).json({
                success: true,
                setupToken: generateSetupToken(user._id),
                profileComplete: false,
            });
        }
    } else {
        // User hoàn toàn mới. Tạo user và yêu cầu hoàn thành hồ sơ.
        user = await User.create({
            googleId: sub,
            username: name,
            email: email,
        });
        res.status(200).json({
            success: true,
            setupToken: generateSetupToken(user._id),
            profileComplete: false,
        });
    }
});

// [THÊM MỚI] Endpoint để hoàn thành hồ sơ
// @desc    Complete user profile after social login or if incomplete
// @route   POST /api/auth/complete-profile
// @access  Private (with setup token)
exports.completeProfile = asyncHandler(async (req, res) => {
    const { password, aiApiKey } = req.body;
    
    if (!password || !aiApiKey) {
        res.status(400);
        throw new Error('Password and AI API Key are required');
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    if(user.password && user.aiApiKey) {
        res.status(400);
        throw new Error('Profile already complete');
    }

    user.password = password;
    user.aiApiKey = aiApiKey;
    await user.save();

    res.status(200).json({
        success: true,
        token: generateToken(user._id),
    });
});