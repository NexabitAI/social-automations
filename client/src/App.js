import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        {/* Login and Register pages without dashboard layout */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />

        {/* Dashboard layout for authenticated pages */}
        <Route
          path="/*"
          element={
            <div className="app-container" style={{ display: "flex" }}>
              <Sidebar />
              <div style={{ flex: 1 }}>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/posts" element={<Posts />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
