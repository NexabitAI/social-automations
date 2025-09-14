import React, { useState } from "react";
import api from "../api/api";

const AiHelper = ({ setContent, setGeneratedImage }) => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        try {
            const res = await api.post("/api/openai/generate", { prompt });

            if (res.data.success) {
                if (res.data.content) {
                    setContent(res.data.content); // ✅ set text
                }
                if (res.data.imageUrl) {
                    setGeneratedImage(res.data.imageUrl); // ✅ set image in parent
                }
            }
        } catch (err) {
            console.error("AI error:", err.response?.data || err.message);
        }
        setLoading(false);
    };

    return (
        <div style={{ margin: "10px 0" }}>
            <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt for AI"
                style={{ width: "80%" }}
            />
            <button onClick={generate} disabled={loading}>
                {loading ? "Generating..." : "Generate Post"}
            </button>
        </div>
    );
};

export default AiHelper;
