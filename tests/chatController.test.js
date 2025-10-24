/**
 * Integration and unit tests for Chat Controller
 * Tests with mocked AI client and Express middleware
 */

const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent
      })
    }))
  };
});

process.env.GOOGLE_API_KEY = 'test-key';

const { handleChat, chatBA } = require('../controllers/chatController');
const { createMockRequest, createMockResponse } = require('./helpers');

describe('ChatController - handleChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateContent.mockReset();
  });

  describe('Validation Tests', () => {
    test('should return 400 when message is missing', async () => {
      const req = createMockRequest({ body: {} });
      const res = createMockResponse();

      await handleChat(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Message is required' });
    });

    test('should return 400 when message is empty string', async () => {
      const req = createMockRequest({ body: { message: '' } });
      const res = createMockResponse();

      await handleChat(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Message is required' });
    });
  });

  describe('Success Tests', () => {
    test('should return AI reply on successful chat', async () => {
      const mockReply = 'Hello, this is AI response!';
      mockGenerateContent.mockResolvedValueOnce({
        response: Promise.resolve({ text: () => mockReply })
      });

      const req = createMockRequest({ body: { message: 'Hi there' } });
      const res = createMockResponse();

      await handleChat(req, res);

      expect(mockGenerateContent).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ reply: mockReply });
    });

    test('should handle special characters in message', async () => {
      const mockReply = 'Response to special chars';
      mockGenerateContent.mockResolvedValueOnce({
        response: Promise.resolve({ text: () => mockReply })
      });

      const req = createMockRequest({ body: { message: '你好 @#$%^&*()' } });
      const res = createMockResponse();

      await handleChat(req, res);

      expect(res.json).toHaveBeenCalledWith({ reply: mockReply });
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

      const req = createMockRequest({ body: { message: 'test' } });
      const res = createMockResponse();

      await handleChat(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    test('should handle network timeout', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockGenerateContent.mockRejectedValueOnce(timeoutError);

      const req = createMockRequest({ body: { message: 'test' } });
      const res = createMockResponse();

      await handleChat(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});

describe('ChatController - chatBA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateContent.mockReset();
  });

  describe('Business Analyst Mode Tests', () => {
    test('should generate BA todo list from user story', async () => {
      const mockTodoList = `I. PHÂN TÍCH YÊU CẦU
- [ ] Hiểu yêu cầu người dùng
- [ ] Xác định ràng buộc
II. TIÊU CHÍ CHẤP NHẬN
- [ ] Yêu cầu chức năng`;

      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => mockTodoList }
      });

      const req = createMockRequest({ body: { message: 'Build a chat system' } });
      const res = createMockResponse();

      await chatBA(req, res);

      expect(res.json).toHaveBeenCalledWith({ reply: mockTodoList });
      expect(mockGenerateContent).toHaveBeenCalledWith(expect.stringContaining('Business Analyst'));
    });

    test('should include only required sections in response', async () => {
      const mockTodoList = `I. PHÂN TÍCH YÊU CẦU
- [ ] Task 1`;

      mockGenerateContent.mockResolvedValueOnce({
        response: { text: () => mockTodoList }
      });

      const req = createMockRequest({ body: { message: 'user story' } });
      const res = createMockResponse();

      await chatBA(req, res);

      const callArg = mockGenerateContent.mock.calls[0][0];
      expect(callArg).toContain('I. PHÂN TÍCH YÊU CẦU');
      expect(callArg).toContain('II. TIÊU CHÍ CHẤP NHẬN');
      expect(callArg).toContain('III. CÔNG VIỆC CỤ THỂ CHO BA');
    });
  });

  describe('Error Handling for BA Mode', () => {
    test('should handle BA mode API errors', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

      const req = createMockRequest({ body: { message: 'user story' } });
      const res = createMockResponse();

      await chatBA(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Không thể tạo to-do list' });
    });
  });
});
