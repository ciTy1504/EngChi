// src/api/apiService.js
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Hàm gọi API chung, tự động thêm token xác thực.
 * @param {string} endpoint - Đường dẫn API (ví dụ: '/lessons?type=vocab')
 * @param {object} options - Các tùy chọn của fetch (method, body, headers...)
 * @returns {Promise<any>}
 */
export const apiService = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            // Ném lỗi để có thể bắt được ở component
            throw new Error(data.message || 'An error occurred with the API call.');
        }

        return data; // Trả về { success: true, ... }
    } catch (error) {
        console.error(`API service error for endpoint ${endpoint}:`, error);
        // Ném lại lỗi để component có thể xử lý (hiển thị thông báo cho người dùng)
        throw error;
    }
};