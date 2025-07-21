// src/pages/HomePage/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { features } from '../../constants/appData';
import { useTranslations } from '../../hooks/useTranslations';
import { LanguageContext } from '../../contexts/LanguageContext';

const FeatureCard = ({ name, icon, path }) => (
  <Link to={path} className="group">
    <div className="flex flex-col items-center justify-center w-full h-36 sm:h-40 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-2 border-b-4 border-transparent group-hover:border-blue-500">
      <span className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110">{icon}</span>
      <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">{name}</span>
    </div>
  </Link>
);

const HomePage = () => {
  const t = useTranslations();
  const { language } = React.useContext(LanguageContext);
  const currentFeatures = features[language];

  return (
    <>
      <h2 className="text-3xl font-bold text-center mb-12">
        {t.home_title}
      </h2>
      <div className="w-full max-w-5xl mx-auto"> 
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {currentFeatures.map(feature => (
            <FeatureCard
              key={feature.id}
              name={t[`feature_name_${feature.id}`]}
              icon={feature.icon}
              path={`/${language}${feature.path}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default HomePage;