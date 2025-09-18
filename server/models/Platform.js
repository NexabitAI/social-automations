// models/Platform.js
const mongoose = require("mongoose");

const PlatformSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    platform: {
        type: String,
        enum: ["facebook", "instagram", "linkedin", "twitter"],
        required: true
    },
    authData: {
        accessToken: String,
        refreshToken: String,
        pageId: String,
        pageAccessToken: String,
        linkedinId: String,
        expiresAt: Date
    },
    connectedAt: {
        type: Date,
        default: Date.now
    },
    lastUsedAt: Date
}, {
    timestamps: true
});

PlatformSchema.index({ user: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model("Platform", PlatformSchema);
