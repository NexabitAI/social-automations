// services/aiService.js
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function generateImage(prompt) {
    try {
        const result = await openai.images.generate({
            model: "gpt-image-1",
            prompt,
            size: "512x512"
        });

        return result.data[0].url; // ✅ AI image URL
    } catch (err) {
        console.error("AI image generation error:", err.message);
        return null; // fallback
    }
}

module.exports = { generateImage };
