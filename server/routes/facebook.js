const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_ID = "1170071401623956";
// const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI;
const FACEBOOK_REDIRECT_URI = "http://localhost:5000/api/facebook/callback";

// Start Facebook login
router.get("/login", (req, res) => {
    const token = req.query.token; // user’s JWT passed from frontend
    if (!token) return res.status(400).json({ msg: "Missing user token" });

    const fbAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
        FACEBOOK_REDIRECT_URI
    )}&state=${token}&scope=pages_manage_posts,pages_show_list`;

    res.redirect(fbAuthUrl);
});

module.exports = router;
