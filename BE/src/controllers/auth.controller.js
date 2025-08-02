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

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
      res.status(400);
      throw new Error('Please provide username, email, and password');
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
    const user = await User.findById(req.user.id).select('-password');

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
        res.status(400);
        throw new Error('Google token is required');
    }

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, sub } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId: sub }, { email: email }] });

    if (user) {
        if (!user.googleId) {
            user.googleId = sub;
            await user.save();
        }
    } else {
        user = await User.create({
            googleId: sub,
            username: name,
            email: email,
        });
    }
    
    res.status(200).json({
        success: true,
        token: generateToken(user._id),
    });
});