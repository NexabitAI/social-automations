const Post = require("../models/Post");
const { generateImage } = require("../services/aiService");

exports.createPost = async (req, res) => {
    try {
        const { content, platform, scheduledTime } = req.body;
        const userId = req.user.id;

        if (!content || !platform || !scheduledTime) {
            return res.status(400).json({ success: false, msg: "Missing required fields" });
        }

        // Use frontend image or generate AI image
        let imageUrl = content.imageUrl || await generateImage(content.text || content);

        // Create a post per platform inside the array
        const post = new Post({
            user: userId,
            content: {
                text: content.text || content,
                imageUrl: imageUrl
            },
            platforms: [
                {
                    name: platform,
                    status: 'scheduled',
                    scheduledFor: scheduledTime,
                }
            ]
        });

        await post.save();

        return res.json({ success: true, post });
    } catch (err) {
        console.error("Error creating post:", err.message);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};


exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, posts });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};
