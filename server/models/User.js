const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    // Platform-specific tokens for THIS user
    platformAuth: {
        facebook: {
            pageId: String,
            accessToken: String, // Will be encrypted before saving
            pageName: String
        },
        instagram: {
            igUserId: String,
            accessToken: String, // Encrypted
            username: String
        },
        linkedin: {
            accessToken: String, // Encrypted
            refreshToken: String, // Encrypted - CRITICAL
            memberId: String,
            organizationId: String,
            organizationName: String
        },
        twitter: {
            // Twitter API v2 requires OAuth 2.0
            accessToken: String, // Encrypted
            refreshToken: String, // Encrypted
            userId: String
        }
    }
}, {
    timestamps: true // Adds createdAt, updatedAt
});

// Encrypt password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password for login
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// TODO: Add pre-save hooks to encrypt platformAuth tokens (using mongoose encryption or 'crypto')

module.exports = mongoose.model('User', UserSchema);