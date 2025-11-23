// Set backend API key in localStorage for Electron app
// Run this in the app's DevTools console

localStorage.setItem('BACKEND_API_KEY', 'test-key-12345');
console.log('✅ Backend API key configured:', localStorage.getItem('BACKEND_API_KEY'));
