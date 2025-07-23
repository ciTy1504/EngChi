// src/components/layout/Header.jsx
import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom'; // <-- 1. Import useLocation
import { LanguageContext } from '../../contexts/LanguageContext';
import LanguageToggle from '../shared/LanguageToggle';

// Import logo
import logoEN from '../../assets/images/logo-en.png';
import logoZH from '../../assets/images/logo-zh.png';

const brandInfo = {
  en: {
    logo: logoEN,
    name: 'Công Thái Học',
  },
  zh: {
    logo: logoZH,
    name: '公泰同学',
  },
};

const Header = () => {
  const { language } = useContext(LanguageContext);
  const location = useLocation();
  const currentBrand = brandInfo[language];
  const isPracticePage = /\/(vocab|translate|reading|grammar)\/.+/.test(location.pathname);

  return (
    <header className="w-full p-4 bg-gradient-to-r from-white to-slate-200 border-b border-slate-200 flex justify-between items-center">

      <div className="flex items-center gap-3">
        <img src={currentBrand.logo} alt="Brand Logo" className="h-12 w-12" />
        <h1 className="text-xl font-bold text-gray-800">{currentBrand.name}</h1>
      </div>
      
      {!isPracticePage && <LanguageToggle />}
    </header>
  );
};

export default Header;