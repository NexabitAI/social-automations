// services/facebookService.js
const axios = require("axios");
const { savePlatformAuth } = require("./platformService");

async function exchangeFbToken(userId, shortLivedToken) {
    try {
        const fbAppId = process.env.FB_APP_ID;
        const fbAppSecret = process.env.FB_APP_SECRET;

        // Step 1: exchange short-lived -> long-lived token
        const tokenRes = await axios.get("https://graph.facebook.com/v17.0/oauth/access_token", {
            params: {
                grant_type: "fb_exchange_token",
                client_id: fbAppId,
                client_secret: fbAppSecret,
                fb_exchange_token: shortLivedToken
            }
        });

        const longLivedToken = tokenRes.data.access_token;

        // Step 2: get user pages
        const pagesRes = await axios.get("https://graph.facebook.com/me/accounts", {
            params: { access_token: longLivedToken }
        });

        if (!pagesRes.data.data.length) {
            throw new Error("No pages found for this Facebook account");
        }

        // Save first page (or loop for multiple)
        const page = pagesRes.data.data[0];

        const record = await savePlatformAuth(userId, "facebook", {
            pageId: page.id,
            pageName: page.name,
            accessToken: longLivedToken,   // user token
            pageAccessToken: page.access_token, // page token
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // ~60 days
        });

        return record;
    } catch (err) {
        console.error("Facebook token exchange error:", err.response?.data || err.message);
        throw new Error("Failed to exchange Facebook token");
    }
}

module.exports = { exchangeFbToken };
