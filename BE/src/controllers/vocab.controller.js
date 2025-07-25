// File: src/controllers/vocab.controller.js
const mongoose = require('mongoose');
const UserProgress = require('../models/userProgress.model');
const MasterLesson = require('../models/masterLesson.model');

// @desc    Lấy tất cả các từ cần review của người dùng từ tất cả các level
// @route   GET /api/vocab/review-words
// @access  Private
exports.getReviewWords = async (req, res) => {
    try {
        const userId = req.user.id;
        // --- SỬA ĐỔI: Nhận 'language' từ query string ---
        const { language } = req.query;

        if (!language) {
            return res.status(400).json({ success: false, message: 'Language parameter is required for review.' });
        }

        // --- SỬA ĐỔI: Dùng aggregation để join với MasterLesson và lọc theo ngôn ngữ ---
        const progressEntries = await UserProgress.aggregate([
            // 1. Tìm các tiến trình của người dùng có từ cần review
            { $match: { user: new mongoose.Types.ObjectId(userId), 'progressData.reviewWords.0': { $exists: true } } },
            // 2. Join với collection 'masterlessons' để lấy thông tin ngôn ngữ
            {
                $lookup: {
                    from: 'masterlessons',
                    localField: 'lesson',
                    foreignField: '_id',
                    as: 'masterLessonInfo'
                }
            },
            // 3. Deconstruct mảng masterLessonInfo (vì join chỉ có 1 kết quả)
            { $unwind: '$masterLessonInfo' },
            // 4. Lọc các bài học theo ngôn ngữ được yêu cầu
            { $match: { 'masterLessonInfo.language': language } }
        ]);

        if (!progressEntries || progressEntries.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }
        
        // --- Phần còn lại của logic giữ nguyên, chỉ cần điều chỉnh nhỏ ---
        const allReviewWordsMap = new Map();
        progressEntries.forEach(progress => {
            (progress.progressData.reviewWords || []).forEach(reviewWord => {
                if (!allReviewWordsMap.has(reviewWord.word)) {
                    allReviewWordsMap.set(reviewWord.word, reviewWord.masterLessonId);
                }
            });
        });
        
        const lessonIds = [...new Set(allReviewWordsMap.values())].map(id => new mongoose.Types.ObjectId(id));
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
        // --- SỬA ĐỔI: Nhận 'language' từ query string ---
        const { language } = req.query;

        if (!language) {
            return res.status(400).json({ success: false, message: 'Language parameter is required for review count.' });
        }
        
        // --- SỬA ĐỔI: Thêm pipeline để lọc theo ngôn ngữ ---
        const result = await UserProgress.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'masterlessons',
                    localField: 'lesson',
                    foreignField: '_id',
                    as: 'masterLessonInfo'
                }
            },
            { $unwind: '$masterLessonInfo' },
            { $match: { 'masterLessonInfo.language': language } },
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