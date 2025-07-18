// src/App.jsx
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import VocabLevelSelectionPage from './pages/Vocab/VocabLevelSelectionPage';
import QuizPage from './pages/Vocab/QuizPage';
import TranslateLevelSelectionPage from './pages/Translate/TranslateLevelSelectionPage';
import TranslatePage from './pages/Translate/TranslatePage';
import MainLayout from './components/layout/MainLayout';
import LanguageSetter from './components/layout/LanguageSetter';

// Auth Components
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to="/en" replace />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/:lang" element={<LanguageSetter />}>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            
            <Route path="vocab" element={<VocabLevelSelectionPage />} />
            <Route path="vocab/:levelId" element={<QuizPage />} />
            
            <Route path="translate" element={<TranslateLevelSelectionPage />} />
            <Route path="translate/:levelId" element={<TranslatePage />} />
            {/* Các route học tập khác sẽ nằm ở đây */}
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;