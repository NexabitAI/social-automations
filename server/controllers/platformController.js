const User = require('../models/User');
const axios = require('axios');

// Save platform auth dynamically
const connectPlatform = async (req, res) => {
    try {
        const { platform } = req.params; // 'facebook', 'instagram', etc.
        const { userId, authData } = req.body;

        if (!platform || !userId || !authData) {
            return res.status(400).json({ success: false, message: 'Missing platform, userId, or authData' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Ensure platformAuth exists
        user.platformAuth = user.platformAuth || {};

        // Save auth data dynamically
        user.platformAuth[platform] = {
            ...user.platformAuth[platform],
            ...authData,
            connectedAt: new Date()
        };

        await user.save();

        return res.json({ success: true, message: `${platform} connected successfully` });
    } catch (err) {
        console.error('connectPlatform error', err);
        return res.status(500).json({ success: false, message: 'Server error connecting platform' });
    }
};

// Get platform connection status dynamically
const getPlatform = async (req, res) => {
    try {
        const { platform } = req.params; // 'facebook', 'instagram', etc.
        const user = await User.findById(req.user.id).select(`platformAuth.${platform}`);

        if (!user || !user.platformAuth || !user.platformAuth[platform]) {
            return res.json({ isConnected: false });
        }

        const p = user.platformAuth[platform];
        return res.json({
            isConnected: !!p.accessToken,
            ...p
        });
    } catch (err) {
        console.error('getPlatform error', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Post to Instagram
const postToInstagram = async (req, res) => {
    try {
        const { caption, imageUrl } = req.body;
        if (!caption || !imageUrl) {
            return res.status(400).json({ success: false, message: 'Caption and imageUrl are required' });
        }

        const user = await User.findById(req.user.id);
        if (!user || !user.platformAuth?.instagram) {
            return res.status(400).json({ success: false, message: 'Instagram not connected' });
        }

        const { accessToken, igUserId } = user.platformAuth.instagram;
        if (!accessToken || !igUserId) {
            return res.status(400).json({ success: false, message: 'Instagram credentials missing' });
        }

        // Step 1: Create media container
        const mediaRes = await axios.post(
            `https://graph.facebook.com/v17.0/${igUserId}/media`,
            {
                image_url: imageUrl,
                caption: caption,
                access_token: accessToken
            }
        );

        const creationId = mediaRes.data.id;

        // Step 2: Publish media
        const publishRes = await axios.post(
            `https://graph.facebook.com/v17.0/${igUserId}/media_publish`,
            {
                creation_id: creationId,
                access_token: accessToken
            }
        );

        return res.json({ success: true, postId: publishRes.data.id });
    } catch (err) {
        console.error('postToInstagram error:', err.response?.data || err.message);
        return res.status(500).json({ success: false, message: 'Failed to post to Instagram' });
    }
};

module.exports = { connectPlatform, getPlatform, postToInstagram };
