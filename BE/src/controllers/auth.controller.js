// File: controllers/auth.controller.js
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ... hàm register và getMe giữ nguyên, chúng đã đúng ...
exports.register = asyncHandler(async (req, res) => {
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
    aiApiKey,
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

exports.getMe = asyncHandler(async (req, res) => {
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
// ----------------------------------------------------


// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => { 
  const { email, password } = req.body;

  if (!email || !password) {
      res.status(400); 
      throw new Error('Please provide email and password'); 
  }

  // Luôn lấy password để so sánh
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    // [DỌN DẸP LOGIC] Bỏ đoạn kiểm tra profile chưa hoàn chỉnh.
    // Nếu user đăng nhập được bằng password, có nghĩa là hồ sơ của họ đã hoàn chỉnh.
    res.json({
      success: true,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials'); 
  }
});


exports.googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
      res.status(400);
      throw new Error('Google token is required');
  }

  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
  });
  const { name, email, sub } = ticket.getPayload();

  
  const user = await User.findOne({ $or: [{ googleId: sub }, { email: email }] }).select('+password +aiApiKey');

  if (user && user.password && user.aiApiKey) {
    if (!user.googleId) {
        user.googleId = sub;
        await user.save({ validateBeforeSave: false });
    }
    res.status(200).json({
        success: true,
        token: generateToken(user._id),
        profileComplete: true,
    });
    return;
  }

  const setupTokenPayload = { name, email, googleId: sub };
  const setupToken = jwt.sign(setupTokenPayload, process.env.JWT_SETUP_SECRET, {
      expiresIn: '15m',
  });

  res.status(200).json({
      success: true,
      setupToken: setupToken,
      profileComplete: false, 
  });
});


// @desc    Complete profile using info from setup token (từ Google)
// @route   POST /api/auth/complete-profile
// @access  Public (sử dụng setup token)
// [GIỮ NGUYÊN] Logic này đã chính xác cho luồng mới
exports.completeProfile = asyncHandler(async (req, res) => {
  console.log('>>> RECEIVED REQUEST BODY:', req.body); 
  const { password, aiApiKey, setupToken } = req.body;

  if (!password || !aiApiKey || !setupToken) {
      res.status(400);
      throw new Error('Password, AI API Key, and setupToken are required');
  }

  let decoded;
  try {
    console.log('[VERIFYING] Using JWT_SETUP_SECRET:', process.env.JWT_SETUP_SECRET);
    decoded = jwt.verify(setupToken, process.env.JWT_SETUP_SECRET);
  } catch (err) {
    console.error('JWT Verification Failed:', err.message);
    res.status(401);
    throw new Error('Not authorized: Invalid or expired setup token');
  }
  
  const { name, email, googleId } = decoded;

  // Kiểm tra lại lần nữa để tránh người dùng mở 2 tab và tạo 2 lần
  const userExists = await User.findOne({ $or: [{ googleId: googleId }, { email: email }] });

  if (userExists) {
      // Nếu user đã tồn tại rồi, chỉ cần đăng nhập cho họ
      res.status(200).json({
          success: true,
          token: generateToken(userExists._id),
      });
      return;
  }
  
  // Chỉ tạo user khi nhận đủ thông tin
  const user = await User.create({
      username: name,
      email,
      googleId,
      password,
      aiApiKey
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