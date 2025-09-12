import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <h3 className="navbar-title"></h3>

            <div className="navbar-right">
                <div className="navbar-notifications">
                    <FaBell size={18} />
                    <span className="navbar-badge">3</span>
                </div>

                {user && (
                    <div className="navbar-user">
                        <img
                            src={
                                user.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user.name
                                )}&background=0D8ABC&color=fff`
                            }
                            alt="User"
                            className="navbar-avatar"
                        />
                        <span className="navbar-username">{user.name}</span>
                    </div>
                )}

                <button onClick={handleLogout} className="navbar-logout">
                    <FaSignOutAlt size={16} /> Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
