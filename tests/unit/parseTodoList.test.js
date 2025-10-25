/**
 * Unit Tests for parseTodoList function
 */

const parseTodoList = require('../../utils/parseTodoList');

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
