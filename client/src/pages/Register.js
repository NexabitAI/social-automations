import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import api from "../api/api";

const Register = ({ setUser }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirm) {
            alert("Passwords do not match");
            return;
        }

        try {
            const res = await api.post("/api/auth/register", {
                username: name,
                email,
                password,
            });

            const { user, token, userid } = res.data;

            // Store in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("userid", userid);

            setUser(user);
            navigate("/");
        } catch (err) {
            console.error(err.response?.data || err.message);
            alert(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="register-container">
            <form onSubmit={handleSubmit} className="register-form">
                <h2>Register</h2>

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

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

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                />

                <button type="submit">Register</button>

                <p className="register-footer">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
