// src/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  // Log lỗi ra console để debug (trong môi trường dev)
  console.error(err.stack);

  // Mặc định là lỗi server
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    success: false,
    message: err.message,
    // Chỉ hiển thị stack trace trong môi trường development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };