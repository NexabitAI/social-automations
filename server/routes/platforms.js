// routes/platforms.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { exchangeFbToken } = require('../services/facebookService'); // ✅ new service
const { savePlatformAuth } = require('../services/platformService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ...

router.get('/:platform/callback', async (req, res) => {
    const { platform } = req.params;
    const { code, state } = req.query;

    if (!code || !state) return res.status(400).send("Missing code or state");

    try {
        const decoded = jwt.verify(state, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const BACKEND_URL = process.env.BACKEND_URL || "https://buzzpilot.app";

        switch (platform) {
            case 'facebook': {
                const fbAppId = process.env.FB_APP_ID;
                const fbAppSecret = process.env.FB_APP_SECRET;
                const redirectUri = `${BACKEND_URL}/api/platforms/facebook/callback`;

                // Step 1: code → short-lived token
                const tokenRes = await axios.get('https://graph.facebook.com/v17.0/oauth/access_token', {
                    params: { client_id: fbAppId, client_secret: fbAppSecret, redirect_uri: redirectUri, code }
                });

                const shortLivedToken = tokenRes.data.access_token;

                // Step 2: exchange + save
                await exchangeFbToken(userId, shortLivedToken);

                return res.send("✅ Facebook connected successfully! You can close this tab.");
            }

            // LinkedIn case same as before...
        }
    } catch (err) {
        console.error("OAuth callback error:", err.response?.data || err.message);
        return res.status(500).send("OAuth failed");
    }
});
module.exports = router;