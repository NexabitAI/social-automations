import React, { useState } from "react";
import AiHelper from "../components/AiHelper";
import axios from "axios";
import "./Posts.css";
import {
    FaFacebookF,
    FaLinkedinIn,
    FaInstagram,
    FaTwitter,
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

const Posts = () => {
    const [content, setContent] = useState("");
    const [platform, setPlatform] = useState("facebook");
    const [scheduledTime, setScheduledTime] = useState("");
    const [generatedImage, setGeneratedImage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!content || !scheduledTime) {
            toast.error("Please fill in content and scheduled time.");
            return;
        }

        try {
            const res = await axios.post(
                "http://localhost:5000/api/posts",
                { content, platform, scheduledTime },
                { headers: { "x-auth-token": token } }
            );

            if (res.data.success) {
                toast.success("Post scheduled successfully with AI image!");
                setGeneratedImage(res.data.post.mediaUrl); // ✅ set image from response
                setContent("");
                setScheduledTime("");
            } else {
                toast.error("Error scheduling post.");
            }
        } catch (err) {
            console.error(err.response?.data || err.message);
            toast.error("Error scheduling post.");
        }
    };

    return (
        <div className="posts-container-flex">
            <ToastContainer />
            <div className="posts-form-container">
                <h2 className="posts-title">Create New Post</h2>

                <form onSubmit={handleSubmit} className="posts-form">
                    <div className="form-group">
                        <label>Platform</label>
                        <div className="platform-buttons">
                            {[
                                { name: "facebook", icon: <FaFacebookF /> },
                                { name: "linkedin", icon: <FaLinkedinIn /> },
                                { name: "instagram", icon: <FaInstagram /> },
                                { name: "twitter", icon: <FaTwitter /> },
                            ].map((p) => (
                                <button
                                    key={p.name}
                                    type="button"
                                    className={platform === p.name ? "selected" : ""}
                                    onClick={() => setPlatform(p.name)}
                                >
                                    {p.icon}{" "}
                                    {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>AI Prompt</label>
                        <AiHelper setContent={setContent} />
                    </div>

                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your post content here"
                            rows="6"
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Scheduled Time</label>
                        <input
                            type="datetime-local"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        Schedule Post with AI Image
                    </button>
                </form>
            </div>

            <div className="generated-image-preview-container">
                <h3>AI Image Preview</h3>
                {generatedImage ? (
                    <img
                        src={generatedImage}
                        alt="AI Generated Preview"
                        className="generated-image-preview"
                    />
                ) : (
                    <p>No image generated yet. Submit post to generate.</p>
                )}
            </div>
        </div>
    );
};

export default Posts;
