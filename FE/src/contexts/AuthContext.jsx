// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
// [THÊM MỚI] Import useLocation
import { useLocation } from 'react-router-dom';
import { apiService } from '../api/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);
    // [THÊM MỚI] Lấy thông tin về route hiện tại
    const location = useLocation();

    useEffect(() => {
        // [THÊM MỚI] Kiểm tra xem có đang ở trang hoàn thành hồ sơ không
        const isSetupPage = location.pathname === '/complete-profile';

        if (token) {
            localStorage.setItem('token', token);

            // [SỬA ĐỔI] Nếu đang ở trang setup, không gọi /api/auth/me
            // vì token hiện tại là token tạm thời.
            if (isSetupPage) {
                setIsLoading(false); // Cho phép render trang mà không cần chờ user data
                return; 
            }

            // Chỉ gọi api/auth/me khi không ở trang setup
            apiService('/auth/me')
                .then(response => setUser(response.data))
                .catch(() => {
                    // Token không hợp lệ, có thể đã hết hạn hoặc là setupToken trên trang khác
                    logout();
                })
                .finally(() => setIsLoading(false));
        } else {
            localStorage.removeItem('token');
            setIsLoading(false);
        }
    // [SỬA ĐỔI] Thêm location.pathname vào dependency array
    }, [token, location.pathname]);

    const login = async (email, password) => {
        const response = await apiService('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (response.profileComplete === false) {
            setToken(response.setupToken);
            return { profileComplete: false };
        }
        setToken(response.token);
        return { profileComplete: true };
    };

    const register = async (username, email, password, aiApiKey) => { 
         const response = await apiService('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, aiApiKey }),
        });
        setToken(response.token);
        return response;
    };

    const googleLogin = async (googleToken) => {
        const response = await apiService('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ token: googleToken }),
        });
        if (response.profileComplete === false) {
            setToken(response.setupToken);
            return { profileComplete: false };
        }
        setToken(response.token);
        return { profileComplete: true };
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };

    const value = useMemo(
        () => ({ user, token, isLoading, login, logout, register, googleLogin, isAuthenticated: !!token }),
        [user, token, isLoading]
    );

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};