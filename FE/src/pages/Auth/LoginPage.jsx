// src/pages/Auth/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, googleLogin } = useAuth(); // Lấy cả hai hàm từ context
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        try {
            // SỬA: Sử dụng hàm `googleLogin` từ context
            const result = await googleLogin(credentialResponse.credential);
            if (result.profileComplete) {
                navigate('/en');
            } else {
                navigate('/complete-profile');
            }
        } catch (err) {
            setError(err.message || 'Google login failed.');
        }
    };
    
    const handleGoogleError = () => {
        setError('Google login was unsuccessful. Please try again.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const result = await login(email, password);
            if (result.profileComplete) {
                navigate('/en');
            } else {
                navigate('/complete-profile');
            }
        } catch (err) {
            setError(err.message || 'Failed to log in. Please check your credentials.');
        }
    };

    return (
        <AuthLayout title="Login"> 
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors">
                    Login
                </button>
            </form>

            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap 
                />
            </div>
            
            <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
            </p>
        </AuthLayout>
    );
};
export default LoginPage;