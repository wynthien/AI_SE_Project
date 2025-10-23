// server.js
require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // hoặc "gemini-1.5-pro"

app.post('/generate-todo', async (req, res) => {
  const { userStory } = req.body;

  const prompt = `
Bạn là một Business Analyst chuyên nghiệp.
Hãy tạo danh sách công việc (to-do list) chi tiết cho BA dựa trên user story sau.
- Trả lời bằng tiếng Việt
- Dùng định dạng: "- [ ] ..."
- Bao gồm: làm rõ yêu cầu, tiêu chí chấp nhận, UI/UX, tích hợp hệ thống, trường hợp biên, metric

User story: "${userStory}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const todoList = result.response.text();
    res.json({ todoList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Không thể tạo to-do list' });
  }
});

app.listen(3000, () => console.log('Server chạy trên cổng 3000'));
