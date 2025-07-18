import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { features } from '../../constants/appData';
import { useTranslations } from '../../hooks/useTranslations';
import { LanguageContext } from '../../contexts/LanguageContext';

const FeatureCard = ({ name, icon, path }) => (
  <Link to={path} className="w-full max-w-xs">
    <button className="flex flex-col items-center justify-center w-full h-40 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors transform hover:-translate-y-1">
      <span className="text-4xl mb-2">{icon}</span>
      <span className="text-xl font-semibold">{name}</span>
    </button>
  </Link>
);

const HomePage = () => {
  const t = useTranslations();
  const { language } = React.useContext(LanguageContext);
  const currentFeatures = features[language];

  return (
    <>
      <h2 className="text-3xl font-bold text-center text-gray-700 mb-12">
        {t.home_title}
      </h2>

      <div className="w-full max-w-2xl mx-auto"> 
        <div className="grid grid-cols-2 gap-8 justify-items-center">
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