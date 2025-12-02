describe('getCopilotAuthorizeUrl helper', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('builds authorize URL with provided parameters', () => {
    process.env.GITHUB_COPILOT_CLIENT_ID = 'client-123';
    const { getAuthorizeUrl } = require('../src/utils/getCopilotAuthorizeUrl');

    const url = getAuthorizeUrl({
      state: 'state-value',
      code_challenge: 'challenge-value',
      redirect_uri: 'https://example.com/callback'
    });

    const [base, query] = url.split('?');
    expect(base).toBe('https://api.githubcopilot.com/authorize');
    const params = new URLSearchParams(query);
    expect(params.get('client_id')).toBe('client-123');
    expect(params.get('state')).toBe('state-value');
    expect(params.get('code_challenge')).toBe('challenge-value');
    expect(params.get('code_challenge_method')).toBe('S256');
    expect(params.get('redirect_uri')).toBe('https://example.com/callback');
  });

  test('falls back to other env vars when GITHUB_COPILOT_CLIENT_ID is missing', () => {
    delete process.env.GITHUB_COPILOT_CLIENT_ID;
    process.env.GITHUB_CLIENT_ID = 'fallback-client';

    const { getAuthorizeUrl } = require('../src/utils/getCopilotAuthorizeUrl');
    const url = getAuthorizeUrl();

    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('client_id')).toBe('fallback-client');
  });

  test('throws when no client id env vars are set', () => {
    delete process.env.GITHUB_COPILOT_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.COPILOT_CLIENT_ID;

    const { getAuthorizeUrl } = require('../src/utils/getCopilotAuthorizeUrl');

    expect(() => getAuthorizeUrl()).toThrow('Missing environment variable GITHUB_COPILOT_CLIENT_ID');
  });
});
