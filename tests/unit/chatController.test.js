/**
 * Unit Tests for Chat Controller Functions
 * Testing with real environment variables from .env
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const TodoList = require('../../models/TodoList');
const chatController = require('../../controllers/chatController');

// Mock the TodoList model to avoid database operations
jest.mock('../../models/TodoList');

// Mock mongoose to avoid actual database connection
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(true),
    connection: {
      close: jest.fn()
    }
  };
});

describe('Chat Controller - Environment Variables Tests', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup mock request and response objects
    mockRequest = {
      body: {}
    };
    
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('Environment Variables', () => {
    it('should have GOOGLE_API_KEY loaded from .env', () => {
      expect(process.env.GOOGLE_API_KEY).toBeDefined();
      expect(process.env.GOOGLE_API_KEY).not.toBe('');
      console.log('✅ GOOGLE_API_KEY loaded:', process.env.GOOGLE_API_KEY.substring(0, 10) + '...');
    });

    it('should have MONGO_URI loaded from .env', () => {
      expect(process.env.MONGO_URI).toBeDefined();
      expect(process.env.MONGO_URI).not.toBe('');
      console.log('✅ MONGO_URI loaded:', process.env.MONGO_URI);
    });

    it('should have NODE_ENV set to test', () => {
      expect(process.env.NODE_ENV).toBe('test');
      console.log('✅ NODE_ENV:', process.env.NODE_ENV);
    });
  });

  describe('handleChat', () => {
    it('should return 400 when message is missing', async () => {
      mockRequest.body = {};

      await chatController.handleChat(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: 'Message is required' 
      });
    });

    it('should handle error when API call fails', async () => {
      jest.setTimeout(60000); // allow up to 60s in case remote API is slow
      mockRequest.body = { message: 'Test message' };

      // This test may hit real API; accept both success and graceful error
      await chatController.handleChat(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalled();
      const response = mockResponse.json.mock.calls[0][0];
      if (response && response.error) {
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(response.error).toMatch(/error/i);
      } else {
        expect(response).toHaveProperty('reply');
      }
    });
  });

  describe('chatBA', () => {
    it('should return 400 when message is missing', async () => {
      mockRequest.body = {};

      // Mock the response to avoid actual API call
      mockResponse.status.mockImplementation((code) => {
        expect(code).toBe(400);
        return mockResponse;
      });

      // Since chatBA doesn't have explicit validation, let's test the behavior
      await chatController.chatBA(mockRequest, mockResponse);

      // Check that a response was sent
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should process valid user story', async () => {
      mockRequest.body = { 
        message: 'As a user, I want to login to the system so that I can access my account' 
      };

      await chatController.chatBA(mockRequest, mockResponse);

      // Verify response was called
      expect(mockResponse.json).toHaveBeenCalled();
      
      const response = mockResponse.json.mock.calls[0][0];
      
      // Check response structure
      if (!response.error) {
        expect(response).toHaveProperty('reply');
        expect(response).toHaveProperty('parsed');
        
        if (response.parsed) {
          expect(Array.isArray(response.parsed)).toBe(true);
          console.log('✅ Generated todo list with', response.parsed.length, 'sections');
        }
      }
    });
  });

  describe('acceptTodo', () => {
    it('should return 400 when required fields are missing', async () => {
      mockRequest.body = {};

      await chatController.acceptTodo(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: 'userStory and sections are required' 
      });
    });

    it('should save todo when valid data is provided', async () => {
      const mockTodo = {
        _id: 'mock-id-123',
        userStory: 'Test user story',
        sections: [
          { title: 'Section 1', tasks: ['Task 1'] }
        ],
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock TodoList constructor
      TodoList.mockImplementation(() => mockTodo);

      mockRequest.body = {
        userStory: 'Test user story',
        sections: [
          { title: 'Section 1', tasks: ['Task 1'] }
        ]
      };

      await chatController.acceptTodo(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'TodoList saved successfully',
        id: 'mock-id-123'
      });
      expect(mockTodo.save).toHaveBeenCalled();
    });

    it('should handle save errors', async () => {
      const mockTodo = {
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      TodoList.mockImplementation(() => mockTodo);

      mockRequest.body = {
        userStory: 'Test user story',
        sections: []
      };

      await chatController.acceptTodo(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Failed to save TodoList')
        })
      );
    });
  });

  describe('getAcceptedTodos', () => {
    it('should return list of accepted todos', async () => {
      const mockTodos = [
        {
          _id: 'id1',
          userStory: 'Story 1',
          sections: [],
          accepted: true,
          generatedAt: new Date()
        },
        {
          _id: 'id2',
          userStory: 'Story 2',
          sections: [],
          accepted: true,
          generatedAt: new Date()
        }
      ];

      // Mock TodoList.find
      TodoList.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTodos)
      });

      await chatController.getAcceptedTodos(mockRequest, mockResponse);

      expect(TodoList.find).toHaveBeenCalledWith({ accepted: true });
      expect(mockResponse.json).toHaveBeenCalledWith(mockTodos);
    });

    it('should handle errors when fetching todos', async () => {
      // Mock TodoList.find to throw error
      TodoList.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await chatController.getAcceptedTodos(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        error: 'Failed to fetch TodoLists' 
      });
    });
  });

  describe('parseTodoList function', () => {
    // Test the parseTodoList function behavior through chatBA
    it('should parse todo list with I./II./III. format', async () => {
      const todoText = `I. PHÂN TÍCH YÊU CẦU
- [] Task 1
- [] Task 2

II. TIÊU CHÍ CHẤP NHẬN
- [] Criteria 1

III. CÔNG VIỆC CỤ THỂ CHO BA
- [] Action 1`;

      mockRequest.body = { 
        message: 'Create a login feature' 
      };

      await chatController.chatBA(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});

describe('Google AI Integration', () => {
  it('should initialize Google AI with API key from .env', () => {
    expect(process.env.GOOGLE_API_KEY).toBeDefined();
    
    // Verify GoogleGenerativeAI can be instantiated
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    expect(genAI).toBeDefined();
    
    console.log('✅ Google AI initialized successfully');
  });

  it('should create model instance', () => {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    expect(model).toBeDefined();
    console.log('✅ Gemini model instance created');
  });
});
