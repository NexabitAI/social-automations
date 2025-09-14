// services/publisherService.js
const User = require("../models/User");
const axios = require("axios");

async function publishPost(userId, platformName, content) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (platformName === "facebook") {
        const fb = user.platformAuth?.facebook;
        if (!fb || !fb.pageAccessToken || !fb.pageId) {
            throw new Error("Facebook not connected");
        }

        let url;
        let params;

        // If image exists, post as photo
        if (content.imageUrl) {
            url = `https://graph.facebook.com/${fb.pageId}/photos`;
            params = {
                url: content.imageUrl,
                caption: content.text || "",
                access_token: fb.pageAccessToken
            };
        } else {
            // Text-only post
            url = `https://graph.facebook.com/${fb.pageId}/feed`;
            params = {
                message: content.text,
                access_token: fb.pageAccessToken
            };
        }

        try {
            const res = await axios.post(url, null, { params });
            return res.data; // includes post id
        } catch (err) {
            console.error("Facebook post error:", err.response?.data || err.message);
            throw new Error(err.response?.data?.error?.message || "Failed to post on Facebook");
        }
    }

    // TODO: Add LinkedIn, Instagram, Twitter later
    throw new Error(`Unsupported platform: ${platformName}`);
}

module.exports = { publishPost };
