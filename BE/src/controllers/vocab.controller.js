// File: src/controllers/vocab.controller.js
const mongoose = require('mongoose'); // SỬA LỖI: Thêm dòng này
const UserProgress = require('../models/userProgress.model');
const MasterLesson = require('../models/masterLesson.model');

// @desc    Lấy tất cả các từ cần review của người dùng từ tất cả các level
// @route   GET /api/vocab/review-words
// @access  Private
exports.getReviewWords = async (req, res) => {
    try {
        const userId = req.user.id;
        const progressEntries = await UserProgress.find({ user: userId, 'progressData.reviewWords.0': { $exists: true } }).lean();

        if (!progressEntries || progressEntries.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const allReviewWordsMap = new Map();
        progressEntries.forEach(progress => {
            (progress.progressData.reviewWords || []).forEach(reviewWord => {
                if (!allReviewWordsMap.has(reviewWord.word)) {
                    allReviewWordsMap.set(reviewWord.word, reviewWord.masterLessonId);
                }
            });
        });
        
        const lessonIds = [...new Set(allReviewWordsMap.values())];
        const masterLessons = await MasterLesson.find({ _id: { $in: lessonIds } }).select('content.words').lean();
        
        const wordDataMap = new Map();
        masterLessons.forEach(lesson => {
            (lesson.content.words || []).forEach(word => {
                wordDataMap.set(word.word, word);
            });
        });
        
        const reviewQuizData = [];
        allReviewWordsMap.forEach((lessonId, word) => {
             if(wordDataMap.has(word)) {
                reviewQuizData.push({
                    wordData: wordDataMap.get(word),
                    // Gửi kèm masterLessonId để frontend biết cập nhật progress của lesson nào
                    masterLessonId: lessonId.toString()
                });
             }
        });

        res.status(200).json({ success: true, data: reviewQuizData });

    } catch (error) {
        console.error("Get Review Words Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Lấy tổng số lượng từ cần review
// @route   GET /api/vocab/review-count
// @access  Private
exports.getReviewWordCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await UserProgress.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $project: { reviewCount: { $size: { $ifNull: [ "$progressData.reviewWords", [] ] } } } },
            { $group: { _id: null, total: { $sum: "$reviewCount" } } }
        ]);

        const count = result.length > 0 ? result[0].total : 0;
        res.status(200).json({ success: true, data: { count } });

    } catch (error) {
        console.error("Get Review Word Count Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};