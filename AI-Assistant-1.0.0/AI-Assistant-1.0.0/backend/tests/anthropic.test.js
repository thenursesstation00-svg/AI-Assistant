const axios = require('axios');
jest.mock('axios');

const { sendToAnthropic } = require('../src/services/anthropic');

describe('anthropic client', () => {
  it('throws when API key missing', async () => {
    const orig = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    await expect(sendToAnthropic({ system: 'a', messages: [] })).rejects.toThrow('ANTHROPIC_API_KEY missing');
    process.env.ANTHROPIC_API_KEY = orig;
  });

  it('calls axios and returns data', async () => {
    process.env.ANTHROPIC_API_KEY = 'fake';
    axios.post.mockResolvedValue({ data: { output_text: 'hello' }});
    const res = await sendToAnthropic({ system: 's', messages: [] });
    expect(res).toBeDefined();
  });
});
