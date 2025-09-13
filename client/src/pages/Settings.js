import React, { useEffect, useState } from "react";
import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
    FaTwitter,
} from "react-icons/fa";
import "./Settings.css";
import api from "../api/api";

const Settings = () => {
    const [connected, setConnected] = useState({
        facebook: false,
        instagram: false,
        linkedin: false,
        twitter: false,
    });

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await api.get("/api/auth/me", {
                    headers: { "x-auth-token": token }
                });

                const user = res.data;

                setConnected({
                    facebook: !!user.facebook?.pageId,
                    instagram: !!user.instagram?.profileId,
                    linkedin: !!user.linkedin?.profileId,
                    twitter: !!user.twitter?.profileId,
                });
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        };

        fetchUser();
    }, []);

    const connectSocial = async (platform) => {
        const token = localStorage.getItem("token");

        // Open OAuth in new window/tab
        window.open(`${process.env.REACT_APP_BACKEND_URL}/api/${platform}/login?token=${token}`, "_blank");

        // Poll backend to check if connection is done
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/api/platform/${platform}`, {
                    headers: { "x-auth-token": token }
                });
                if (res.data.isConnected) {
                    setConnected(prev => ({ ...prev, [platform]: true }));
                    clearInterval(interval);
                }
            } catch (err) {
                console.error(err);
            }
        }, 3000); // check every 3 seconds
    };


    return (
        <div className="settings-container">
            <h2>Social Accounts</h2>
            <div className="social-buttons">
                <button className={`fb ${connected.facebook ? "connected" : ""}`} onClick={() => connectSocial("facebook")}>
                    <FaFacebookF className="icon" /> {connected.facebook ? "Connected" : "Connect Facebook"}
                </button>
                <button className={`ig ${connected.instagram ? "connected" : ""}`} onClick={() => connectSocial("instagram")}>
                    <FaInstagram className="icon" /> {connected.instagram ? "Connected" : "Connect Instagram"}
                </button>
                <button className={`li ${connected.linkedin ? "connected" : ""}`} onClick={() => connectSocial("linkedin")}>
                    <FaLinkedinIn className="icon" /> {connected.linkedin ? "Connected" : "Connect LinkedIn"}
                </button>
                <button className={`tw ${connected.twitter ? "connected" : ""}`} onClick={() => connectSocial("twitter")}>
                    <FaTwitter className="icon" /> {connected.twitter ? "Connected" : "Connect Twitter"}
                </button>
            </div>
        </div>
    );
};

export default Settings;
