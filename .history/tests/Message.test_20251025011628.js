/**
 * Message Model Tests
 * Schema validation and model behavior tests
 */

const Message = require('../models/Message');

describe('Message Model', () => {
  describe('Schema Definition', () => {
    test('should have correct model name', () => {
      expect(Message.modelName).toBe('Message');
    });

    test('should have userMessage field as required', () => {
      const userMessagePath = Message.schema.path('userMessage');
      expect(userMessagePath.isRequired).toBe(true);
    });

    test('should have aiReply field with default empty string', () => {
      const aiReplyPath = Message.schema.path('aiReply');
      expect(aiReplyPath.defaultValue).toBe('');
    });

    test('should have timestamp field with default Date.now', () => {
      const timestampPath = Message.schema.path('timestamp');
      expect(timestampPath.defaultValue).toBeDefined();
    });
  });

  describe('Field Types', () => {
    test('userMessage should be of type String', () => {
      const userMessagePath = Message.schema.path('userMessage');
      expect(userMessagePath.instance).toBe('String');
    });

    test('aiReply should be of type String', () => {
      const aiReplyPath = Message.schema.path('aiReply');
      expect(aiReplyPath.instance).toBe('String');
    });

    test('timestamp should be of type Date', () => {
      const timestampPath = Message.schema.path('timestamp');
      expect(timestampPath.instance).toBe('Date');
    });
  });
});
