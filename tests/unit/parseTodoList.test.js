/**
 * Unit Tests for parseTodoList function
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const TodoList = require('../../models/TodoList');

// Mock the parseTodoList function since it's not exported
// We'll extract it for testing purposes
function parseTodoList(todoString) {
  const text = (todoString || '').replace(/\r/g, '').trim();
  const sections = [];
  if (!text) return sections;

  const secRegex = /I\.\s*([\s\S]*?)\n\s*II\.\s*([\s\S]*?)\n\s*III\.\s*([\s\S]*)/im;
  const m = text.match(secRegex);

  const bulletRegex = /^\s*[-*]\s*\[?\s*[xX\s]?\]?\s*(.+)$/;

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

  const headerNames = [
    { key: 'PHÂN TÍCH YÊU CẦU', re: /PHÂN\s*TÍCH\s*YÊU\s*CẦU/i },
    { key: 'TIÊU CHÍ CHẤP NHẬN', re: /TIÊU\s*CHÍ\s*CHẤP\s*NHẬN/i },
    { key: 'CÔNG VIỆC CỤ THỂ CHO BA', re: /CÔNG\s*VIỆC\s*CỤ\s*THỂ/i }
  ];

  const indices = headerNames.map(h => {
    const idx = text.search(h.re);
    return { title: h.key, idx };
  });

  const found = indices.filter(i => i.idx >= 0);
  if (found.length >= 3) {
    found.sort((a, b) => a.idx - b.idx);
    for (let i = 0; i < found.length; i++) {
      const start = found[i].idx;
      const end = i + 1 < found.length ? found[i + 1].idx : text.length;
      const block = text.substring(start, end).replace(/^[^\n]*\n/, '');
      sections.push({ title: found[i].title, tasks: extractTasks(block) });
    }
    return sections;
  }

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

  return [
    { title: 'PHÂN TÍCH YÊU CẦU', tasks: [] },
    { title: 'TIÊU CHÍ CHẤP NHẬN', tasks: [] },
    { title: 'CÔNG VIỆC CỤ THỂ CHO BA', tasks: [] }
  ];
}

describe('parseTodoList', () => {
  describe('with structured Roman numeral format', () => {
    it('should parse todo list with I./II./III. sections correctly', () => {
      const input = `I. PHÂN TÍCH YÊU CẦU
- [] Xác định yêu cầu người dùng
- [] Phân tích nghiệp vụ

II. TIÊU CHÍ CHẤP NHẬN
- [] Đảm bảo chức năng hoạt động
- [] Kiểm tra UI/UX

III. CÔNG VIỆC CỤ THỂ CHO BA
- [] Viết tài liệu kỹ thuật
- [] Tạo user stories`;

      const result = parseTodoList(input);

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('PHÂN TÍCH YÊU CẦU');
      expect(result[0].tasks).toHaveLength(2);
      expect(result[0].tasks[0]).toBe('Xác định yêu cầu người dùng');
      
      expect(result[1].title).toBe('TIÊU CHÍ CHẤP NHẬN');
      expect(result[1].tasks).toHaveLength(2);
      
      expect(result[2].title).toBe('CÔNG VIỆC CỤ THỂ CHO BA');
      expect(result[2].tasks).toHaveLength(2);
    });

    it('should handle tasks with different bullet formats', () => {
      const input = `I. PHÂN TÍCH YÊU CẦU
- Task 1
- [ ] Task 2
- [x] Task 3
* Task 4

II. TIÊU CHÍ CHẤP NHẬN
- Task A

III. CÔNG VIỆC CỤ THỂ CHO BA
- Task X`;

      const result = parseTodoList(input);

      expect(result[0].tasks).toHaveLength(4);
      expect(result[0].tasks).toContain('Task 1');
      expect(result[0].tasks).toContain('Task 2');
      expect(result[0].tasks).toContain('Task 3');
      expect(result[0].tasks).toContain('Task 4');
    });
  });

  describe('with Vietnamese header format', () => {
    it('should parse todo list with Vietnamese headers', () => {
      const input = `PHÂN TÍCH YÊU CẦU
- Task 1

TIÊU CHÍ CHẤP NHẬN
- Task 2

CÔNG VIỆC CỤ THỂ
- Task 3`;

      const result = parseTodoList(input);

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('PHÂN TÍCH YÊU CẦU');
      expect(result[1].title).toBe('TIÊU CHÍ CHẤP NHẬN');
      expect(result[2].title).toBe('CÔNG VIỆC CỤ THỂ CHO BA');
    });
  });

  describe('edge cases', () => {
    it('should return empty sections for empty input', () => {
      const result = parseTodoList('');

      expect(result).toHaveLength(0);
    });

    it('should return empty sections for null input', () => {
      const result = parseTodoList(null);

      expect(result).toHaveLength(0);
    });

    it('should handle input without clear structure', () => {
      const input = `- Task 1
- Task 2
- Task 3
- Task 4
- Task 5
- Task 6`;

      const result = parseTodoList(input);

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('PHÂN TÍCH YÊU CẦU');
      expect(result[1].title).toBe('TIÊU CHÍ CHẤP NHẬN');
      expect(result[2].title).toBe('CÔNG VIỆC CỤ THỂ CHO BA');
    });

    it('should return empty task arrays when no headers or bullets found', () => {
      const input = 'This is just some text without structure';

      const result = parseTodoList(input);

      expect(result).toHaveLength(3);
      expect(result[0].tasks).toHaveLength(0);
      expect(result[1].tasks).toHaveLength(0);
      expect(result[2].tasks).toHaveLength(0);
    });
  });
});
