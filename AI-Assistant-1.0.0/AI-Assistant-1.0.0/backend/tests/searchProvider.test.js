const axios = require('axios');
const { searchNormalized } = require('../src/services/searchProvider');

jest.mock('axios');

describe('searchProvider normalization', () => {
  it('normalizes serpapi results', async () => {
    process.env.SERPAPI_KEY = 'testkey';
    const fake = { organic_results: [ { title: 'T1', snippet: 'S1', link: 'https://a' } ] };
    axios.get.mockResolvedValueOnce({ data: fake });
    const res = await searchNormalized('test');
    expect(res.provider).toBe('serpapi');
    expect(res.results[0].title).toBe('T1');
    expect(res.results[0].link).toBe('https://a');
    delete process.env.SERPAPI_KEY;
  });

  it('normalizes google cse results', async () => {
    process.env.SEARCH_PROVIDER = 'google';
    process.env.GOOGLE_CSE_KEY = 'gkey';
    process.env.GOOGLE_CSE_CX = 'gcx';
    const fake = { items: [ { title: 'G1', snippet: 'GS1', link: 'https://g' } ] };
    axios.get.mockResolvedValueOnce({ data: fake });
    const res = await searchNormalized('foo');
    expect(res.provider).toBe('google');
    expect(res.results[0].title).toBe('G1');
    expect(res.results[0].link).toBe('https://g');
    delete process.env.SEARCH_PROVIDER;
    delete process.env.GOOGLE_CSE_KEY;
    delete process.env.GOOGLE_CSE_CX;
  });
});
