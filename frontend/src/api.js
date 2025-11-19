export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function sendChat(messages, profile={}, mode='assistant'){
  const res = await fetch(`${API_URL}/api/chat`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ messages, profile, mode })
  });
  if(!res.ok) throw new Error('Network error');
  return res.json();
}
