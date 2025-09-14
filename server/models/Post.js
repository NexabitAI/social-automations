const mongoose = require('mongoose');

const PlatformSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ['facebook', 'instagram', 'linkedin', 'twitter'],
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'published', 'failed'],
        default: 'scheduled'
    },
    scheduledFor: {
        type: Date,
        required: true
    },
    publishedAt: Date,
    platformPostId: String,   // ID returned from platform API (e.g. Facebook Post ID)
    errorMessage: String,     // Error if publishing fails
    responseLog: Object       // Store raw API response for debugging
}, { _id: false });

const PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        text: {
            type: String,
            required: true
        },
        imageUrl: String,
        uploadedImageUrl: String
    },
    platforms: [PlatformSchema],
    globalStatus: {
        type: String,
        enum: ['draft', 'scheduled', 'partially_published', 'published', 'failed'],
        default: 'scheduled'
    }
}, {
    timestamps: true
});

// Index for efficient querying of a user's posts
PostSchema.index({ user: 1, createdAt: -1 });

/**
 * Auto-update globalStatus before save:
 * - If all published → "published"
 * - If some published, some failed → "partially_published"
 * - If all failed → "failed"
 */
PostSchema.pre('save', function (next) {
    if (!this.platforms || this.platforms.length === 0) {
        return next();
    }

    const statuses = this.platforms.map(p => p.status);

    if (statuses.every(s => s === 'published')) {
        this.globalStatus = 'published';
    } else if (statuses.includes('published') && statuses.includes('failed')) {
        this.globalStatus = 'partially_published';
    } else if (statuses.every(s => s === 'failed')) {
        this.globalStatus = 'failed';
    } else if (statuses.every(s => s === 'scheduled')) {
        this.globalStatus = 'scheduled';
    } else {
        this.globalStatus = 'draft';
    }

    next();
});

module.exports = mongoose.model('Post', PostSchema);
