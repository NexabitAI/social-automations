// controllers/postController.js
const moment = require("moment-timezone");
const Post = require("../models/Post");
const { generateImage } = require("../services/aiService");
const cloudinary = require("../services/cloudinary");

exports.createPost = async (req, res) => {
    try {
        const { content, platform, scheduledTime } = req.body;
        const userId = req.user.id;

        if (!content || !platform || !scheduledTime) {
            return res.status(400).json({ success: false, msg: "Missing required fields" });
        }

        // 🔥 Convert local (Pakistan) time to UTC before saving
        const scheduledUTC = moment.tz(scheduledTime, "Asia/Karachi").toDate();

        // Step 1: Use frontend image or generate AI image
        let finalImageUrl = content.imageUrl;
        if (!finalImageUrl) {
            const generatedImage = await generateImage(content.text || content);

            // Step 2: Upload to Cloudinary
            const uploadRes = await cloudinary.uploader.upload(generatedImage, {
                folder: "social-automations",
            });

            finalImageUrl = uploadRes.secure_url;
        }

        // Step 3: Save post in DB
        const post = new Post({
            user: userId,
            content: {
                text: content.text || content,
                imageUrl: finalImageUrl,
            },
            platforms: [
                {
                    name: platform,
                    status: "scheduled",
                    scheduledFor: scheduledUTC, // ✅ save as UTC
                }
            ]
        });

        await post.save();

        return res.json({ success: true, post });
    } catch (err) {
        console.error("❌ Error creating post:", err.message);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};



exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (err) {
        console.error("❌ Error fetching posts:", err.message);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};
