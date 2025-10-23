// Model cho tin nhắn (placeholder để chuẩn bị sử dụng Mongoose)
// Later: kết nối cơ sở dữ liệu và lưu lịch sử cuộc trò chuyện

const mongoose = require('mongoose');

// Schema cho tin nhắn (tạm thời không sử dụng)
const messageSchema = new mongoose.Schema({
  userMessage: {
    type: String,
    required: true
  },
  aiReply: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Model (tạm thời không xuất khẩu)
const MessageModel = mongoose.model('Message', messageSchema);

// Placeholder export cho tương lai
module.exports = MessageModel;
