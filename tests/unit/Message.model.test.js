/**
 * Unit tests for Message model
 */

const mongoose = require('mongoose');
const Message = require('../../models/Message');

// Mock mongoose connection to avoid real DB
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(true),
    connection: { close: jest.fn() }
  };
});

describe('Message Model', () => {
  it('should be defined', () => {
    expect(Message).toBeDefined();
    expect(Message.modelName).toBe('Message');
  });

  it('should create a valid Message document', () => {
    const msg = new Message({
      userMessage: 'Hi',
      aiReply: 'Hello'
    });

    expect(msg.userMessage).toBe('Hi');
    expect(msg.aiReply).toBe('Hello');
    expect(msg.timestamp).toBeDefined();
  });

  it('should require userMessage', () => {
    const msg = new Message({});
    const err = msg.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.userMessage).toBeDefined();
  });

  it('should default aiReply to empty string', () => {
    const msg = new Message({ userMessage: 'Hi' });
    expect(msg.aiReply).toBe('');
  });
});
