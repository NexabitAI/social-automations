const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function generateText(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a social media assistant that creates engaging short posts." },
                { role: "user", content: prompt }
            ],
            max_tokens: 150
        });

        return response.choices[0].message.content.trim();
    } catch (err) {
        console.error("AI text generation error:", err.message);
        return null;
    }
}

async function generateImage(prompt) {
    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt,
            n: 1,
            size: "1024x1024",
        });

        return response.data[0].url;
    } catch (err) {
        console.error("AI image generation error:", err.message);
        return null;
    }
}

async function generatePost(prompt) {
    const text = await generateText(prompt);
    const imageUrl = await generateImage(prompt);
    return { text, imageUrl };
}

module.exports = { generatePost };
