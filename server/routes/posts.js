// routes/posts.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createPost, getPosts } = require("../controllers/postController");

router.post("/", auth, createPost); // schedule new post
router.get("/", auth, getPosts);   // get user posts

module.exports = router;
