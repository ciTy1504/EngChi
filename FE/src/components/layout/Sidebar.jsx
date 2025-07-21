// src/components/layout/Sidebar.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { sidebarMenu } from '../../constants/appData';
import ConfirmDialog from '../shared/ConfirmDialog';
import { toast } from 'react-hot-toast';

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { logout } = useAuth();
  const t = useTranslations();
  const [isLogoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleNavigate = (path) => navigate(`/${language}${path}`);

  const handleConfirmLogout = () => {
    logout();
    setLogoutDialogOpen(false);
    toast.success(t.logout_success_message);
  };

  return (
    <>
      <aside
        className={`bg-gray-800 text-white flex flex-col 
                   transition-all duration-300 ease-in-out 
                   ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}`}
      >
        <div className="flex flex-col justify-between h-full p-4">
          <nav className="flex flex-col space-y-2 mt-4">
            {sidebarMenu.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.path)}
                className="flex items-center space-x-3 px-4 py-2 rounded hover:bg-gray-700 transition-colors text-left w-full"
              >
                <span>{item.icon}</span>
                <span>{t[`sidebar_${item.id}`]}</span>
              </button>
            ))}
          </nav>
          
          <div>
            <button
              type="button"
              onClick={() => setLogoutDialogOpen(true)}
              className="flex items-center space-x-3 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition-colors text-left w-full mt-4"
            >
              <span><LogoutIcon /></span>
              <span>{t.sidebar_logout}</span>
            </button>
          </div>

        </div>
      </aside>

      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
        title={t.logout_confirm_title}
        message={t.logout_confirm_message}
        confirmText={t.logout_confirm_button}
        cancelText={t.logout_cancel_button}
      />
    </>
  );
};

export default Sidebar;