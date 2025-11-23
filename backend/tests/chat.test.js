const request = require('supertest');
const express = require('express');
jest.mock('../src/services/anthropic');
const { sendToAnthropic } = require('../src/services/anthropic');

// Mock the provider registry
const mockProvider = {
  sendMessage: jest.fn()
};

jest.mock('../src/services/providers/registry', () => {
  return {
    getDefaultProvider: jest.fn().mockResolvedValue({
      name: 'anthropic',
      provider: mockProvider
    }),
    getProvider: jest.fn(),
    getActiveProviders: jest.fn().mockResolvedValue([])
  };
});

const chatRoutes = require('../src/routes/chat');

describe('POST /api/chat', () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/chat', chatRoutes);
    jest.clearAllMocks();
  });

  it('returns 200 when provider returns value', async () => {
    mockProvider.sendMessage.mockResolvedValue({ 
      content: 'Hello!',
      model: 'claude-3-sonnet',
      usage: { prompt_tokens: 10, completion_tokens: 5 },
      cost: 0.001
    });
    const res = await request(app).post('/api/chat').send({ messages: [{ role: 'user', content: 'hi' }] });
    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBeDefined();
    expect(res.body.provider).toBe('anthropic');
  });
});
