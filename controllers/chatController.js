const { GoogleGenerativeAI } = require('@google/generative-ai');

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const handleChat = async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Gửi prompt đến Gemini
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const text = response.text();
    res.json({ reply: text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const chatBA = async (req, res) => {
  const { userStory } = req.body.message;

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
};

module.exports = {
  handleChat,
  chatBA
};
