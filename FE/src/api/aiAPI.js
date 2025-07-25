// src/api/aiAPI.js
import { apiService } from './apiService';

/**
 * Hàm chung để gửi yêu cầu kiểm tra tới AI thông qua backend.
 * @param {string} checkType - Loại kiểm tra ('vocab', 'translation', ...).
 * @param {object} payload - Dữ liệu cần kiểm tra.
 * @returns {Promise<object>}
 */
async function performAICheck(checkType, payload) {
    try {
        // Dùng apiService đã có sẵn token và base URL
        const data = await apiService('/ai/check', {
            method: 'POST',
            body: JSON.stringify({ checkType, payload }),
        });
        return data;
    } catch (error) {
        // apiService đã ném lỗi, ta chỉ cần bắt và trả về định dạng mong muốn
        return { error: error.message || 'An error occurred during the AI check.' };
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