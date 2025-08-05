// File: middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // [SỬA ĐỔI QUAN TRỌNG]
    // Yêu cầu Mongoose lấy tất cả các trường mặc định VÀ thêm trường aiApiKey.
    // Dấu '+' đảm bảo trường này được trả về để chúng ta có thể giải mã nó sau này.
    req.user = await User.findById(decoded.id).select('+aiApiKey');

    if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

exports.protectSetup = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized: No setup token' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SETUP_SECRET);
        req.user = { id: decoded.id };
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized: Invalid setup token' });
    }
};