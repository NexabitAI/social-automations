// routes/platforms.js
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { connectPlatform, getPlatform } = require('../controllers/platformController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * Step 1: Redirect user to platform OAuth
 * Example: GET /api/platforms/facebook/auth?userId=USER_ID
 */
router.get('/:platform/auth', (req, res) => {
    const { platform } = req.params;
    const { userId } = req.query;

    if (!userId) return res.status(400).send("Missing userId");

    // Encode userId into state (signed, expires in 10 min)
    const state = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "10m" });

    const BACKEND_URL = process.env.BACKEND_URL || "https://buzzpilot.app";

    switch (platform) {
        case 'facebook': {
            const fbAppId = process.env.FB_APP_ID;
            const redirectUri = `${BACKEND_URL}/api/platforms/facebook/callback`;
            const scope = 'pages_manage_posts,pages_read_engagement,pages_show_list';
            const url = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;
            return res.redirect(url);
        }

        case 'instagram': {
            const igAppId = process.env.FB_APP_ID;
            const redirectUri = `${BACKEND_URL}/api/platforms/instagram/callback`;
            const scope = 'instagram_basic,pages_show_list';
            const url = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${igAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;
            return res.redirect(url);
        }

        case 'linkedin': {
            const clientId = process.env.LINKEDIN_CLIENT_ID;
            const redirectUri = `${BACKEND_URL}/api/platforms/linkedin/callback`;
            const scope = 'r_liteprofile r_emailaddress w_member_social';
            const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
            return res.redirect(url);
        }

        default:
            return res.status(400).send("Platform not supported");
    }
});

/**
 * Step 2: OAuth callback
 */
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

                // Exchange code for user access token
                const tokenRes = await axios.get('https://graph.facebook.com/v17.0/oauth/access_token', {
                    params: { client_id: fbAppId, client_secret: fbAppSecret, redirect_uri: redirectUri, code }
                });
                const userAccessToken = tokenRes.data.access_token;

                // Get pages
                const pagesRes = await axios.get('https://graph.facebook.com/me/accounts', {
                    params: { access_token: userAccessToken }
                });
                const pages = pagesRes.data.data;

                if (!pages.length) return res.send("No Facebook pages found");

                // Save first page directly using controller
                await connectPlatform({
                    user: { id: userId },
                    body: {
                        authData: {
                            pageId: pages[0].id,
                            pageName: pages[0].name,
                            pageAccessToken: pages[0].access_token
                        }
                    }
                });

                return res.send("✅ Facebook connected successfully! You can close this tab.");
            }

            case 'instagram': {
                // TODO: Exchange code -> access_token -> IG business account
                return res.send("Instagram callback connected! Implement token exchange.");
            }

            case 'linkedin': {
                const clientId = process.env.LINKEDIN_CLIENT_ID;
                const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
                const redirectUri = `${BACKEND_URL}/api/platforms/linkedin/callback`;

                const tokenRes = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
                    params: {
                        grant_type: 'authorization_code',
                        code,
                        redirect_uri: redirectUri,
                        client_id: clientId,
                        client_secret: clientSecret
                    },
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                const accessToken = tokenRes.data.access_token;

                await connectPlatform({
                    user: { id: userId },
                    body: { authData: { accessToken } }
                });

                return res.send("✅ LinkedIn connected successfully! You can close this tab.");
            }

            default:
                return res.status(400).send("Platform not supported");
        }
    } catch (err) {
        console.error("OAuth callback error:", err.response?.data || err.message);
        return res.status(500).send("OAuth failed");
    }
});

// Save platform auth (POST) & get connection status (GET)
router.post('/:platform', authMiddleware, connectPlatform);
router.get('/:platform', authMiddleware, getPlatform);

module.exports = router;
