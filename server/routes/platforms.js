const express = require('express');
const { connectPlatform, getPlatform } = require('../controllers/platformController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Save auth data for a platform
router.post('/:platform', authMiddleware, connectPlatform);

// Get connection status for a platform
router.get('/:platform', authMiddleware, getPlatform);

module.exports = router;
