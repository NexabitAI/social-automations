// services/publisherService.js
const axios = require("axios");
const Platform = require("../models/Platform"); // where we saved user tokens

async function publishToFacebook(post, userId) {
    const platform = await Platform.findOne({ user: userId, platform: "facebook" });
    if (!platform) throw new Error("Facebook not connected");

    const { pageId, pageAccessToken } = platform.authData;

    const url = `https://graph.facebook.com/${pageId}/photos`; // we post image + caption
    await axios.post(url, {
        caption: post.content,
        url: post.mediaUrl
    }, {
        params: { access_token: pageAccessToken }
    });

    return "Facebook post published!";
}

async function publishToLinkedIn(post, userId) {
    const platform = await Platform.findOne({ user: userId, platform: "linkedin" });
    if (!platform) throw new Error("LinkedIn not connected");

    const { accessToken } = platform.authData;

    await axios.post("https://api.linkedin.com/v2/ugcPosts", {
        author: `urn:li:person:${platform.authData.linkedinId}`, // store this in authData when connecting
        lifecycleState: "PUBLISHED",
        specificContent: {
            "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text: post.content },
                shareMediaCategory: "IMAGE",
                media: [
                    {
                        status: "READY",
                        originalUrl: post.mediaUrl
                    }
                ]
            }
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
    }, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    return "LinkedIn post published!";
}

async function publishPost(post) {
    switch (post.platform) {
        case "facebook":
            return publishToFacebook(post, post.user);
        case "linkedin":
            return publishToLinkedIn(post, post.user);
        case "instagram":
            // similar to FB, using IG Graph API
            throw new Error("Instagram posting not implemented yet");
        case "twitter":
            // use Twitter/X API
            throw new Error("Twitter posting not implemented yet");
        default:
            throw new Error("Unsupported platform");
    }
}

module.exports = { publishPost };
