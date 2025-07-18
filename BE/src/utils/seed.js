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

const seedDatabase = async () => {
    try {
        const dataDir = path.join(__dirname, '..', 'seed_data');
        const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

        if (files.length === 0) {
            console.log('No JSON files found in seed_data directory. Exiting.');
            return;
        }

        console.log(`Found ${files.length} lesson files to process.`);

        for (const file of files) {
            const filePath = path.join(dataDir, file);
            console.log(`🔍 Reading file: ${file}`);
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