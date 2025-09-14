const express = require("express");
const { generatePost } = require("../services/aiService");
const router = express.Router();

router.post("/generate", async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const { text, imageUrl } = await generatePost(prompt);

        if (!text && !imageUrl) {
            return res.status(500).json({ error: "Failed to generate post" });
        }

        res.json({
            success: true,
            content: text,
            imageUrl
        });
    } catch (err) {
        console.error("OpenAI route error:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
