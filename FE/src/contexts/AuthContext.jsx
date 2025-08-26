// src/contexts/AuthContext.jsx

import React from 'react';
import { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../api/apiService';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setTokenState] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // THÊM DÒNG NÀY: Xác thực dựa trên sự tồn tại của token
    const isAuthenticated = !!token;

    const setToken = (newToken) => {
        setTokenState(newToken);
        if (newToken) {
            localStorage.setItem('token', newToken);
        } else {
            localStorage.removeItem('token');
        }
    };

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            if (token) {
                try {
                    const response = await apiService('/auth/me');
                    setUser(response.data);
                } catch (error) {
                    console.error("Token validation failed, logging out:", error.message);
                    setUser(null);
                    setToken(null);
                }
            }
            setLoading(false);
        };

        checkUserLoggedIn();
    }, [token]);

    const login = async (email, password) => {
        const response = await apiService('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setToken(response.token);
        return response;
    };
    
    const googleLogin = async (googleToken) => {
        const response = await apiService('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ token: googleToken }),
        });
        if (response.token) {
            setToken(response.token);
        }
        return response;
    };

    const register = async (username, email, password, aiApiKey) => {
        const response = await apiService('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, aiApiKey }),
        });
        setToken(response.token);
        return response;
    };
    
    const logout = () => {
        setUser(null);
        setToken(null);
    };

    const value = {
        user,
        token,
        isAuthenticated, // THÊM DÒNG NÀY: Export biến isAuthenticated
        setToken,
        login,
        googleLogin,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};