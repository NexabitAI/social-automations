import React, { useState } from "react";
import axios from "axios";
import api from "../api/api";

const AiHelper = ({ setContent }) => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        const res = await api.post("/api/openai/generate", { prompt });
        setContent(res.data.content);
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
