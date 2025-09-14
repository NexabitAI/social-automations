import React, { useState } from "react";
import api from "../api/api";

const AiHelper = ({ setContent }) => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        try {
            const res = await api.post("/api/openai/generate", { prompt });

            if (res.data.success) {
                setContent(res.data.content); // ✅ sets text in parent Posts
                if (res.data.imageUrl) {
                    localStorage.setItem("aiGeneratedImage", res.data.imageUrl); // optional, so Posts can pick it up
                }
            }
        } catch (err) {
            console.error("AI error:", err.response?.data || err.message);
        }
        setLoading(false);
    };

    return (
        <div style={{ margin: "10px 0" }}>
            <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter prompt for AI" style={{ width: "80%" }} />
            <button onClick={generate} disabled={loading}>{loading ? "Generating..." : "Generate Post"}</button>
        </div>
    );
};

export default AiHelper;
