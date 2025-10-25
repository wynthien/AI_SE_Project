/**
 * Unit Tests for TodoList Model
 */

const mongoose = require('mongoose');
const TodoList = require('../../models/TodoList');

// Mock mongoose connection
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

describe('TodoList Model', () => {
  describe('Schema Validation', () => {
    it('should be defined', () => {
      expect(TodoList).toBeDefined();
    });

    it('should have correct model name', () => {
      expect(TodoList.modelName).toBe('TodoList');
    });

    it('should create a valid TodoList document', () => {
      const validTodo = new TodoList({
        userStory: 'As a user, I want to login',
        sections: [
          {
            title: 'PHÂN TÍCH YÊU CẦU',
            tasks: ['Task 1', 'Task 2']
          }
        ],
        accepted: true
      });

      expect(validTodo.userStory).toBe('As a user, I want to login');
      expect(validTodo.sections).toHaveLength(1);
      expect(validTodo.sections[0].title).toBe('PHÂN TÍCH YÊU CẦU');
      expect(validTodo.sections[0].tasks).toHaveLength(2);
      expect(validTodo.accepted).toBe(true);
    });

    it('should set default values correctly', () => {
      const todo = new TodoList({
        userStory: 'Test story',
        sections: []
      });

      expect(todo.accepted).toBe(false);
      expect(todo.sessionId).toBe('');
      expect(todo.generatedAt).toBeDefined();
    });

    it('should validate required fields', () => {
      const todo = new TodoList({});
      
      const validationError = todo.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError.errors.userStory).toBeDefined();
    });

    it('should accept multiple sections', () => {
      const todo = new TodoList({
        userStory: 'Test story',
        sections: [
          {
            title: 'PHÂN TÍCH YÊU CẦU',
            tasks: ['Task 1']
          },
          {
            title: 'TIÊU CHÍ CHẤP NHẬN',
            tasks: ['Task 2', 'Task 3']
          },
          {
            title: 'CÔNG VIỆC CỤ THỂ CHO BA',
            tasks: ['Task 4']
          }
        ]
      });

      expect(todo.sections).toHaveLength(3);
      expect(todo.sections[1].tasks).toHaveLength(2);
    });

    it('should validate section structure', () => {
      const todo = new TodoList({
        userStory: 'Test story',
        sections: [
          {
            // missing both title and tasks
          }
        ]
      });

      const validationError = todo.validateSync();
      // Section without required fields should trigger validation error
      expect(validationError).toBeDefined();
      expect(validationError.errors).toBeDefined();
    });
  });
});
