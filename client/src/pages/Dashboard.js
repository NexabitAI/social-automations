import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FaFacebookF,
    FaLinkedinIn,
    FaInstagram,
    FaTwitter,
} from "react-icons/fa";
import "./Dashboard.css";
import api from "../api/api";

const platformIcons = {
    facebook: <FaFacebookF color="#1877f2" />,
    linkedin: <FaLinkedinIn color="#0a66c2" />,
    instagram: <FaInstagram color="#e1306c" />,
    twitter: <FaTwitter color="#1da1f2" />,
};

const Dashboard = () => {
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 4;

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await api.get("/api/posts", { headers: { "x-auth-token": token } });
                setPosts(res.data.posts);
            } catch (err) {
                console.error(err.response?.data || err.message);
            }
        };

        fetchPosts();
    }, []);

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

    const totalPages = Math.ceil(posts.length / postsPerPage);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="dashboard-container">
            {posts.length === 0 ? (
                <div className="loader-container">
                    <div className="spinner"></div>
                </div>
            ) : (
                <>
                    <div className="posts-grid">
                        {currentPosts.map((post) => {
                            // ✅ Show the first platform for card (UI stays same)
                            const platform = post.platforms[0] || {};
                            return (
                                <div className={`post-card ${platform.name}`} key={post._id}>
                                    <div className="post-header">
                                        {platformIcons[platform.name]}
                                        <span className="platform-name">
                                            {platform.name?.toUpperCase() || "N/A"}
                                        </span>
                                    </div>

                                    {/* ✅ Show post image if exists */}
                                    {post.content?.imageUrl && (
                                        <div className="post-image">
                                            <img
                                                src={post.content.imageUrl}
                                                alt="AI Generated"
                                                className="dashboard-post-image"
                                            />
                                        </div>
                                    )}

                                    <p>
                                        {post.content?.text?.split(" ").length > 20
                                            ? post.content.text.split(" ").slice(0, 20).join(" ") + " ..."
                                            : post.content?.text}
                                    </p>

                                    <div className="post-footer">
                                        <small>
                                            Scheduled:{" "}
                                            {platform.scheduledFor
                                                ? new Date(platform.scheduledFor).toLocaleString()
                                                : "N/A"}
                                        </small>
                                        <span className={`status-badge ${platform.status}`}>
                                            {platform.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pagination">
                        <button onClick={handlePrev} disabled={currentPage === 1}>
                            Prev
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button onClick={handleNext} disabled={currentPage === totalPages}>
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
