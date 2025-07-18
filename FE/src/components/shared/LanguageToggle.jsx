// --- START OF FILE LanguageToggle.jsx (SỬA LẠI) ---
import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // <-- Import thêm useLocation
import { LanguageContext } from '../../contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation(); // <-- Lấy vị trí hiện tại
  const isEnglish = language === 'en';

  const toggleLanguage = () => {
    const newLanguage = isEnglish ? 'zh' : 'en';
    
    // Tạm thời set context để UI thay đổi ngay lập tức
    setLanguage(newLanguage); 

    // Lấy path hiện tại sau phần ngôn ngữ
    // ví dụ, từ /en/vocab/A1 -> sẽ lấy /vocab/A1
    const currentPath = location.pathname.substring(3); // Bỏ đi '/en' hoặc '/zh'

    // Tạo URL mới và điều hướng
    navigate(`/${newLanguage}${currentPath}`, { replace: true });
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`relative w-24 h-10 rounded-full transition-colors duration-500 border-2 shadow-inner
        ${isEnglish ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'}`}
    >
      {/* ENG */}
      <span
        className={`absolute left-3 top-1/2 -translate-y-1/2 text-white font-bold text-sm transition-opacity duration-500 delay-[100ms]
          ${isEnglish ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <span className="text-green-900">ENG</span>
      </span>

      {/* 中文 */}
      <span
        className={`absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold text-sm transition-opacity duration-500 delay-[100ms]
          ${!isEnglish ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <span className="text-red-900">中文</span>
      </span>

      {/* Nút tròn trượt */}
      <span
        className={`absolute top-1/2 -translate-y-1/2 left-0.5 w-8 h-8 bg-white rounded-full shadow-md transform transition-transform duration-700 ease-in-out
        ${isEnglish ? 'translate-x-14' : 'translate-x-0'}`}
      ></span>
    </button>
  );
};

export default LanguageToggle;