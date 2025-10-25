const { GoogleGenerativeAI } = require('@google/generative-ai');
const TodoList = require('../models/TodoList'); // Import model

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// Hàm parse TodoList thành cấu trúc có thể lưu MongoDB
function parseTodoList(todoString) {
  const text = (todoString || '').replace(/\r/g, '').trim();
  const sections = [];
  if (!text) return sections;

  // Try to capture clearly labeled I./II./III. sections first
  const secRegex = /I\.\s*([\s\S]*?)\n\s*II\.\s*([\s\S]*?)\n\s*III\.\s*([\s\S]*)/im;
  const m = text.match(secRegex);

  const bulletRegex = /^\s*[-*]\s*\[?\s*[xX\s]?\]?\s*(.+)$/; // captures '- [ ] task', '- [] task', '- task', '* task'

  const extractTasks = (block) => {
    const tasks = [];
    const lines = (block || '').split('\n');
    for (let ln of lines) {
      ln = ln.trim();
      if (!ln) continue;
      const b = ln.match(bulletRegex);
      if (b && b[1]) {
        tasks.push(b[1].trim());
      }
    }
    return tasks;
  };

  if (m) {
    sections.push({ title: 'PHÂN TÍCH YÊU CẦU', tasks: extractTasks(m[1]) });
    sections.push({ title: 'TIÊU CHÍ CHẤP NHẬN', tasks: extractTasks(m[2]) });
    sections.push({ title: 'CÔNG VIỆC CỤ THỂ CHO BA', tasks: extractTasks(m[3]) });
    return sections;
  }

  // If labeled headers not found, try to find Vietnamese header phrases
  const headerNames = [
    { key: 'PHÂN TÍCH YÊU CẦU', re: /PHÂN\s*TÍCH\s*YÊU\s*CẦU/i },
    { key: 'TIÊU CHÍ CHẤP NHẬN', re: /TIÊU\s*CHÍ\s*CHẤP\s*NHẬN/i },
    { key: 'CÔNG VIỆC CỤ THỂ CHO BA', re: /CÔNG\s*VIỆC\s*CỤ\s*THỂ/i }
  ];

  // Locate header indices
  const indices = headerNames.map(h => {
    const idx = text.search(h.re);
    return { title: h.key, idx };
  });

  const found = indices.filter(i => i.idx >= 0);
  if (found.length >= 3) {
    // sort by index
    found.sort((a, b) => a.idx - b.idx);
    for (let i = 0; i < found.length; i++) {
      const start = found[i].idx;
      const end = i + 1 < found.length ? found[i + 1].idx : text.length;
      const block = text.substring(start, end).replace(/^[^\n]*\n/, ''); // remove header line
      sections.push({ title: found[i].title, tasks: extractTasks(block) });
    }
    return sections;
  }

  // Last resort: no headers — try to extract bullets and split into 3 buckets roughly
  const allBullets = [];
  for (const ln of text.split('\n')) {
    const t = ln.trim();
    if (!t) continue;
    const b = t.match(bulletRegex);
    if (b && b[1]) allBullets.push(b[1].trim());
  }

  if (allBullets.length > 0) {
    const per = Math.ceil(allBullets.length / 3) || allBullets.length;
    sections.push({ title: 'PHÂN TÍCH YÊU CẦU', tasks: allBullets.slice(0, per) });
    sections.push({ title: 'TIÊU CHÍ CHẤP NHẬN', tasks: allBullets.slice(per, per * 2) });
    sections.push({ title: 'CÔNG VIỆC CỤ THỂ CHO BA', tasks: allBullets.slice(per * 2) });
    return sections;
  }

  // If nothing found, return empty sections so UI still shows headers
  return [
    { title: 'PHÂN TÍCH YÊU CẦU', tasks: [] },
    { title: 'TIÊU CHÍ CHẤP NHẬN', tasks: [] },
    { title: 'CÔNG VIỆC CỤ THỂ CHO BA', tasks: [] }
  ];
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
