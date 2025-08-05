// File: src/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // Giả sử đường dẫn này đúng
const { errorHandler } = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Import routes
const authRoutes = require('./routes/auth.routes');
const lessonRoutes = require('./routes/lesson.routes');
const vocabRoutes = require('./routes/vocab.routes');
const translationRoutes = require('./routes/translation.routes');
const readingRoutes = require('./routes/reading.routes');
const grammarRoutes = require('./routes/grammar.routes');
const idiomRoutes = require('./routes/idiom.routes');
const progressRoutes = require('./routes/progress.routes'); 
const aiRoutes = require('./routes/ai.routes');


const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/vocab', vocabRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/reading', readingRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api/idioms', idiomRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);


app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));