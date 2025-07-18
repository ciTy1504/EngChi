import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { translations } from '../constants/translations';

export const useTranslations = () => {
  const { language } = useContext(LanguageContext);
  
  return translations[language];
};