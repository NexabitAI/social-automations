const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { connectPlatform } = require('../controllers/platformController');

router.get('/:platform/callback', async (req, res) => {
    const { code, state } = req.query; // state = JWT
    const { platform } = req.params;

    try {
        if (!state) return res.status(400).send('Missing token');

        const decoded = jwt.verify(state, process.env.JWT_SECRET);
        const userId = decoded.user.id;

        let authData = {};

        if (platform === 'facebook' || platform === 'instagram') {
            const appId = process.env.FB_APP_ID;
            const appSecret = process.env.FB_APP_SECRET;
            const redirectUri = `${process.env.BACKEND_URL}/api/platforms/${platform}/callback`;

            // Exchange code for short-lived token
            const tokenRes = await axios.get('https://graph.facebook.com/v17.0/oauth/access_token', {
                params: { client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code }
            });
            const userAccessToken = tokenRes.data.access_token;

            // Fetch user pages/accounts
            const pagesRes = await axios.get('https://graph.facebook.com/me/accounts', {
                params: { access_token: userAccessToken }
            });
            const pages = pagesRes.data.data;
            if (!pages.length) return res.send("No pages found");

            // For simplicity, pick first page (frontend can let user choose later)
            authData = {
                pageId: pages[0].id,
                pageName: pages[0].name,
                accessToken: pages[0].access_token
            };
        }

        if (platform === 'linkedin') {
            // Implement LinkedIn OAuth code exchange
            // authData = { accessToken: ..., profileId: ..., profileName: ... }
        }

        if (platform === 'twitter') {
            // Implement Twitter OAuth code exchange
            // authData = { accessToken: ..., profileId: ..., profileName: ... }
        }

        // Save auth data to user
        await connectPlatform({ params: { platform }, body: { userId, authData } }, {
            json: () => { }, status: () => ({ json: () => { } })
        });

        res.send(`Connected ${platform} successfully! You can close this tab.`);
    } catch (err) {
        console.error('OAuth callback error:', err);
        res.status(500).send('OAuth failed');
    }
});

module.exports = router;
