// routes/platforms.js
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { connectPlatform, getPlatform } = require('../controllers/platformController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * Redirect user to platform OAuth
 * Example: GET /api/platforms/facebook/auth?token=USER_JWT
 */
router.get('/:platform/auth', async (req, res) => {
    const { platform } = req.params;
    const { token } = req.query; // JWT of logged-in SaaS user

    if (!token) return res.status(400).send("Missing token");

    switch (platform) {
        case 'facebook': {
            try {
                const fbAppId = process.env.FB_APP_ID;
                const fbAppSecret = process.env.FB_APP_SECRET;
                const redirectUri = `${process.env.BACKEND_URL}/api/platforms/facebook/callback`;

                // Exchange code for user access token
                const tokenRes = await axios.get('https://graph.facebook.com/v17.0/oauth/access_token', {
                    params: { client_id: fbAppId, client_secret: fbAppSecret, redirect_uri: redirectUri, code }
                });
                console.log("Facebook token response:", tokenRes.data);

                const userAccessToken = tokenRes.data.access_token;

                // Get pages
                const pagesRes = await axios.get('https://graph.facebook.com/me/accounts', {
                    params: { access_token: userAccessToken }
                });
                console.log("Pages response:", pagesRes.data);

                const pages = pagesRes.data.data;
                if (!pages.length) return res.send("No pages found");

                // Save first page
                await axios.post(`${process.env.BACKEND_URL}/api/platforms/facebook`, {
                    userId,
                    authData: {
                        pageId: pages[0].id,
                        pageName: pages[0].name,
                        pageAccessToken: pages[0].access_token
                    }
                });

                return res.send("Facebook connected successfully! You can close this tab.");
            } catch (err) {
                console.error("Facebook OAuth error:", err.response?.data || err.message);
                return res.status(500).send("OAuth failed");
            }
        }


        case 'instagram': {
            const igAppId = process.env.FB_APP_ID; // IG uses FB App
            const redirectUri = `${process.env.BACKEND_URL}/api/platforms/instagram/callback`;
            const scope = 'instagram_basic,pages_show_list';
            const url = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${igAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${token}&scope=${scope}`;
            return res.redirect(url);
        }

        case 'linkedin': {
            const clientId = process.env.LINKEDIN_CLIENT_ID;
            const redirectUri = `${process.env.BACKEND_URL}/api/platforms/linkedin/callback`;
            const scope = 'r_liteprofile,r_emailaddress,w_member_social';
            const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${token}&scope=${encodeURIComponent(scope)}`;
            return res.redirect(url);
        }

        case 'twitter': {
            // For Twitter OAuth 2.0 PKCE
            // You will need to implement PKCE flow separately
            return res.status(501).send("Twitter OAuth not implemented yet");
        }

        default:
            return res.status(400).send("Platform not supported");
    }
});

/**
 * OAuth callback handler
 * Example: GET /api/platforms/facebook/callback?code=...&state=USER_JWT
 */
router.get('/:platform/callback', async (req, res) => {
    const { platform } = req.params;
    const { code, state } = req.query;

    if (!code || !state) return res.status(400).send("Missing code or state");

    try {
        const decoded = jwt.verify(state, process.env.JWT_SECRET);
        const userId = decoded.user.id;

        switch (platform) {
            case 'facebook': {
                const fbAppId = process.env.FB_APP_ID;
                const fbAppSecret = process.env.FB_APP_SECRET;
                const redirectUri = `${process.env.BACKEND_URL}/api/platforms/facebook/callback`;

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
                if (!pages.length) return res.send("No pages found");

                // Save first page
                await axios.post(`${process.env.BACKEND_URL}/api/platforms/facebook`, {
                    userId,
                    authData: {
                        pageId: pages[0].id,
                        pageName: pages[0].name,
                        pageAccessToken: pages[0].access_token
                    }
                });

                return res.send("Facebook connected successfully! You can close this tab.");
            }

            case 'instagram': {
                // IG uses FB OAuth token; you can save the first IG profile
                const igAccessToken = code; // exchange code if needed
                // TODO: implement IG token exchange
                return res.send("Instagram callback connected! Implement IG token exchange.");
            }

            case 'linkedin': {
                const clientId = process.env.LINKEDIN_CLIENT_ID;
                const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
                const redirectUri = `${process.env.BACKEND_URL}/api/platforms/linkedin/callback`;

                // Exchange code for access token
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

                await axios.post(`${process.env.BACKEND_URL}/api/platforms/linkedin`, {
                    userId,
                    authData: { accessToken }
                });

                return res.send("LinkedIn connected successfully! You can close this tab.");
            }

            default:
                return res.status(400).send("Platform not supported");
        }
    } catch (err) {
        console.error("OAuth callback error:", err);
        return res.status(500).send("OAuth failed");
    }
});

/**
 * Save platform auth (POST) & get connection status (GET)
 * Uses your existing controller logic
 */
router.post('/:platform', authMiddleware, connectPlatform);
router.get('/:platform', authMiddleware, getPlatform);

module.exports = router;
