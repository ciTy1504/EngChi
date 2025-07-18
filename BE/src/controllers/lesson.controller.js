const MasterLesson = require('../models/masterLesson.model');
const UserProgress = require('../models/userProgress.model');
const { gradeTranslation } = require('./ai.controller');

// --- CONTROLLER startLesson ĐƯỢC CẬP NHẬT ---
exports.startLesson = async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user.id;

    try {
        const masterLesson = await MasterLesson.findById(lessonId);
        if (!masterLesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        let userProgress = await UserProgress.findOne({ user: userId, lesson: lessonId });

        // Nếu người dùng chưa học bài này, tạo mới progress cho họ
        if (!userProgress) {
            let initialProgressData = {};
            // Phân nhánh logic khởi tạo
            if (masterLesson.type === 'vocab') {
                // Logic cho vocab không thay đổi
                initialProgressData = { deletedWords: [], reviewWords: [] };
            } else if (['translation', 'grammar', 'reading'].includes(masterLesson.type)) {
                // Logic MỚI cho các loại bài khác
                const questionIds = masterLesson.content?.questions?.map(q => q._id) || [];
                initialProgressData = { items: questionIds.map(id => ({ questionId: id, counter: 0 })) };
                // Giữ lại các trường của vocab để đảm bảo tính nhất quán của schema, nhưng chúng sẽ rỗng
                initialProgressData.deletedWords = []; 
                initialProgressData.reviewWords = [];
            } else {
                 return res.status(400).json({ success: false, message: 'Invalid lesson type' });
            }
            
            userProgress = await UserProgress.create({
                user: userId,
                lesson: lessonId,
                progressData: initialProgressData
            });
        }
        
        // Logic đồng bộ hóa (sync) câu hỏi mới/cũ
        if (['translation', 'grammar'].includes(masterLesson.type)) {
            const masterQuestionIds = new Set(masterLesson.content.questions.map(q => q._id));
            const userQuestionIds = new Set(userProgress.progressData.items.map(item => item.questionId));
            
            let needsSave = false;
            masterQuestionIds.forEach(id => {
                if (!userQuestionIds.has(id)) {
                    userProgress.progressData.items.push({ questionId: id, counter: 0 });
                    needsSave = true;
                }
            });

            if (needsSave) {
                await userProgress.save();
            }
        }
        
        res.status(200).json({ success: true, masterLesson, userProgress });

    } catch (error) {
        console.error("Start Lesson Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLessonList = async (req, res) => {
    try {
        const lessons = await MasterLesson.find(req.query).select('title language type level category');
        res.status(200).json({ success: true, count: lessons.length, data: lessons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProgress = async (req, res) => {
    const { progressId } = req.params;
    const { action, payload } = req.body;
    try {
        const progress = await UserProgress.findById(progressId);
        if (!progress) return res.status(404).json({ success: false, message: 'Progress not found' });
        if (progress.user.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

        switch (action) {
            case 'delete_words':
                progress.progressData.deletedWords.addToSet(...(payload.words || []));
                break;
            case 'review_words':
                progress.progressData.reviewWords.addToSet(...(payload.words || []));
                break;
            default:
                return res.status(400).json({ success: false, message: `Invalid action: ${action}` });
        }
        
        await progress.save();
        res.status(200).json({ success: true, data: progress });
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
};

exports.getNextTranslationQuestion = async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user.id;
    try {
        const [masterLesson, userProgress] = await Promise.all([
            MasterLesson.findById(lessonId).lean(),
            UserProgress.findOne({ user: userId, lesson: lessonId })
        ]);
        if (!masterLesson) return res.status(404).json({ success: false, message: "Lesson not found." });
        if (!userProgress || !userProgress.progressData.items) return res.status(404).json({ success: false, message: "User progress not initialized correctly for this lesson type." });
        
        const progressItems = userProgress.progressData.items;
        if (progressItems.length === 0) return res.status(200).json({ success: true, data: null });

        const minCounter = Math.min(...progressItems.map(item => item.counter));
        const potentialQuestionIds = progressItems.filter(item => item.counter === minCounter).map(item => item.questionId);
        if (potentialQuestionIds.length === 0) return res.status(200).json({ success: true, data: null });

        const randomId = potentialQuestionIds[Math.floor(Math.random() * potentialQuestionIds.length)];
        const nextQuestion = masterLesson.content.questions.find(q => q._id === randomId);
        res.status(200).json({ success: true, data: nextQuestion });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.submitTranslationAnswer = async (req, res) => {
    const { lessonId, questionId, userTranslation } = req.body;
    const userId = req.user.id;
    if (!lessonId || !questionId || !userTranslation) return res.status(400).json({ success: false, message: 'Missing required fields.' });
    try {
        const masterLesson = await MasterLesson.findById(lessonId).lean();
        const question = masterLesson?.content?.questions.find(q => q._id === questionId);
        if (!question) return res.status(404).json({ success: false, message: "Question not found." });

        const aiResult = await gradeTranslation(question.source, userTranslation, question.suggestedTranslation);
        await UserProgress.updateOne(
            { user: userId, lesson: lessonId, "progressData.items.questionId": questionId },
            { $inc: { "progressData.items.$.counter": 1 } }
        );
        const finalResult = { ...aiResult, suggestedTranslation: question.suggestedTranslation };
        res.status(200).json({ success: true, data: finalResult });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};