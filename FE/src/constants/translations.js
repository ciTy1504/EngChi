// src/constants/translations.js

export const translations = {
  en: {
    // General
    loading: 'Loading...',
    error_prefix: 'Error',

    // HomePage
    home_title: 'Choose a feature to start',
    feature_name_vocab: 'Vocabulary',
    feature_name_reading: 'Reading',
    feature_name_translate: 'Translate',
    feature_name_grammar: 'Grammar',

    // VocabLevelSelectionPage
    level_selection_title: 'Select Your Level',
    level_selection_subtitle: 'Choose a level to start learning vocabulary.',
    back_to_home: '← Back to Home',
    loading_levels: 'Loading levels...',

    // QuizPage
    quiz_title: "Quiz - Level {level}",
    quiz_question_progress: "Question {current} / {total}",
    quiz_checking: 'Checking with AI...',
    quiz_correct: 'Correct!',
    quiz_incorrect: 'Incorrect.',
    quiz_next_button: 'Next',
    quiz_submit_button: 'Finish & Submit',
    quiz_submit_and_next: 'Submit & Next Question',
    quiz_please_answer_all: 'Please answer all questions',
    quiz_finish_and_review: 'Finish & Review Results',
    quiz_checking_all: 'Checking answers...',
    quiz_view_summary: 'View Summary Page',
    quiz_awaiting_final_results: 'Awaiting final check...',
    quiz_congrats_title: 'Congratulations!',
    quiz_congrats_body: 'You have mastered all the words in level {level}.',

    // QuizResults
    quiz_results_title: "Quiz Results - Level {level}",
    quiz_results_your_answer: "Your answer:",
    quiz_results_unanswered: "(unanswered)",
    quiz_results_correct_answer: "Correct answer:",
    quiz_results_word_action_prompt: "Action for this word:",
    quiz_results_action_keep: "Keep for review",
    quiz_results_action_review: "Review Later",
    quiz_results_action_delete: "Delete (Mastered)",
    quiz_results_instructions: "For correctly answered words, choose a corresponding action. Incorrect words will automatically be kept for the next session.",
    quiz_results_save_and_finish: "Save Progress & Finish",
    quiz_results_saving: "Saving...",
    quiz_results_save_success: "Progress saved successfully!",
    quiz_results_save_error: "Error saving progress:",
    loading_results: 'Loading results or missing data...',
    quiz_choose_another_level: '← Choose another level',

    // Sidebar
    sidebar_home: 'Home',
    sidebar_profile: 'Profile',
    sidebar_settings: 'Settings',
    sidebar_logout: 'Logout',
    logout_confirm_title: 'Confirm Logout',
    logout_confirm_message: 'Are you sure you want to log out?',
    logout_confirm_button: 'Logout',
    logout_cancel_button: 'Cancel',
    logout_success_message: 'Logged out successfully!',

    // Question Navigator
    navigator_go_to_question: 'Go to question {number}',

    // Translate Feature
    translate_level_selection_title: 'Select Translation Level',
    translate_level_selection_subtitle: 'Choose a level to start practicing translation.',
    translate_loading_question: 'Loading question...',
    back_to_level_selection: '← Back to Level Selection',
    translate_no_questions: 'No more questions available for this level. Please check back later!',
    translate_next_question: 'Next Question',
    translate_submit: 'Submit for Grading',
    translate_submitting: 'Grading...',
    translate_source_text: 'Source Text',
    translate_your_translation: 'Your Translation',
    translate_placeholder: 'Type your translation here...',
    translate_result_score: 'Your Score',
    translate_result_suggested: 'Suggested Translation',
    translate_result_feedback: 'Improvement Suggestions',
  },
  zh: {
    // General
    loading: '加载中...',
    error_prefix: '错误',
    
    // HomePage
    home_title: '请选择一个功能开始',
    feature_name_vocab: '词汇',
    feature_name_reading: '阅读',
    feature_name_translate: '翻译',
    feature_name_grammar: '语法',

    // VocabLevelSelectionPage
    level_selection_title: '选择你的等级',
    level_selection_subtitle: '请选择一个级别开始学习词汇。',
    back_to_home: '← 返回首页',
    loading_levels: '正在加载等级...',

    // QuizPage
    quiz_title: "测验 - 等级 {level}",
    quiz_question_progress: "第 {current} 题 / 共 {total} 题",
    quiz_checking: '正在用AI检查...',
    quiz_correct: '正确!',
    quiz_incorrect: '错了。',
    quiz_next_button: '下一题',
    quiz_submit_button: '完成并提交',
    quiz_submit_and_next: '提交并进入下一题',
    quiz_please_answer_all: '请回答所有问题',
    quiz_finish_and_review: '完成并查看结果',
    quiz_checking_all: '正在检查答案...',
    quiz_view_summary: '查看总结页面',
    quiz_awaiting_final_results: '等待最终检查...',
    quiz_congrats_title: '恭喜！',
    quiz_congrats_body: '您已掌握 {level} 等级的所有单词。',

    // QuizResults
    quiz_results_title: "测验结果 - 等级 {level}",
    quiz_results_your_answer: "你的回答：",
    quiz_results_unanswered: "(未回答)",
    quiz_results_correct_answer: "正确答案：",
    quiz_results_word_action_prompt: "对此单词的操作：",
    quiz_results_action_keep: "保留复习",
    quiz_results_action_review: "稍后复习",
    quiz_results_action_delete: "删除 (已掌握)",
    quiz_results_instructions: "对于回答正确的单词，请选择相应的操作。答错的单词将自动保留以便下次学习。",
    quiz_results_save_and_finish: "保存进度并完成",
    quiz_results_saving: "保存中...",
    quiz_results_save_success: "进度保存成功！",
    quiz_results_save_error: "保存进度时出错：",
    loading_results: '正在加载结果或数据丢失...',
    quiz_choose_another_level: '← 选择其他等级',
    
    // Sidebar
    sidebar_home: '首页',
    sidebar_profile: '个人资料',
    sidebar_settings: '设置',
    sidebar_logout: '登出',
    logout_confirm_title: '确认登出',
    logout_confirm_message: '您确定要登出吗？',
    logout_confirm_button: '登出',
    logout_cancel_button: '取消',
    logout_success_message: '已成功登出！',
    
    // Question Navigator
    navigator_go_to_question: '跳转到第 {number} 题',

    // Translate Feature
    translate_level_selection_title: '选择翻译等级',
    translate_level_selection_subtitle: '请选择一个级别开始练习翻译。',
    translate_loading_question: '正在加载题目...',
    back_to_level_selection: '← 返回等级选择',
    translate_no_questions: '该级别已无更多题目，请稍后再试！',
    translate_next_question: '下一题',
    translate_submit: '提交评分',
    translate_submitting: '评分中...',
    translate_source_text: '原文',
    translate_your_translation: '你的翻译',
    translate_placeholder: '在此输入您的翻译...',
    translate_result_score: '你的得分',
    translate_result_suggested: '建议翻译',
    translate_result_feedback: '改进建议',
  },
};