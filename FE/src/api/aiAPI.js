// src/api/aiAPI.js
const API_URL = 'http://localhost:5000/api/ai/check';

/**
 * Hàm chung để gửi yêu cầu kiểm tra tới AI thông qua backend.
 * @param {string} checkType - Loại kiểm tra ('vocab', 'translation', ...).
 * @param {object} payload - Dữ liệu cần kiểm tra.
 * @returns {Promise<object>}
 */
async function performAICheck(checkType, payload) {
    const token = localStorage.getItem('token');
    if (!token) {
        return { error: "Lỗi xác thực: Người dùng chưa đăng nhập." };
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ checkType, payload }),
        });

        const data = await response.json();
        if (!response.ok) {
            return { error: data.message || 'Có lỗi xảy ra từ máy chủ.' };
        }
        return data;
    } catch (error) {
        return { error: `Lỗi mạng: ${error.message}` };
    }
}


// Các hàm tiện ích cho từng loại ---

// Thêm tham số sourceLanguage
export function checkVocabulary(wordPairs, sourceLanguage) {
    return performAICheck('vocab', { wordPairs, sourceLanguage });
}

export function checkTranslation(sourceSentence, userTranslation, questionId, levelId) {
    return performAICheck('translation', { sourceSentence, userTranslation, questionId, levelId });
}

// export function checkSentenceRewrite(...) {
//     return performAICheck('rewrite_sentence', { ... });
// }