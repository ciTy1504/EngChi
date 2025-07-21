// src/contexts/LanguageContext.jsx
import React, { createContext, useState, useMemo } from 'react';

// 1. Tạo Context
export const LanguageContext = createContext();

// 2. Tạo Provider component
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en'); // 'en' hoặc 'zh'

  // Dùng useMemo để tránh re-render không cần thiết
  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}