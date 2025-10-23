require('dotenv/config');
const express = require('express');
const chatRoutes = require('./routes/chat');

const app = express();
const port = 3000;

// Middleware để parse JSON
app.use(express.json());
app.use(express.static('public')); // Serve các file tĩnh như HTML, CSS, JS

// Sử dụng routes
app.use('/api', chatRoutes);

// Khởi động server
app.listen(port, () => {
  console.log(`Chatbot server running at http://localhost:${port}`);
});
