const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const platformRoutes = require('./routes/platforms');
const postRoutes = require('./routes/posts');
const facebookRoutes = require("./routes/facebook");
connectDB();

const app = express();
app.use(cors({
    origin: "https://buzzpilot.app",
    credentials: true,
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/posts', postRoutes);
// app.use("/api/facebook", facebookRoutes);
app.get('/health', (req, res) => {
    res.json({ message: 'Server is running successfully' });
});

const PORT = process.env.PORT || 8003;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});