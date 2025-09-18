import React, { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import "./Settings.css";
import api from "../api/api";
import { jwtDecode } from "jwt-decode";

const Settings = () => {
    const [connected, setConnected] = useState({
        facebook: false,
        instagram: false,
        linkedin: false,
        twitter: false,
    });

    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            setUserId(decoded.id || decoded.user?.id); // ✅ safer
        }

        const fetchUserPlatforms = async () => {
            if (!token) return;
            const platforms = ["facebook", "instagram", "linkedin", "twitter"];
            try {
                const updatedStatus = {};
                for (let platform of platforms) {
                    const res = await api.get(`/api/platforms/${platform}`, {
                        headers: { "x-auth-token": token },
                    });
                    updatedStatus[platform] = res.data.isConnected || false;
                }
                setConnected(updatedStatus);
            } catch (err) {
                console.error("Failed to fetch platform status:", err);
            }
        };

        fetchUserPlatforms();
    }, []);

    const connectSocial = (platform) => {
        const token = localStorage.getItem("token");
        if (!userId) return alert("User not loaded");

        window.open(
            `${process.env.REACT_APP_BACKEND_URL}/api/platforms/${platform}/auth?userId=${userId}`,
            "_blank"
        );

        let elapsed = 0;
        const interval = setInterval(async () => {
            elapsed += 3;
            if (elapsed > 60) {
                clearInterval(interval);
                console.warn(`Timeout waiting for ${platform} connection`);
                return;
            }
            try {
                const res = await api.get(`/api/platforms/${platform}`, {
                    headers: { "x-auth-token": token },
                });
                if (res.data.isConnected) {
                    setConnected((prev) => ({ ...prev, [platform]: true }));
                    clearInterval(interval);
                }
            } catch (err) {
                console.error(err);
            }
        }, 3000);
    };

    return (
        <div className="settings-container">
            <h2>Social Accounts</h2>
            <div className="social-buttons">
                <button
                    className={`fb ${connected.facebook ? "connected" : ""}`}
                    onClick={() => connectSocial("facebook")}
                >
                    <FaFacebookF className="icon" />{" "}
                    {connected.facebook ? "Connected" : "Connect Facebook"}
                </button>
                <button
                    className={`ig ${connected.instagram ? "connected" : ""}`}
                    onClick={() => connectSocial("instagram")}
                >
                    <FaInstagram className="icon" />{" "}
                    {connected.instagram ? "Connected" : "Connect Instagram"}
                </button>
                <button
                    className={`li ${connected.linkedin ? "connected" : ""}`}
                    onClick={() => connectSocial("linkedin")}
                >
                    <FaLinkedinIn className="icon" />{" "}
                    {connected.linkedin ? "Connected" : "Connect LinkedIn"}
                </button>
                <button
                    className={`tw ${connected.twitter ? "connected" : ""}`}
                    onClick={() => connectSocial("twitter")}
                >
                    <FaTwitter className="icon" />{" "}
                    {connected.twitter ? "Connected" : "Connect Twitter"}
                </button>
            </div>
        </div>
    );
};

export default Settings;
