// File: models/userProgress.model.js
const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.ObjectId, ref: 'MasterLesson', required: true },
  
  // Dữ liệu tiến trình, cấu trúc phụ thuộc vào loại bài học
  progressData: {
    deletedWords: {
        type: [String], // Mảng các chuỗi
        default: []
    },
    reviewWords: {
        type: [String], // Mảng các chuỗi
        default: []
    },

    // Các trường dành cho các loại bài khác (ví dụ: translation, grammar)
    // Bạn có thể thêm các trường này nếu cần
    // items: {
    //     type: [{ questionId: String, counter: Number }],
    //     default: undefined // Sẽ không tồn tại nếu không phải loại bài đó
    // }

    items: {
        type: [{
            questionId: { type: String, required: true },
            counter: { type: Number, default: 0 }
        }],
        default: undefined 
    }
  },
  
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  lastUpdatedAt: { type: Date, default: Date.now },
});

UserProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', UserProgressSchema);