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

// Set test env var to avoid requiring a real API key
process.env.GOOGLE_API_KEY = 'test-key';

const { handleChat, chatBA } = require('./chatController');

describe('chatController', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  test('handleChat returns 400 when no message provided', async () => {
    const req = { body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await handleChat(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Message is required' });
  });

  test('handleChat returns reply when model resolves', async () => {
    // model.generateContent returns an object whose response is a Promise resolving to an object with text()
    mockGenerateContent.mockResolvedValueOnce({ response: Promise.resolve({ text: () => 'hello from AI' }) });

    const req = { body: { message: 'hi' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await handleChat(req, res);

    expect(res.json).toHaveBeenCalledWith({ reply: 'hello from AI' });
  });

  test('chatBA returns todo list when model returns text synchronously', async () => {
    // chatBA expects result.response.text() to be synchronous in this code path
    mockGenerateContent.mockResolvedValueOnce({ response: { text: () => 'I. PHÂN TÍCH YÊU CẦU' } });

    const req = { body: { message: 'user story' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await chatBA(req, res);

    expect(res.json).toHaveBeenCalledWith({ reply: 'I. PHÂN TÍCH YÊU CẦU' });
  });
});
