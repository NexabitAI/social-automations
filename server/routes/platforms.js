const express = require('express');
const router = express.Router();
const platformController = require('../controllers/platformController');
const verifyN8n = require('../middleware/verifyN8n');
const auth = require('../middleware/auth');

// For n8n callback after FB auth
router.post('/webhook/facebook/callback', verifyN8n, platformController.connectPlatform);

// For frontend to check if FB is connected
router.get('/facebook', auth, platformController.getPlatform);

module.exports = router;
