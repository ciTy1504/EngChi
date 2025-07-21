// File: models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    // SỬA: Mật khẩu chỉ bắt buộc khi không có googleId
    required: function() { return !this.googleId; },
    minlength: 6,
    select: false,
  },
  // THÊM: trường để lưu ID từ Google
  googleId: {
    type: String,
    unique: true,
    sparse: true // Cho phép nhiều document có giá trị null, nhưng giá trị có thật thì phải là duy nhất
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Mã hóa password trước khi lưu
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// So sánh password nhập vào với password đã mã hóa
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);