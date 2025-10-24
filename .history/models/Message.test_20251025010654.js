const Message = require('./Message');

describe('Message model', () => {
  test('has correct model name', () => {
    expect(Message.modelName).toBe('Message');
  });
});
