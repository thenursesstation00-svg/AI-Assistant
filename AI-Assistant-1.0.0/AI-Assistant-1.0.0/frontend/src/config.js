export function getBackendApiKey(){
  try{
    if(typeof window !== 'undefined' && window.__APP_CONFIG__ && window.__APP_CONFIG__.BACKEND_API_KEY){
      return window.__APP_CONFIG__.BACKEND_API_KEY;
    }
  }catch(e){}
  try{ return localStorage.getItem('BACKEND_API_KEY'); }catch(e){ return null; }
}

export function setBackendApiKey(key){
  try{ localStorage.setItem('BACKEND_API_KEY', key); }catch(e){}
}

export async function getBackendApiKeyAsync(){
  try{
    if(typeof window !== 'undefined' && window.backendKeyStore && window.backendKeyStore.getKey){
      const k = await window.backendKeyStore.getKey();
      if(k) return k;
    }
  }catch(e){}
  // fall back to env and localStorage
  try{
    if(typeof window !== 'undefined' && window.__APP_CONFIG__ && window.__APP_CONFIG__.BACKEND_API_KEY) return window.__APP_CONFIG__.BACKEND_API_KEY;
  }catch(e){}
  try{ return localStorage.getItem('BACKEND_API_KEY'); }catch(e){ return null; }
}

export async function setBackendApiKeyAsync(key){
  try{
    if(typeof window !== 'undefined' && window.backendKeyStore && window.backendKeyStore.setKey){
      const ok = await window.backendKeyStore.setKey(key);
      if(ok) return true;
    }
  }catch(e){}
  try{ localStorage.setItem('BACKEND_API_KEY', key); return true; }catch(e){ return false; }
}

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
