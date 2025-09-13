const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    platformAuth: {
        facebook: {
            pageId: String,
            pageName: String,
            accessToken: String,
            connectedAt: Date
        },
        instagram: {
            profileId: String,
            accessToken: String,
            connectedAt: Date
        },
        linkedin: {
            profileId: String,
            accessToken: String,
            connectedAt: Date
        },
        twitter: {
            profileId: String,
            accessToken: String,
            connectedAt: Date
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
