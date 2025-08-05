// src/pages/Auth/RegisterPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout'; 

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [aiApiKey, setAiApiKey] = useState(''); 
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setIsLoading(false);
            return;
        }

        try {
            await register(username, email, password, aiApiKey);
            navigate('/en'); 
        } catch (err) {
            setError(err.message || 'Failed to register. The email or username may already be in use.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Create an Account">
            {error && <p className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                 <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-1" htmlFor="aiApiKey">
                        Google AI API Key
                    </label>
                    <input
                        id="aiApiKey"
                        type="password"
                        value={aiApiKey}
                        onChange={(e) => setAiApiKey(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Dự án này yêu cầu bạn cung cấp API Key của riêng mình. 
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                           Lấy key tại đây.
                        </a>
                    </p>
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                    disabled={isLoading}
                >
                    {isLoading ? 'Registering...' : 'Register'}
                </button>
            </form>

            <p className="text-center text-gray-600 text-sm mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-500 hover:underline">
                    Log in here
                </Link>
            </p>
        </AuthLayout>
    );
};

export default RegisterPage;