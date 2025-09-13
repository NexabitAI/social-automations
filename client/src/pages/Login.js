import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import "./Login.css";
import api from "../api/api";

const Login = ({ setUser }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await api.post("/api/auth/login", { email, password });

            const { user, token, userid } = res.data;

            // Save in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("userid", userid);

            setUser(user);
            navigate("/");
        } catch (err) {
            console.error(err.response?.data || err.message);
            alert(err.response?.data?.message || "Login failed.");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>Login</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Login</button>

                <p className="login-footer">
                    Don’t have an account? <Link to="/register">Register here</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
