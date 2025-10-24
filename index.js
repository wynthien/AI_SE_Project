require('dotenv/config');
const express = require('express');
const mongoose = require('mongoose');
const chatRoutes = require('./routes/chat');

const app = express();
const port = 3000;

// Kết nối Mongoose
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware để parse JSON
app.use(express.json());
app.use(express.static('public')); // Serve các file tĩnh như HTML, CSS, JS

// Sử dụng routes
app.use('/api', chatRoutes);

// Khởi động server
app.listen(port, () => {
  console.log(`Chatbot server running at http://localhost:${port}`);
});
