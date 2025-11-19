const request = require('supertest');
const express = require('express');
jest.mock('../src/services/anthropic');
const { sendToAnthropic } = require('../src/services/anthropic');

const chatRoutes = require('../src/routes/chat');

describe('POST /api/chat', () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/chat', chatRoutes);
  });

  it('returns 200 when provider returns value', async () => {
    sendToAnthropic.mockResolvedValue({ output_text: 'ok' });
    const res = await request(app).post('/api/chat').send({ messages: [{ role: 'user', content: 'hi' }] });
    expect(res.statusCode).toBe(200);
    expect(res.body.output_text).toBeDefined();
  });
});
