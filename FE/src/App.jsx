// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage/HomePage';
import CompleteProfilePage from './pages/Auth/CompleteProfilePage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import MainLayout from './components/layout/MainLayout';
import LanguageSetter from './components/layout/LanguageSetter';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

import FeatureLevelSelectionPage from './features/shared/FeatureLevelSelectionPage';

import QuizPage from './features/vocab/QuizPage'; 
import TranslatePage from './features/translate/TranslatePage';
import ReadingPage from './features/reading/ReadingPage';

import GrammarLandingPage from './features/grammar/GrammarLandingPage';
import GrammarTheoryPage from './features/grammar/GrammarTheoryPage';
import GrammarQuizPage from './features/grammar/GrammarQuizPage';

import IdiomLibraryPage from './features/idiom/IdiomLibraryPage'; 

import { featureConfig } from './constants/appData';

const pageComponents = {
  QuizPage,
  TranslatePage,
  ReadingPage,
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/complete-profile" element={<CompleteProfilePage />} />
      <Route path="/" element={<Navigate to="/en" replace />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/:lang" element={<LanguageSetter />}>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            
            {featureConfig.map(feature => {
              const PageComponent = pageComponents[feature.pageComponent];
              if (!PageComponent) return null; 

              return (
                <React.Fragment key={feature.id}>
                  <Route 
                    path={feature.path.substring(1)} 
                    element={<FeatureLevelSelectionPage {...feature.selectionProps} />}
                  />
                  <Route 
                    path={`${feature.path.substring(1)}/:lessonId`} 
                    element={<PageComponent />}
                  />
                </React.Fragment>
              );
            })}

            <Route 
              path="vocab/review"
              element={<QuizPage isReviewMode={true} />}
            />

            <Route path="grammar" element={<GrammarLandingPage />} />
            <Route path="grammar/theory" element={<GrammarTheoryPage />} />
            <Route 
                path="grammar/practice" 
                element={
                    <FeatureLevelSelectionPage 
                        featureType="grammar"
                        featurePath="/grammar/practice"
                        pageTitleKey="grammar_practice_selection_title"
                        pageSubtitleKey="grammar_practice_selection_subtitle"
                        backButtonPath="/grammar"
                    />
                } 
            />
            <Route path="grammar/practice/:lessonId" element={<GrammarQuizPage />} />
            
            <Route path="idioms" element={<IdiomLibraryPage />} />

            <Route path="settings" element={<SettingsPage />} />

          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;