const { GoogleGenerativeAI } = require('@google/generative-ai');
const TodoList = require('../models/TodoList'); // Import model
const parseTodoList = require('../utils/parseTodoList');

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// parseTodoList moved to utils/parseTodoList.js

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
Bạn sử dụng ngôn ngữ chính xác, trang trọng, dễ hiểu.
Giọng điệu: hướng dẫn, không phán xét, không lan man.

Mục tiêu của bạn là tạo ra danh sách công việc (to-do list) cho BA khi đưa User Story vào.
Trường hợp không phải UserStory, bạn chỉ trả lời "Vui lòng cung cấp User Story hợp lệ."

Khi người dùng đưa yêu cầu, bạn cần tạo các công việc cho BA để đạt được mục tiêu đó.

✅ YÊU CẦU BẮT BUỘC:
- Trả lời bằng tiếng Việt.
- Chỉ dùng định dạng: "- [] ..."
- Chia thành 3 phần rõ ràng (ghi tiêu đề): 
  I. PHÂN TÍCH YÊU CẦU
  II. TIÊU CHÍ CHẤP NHẬN
  III. CÔNG VIỆC CỤ THỂ CHO BA

❌ CẤM:
- Viết đoạn mở đầu/đóng kết thúc.
- Giải thích logic

Quy tắc:
- Không suy luận ngoài phạm vi dữ liệu.
- Không thêm chi tiết không có trong đề bài.
- Tránh ngôn từ cảm tính hoặc ý kiến cá nhân.
- Nếu thiếu thông tin, hãy yêu cầu người dùng cung cấp thêm.

Giọng điệu: [vui vẻ / chuyên nghiệp / học thuật / thân thiện]  
Độ dài: vừa và chi tiết
Ngôn ngữ: Tiếng Việt
Tránh: ngôn ngữ tiêu cực, mơ hồ, slang

User story: "${message}"

Bắt đầu ngay bằng chữ "I."
`;

  try {
    const result = await model.generateContent(prompt);
    const todoList = result.response.text();
    const parsedSections = parseTodoList(todoList);
    res.json({ reply: todoList, parsed: parsedSections });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Không thể tạo to-do list' });
  }
};

// API chấp nhận TodoList
const acceptTodo = async (req, res) => {
  const { userStory, sections } = req.body;
  console.log('Received data:', req.body);
  if (!userStory || !sections) {
    return res.status(400).json({ error: 'userStory and sections are required' });
  }
  try {
    const todo = new TodoList({ userStory, sections, accepted: true });
    await todo.save();
    res.json({ message: 'TodoList saved successfully', id: todo._id });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save TodoList: ' + error.message });
  }
};

// API lấy danh sách TodoList đã chấp nhận
const getAcceptedTodos = async (req, res) => {
  try {
    const todos = await TodoList.find({ accepted: true }).sort({ generatedAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TodoLists' });
  }
};

module.exports = {
  handleChat,
  chatBA,
  acceptTodo,
  getAcceptedTodos
};
