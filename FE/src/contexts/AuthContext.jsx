// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { apiService } from '../api/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            // Lấy thông tin người dùng nếu có token
            apiService('/auth/me')
                .then(response => setUser(response.data))
                .catch(() => {
                    // Token không hợp lệ, xóa đi
                    logout();
                })
                .finally(() => setIsLoading(false));
        } else {
            localStorage.removeItem('token');
            setIsLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const response = await apiService('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setToken(response.token);
        return response;
    };

    const register = async (username, email, password) => {
         const response = await apiService('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
        setToken(response.token);
        return response;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };

    const value = useMemo(
        () => ({ user, token, isLoading, login, logout, register, isAuthenticated: !!token }),
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