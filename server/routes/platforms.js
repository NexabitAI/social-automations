const express = require('express');
const router = express.Router();
const { connectPlatform, getPlatform } = require('../controllers/platformController');
const authMiddleware = require('../middleware/auth');

// Save token after OAuth callback
router.post('/platform/:platform', authMiddleware, connectPlatform);

// Get connection status
router.get('/platform/:platform', authMiddleware, getPlatform);

module.exports = router;
