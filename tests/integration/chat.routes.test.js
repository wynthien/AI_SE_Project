/**
 * Integration Tests for Chat Controller
 */

const request = require('supertest');
const express = require('express');
const chatRoutes = require('../../routes/chat');

// Create a test Express app
const app = express();
app.use(express.json());
app.use('/api', chatRoutes);

// Mock the controller functions
jest.mock('../../controllers/chatController', () => ({
  handleChat: jest.fn((req, res) => {
    res.json({ reply: 'Mocked response' });
  }),
  chatBA: jest.fn((req, res) => {
    const mockTodoList = `I. PHÂN TÍCH YÊU CẦU
- [] Task 1

II. TIÊU CHÍ CHẤP NHẬN
- [] Task 2

III. CÔNG VIỆC CỤ THỂ CHO BA
- [] Task 3`;
    
    res.json({
      reply: mockTodoList,
      parsed: [
        { title: 'PHÂN TÍCH YÊU CẦU', tasks: ['Task 1'] },
        { title: 'TIÊU CHÍ CHẤP NHẬN', tasks: ['Task 2'] },
        { title: 'CÔNG VIỆC CỤ THỂ CHO BA', tasks: ['Task 3'] }
      ]
    });
  }),
  acceptTodo: jest.fn((req, res) => {
    res.json({ message: 'TodoList saved successfully', id: 'test-id-123' });
  }),
  getAcceptedTodos: jest.fn((req, res) => {
    res.json([
      {
        _id: 'test-id-123',
        userStory: 'Test user story',
        sections: [],
        accepted: true,
        generatedAt: new Date()
      }
    ]);
  })
}));

describe('Chat Routes Integration Tests', () => {
  describe('POST /api/chat', () => {
    it('should return todo list response', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Test user story' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('reply');
      expect(response.body).toHaveProperty('parsed');
      expect(response.body.parsed).toHaveLength(3);
    });

    it('should handle missing message', async () => {
      const chatController = require('../../controllers/chatController');
      chatController.chatBA.mockImplementationOnce((req, res) => {
        res.status(400).json({ error: 'Message is required' });
      });

      const response = await request(app)
        .post('/api/chat')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/accept', () => {
    it('should accept and save todo list', async () => {
      const todoData = {
        userStory: 'Test user story',
        sections: [
          { title: 'PHÂN TÍCH YÊU CẦU', tasks: ['Task 1'] }
        ]
      };

      const response = await request(app)
        .post('/api/accept')
        .send(todoData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /api/todos', () => {
    it('should retrieve accepted todos', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('_id');
        expect(response.body[0]).toHaveProperty('userStory');
        expect(response.body[0]).toHaveProperty('accepted');
      }
    });
  });
});
