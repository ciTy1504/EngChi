// File: src/models/userProgress.model.js
const mongoose = require('mongoose');

const ReviewWordSchema = new mongoose.Schema({
    word: { type: String, required: true },
    masterLessonId: { type: mongoose.Schema.ObjectId, ref: 'MasterLesson', required: true },
}, { _id: false });

const UserProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.ObjectId, ref: 'MasterLesson', required: true },
  
  progressData: {
    deletedWords: { type: [String], default: [] },
    reviewWords: { type: [ReviewWordSchema], default: [] }, 

    items: {
        type: [{
            questionId: { type: String, required: true },
            counter: { type: Number, default: 0 }
        }],
        default: undefined 
    },
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