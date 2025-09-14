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
        // Each platform stores different token data
        accessToken: String,        // For LinkedIn, Twitter
        refreshToken: String,       // If supported
        pageId: String,             // For Facebook/Instagram
        pageAccessToken: String,    // For Facebook/Instagram Page posting
        linkedinId: String,         // For LinkedIn (person/org ID)
        expiresAt: Date             // Token expiry
    },
    connectedAt: {
        type: Date,
        default: Date.now
    },
    lastUsedAt: Date
}, {
    timestamps: true
});

// Prevent duplicate entries for same user + platform
PlatformSchema.index({ user: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model("Platform", PlatformSchema);
