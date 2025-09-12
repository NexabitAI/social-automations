const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

router.post('/', auth, postController.schedulePost);
router.get('/', auth, postController.getPosts);

module.exports = router;
