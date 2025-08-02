// src/controllers/idiom.controller.js
const MasterLesson = require('../models/masterLesson.model');
const asyncHandler = require('express-async-handler');

// @desc    Get the entire idiom library for a specific language
// @route   GET /api/idioms
// @access  Private
exports.getIdiomLibrary = asyncHandler(async (req, res) => {
    const { language } = req.query;

    if (!language) {
        res.status(400);
        throw new Error('Language query parameter is required.');
    }

    const idiomLibraryDoc = await MasterLesson.findOne({ type: 'idiom', language: language })
                                              .select('content.categories');

    if (!idiomLibraryDoc || !idiomLibraryDoc.content || !idiomLibraryDoc.content.categories) {
        return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({ success: true, data: idiomLibraryDoc.content.categories });
});