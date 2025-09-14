import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


router.post("/generate", async (req, res) => {
    const { prompt } = req.body;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a social media content assistant." },
                { role: "user", content: prompt },
            ],
        });

        const aiResponse = completion.choices[0].message.content;
        res.json({ success: true, content: aiResponse });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
