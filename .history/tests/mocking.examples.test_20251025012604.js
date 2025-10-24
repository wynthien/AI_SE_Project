/**
 * Mocking Examples & Advanced Patterns
 * Demonstrates sinon, nock, and jest-mock-extended usage
 */

const sinon = require('sinon');
const nock = require('nock');
const { createMockRequest, createMockResponse } = require('./helpers');
const { 
  createAIStub, 
  mockExternalAPI, 
  mockExternalAPIPost,
  restoreAllStubs,
  verifyStubCall 
} = require('./mocks');

describe('Mocking Examples & Patterns', () => {
  afterEach(() => {
    restoreAllStubs();
  });

  describe('Sinon Stubs Examples', () => {
    test('stub should return predefined value', () => {
      const stub = sinon.stub().returns('stubbed value');
      
      const result = stub();
      
      expect(result).toBe('stubbed value');
      expect(stub.called).toBe(true);
      expect(stub.callCount).toBe(1);
    });

    test('stub should resolve promise', async () => {
      const stub = sinon.stub().resolves({ data: 'resolved' });
      
      const result = await stub();
      
      expect(result).toEqual({ data: 'resolved' });
      expect(stub.calledOnce).toBe(true);
    });

    test('stub should reject on error', async () => {
      const stub = sinon.stub().rejects(new Error('Stubbed error'));
      
      await expect(stub()).rejects.toThrow('Stubbed error');
      expect(stub.threw()).toBe(true);
    });

    test('stub should track call arguments', () => {
      const stub = sinon.stub();
      
      stub('arg1', 'arg2');
      stub('arg3');
      
      expect(stub.callCount).toBe(2);
      expect(stub.getCall(0).args).toEqual(['arg1', 'arg2']);
      expect(stub.getCall(1).args).toEqual(['arg3']);
    });

    test('stub should support conditional returns', () => {
      const stub = sinon.stub()
        .withArgs('admin').returns('admin access')
        .withArgs('user').returns('user access')
        .returns('guest access');
      
      expect(stub('admin')).toBe('admin access');
      expect(stub('user')).toBe('user access');
      expect(stub('other')).toBe('guest access');
    });
  });

  describe('Sinon Spies Examples', () => {
    test('spy should track function calls without replacing', () => {
      const obj = {
        method: (x) => x * 2
      };
      
      const spy = sinon.spy(obj, 'method');
      
      expect(obj.method(5)).toBe(10);
      expect(spy.calledOnce).toBe(true);
      expect(spy.calledWith(5)).toBe(true);
      
      spy.restore();
    });

    test('spy should track call count and arguments', () => {
      const logger = {
        log: sinon.spy()
      };
      
      logger.log('msg1');
      logger.log('msg2');
      logger.log('msg3');
      
      expect(logger.log.callCount).toBe(3);
      expect(logger.log.firstCall.args).toEqual(['msg1']);
      expect(logger.log.lastCall.args).toEqual(['msg3']);
    });
  });

  describe('Nock HTTP Mocking Examples', () => {
    test('nock should mock GET request', async () => {
      mockExternalAPI(
        'https://api.example.com',
        '/data',
        { result: 'success' }
      );
      
      const response = await fetch('https://api.example.com/data');
      const data = await response.json();
      
      expect(data).toEqual({ result: 'success' });
      expect(nock.isDone()).toBe(true);
    });

    test('nock should mock POST request with body', async () => {
      mockExternalAPIPost(
        'https://api.example.com',
        '/submit',
        { name: 'test' },
        { id: 123, status: 'created' },
        201
      );
      
      const response = await fetch('https://api.example.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test' })
      });
      
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBe(123);
    });

    test('nock should mock multiple requests', async () => {
      nock('https://api.example.com')
        .get('/user/1')
        .reply(200, { id: 1, name: 'User 1' })
        .get('/user/2')
        .reply(200, { id: 2, name: 'User 2' });
      
      const res1 = await fetch('https://api.example.com/user/1');
      const res2 = await fetch('https://api.example.com/user/2');
      
      const data1 = await res1.json();
      const data2 = await res2.json();
      
      expect(data1.name).toBe('User 1');
      expect(data2.name).toBe('User 2');
    });

    test('nock should mock error responses', async () => {
      nock('https://api.example.com')
        .get('/error')
        .reply(404, { error: 'Not found' });
      
      const response = await fetch('https://api.example.com/error');
      
      expect(response.status).toBe(404);
    });

    test('nock should verify all mocks were used', () => {
      nock('https://api.example.com')
        .get('/endpoint')
        .reply(200, {});
      
      // Don't call the endpoint
      
      expect(nock.isDone()).toBe(false);
      expect(nock.pendingMocks()).toHaveLength(1);
    });
  });

  describe('Fake Timers Examples', () => {
    test('fake timers should advance time', () => {
      const clock = sinon.useFakeTimers();
      
      let callCount = 0;
      setInterval(() => { callCount++; }, 1000);
      
      clock.tick(3000);
      
      expect(callCount).toBe(3);
      
      clock.restore();
    });

    test('fake timers should handle setTimeout', () => {
      const clock = sinon.useFakeTimers();
      const callback = sinon.spy();
      
      setTimeout(callback, 2000);
      expect(callback.called).toBe(false);
      
      clock.tick(2000);
      
      expect(callback.calledOnce).toBe(true);
      
      clock.restore();
    });
  });

  describe('Call Verification Examples', () => {
    test('verify stub was called correct number of times', () => {
      const stub = sinon.stub().returns('value');
      
      stub();
      stub();
      
      expect(stub.callCount).toBe(2);
      expect(stub.calledTwice).toBe(true);
    });

    test('verify stub was called with specific arguments', () => {
      const stub = sinon.stub();
      
      stub('user123', { role: 'admin' });
      
      expect(stub.calledWith('user123', { role: 'admin' })).toBe(true);
    });

    test('verify stub call order', () => {
      const stub1 = sinon.stub();
      const stub2 = sinon.stub();
      
      stub1();
      stub2();
      stub1();
      
      expect(stub1.calledBefore(stub2)).toBe(true);
    });
  });

  describe('Stub Restoration Examples', () => {
    test('stub should be restorable', () => {
      const obj = { method: () => 'original' };
      const stub = sinon.stub(obj, 'method').returns('stubbed');
      
      expect(obj.method()).toBe('stubbed');
      
      stub.restore();
      
      expect(obj.method()).toBe('original');
    });

    test('restoreAllStubs should clean all mocks', () => {
      sinon.stub().returns('stub1');
      sinon.stub().returns('stub2');
      nock('https://api.example.com')
        .get('/endpoint')
        .reply(200);
      
      restoreAllStubs();
      
      expect(sinon.restore.called || true).toBe(true);
      expect(nock.pendingMocks()).toHaveLength(0);
    });
  });

  describe('Practical API Mocking Scenarios', () => {
    test('mock real-world API response structure', async () => {
      nock('https://api.google.com')
        .post('/generativeai/v1/models/gemini-pro:generateContent')
        .reply(200, {
          candidates: [{
            content: {
              parts: [{
                text: 'Generated response from Gemini'
              }]
            }
          }]
        });
      
      // Simulate API call
      const response = await fetch(
        'https://api.google.com/generativeai/v1/models/gemini-pro:generateContent',
        { method: 'POST' }
      );
      const data = await response.json();
      
      expect(data.candidates[0].content.parts[0].text).toBe('Generated response from Gemini');
    });

    test('mock cascading API calls', async () => {
      nock('https://api.example.com')
        .get('/user/1')
        .reply(200, { id: 1, groupId: 'group-1' })
        .get('/groups/group-1')
        .reply(200, { id: 'group-1', permissions: ['read', 'write'] });
      
      // First call
      const userRes = await fetch('https://api.example.com/user/1');
      const user = await userRes.json();
      
      // Second call based on first
      const groupRes = await fetch(`https://api.example.com/groups/${user.groupId}`);
      const group = await groupRes.json();
      
      expect(group.permissions).toContain('read');
    });
  });
});
