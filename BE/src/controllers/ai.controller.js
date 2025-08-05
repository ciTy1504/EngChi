// File: src/controllers/ai.controller.js
const axios = require('axios');
const MasterLesson = require('../models/masterLesson.model');

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const safetySettings = [
    { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
    { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
    { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
    { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" },
];

/**
 * Hàm chung để gọi Gemini API.
 * @param {string} prompt - The prompt to send to the AI.
 * @param {string} apiKey - The user's specific API key.
 * @param {boolean} isJson - If true, requests a JSON response.
 * @returns {Promise<string>} - The text response from the AI.
 */
async function callGemini(prompt, apiKey, isJson = false) {
    if (!apiKey) {
        throw new Error("AI service API key is not configured for this user.");
    }

    console.log("--- Sending Prompt to Gemini ---");
    console.log(prompt);
    console.log("------------------------------");

    try {
        const config = {
            contents: [{ parts: [{ text: prompt }] }],
            safetySettings,
        };
        if (isJson) {
            config.generationConfig = { "response_mime_type": "application/json" };
        }

        const response = await axios.post(API_URL, config, {
            headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey }
        });

        console.log("--- Received successful response from Gemini ---");

        const textResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResponse) {
            throw new Error("Invalid or empty response from AI API.");
        }
        
        return textResponse;
    } catch (error) {
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.error("!!!     GEMINI API CALL FAILED    !!!");
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        
        if (error.response) {
            console.error("--- ERROR STATUS:", error.response.status);
            console.error("--- ERROR HEADERS:", JSON.stringify(error.response.headers, null, 2));
            console.error("--- ERROR RESPONSE BODY (THE ACTUAL ERROR!): ---");
            console.error(JSON.stringify(error.response.data, null, 2));
            console.error("------------------------------------------------");
            const errorMessage = error.response.data?.error?.message || "An unknown error occurred with the AI service.";
            throw new Error(`AI Service Error: ${errorMessage}`);
        } else if (error.request) {
            console.error("--- NO RESPONSE RECEIVED FROM AI SERVICE ---");
            console.error(error.request);
        } else {
            console.error("--- AXIOS REQUEST SETUP ERROR ---");
            console.error('Error', error.message);
        }
        
        throw new Error("Failed to communicate with AI service.");
    }
}

/**
 * Xử lý kiểm tra từ vựng theo batch một cách an toàn và hiệu quả.
 * @param {object} payload - Dữ liệu từ client
 * @param {string} apiKey - API key của người dùng
 * @returns {Promise<Array<{isCorrect: boolean}>>}
 */
async function handleVocabCheck(payload, apiKey) {
    const { wordPairs, sourceLanguage } = payload;
    if (!wordPairs || !Array.isArray(wordPairs) || wordPairs.length === 0 || !sourceLanguage) {
        throw new Error('Invalid payload for vocab check.');
    }

    const sourceWordsFromClient = wordPairs.map(pair => pair.sourceWord);

    const lessonsContainingWords = await MasterLesson.find({ 
        "content.words.word": { $in: sourceWordsFromClient },
        "language": sourceLanguage 
    }).select('content.words.word content.words.meaning').lean();

    const correctMeaningMap = new Map();
    for (const lesson of lessonsContainingWords) {
        for (const word of lesson.content.words) {
            if (!correctMeaningMap.has(word.word)) {
                correctMeaningMap.set(word.word, word.meaning);
            }
        }
    }

    const results = [];
    const pairsForAI = [];
    const aiPairsOriginalIndex = [];

    wordPairs.forEach((pair, index) => {
        const correctMeaning = correctMeaningMap.get(pair.sourceWord);

        if (!correctMeaning) {
            results[index] = { isCorrect: false };
            return;
        }

        if (pair.userInput.trim().toLowerCase() === correctMeaning.trim().toLowerCase()) {
            results[index] = { isCorrect: true };
        } else {
            pairsForAI.push(pair);
            aiPairsOriginalIndex.push(index);
        }
    });

    if (pairsForAI.length > 0) {
        const langMap = { 'en': 'tiếng Anh', 'zh': 'tiếng Trung' };
        const languageName = langMap[sourceLanguage] || 'ngoại ngữ';
        
        const questions = pairsForAI.map((pair, index) =>
            `${index + 1}. Từ ${languageName} '${pair.sourceWord}' có một trong các nghĩa tiếng Việt là '${pair.userInput}' không?`
        ).join('\n');

        const prompt = `${questions}\n\nHãy trả lời trên một dòng riêng biệt theo định dạng: "Số. [đúng/sai]". Không thêm giải thích.`;
        
        const textResponse = await callGemini(prompt, apiKey, false); 
        
        const lines = textResponse.trim().split('\n');
        
        lines.forEach((line, i) => {
            const originalIndex = aiPairsOriginalIndex[i];
            results[originalIndex] = { isCorrect: line.toLowerCase().includes('đúng') };
        });
    }
    for (let i = 0; i < wordPairs.length; i++) {
        if (results[i] === undefined) {
             results[i] = { isCorrect: false };
        }
    }

    return results;
}

/**
 * @param {string} sourceSentence - Câu gốc
 * @param {string} userTranslation - Câu dịch của người dùng
 * @param {string} suggestedTranslation - Câu dịch mẫu từ DB
 * @param {string} apiKey - API key của người dùng
 * @returns {Promise<{score: number, feedback: string}>}
 */
exports.gradeTranslation = async (sourceSentence, userTranslation, suggestedTranslation, apiKey) => {
    const prompt = `Bạn là một giám khảo chấm điểm dịch thuật chuyên nghiệp và khó tính. Dựa trên thông tin sau, hãy đánh giá chất lượng bản dịch của người dùng:

        **Thông tin:**
        - Câu gốc: "${sourceSentence}"
        - Câu dịch của người dùng: "${userTranslation}"
        - Bản dịch mẫu để tham khảo: "${suggestedTranslation}"
        
        **Tiêu chí đánh giá (100 điểm):**
        1. **Độ chính xác ngữ nghĩa (40 điểm):**
        - Câu dịch có truyền tải đúng ý của câu gốc không?
        - Có bị hiểu sai, thiếu ý hay thừa ý không?
        2. **Văn phong và sự trôi chảy (25 điểm):**
        - Câu văn có mượt mà, tự nhiên, phù hợp ngữ cảnh không?
        - Cấu trúc câu có rõ ràng, dễ hiểu không?
        3. **Chính tả, ngữ pháp và dấu câu (15 điểm):**
        - Có lỗi chính tả không?
        - Có sai về ngữ pháp hoặc dùng từ không phù hợp không?
        4. **Tác phong làm bài (10 điểm):**
        - Bài làm có hoàn chỉnh không?
        - Văn phong có lịch sự, có thể hiện thái độ nghiêm túc không?
        5. **Hình thức trình bày (10 điểm):**
        - Câu trả lời có sạch đẹp, viết liền mạch, không bị rời rạc không?
        - Có lỗi xuống dòng bất thường hay viết thiếu dấu không?
        Điểm số không nhất thiết phải tròn, có thể là 87, 73,... chứ không cần 5, 10, 15,...
        
        **Nhận xét:**
        Phần một: Nhận xét theo từng tiêu chí chấm điểm, không trả về điểm từng thành phần, không nêu từng thành phần có số điểm tối đa bao nhiêu
        Với mỗi tiêu chí, cần nhận xét:
            Điểm mạnh nếu có.
            Điểm yếu hoặc lỗi sai (nếu có), cần nêu rõ và cụ thể.
            Nếu không có lỗi, có thể ghi chú như "Không phát hiện lỗi."
            Trình bày mỗi tiêu chí trong một mục rõ ràng, có thể dùng gạch đầu dòng hoặc đoạn văn riêng biệt.
            Ví dụ mong muốn (dưới dạng HTML):
            <h2>1. Đánh giá theo tiêu chí</h2> <ul> <li><strong>Độ chính xác ngữ nghĩa:</strong> Câu dịch khá sát nghĩa, tuy nhiên phần cuối chưa truyền đạt hết thông điệp gốc.</li> <li><strong>Văn phong và sự trôi chảy (25 điểm):</strong> Câu văn hơi cứng, một số cụm chưa tự nhiên như "diễn ra nhanh chóng".</li> ... </ul>
        
        Phần hai: Các gợi ý cải thiện
            Đưa ra các đề xuất cụ thể để cải thiện bản dịch, ví dụ:
            Cải thiện lựa chọn từ vựng (dùng từ tự nhiên, tránh dịch sát từ).
            Cải thiện cấu trúc câu (chia câu hợp lý, tránh lặp từ, tránh dịch word-by-word).
            Không đưa ra lời khuyên chung chung; cần gợi ý cụ thể, dễ hành động.
            Trình bày bằng danh sách gạch đầu dòng hoặc đoạn văn rõ ràng.
            Ví dụ mong muốn (HTML):
            <h2>2. Gợi ý cải thiện</h2> <ul> <li>Nên dùng "đưa ra quyết định" thay vì "làm ra quyết định" để tự nhiên hơn.</li> <li>Xem xét dùng thể chủ động cho câu thứ hai để rõ ràng hơn.</li> </ul>
        
        Phần ba: Chỉ ra lỗi sai trong bản dịch
            Dẫn lại các câu dịch sai của người dùng.
            Trong câu, bôi đậm (sử dụng thẻ <strong>) các phần dịch sai, bao gồm:
            Sai nghĩa
            Sai ngữ pháp
            Dùng sai từ hoặc dấu câu
            Sau mỗi câu sai, thêm giải thích ngắn để người dùng hiểu sai ở đâu và vì sao.
            Ví dụ mong muốn (HTML):
            <h2>3. Các lỗi sai trong bản dịch</h2> <p>Câu: "<strong>Anh ấy là cao</strong>" — sai vì tiếng Việt không dùng "là" với tính từ. Nên sửa thành "Anh ấy cao".</p> <p>Câu: "<strong>Làm ra một quyết định</strong>" — không tự nhiên, nên dùng "đưa ra một quyết định".</p>
            Định dạng yêu cầu: toàn bộ phần nhận xét phải được viết bằng HTML có cấu trúc rõ ràng:
            Dùng thẻ <h2> cho tiêu đề các phần chính.
            Dùng thẻ <ul><li> cho danh sách các điểm nhận xét hoặc gợi ý.
            Dùng thẻ <p> cho đoạn văn mô tả chi tiết hoặc giải thích lỗi.
            Dùng thẻ <strong> để bôi đậm phần sai trong câu dịch của người dùng.
            Có thể dùng thêm <em> để làm nổi bật chú thích nhẹ hoặc lời khuyên bổ sung.

        **Yêu cầu:**
        - Trả về một **đối tượng JSON duy nhất**, có cấu trúc sau:
        {
            "score": [một số nguyên từ 0 đến 100],
            "feedback": "[một chuỗi HTML chứa nhận xét chi tiết để giúp người dùng cải thiện. Có thể sử dụng các thẻ HTML như <strong>, <em>, <ul>, <li> để làm nổi bật điểm mạnh và điểm yếu.]"
        }

        **Lưu ý:** Chỉ trả về đối tượng JSON. Không thêm bất kỳ nội dung nào bên ngoài`;
    
    const jsonResponse = await callGemini(prompt, apiKey, true);
    return JSON.parse(jsonResponse);
};

const aiTaskHandlers = {
    'vocab': handleVocabCheck,
};

/**
 * @desc    Thực hiện các tác vụ AI đơn giản không cần cập nhật DB.
 * @route   POST /api/ai/check
 * @access  Private
 */
exports.performAICheck = async (req, res) => {
    const { checkType, payload } = req.body;

    const handler = aiTaskHandlers[checkType];
    if (!handler) {
        return res.status(400).json({ 
            success: false, 
            message: `Invalid checkType '${checkType}'. This endpoint is for simple checks like 'vocab'. More complex tasks may have their own endpoints (e.g., /api/lessons/translation/submit-answer).` 
        });
    }

    try {
        const apiKey = req.user.getDecryptedApiKey();
        
        const results = await handler(payload, apiKey);
        res.status(200).json({ success: true, results });
    } catch (error) {
        console.error(`AI Check Error for type '${checkType}':`, error.message);
        res.status(500).json({ success: false, message: error.message || 'An error occurred during the AI check.' });
    }
};