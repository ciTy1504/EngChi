// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = () => {
    // SỬA LẠI: Lấy cả `isAuthenticated` và `loading`
    const { isAuthenticated, loading } = useAuth();
    
    // Nếu vẫn đang trong quá trình kiểm tra (lần đầu tải trang) thì chưa làm gì cả
    if (loading) {
        return null; // Hoặc một spinner/loading component
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Nếu đã authenticated, cho phép truy cập
    return <Outlet />;
};

export default ProtectedRoute;