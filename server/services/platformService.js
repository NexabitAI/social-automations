// services/platformService.js
const Platform = require("../models/Platform");

async function savePlatformAuth(userId, platform, authData) {
    // find if record already exists
    let record = await Platform.findOne({ user: userId, platform });

    if (record) {
        // update existing
        record.authData = { ...record.authData, ...authData };
        record.lastUsedAt = new Date();
        await record.save();
    } else {
        // create new
        record = await Platform.create({
            user: userId,
            platform,
            authData,
            connectedAt: new Date()
        });
    }

    return record;
}

async function getPlatformAuth(userId, platform) {
    return await Platform.findOne({ user: userId, platform });
}

async function removePlatformAuth(userId, platform) {
    return await Platform.deleteOne({ user: userId, platform });
}

module.exports = { savePlatformAuth, getPlatformAuth, removePlatformAuth };
