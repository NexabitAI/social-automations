const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const platformRoutes = require('./routes/platforms');
const platformCallbackRoutes = require('./routes/platformCallback'); // <---
const postRoutes = require('./routes/posts');

connectDB();

const app = express();

app.use(cors({
    origin: "https://buzzpilot.app",
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformRoutes);         // dynamic routes
app.use('/api/platforms', platformCallbackRoutes); // OAuth callbacks
app.use('/api/posts', postRoutes);

app.get('/health', (req, res) => res.json({ message: 'Server running' }));

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
