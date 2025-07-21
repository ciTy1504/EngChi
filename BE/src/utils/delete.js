// File: src/utils/delete.js
// WARNING: This script will DELETE ALL data from the MasterLesson collection.

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

console.log("--- Starting Deletion Script ---");

const envPath = path.join(__dirname, '..', '..', '.env');
console.log(`Attempting to load .env file from: ${envPath}`);
dotenv.config({ path: envPath });

if (!process.env.MONGO_URI) {
    console.error("\n❌ FATAL ERROR: MONGO_URI is not defined.");
    console.error("Please ensure you have a .env file in the root directory (D:\\EngChi\\BE\\.env) with the MONGO_URI variable set.");
    process.exit(1);
}

console.log("MONGO_URI is loaded successfully.");

// Load the model
const MasterLesson = require('../models/masterLesson.model');
const UserProgress = require('../models/userProgress.model'); 

// Database Connection Function
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected for Deletion...`);
    } catch (error) {
        console.error(`DB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// Main function to delete all data
const deleteAllData = async () => {
    try {
        console.log('--- Deleting MasterLessons ---');
        const lessonResult = await MasterLesson.deleteMany({});
        console.log(`✅ Deleted ${lessonResult.deletedCount} documents from MasterLesson collection.`);

        console.log('\n--- Deleting UserProgress ---');
        const progressResult = await UserProgress.deleteMany({});
        console.log(`✅ Deleted ${progressResult.deletedCount} documents from UserProgress collection.`);

    } catch (error) {
        console.error('\n❌ An error occurred during the deletion process:', error);
    }
};

// Main execution function
const run = async () => {
    await connectDB();
    await deleteAllData();
    await mongoose.disconnect();
    console.log('--- Deletion Script Finished ---');
};

run().catch(err => {
    console.error("An unexpected error occurred:", err);
    process.exit(1);
});

// To run this script: node src/utils/delete.js