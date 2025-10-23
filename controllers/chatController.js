const { GoogleGenerativeAI } = require('@google/generative-ai');

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

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
  const { message } = req.body;

  const prompt = `
📌 Bạn là một Business Analyst chuyên nghiệp. 
NHIỆM VỤ: Chỉ tạo ra danh sách công việc (to-do list) cho BA — KHÔNG GIẢI THÍCH, KHÔNG CHÀO HỎI, KHÔNG THÊM VĂN BẢN.

✅ YÊU CẦU BẮT BUỘC:
- Trả lời bằng tiếng Việt.
- Chỉ dùng định dạng: "- [ ] ..."
- Chia thành 3 phần rõ ràng (ghi tiêu đề):
  I. PHÂN TÍCH YÊU CẦU
  II. TIÊU CHÍ CHẤP NHẬN
  III. CÔNG VIỆC CỤ THỂ CHO BA

❌ CẤM:
- Viết đoạn mở đầu/đóng kết
- Dùng dấu sao (*), ngoặc kép ("), số thứ tự (1., 2.)
- Giải thích logic

User story: "${message}"

➡️ Bắt đầu ngay bằng chữ "I." — Không có ngoại lệ!
`;

  try {
    const result = await model.generateContent(prompt);
    const todoList = result.response.text();
    res.json({ reply: todoList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Không thể tạo to-do list' });
  }
};

module.exports = {
  handleChat,
  chatBA
};
