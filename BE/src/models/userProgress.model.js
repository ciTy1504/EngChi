// src/models/userProgress.model.js
const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.ObjectId, ref: 'MasterLesson', required: true },
  
  progressData: {
    // Dành cho vocab
    deletedWords: { type: [String], default: [] },
    reviewWords: { type: [String], default: [] },

    // Dành cho translation, grammar
    items: {
        type: [{
            questionId: { type: String, required: true },
            counter: { type: Number, default: 0 }
        }],
        default: undefined 
    },

    // Dành cho reading
    articleProgress: {
        type: [{
            articleId: { type: String, required: true },
            counter: { type: Number, default: 0 },
        }],
        default: undefined
    }
  },
  
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  lastUpdatedAt: { type: Date, default: Date.now, set: () => Date.now() },
});

UserProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', UserProgressSchema);