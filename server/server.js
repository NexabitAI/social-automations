// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const platformRoutes = require('./routes/platforms');
const postRoutes = require('./routes/posts');
const { startPostScheduler } = require("./jobs/postScheduler");
import openaiRoutes from './routes/openai.js';

connectDB();

const app = express();

// CORS
app.use(cors({
    origin: "https://buzzpilot.app",
    credentials: true,
}));

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformRoutes); // <- dynamic platform routes
app.use('/api/posts', postRoutes);
app.use('/api/openai', openaiRoutes);


// Health check
app.get('/health', (req, res) => {
    res.json({ message: 'Server is running successfully' });
});

// Start server
const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
startPostScheduler();