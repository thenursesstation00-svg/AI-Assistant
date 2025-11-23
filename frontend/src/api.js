import { getBackendApiKeyAsync, API_URL } from './config';

export async function sendChat(messages, profile = {}, mode = 'assistant') {
  const headers = { 'Content-Type': 'application/json' };
  const key = await getBackendApiKeyAsync();
  if (key) headers['x-api-key'] = key;

  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages, profile, mode })
  });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}
