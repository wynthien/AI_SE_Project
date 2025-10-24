const { GoogleGenerativeAI } = require('@google/generative-ai');
const TodoList = require('../models/TodoList'); // Import model

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Hàm parse TodoList thành cấu trúc có thể lưu MongoDB
function parseTodoList(todoString) {
  const sections = [];
  const lines = todoString.split('\n');

  let currentSection = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('I. PHÂN TÍCH YÊU CẦU')) {
      currentSection = { title: 'PHÂN TÍCH YÊU CẦU', tasks: [] };
      sections.push(currentSection);
    } else if (trimmed.startsWith('II. TIÊU CHÍ CHẤP NHẬN')) {
      currentSection = { title: 'TIÊU CHÍ CHẤP NHẬN', tasks: [] };
      sections.push(currentSection);
    } else if (trimmed.startsWith('III. CÔNG VIỆC CỤ THỂ CHO BA')) {
      currentSection = { title: 'CÔNG VIỆC CỤ THỂ CHO BA', tasks: [] };
      sections.push(currentSection);
    } else if (currentSection && trimmed.startsWith('- [ ] ')) {
      currentSection.tasks.push(trimmed.substring(6));
    }
  }
  return sections;
}

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
