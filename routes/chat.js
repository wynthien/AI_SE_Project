const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Route cho chat
router.post('/chat', chatController.chatBA);

module.exports = router;
