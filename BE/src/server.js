// File: src/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const authRoutes = require('./routes/auth.routes');
const lessonRoutes = require('./routes/lesson.routes');
const aiRoutes = require('./routes/ai.routes');
const vocabRoutes = require('./routes/vocab.routes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/vocab', vocabRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

