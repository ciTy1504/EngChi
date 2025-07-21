//  src/constants/nappData.js
/**
 * Cấu hình trung tâm cho tất cả các tính năng.
 * - id: Định danh duy nhất.
 * - path: Đường dẫn URL (ví dụ: /vocab).
 * - icon: Biểu tượng hiển thị trên HomePage.
 * - pageComponent: Tên của component chính cho tính năng này (dùng trong App.jsx).
 * - selectionProps: Dữ liệu để truyền vào FeatureLevelSelectionPage.
 *   - featureType: Loại để gọi API (ví dụ: 'vocab', 'translation').
 *   - pageTitleKey, pageSubtitleKey: Key trong file translations.js để lấy tiêu đề.
 */
export const featureConfig = [
    { 
      id: 'vocab', 
      path: '/vocab', 
      icon: '📚',
      pageComponent: 'QuizPage',
      selectionProps: {
        featureType: 'vocab',
        featurePath: '/vocab',
        pageTitleKey: 'level_selection_title',
        pageSubtitleKey: 'level_selection_subtitle',
      }
    },
    { 
      id: 'translate', 
      path: '/translate', 
      icon: '🌍',
      pageComponent: 'TranslatePage',
      selectionProps: {
        featureType: 'translation',
        featurePath: '/translate',
        pageTitleKey: 'translate_level_selection_title',
        pageSubtitleKey: 'translate_level_selection_subtitle',
      }
    },
    { 
      id: 'reading', 
      path: '/reading', 
      icon: '📖',
      pageComponent: 'ReadingPage',
      selectionProps: {
        featureType: 'reading',
        featurePath: '/reading',
        pageTitleKey: 'reading_level_selection_title',
        pageSubtitleKey: 'reading_level_selection_subtitle',
      }
    },
    { 
      id: 'grammar', 
      path: '/grammar', 
      icon: '✍️',
      pageComponent: 'GrammarHomePage', 
      selectionProps: {
        featureType: 'grammar',
        featurePath: '/grammar',
        pageTitleKey: 'grammar_level_selection_title',
        pageSubtitleKey: 'grammar_level_selection_subtitle',
      }
    }
    // KHI THÊM TÍNH NĂNG MỚI, CHỈ CẦN THÊM MỘT OBJECT VÀO ĐÂY
];

export const features = {
  en: [
    { id: 'vocab', name: 'Vocabulary', icon: '📚', path: '/vocab' },
    { id: 'translate', name: 'Translate', icon: '🌍', path: '/translate' },
    { id: 'reading', name: 'Reading', icon: '📖', path: '/reading' },
    { id: 'grammar', name: 'Grammar', icon: '✍️', path: '/grammar' },
    { id: 'idioms', name: 'Idioms', icon: '💡', path: '/idioms' },
    { id: 'listening', name: 'Listening', icon: '🎧', path: '/listening' },
    { id: 'pronunciation', name: 'Pronunciation', icon: '🎙️', path: '/pronunciation' },
    { id: 'chat', name: 'AI Chat', icon: '💬', path: '/chat' },
  ],
  zh: [
    { id: 'vocab', name: '词汇', icon: '📚', path: '/vocab' },
    { id: 'translate', name: '翻译', icon: '🌍', path: '/translate' },
    { id: 'reading', name: '阅读', icon: '📖', path: '/reading' },
    { id: 'grammar', name: '语法', icon: '✍️', path: '/grammar' },
    { id: 'idioms', name: '成语', icon: '💡', path: '/idioms' },
    { id: 'listening', name: '听力', icon: '🎧', path: '/listening' },
    { id: 'pronunciation', name: '发音', icon: '🎙️', path: '/pronunciation' },
    { id: 'chat', name: 'AI 对话', icon: '💬', path: '/chat' },
  ],
};

export const sidebarMenu = [
    { id: 'home', path: '/', icon: '🏠' },
    { id: 'progress', path: '/progress', icon: '📈' },
    { id: 'stats', path: '/stats', icon: '📊' },
    { id: 'profile', path: '/profile', icon: '👤' },
    { id: 'settings', path: '/settings', icon: '⚙️' },
];