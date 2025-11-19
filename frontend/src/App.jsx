import React, { useState } from 'react';
import { sendChat } from './api';
import Admin from './Admin';

export default function App(){
  const [messages, setMessages] = useState([{role:'assistant', content: 'Hello!'}]);
  const [input, setInput] = useState('');

  const send = async () => {
    if(!input.trim()) return;
    const userMsg = {role:'user', content: input};
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    try{
      const resp = await sendChat(newMsgs, {});
      const text = resp && resp.output_text ? resp.output_text : JSON.stringify(resp).slice(0,400);
      setMessages(prev => [...prev, {role:'assistant', content: text}]);
    }catch(e){
      setMessages(prev => [...prev, {role:'assistant', content: 'Error: '+e.message}]);
    }
  };

  return (
    <div style={{maxWidth:800, margin:'40px auto', fontFamily:'sans-serif'}}>
      <h1>AI Assistant</h1>
      <Admin />
      <div style={{minHeight:300, border:'1px solid #ddd', padding:12}}>
        {messages.map((m,i)=> <div key={i} style={{textAlign: m.role==='user'?'right':'left', margin:6}}>
          <div style={{display:'inline-block',padding:8, borderRadius:8, background: m.role==='user'?'#3b82f6':'#111827', color:'#fff'}}>
            {m.content}
          </div>
        </div>)}
      </div>
      <div style={{display:'flex', marginTop:12}} >
        <input value={input} onChange={e=>setInput(e.target.value)} style={{flex:1, padding:8}} />
        <button onClick={send} style={{marginLeft:8, padding:'8px 12px'}}>Send</button>
      </div>
    </div>
  );
}
