import React, { useEffect, useState } from "react";
import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
    FaTwitter,
} from "react-icons/fa";
import axios from "axios";
import "./Settings.css";

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
                const res = await axios.get("http://localhost:5000/api/auth/me", {
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

    const connectFacebook = () => {
        const token = localStorage.getItem("token");
        window.location.href = `http://localhost:5000/api/facebook/login?token=${token}`;
    };

    const connectInstagram = () => {
        const token = localStorage.getItem("token");
        window.location.href = `http://localhost:5000/api/instagram/login?token=${token}`;
    };

    const connectLinkedIn = () => {
        const token = localStorage.getItem("token");
        window.location.href = `http://localhost:5000/api/linkedin/login?token=${token}`;
    };

    const connectTwitter = () => {
        const token = localStorage.getItem("token");
        window.location.href = `http://localhost:5000/api/twitter/login?token=${token}`;
    };

    return (
        <div className="settings-container">
            <h2>Social Accounts</h2>
            <div className="social-buttons">
                <button className={`fb ${connected.facebook ? "connected" : ""}`} onClick={connectFacebook}>
                    <FaFacebookF className="icon" /> {connected.facebook ? "Connected" : "Connect Facebook"}
                </button>
                <button className={`ig ${connected.instagram ? "connected" : ""}`} onClick={connectInstagram}>
                    <FaInstagram className="icon" /> {connected.instagram ? "Connected" : "Connect Instagram"}
                </button>
                <button className={`li ${connected.linkedin ? "connected" : ""}`} onClick={connectLinkedIn}>
                    <FaLinkedinIn className="icon" /> {connected.linkedin ? "Connected" : "Connect LinkedIn"}
                </button>
                <button className={`tw ${connected.twitter ? "connected" : ""}`} onClick={connectTwitter}>
                    <FaTwitter className="icon" /> {connected.twitter ? "Connected" : "Connect Twitter"}
                </button>
            </div>
        </div>
    );
};

export default Settings;
