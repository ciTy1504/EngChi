// src/components/layout/LanguageSetter.jsx
import React, { useContext, useEffect } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';

const LanguageSetter = () => {
  const { lang } = useParams(); // Lấy 'en' hoặc 'zh' từ URL
  const { setLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra xem 'lang' có hợp lệ không ('en' hoặc 'zh')
    if (lang && ['en', 'zh'].includes(lang)) {
      setLanguage(lang);
    } else {
      // Nếu lang không hợp lệ, điều hướng về trang chủ
      console.warn(`Invalid language code '${lang}' in URL. Redirecting to home.`);
      navigate('/');
    }
  }, [lang, setLanguage, navigate]);

  // Render các route con (nested routes)
  return <Outlet />;
};

export default LanguageSetter;