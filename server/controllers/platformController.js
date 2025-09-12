// controllers/platformController.js
const User = require('../models/User');

const connectPlatform = async (req, res) => {
    try {
        // n8n will POST { userId, authData: { pageId, pageName, pageAccessToken } }
        const { userId, authData } = req.body;

        if (!userId || !authData) {
            return res.status(400).json({ success: false, message: 'Missing userId or authData' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Ensure platformAuth exists
        user.platformAuth = user.platformAuth || {};
        user.platformAuth.facebook = {
            ...user.platformAuth.facebook,
            pageId: authData.pageId,
            pageName: authData.pageName,
            accessToken: authData.pageAccessToken,
            connectedAt: new Date()
        };

        await user.save();

        return res.json({ success: true, message: 'Facebook connected successfully' });
    } catch (err) {
        console.error('connectPlatform error', err);
        return res.status(500).json({ success: false, message: 'Server error connecting Facebook' });
    }
};

const getPlatform = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('platformAuth.facebook');

        if (!user || !user.platformAuth || !user.platformAuth.facebook) {
            return res.json({ isConnected: false });
        }

        const fb = user.platformAuth.facebook;
        return res.json({
            isConnected: !!fb.accessToken,
            pageId: fb.pageId,
            pageName: fb.pageName,
            connectedAt: fb.connectedAt || null
        });
    } catch (err) {
        console.error('getPlatform error', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { connectPlatform, getPlatform };
