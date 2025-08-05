const UserProgress = require('../models/userProgress.model');
const asyncHandler = require('express-async-handler');

const progressUpdateActions = {
    'delete_words': async (progress, payload) => {
        progress.progressData.deletedWords.addToSet(...(payload.words || []));
    },
    'review_words': async (progress, payload) => {
        const wordsToReview = payload.words.map(w => ({
            word: w.word,
            masterLessonId: w.masterLessonId
        }));

        wordsToReview.forEach(newWord => {
            if (!progress.progressData.reviewWords.some(existing => existing.word === newWord.word)) {
                progress.progressData.reviewWords.push(newWord);
            }
        });
    },
    'remove_review_words': async (progress, payload) => {
        const wordsToRemove = payload.words || [];
        progress.progressData.reviewWords = progress.progressData.reviewWords.filter(
            reviewWord => !wordsToRemove.includes(reviewWord.word)
        );
        progress.progressData.deletedWords.addToSet(...wordsToRemove);
    }
};

exports.updateProgress = asyncHandler(async (req, res) => {
    const { progressId } = req.params;
    const { action, payload } = req.body;

    const progress = await UserProgress.findById(progressId);
    if (!progress) {
        res.status(404);
        throw new Error('Progress not found');
    }
    if (progress.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const handler = progressUpdateActions[action];
    if (!handler) {
        res.status(400);
        throw new Error(`Invalid action: ${action}`);
    }

    await handler(progress, payload);
    await progress.save();

    res.status(200).json({ success: true, data: progress });
});