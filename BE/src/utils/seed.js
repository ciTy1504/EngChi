const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

console.log("Loading ENV from:", path.join(__dirname, '..', '..', '.env'));
dotenv.config({ path: path.join(__dirname, '..', '..','.env') });
console.log("MONGO_URI =", process.env.MONGO_URI);

const MasterLesson = require('../models/masterLesson.model');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected for Seeding...`);
    } catch (error) {
        console.error(`DB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

/**
 * Hàm đệ quy để lấy tất cả các đường dẫn file .json trong một thư mục và các thư mục con của nó.
 * @param {string} dirPath - Đường dẫn thư mục để quét.
 * @param {string[]} [arrayOfFiles=[]] - Mảng tích lũy các file tìm thấy (dùng cho đệ quy).
 * @returns {string[]} - Mảng chứa đường dẫn đầy đủ của tất cả các file .json.
 */
const getAllJsonFiles = (dirPath, arrayOfFiles = []) => {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // Nếu là thư mục, gọi đệ quy để vào trong
            getAllJsonFiles(fullPath, arrayOfFiles);
        } else if (file.endsWith('.json')) {
            // Nếu là file .json, thêm đường dẫn đầy đủ vào mảng
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
};

const seedDatabase = async () => {
    try {
        const dataDir = path.join(__dirname, '..', 'seed_data');
        
        // Sử dụng hàm mới để lấy tất cả các file JSON, kể cả trong thư mục con
        const filePaths = getAllJsonFiles(dataDir);

        if (filePaths.length === 0) {
            console.log('No JSON files found in seed_data directory and its subdirectories. Exiting.');
            return;
        }

        console.log(`Found ${filePaths.length} lesson files to process.`);

        for (const filePath of filePaths) {
            // Lấy tên file để log cho gọn gàng
            const fileName = path.basename(filePath);
            console.log(`🔍 Reading file: ${fileName}`);
            
            const lessonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            const uniqueKey = {
                type: lessonData.type,
                language: lessonData.language,
                level: lessonData.level,
                category: lessonData.category 
            };
            
            Object.keys(uniqueKey).forEach(key => uniqueKey[key] === undefined && delete uniqueKey[key]);

            const existingLesson = await MasterLesson.findOne(uniqueKey);
            if (existingLesson) {
                console.log(`- Updating lesson: "${lessonData.title}"...`);
                await MasterLesson.deleteOne({ _id: existingLesson._id });
            } else {
                console.log(`- Importing new lesson: "${lessonData.title}"...`);
            }
            
            await MasterLesson.create(lessonData);
        }

        console.log('\n✅ All lessons have been successfully seeded/updated!');

    } catch (error) {
        console.error('\n❌ An error occurred during the seeding process:', error);
    }
};

const run = async () => {
    await connectDB();
    await seedDatabase();
    await mongoose.disconnect();
    console.log('Disconnected from DB.');
};

run();

// node src/utils/seed.js