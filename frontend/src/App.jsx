// src/App.jsx (Final Version with UI Polish and Conversation Memory)

import React, { useState, useEffect, useRef } from 'react';
import { sendChat } from './api';
import FirstRunModal from './FirstRunModal';
import { getBackendApiKeyAsync } from './config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Chat.css';
import Settings from './Settings';
import Search from './Search';


function App( ) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I'm your AI Assistant. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef(null);
  const [showFirstRun, setShowFirstRun] = useState(false);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const k = await getBackendApiKeyAsync();
        if(mounted && !k) setShowFirstRun(true);
      }catch(e){ /* ignore */ }
    })();
    return ()=>{ mounted = false };
  },[]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const userMessage = { sender: 'user', text: inputValue };
    
    // Create the new history with the user's latest message
    const newHistory = [...messages, userMessage];
    setMessages(newHistory); // Update the UI immediately
    setIsLoading(true);
    setInputValue('');

    try {
      // Format the history for the Anthropic API
      // The API expects { role: 'user' | 'assistant', content: '...' }
      const apiFormattedHistory = newHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Send the entire formatted history to the backend
      const response = await sendChat(apiFormattedHistory);
      const aiMessage = { text: response.reply || response.output_text || JSON.stringify(response), sender: 'ai' };
      
      // Add the AI's response to the state
      setMessages(prevMessages => [...prevMessages, aiMessage]);

    } catch (error) {
      console.error("Error fetching AI reply:", error);
      const errorMessage = { text: "Sorry, an error occurred. Please check the backend console.", sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="app-container">
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <Settings />
      </div>
      <div style={{ position: 'absolute', top: 12, left: 12 }}>
        <Search />
      </div>
      <div className="message-list" ref={messageListRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.sender === 'ai' ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
            ) : (
              message.text
            )}
          </div>
        ))}
        {isLoading && <div className="message ai"><i>Typing...</i></div>}
      </div>

      <form className="input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
    <FirstRunModal visible={showFirstRun} onClose={()=>setShowFirstRun(false)} />
    </>
  );
}

export default App;
