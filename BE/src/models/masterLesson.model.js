// src/models/masterLesson.model.js

const mongoose = require('mongoose');

// --- CÁC SCHEMA CON ---
const OptionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

// Dùng chung cho Reading và Grammar
const QuestionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  qType: { type: String, required: true, enum: ['multiple_choice_single', 'multiple_choice_multiple', 'fill_in_blank'] },
  prompt: { type: String, required: true },
  options: { type: [OptionSchema], default: undefined },
  answers: { type: [String], default: undefined },
  explanation: { type: String },
  relatedTheoryId: { type: String }
});

const ArticleSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  articleText: { type: String, required: true },
  questions: [QuestionSchema],
});

// Dùng cho Translation
const TranslationItemSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  source: { type: String, required: true },
  suggestedTranslation: { type: String, required: true }
});

const VocabWordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  pronounce: { type: String },
});

// Schema mới cho Lý thuyết Grammar
const TheoryItemSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    contentHTML: { type: String }, 
    children: { type: [this], default: undefined }, 
});


// --- MASTER LESSON SCHEMA
const MasterLessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  language: { type: String, required: true, enum: ['en', 'zh'] },
  type: {
    type: String,
    required: true,
    enum: ['vocab', 'translation', 'reading', 'grammar'],
  },
  level: { type: String },
  order: { type: Number, default: 0 },

  content: {
    articles: { type: [ArticleSchema], default: undefined },
    questions: { type: [TranslationItemSchema], default: undefined }, 
    words: { type: [VocabWordSchema], default: undefined },
    
    grammarTheory: { type: [TheoryItemSchema], default: undefined },
    grammarQuestions: { type: [QuestionSchema], default: undefined }, 
  },

  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

MasterLessonSchema.index({ type: 1, language: 1, order: 1 });

module.exports = mongoose.model('MasterLesson', MasterLessonSchema);