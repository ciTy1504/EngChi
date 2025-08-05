const MasterLesson = require('../models/masterLesson.model');
const UserProgress = require('../models/userProgress.model');
const { gradeTranslation } = require('./ai.controller');
const asyncHandler = require('express-async-handler');

exports.startLesson = async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user.id;

    try {
        const masterLesson = await MasterLesson.findById(lessonId).lean();
        if (!masterLesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        // --- GRAMMAR SẼ KHÔNG SỬ DỤNG USERPROGRESS Ở ĐÂY ---
        if (masterLesson.type === 'grammar') {
            // Đối với Grammar, chúng ta chỉ cần trả về masterLesson,
            // việc random questions sẽ được xử lý bởi getGrammarQuizQuestions riêng.
            // StartLesson chỉ đảm bảo lesson tồn tại.
            return res.status(200).json({ success: true, masterLesson });
        }


        let userProgress = await UserProgress.findOne({ user: userId, lesson: lessonId });

        // A. Xử lý khi người dùng chưa có tiến trình (lần đầu học)
        if (!userProgress) {
            let initialProgressData = {};
            
            if (masterLesson.type === 'vocab') {
                initialProgressData = { deletedWords: [], reviewWords: [] };
            } else if (masterLesson.type === 'reading') {
                initialProgressData = { articleProgress: [] };
            } else if (masterLesson.type === 'translation') { // Chỉ áp dụng cho translation
                const questionIds = masterLesson.content.questions?.map(q => q._id.toString()) || [];
                initialProgressData = { items: questionIds.map(id => ({ questionId: id, counter: 0 })) };
            } else {
                 return res.status(400).json({ success: false, message: 'Invalid lesson type for UserProgress initialization' });
            }
            
            userProgress = await UserProgress.create({
                user: userId,
                lesson: lessonId,
                progressData: initialProgressData
            });
        } 
        // B. Xử lý khi người dùng đã có tiến trình -> Đồng bộ hóa (chỉ cho translation/reading)
        else {
            let needsSave = false;
            
            if (masterLesson.type === 'translation') {
                const masterQuestionIds = new Set(masterLesson.content.questions?.map(q => q._id.toString()) || []);
                const userQuestionItems = userProgress.progressData.items || [];
                const userQuestionIds = new Set(userQuestionItems.map(item => item.questionId.toString()));
                
                masterQuestionIds.forEach(id => {
                    if (!userQuestionIds.has(id)) {
                        userProgress.progressData.items.push({ questionId: id, counter: 0 });
                        needsSave = true;
                    }
                });
            }
            else if (masterLesson.type === 'reading') {
                const masterArticleIds = new Set(masterLesson.content.articles?.map(a => a._id.toString()) || []);
                const userArticleProgress = userProgress.progressData.articleProgress || [];
                const userArticleIds = new Set(userArticleProgress.map(p => p.articleId.toString()));
                
                const currentMinCounter = userArticleProgress.length > 0
                    ? Math.min(...userArticleProgress.map(item => item.counter))
                    : 0;

                masterArticleIds.forEach(id => {
                    if (!userArticleIds.has(id)) {
                        userProgress.progressData.articleProgress.push({ articleId: id, counter: currentMinCounter });
                        needsSave = true;
                    }
                });
            }

            if (needsSave) {
                await userProgress.save();
            }
        }
        
        // Trả về masterLesson và userProgress (hoặc null nếu không cần)
        res.status(200).json({ success: true, masterLesson, userProgress: userProgress || null });

    } catch (error) {
        console.error("Start Lesson Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLessonList = async (req, res) => {
    try {
        const query = { ...req.query };
        const fields = query.fields ? query.fields.split(',').join(' ') : '-content';
        const sortBy = query.sort ? query.sort.split(',').join(' ') : 'order level title'; // Mặc định sắp xếp theo order

        delete query.fields;
        delete query.sort;
        
        const lessons = await MasterLesson.find(query)
                                          .sort(sortBy)
                                          .select(fields);

        res.status(200).json({ success: true, count: lessons.length, data: lessons });
    } catch (error) {
        console.error("Get Lesson List Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};







