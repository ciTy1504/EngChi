const mongoose = require('mongoose');

const MasterLessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  language: { type: String, required: true, enum: ['en', 'zh'] },
  type: {
    type: String,
    required: true,
    enum: ['vocab', 'translation', 'reading', 'grammar'],
  },

  level: { type: String },
  category: { type: String },

  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },

  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

MasterLessonSchema.index({ type: 1, language: 1, level: 1, category: 1 });

module.exports = mongoose.model('MasterLesson', MasterLessonSchema);