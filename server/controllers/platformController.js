const User = require('../models/User');

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

module.exports = { connectPlatform, getPlatform };
