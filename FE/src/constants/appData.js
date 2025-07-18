// --- START OF FILE appData.js (SỬA LẠI) ---
export const features = {
  en: [
    // Thêm `id` vào đây
    { id: 'vocab', name: 'Vocabulary', icon: '📚', path: '/vocab' },
    { id: 'reading', name: 'Reading', icon: '📖', path: '/reading' },
    { id: 'translate', name: 'Translate', icon: '🌍', path: '/translate' },
    { id: 'grammar', name: 'Grammar', icon: '✍️', path: '/grammar' },
  ],
  zh: [
    // Thêm `id` vào đây
    { id: 'vocab', name: '词汇', icon: '📚', path: '/vocab' },
    { id: 'reading', name: '阅读', icon: '📖', path: '/reading' },
    { id: 'translate', name: '翻译', icon: '🌍', path: '/translate' },
    { id: 'grammar', name: '语法', icon: '✍️', path: '/grammar' },
  ],
};

// Phần sidebarMenu đã đúng, giữ nguyên
export const sidebarMenu = [
    { id: 'home', path: '/', icon: '🏠' },
    { id: 'profile', path: '/profile', icon: '👤' },
    { id: 'settings', path: '/settings', icon: '⚙️' },
];