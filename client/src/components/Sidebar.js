import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaPenFancy, FaCog } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
    const location = useLocation();

    return (
        <div className="sidebar">
            <div className="sidebar-header">Social Scheduler</div>
            <ul className="sidebar-menu">
                <li className={location.pathname === "/" ? "active" : ""}>
                    <Link to="/">
                        <FaTachometerAlt className="icon" /> Dashboard
                    </Link>
                </li>
                <li className={location.pathname === "/posts" ? "active" : ""}>
                    <Link to="/posts">
                        <FaPenFancy className="icon" /> Posts
                    </Link>
                </li>
                <li className={location.pathname === "/settings" ? "active" : ""}>
                    <Link to="/settings">
                        <FaCog className="icon" /> Settings
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
