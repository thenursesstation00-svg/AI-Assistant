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

export async function uploadFiles(files) {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const key = await getBackendApiKeyAsync();
  const headers = {};
  if (key) headers['x-api-key'] = key;

  const res = await fetch(`${API_URL}/api/chat/upload`, {
    method: 'POST',
    headers,
    body: formData
  });
  
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function deleteFile(fileId) {
  const key = await getBackendApiKeyAsync();
  const headers = {};
  if (key) headers['x-api-key'] = key;

  const res = await fetch(`${API_URL}/api/chat/files/${fileId}`, {
    method: 'DELETE',
    headers
  });
  
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

export async function listChatFiles() {
  const key = await getBackendApiKeyAsync();
  const headers = {};
  if (key) headers['x-api-key'] = key;

  const res = await fetch(`${API_URL}/api/chat/files`, {
    method: 'GET',
    headers
  });
  
  if (!res.ok) throw new Error('Failed to list files');
  return res.json();
}

// Alias for compatibility with ChatWindow.jsx
export const sendMessage = sendChat;
