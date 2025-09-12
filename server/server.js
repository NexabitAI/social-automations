const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');

// Route imports
const authRoutes = require('./routes/auth');
const platformRoutes = require('./routes/platforms');
const postRoutes = require('./routes/posts');
const facebookRoutes = require("./routes/facebook");
// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/posts', postRoutes);
app.use("/api/facebook", facebookRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ message: 'Server is running successfully' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});