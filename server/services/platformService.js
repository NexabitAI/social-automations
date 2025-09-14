// services/platformService.js
const User = require('../models/User');

async function savePlatformAuth(userId, platform, authData) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.platformAuth = user.platformAuth || {};
    user.platformAuth[platform] = {
        ...user.platformAuth[platform],
        ...authData,
        connectedAt: new Date()
    };

    await user.save();
    return user.platformAuth[platform];
}

module.exports = { savePlatformAuth };
