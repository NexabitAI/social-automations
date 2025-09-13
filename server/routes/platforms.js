const express = require('express');
const router = express.Router();
const { connectPlatform, getPlatform } = require('../controllers/platformController');

// Save token after OAuth callback
router.post('/:platform', connectPlatform);

// Get connection status
router.get('/:platform', getPlatform);

// Start OAuth login (example for Facebook)
router.get('/:platform/login', (req, res) => {
    const { platform } = req.params;
    const { token } = req.query; // your user JWT

    if (platform === 'facebook') {
        // Redirect to Facebook OAuth URL
        const fbAppId = process.env.FACEBOOK_APP_ID;
        const redirectUri = encodeURIComponent(`${process.env.BACKEND_URL}/api/platforms/facebook/callback?token=${token}`);
        const fbUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement,pages_show_list`;
        return res.redirect(fbUrl);
    }

    // Other platforms can be added similarly
    res.status(400).send('OAuth not implemented for this platform');
});

module.exports = router;
