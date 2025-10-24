const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  tasks: [
    {
      type: String,
      required: true
    }
  ]
});

const todoListSchema = new mongoose.Schema({
  userStory: {
    type: String,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  accepted: {
    type: Boolean,
    default: false
  },
  sections: [sectionSchema],
  sessionId: { // Để nhận biết session, có thể dùng trong tương lai
    type: String,
    default: ''
  }
});

const TodoList = mongoose.model('TodoList', todoListSchema);

module.exports = TodoList;
