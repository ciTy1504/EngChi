// src/pages/Auth/CompleteProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Thêm useLocation
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../api/apiService';
import AuthLayout from './AuthLayout';

const CompleteProfilePage = () => {
    const [password, setPassword] = useState('');
    const [aiApiKey, setAiApiKey] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation(); // Dùng hook useLocation để lấy state
    const { setToken } = useAuth();

    // [SỬA LỖI QUAN TRỌNG]
    // Lấy token trực tiếp từ state điều hướng, không dùng localStorage
    const setupToken = location.state?.setupToken;

    // useEffect bây giờ chỉ có một nhiệm vụ: kiểm tra xem trang có được vào đúng cách không
    useEffect(() => {
        if (!setupToken) {
            console.error("Accessed CompleteProfilePage without a setupToken. Redirecting.");
            navigate('/login');
        }
    }, [setupToken, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await apiService('/auth/complete-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, aiApiKey, setupToken }), // Gửi token đã lấy được
            });
            
            // Không cần xóa localStorage vì chúng ta không dùng nó nữa
            setToken(response.token);
            navigate('/en');

        } catch (err) {  
            setError(err.message || 'Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    // "Gatekeeper" - Nếu không có token (do vào trang trực tiếp), không hiển thị gì cả
    if (!setupToken) {
        return null; 
    }

    // Nếu có token, hiển thị form
    return (
        <AuthLayout title="Complete Your Profile">
            <p className="text-center text-sm text-gray-600 mb-4">
                This is a one-time setup. Please provide a password and your AI API key to continue.
            </p>
            {error && <p className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="password">Create a Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required minLength={6}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="aiApiKey">Google AI API Key</label>
                    <input
                        id="aiApiKey"
                        type="password"
                        value={aiApiKey}
                        onChange={(e) => setAiApiKey(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                     <p className="text-xs text-gray-500 mt-1">
                        Get your free key from 
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                           Google AI Studio
                        </a>.
                    </p>
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Save and Continue'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default CompleteProfilePage;