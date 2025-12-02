const DEFAULT_REDIRECT_URI = 'https://vscode.dev/redirect';

function getAuthorizeUrl({ state = '', code_challenge = '', redirect_uri = DEFAULT_REDIRECT_URI } = {}) {
  const clientId =
    process.env.GITHUB_COPILOT_CLIENT_ID ||
    process.env.GITHUB_CLIENT_ID ||
    process.env.COPILOT_CLIENT_ID;

  if (!clientId) {
    throw new Error(
      'Missing environment variable GITHUB_COPILOT_CLIENT_ID (or GITHUB_CLIENT_ID / COPILOT_CLIENT_ID). Set it in Codespaces secrets or .devcontainer configuration.'
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    state,
    code_challenge,
    code_challenge_method: 'S256',
    redirect_uri
  });

  return `https://api.githubcopilot.com/authorize?${params.toString()}`;
}

module.exports = { getAuthorizeUrl };
