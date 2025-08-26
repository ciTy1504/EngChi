// File: models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/crypto');

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
    required: function() { return !this.googleId; }, 
    minlength: 6,
    select: false,
  },
  aiApiKey: {
    type: String,
    required: function() { return !this.googleId; },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isModified('aiApiKey') && this.aiApiKey) {
    this.aiApiKey = encrypt(this.aiApiKey);
  }
  
  next();
});


UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; 
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getDecryptedApiKey = function () {
    if (!this.aiApiKey) {
        throw new Error('User does not have an AI API key configured.');
    }
    return decrypt(this.aiApiKey);
};

module.exports = mongoose.model('User', UserSchema);