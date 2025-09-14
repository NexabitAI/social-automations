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

        const url = `https://graph.facebook.com/${fb.pageId}/photos`;
        const params = {
            url: content.imageUrl,
            caption: content.text,
            access_token: fb.pageAccessToken
        };

        const res = await axios.post(url, null, { params });
        return res.data;
    }

    // TODO: Add LinkedIn, Instagram, Twitter later
    throw new Error(`Unsupported platform: ${platformName}`);
}

module.exports = { publishPost };
