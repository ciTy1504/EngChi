// src/pages/Auth/AuthLayout.jsx
import React from 'react';
import backgroundImage from '../../assets/images/background_login.jpeg';

const AuthLayout = ({ children, title }) => {
    return (
        <div
            className="flex items-center justify-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50" />

            <div className="relative z-10 p-8 bg-white rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {title}
                </h2>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;