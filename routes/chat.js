const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Route cho chat (tạo TodoList)
router.post('/chat', chatController.chatBA);

// Route chấp nhận TodoList
router.post('/accept', chatController.acceptTodo);

// Route lấy danh sách TodoList đã chấp nhận
router.get('/todos', chatController.getAcceptedTodos);

module.exports = router;
