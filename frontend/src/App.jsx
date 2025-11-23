// src/App.jsx (Phase 4: Multi-Panel Workspace)

import React, { useState, useEffect, useRef } from 'react';
import { sendChat } from './api';
import FirstRunModal from './FirstRunModal';
import { getBackendApiKeyAsync } from './config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Chat.css';
import Settings from './Settings';
import Search from './Search';
import CredentialManager from './CredentialManager';
import ProviderSelector from './components/ProviderSelector';
import Workspace from './Workspace';
import UpdateNotification from './UpdateNotification';
import PluginManager from './PluginManager';
import ModernChat from './ModernChat';
import FuturisticUI from './FuturisticUI';


function App( ) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I'm your AI Assistant. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messageListRef = useRef(null);
  const [showFirstRun, setShowFirstRun] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showPlugins, setShowPlugins] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('anthropic');
  const [selectedModel, setSelectedModel] = useState('');
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [workspaceMode, setWorkspaceMode] = useState(false); // Toggle between classic and workspace
  const [modernMode, setModernMode] = useState(false); // Toggle modern UI
  const [futuristicMode, setFuturisticMode] = useState(true); // Toggle futuristic UI
  const eventSourceRef = useRef(null);

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
    
    // Check if this is a command (starts with /)
    const isCommand = inputValue.trim().startsWith('/');
    
    // Create the new history with the user's latest message
    const newHistory = [...messages, userMessage];
    setMessages(newHistory); // Update the UI immediately
    
    const commandText = inputValue.trim();
    setInputValue('');

    try {
      // Handle commands
      if (isCommand) {
        setIsLoading(true);
        const command = commandText.substring(1); // Remove the leading /
        
        // Execute command via API
        const apiKey = await getBackendApiKeyAsync();
        const response = await fetch('http://127.0.0.1:3001/api/command', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey || ''
          },
          body: JSON.stringify({ command })
        });
        
        const data = await response.json();
        const output = data.success 
          ? `✅ **Command executed:**\n\`\`\`\n${data.output}\n\`\`\``
          : `❌ **Command failed:**\n\`\`\`\n${data.output || data.error}\n\`\`\``;
        
        const commandResult = { text: output, sender: 'ai' };
        setMessages(prevMessages => [...prevMessages, commandResult]);
        setIsLoading(false);
        return;
      }
      
      // Regular chat message - use streaming if enabled
      if (streamingEnabled) {
        handleStreamingChat(newHistory);
      } else {
        handleRegularChat(newHistory);
      }

    } catch (error) {
      console.error("Error fetching AI reply:", error);
      const errorMessage = { text: "Sorry, an error occurred. Please check the backend console.", sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleStreamingChat = async (conversationHistory) => {
    setIsStreaming(true);
    
    // Add placeholder message for streaming
    const placeholderIndex = messages.length;
    setMessages(prev => [...prev, { sender: 'ai', text: '', streaming: true }]);

    try {
      const apiKey = await getBackendApiKeyAsync();
      
      // Format messages for API
      const apiFormattedHistory = conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Create streaming request
      const response = await fetch(`http://127.0.0.1:3001/api/stream/${selectedProvider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({
          messages: apiFormattedHistory,
          options: selectedModel ? { model: selectedModel } : {}
        })
      });

      if (!response.ok) {
        throw new Error(`Streaming failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'token') {
              fullResponse += data.content;
              // Update the streaming message
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[placeholderIndex + 1] = {
                  sender: 'ai',
                  text: fullResponse,
                  streaming: true
                };
                return newMessages;
              });
            } else if (data.type === 'done') {
              // Mark as complete
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[placeholderIndex + 1] = {
                  sender: 'ai',
                  text: data.fullResponse || fullResponse,
                  streaming: false
                };
                return newMessages;
              });
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[placeholderIndex + 1] = {
          sender: 'ai',
          text: `Error: ${error.message}. Falling back to regular mode.`,
          streaming: false
        };
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleRegularChat = async (conversationHistory) => {
    setIsLoading(true);
    
    try {
      // Format the history for the Anthropic API
      const apiFormattedHistory = conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Send the entire formatted history to the backend
      const response = await sendChat(apiFormattedHistory);
      const aiMessage = { text: response.reply || response.output_text || JSON.stringify(response), sender: 'ai' };
      
      // Add the AI's response to the state
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    {futuristicMode ? (
      // Futuristic UI with draggable windows
      <>
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10000, display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { setFuturisticMode(false); setModernMode(true); }}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#00f0ff',
              border: '1px solid #00f0ff',
              borderRadius: '4px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            💬 Modern
          </button>
          <button
            onClick={() => { setFuturisticMode(false); setModernMode(false); }}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#00f0ff',
              border: '1px solid #00f0ff',
              borderRadius: '4px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            ← Classic
          </button>
        </div>
        <FuturisticUI />
      </>
    ) : modernMode ? (
      // Modern UI with file upload capabilities
      <>
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { setFuturisticMode(true); setModernMode(false); }}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              backgroundColor: '#b400ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ✨ Futuristic
          </button>
          <button
            onClick={() => setModernMode(false)}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Classic UI
          </button>
        </div>
        <ModernChat />
      </>
    ) : workspaceMode ? (
      <Workspace 
        onShowCredentials={() => setShowCredentials(true)} 
        onBackToClassic={() => setWorkspaceMode(false)}
      />
    ) : (
    <div className="app-container">
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: '8px' }}>
        <button
          onClick={() => { setFuturisticMode(true); setModernMode(false); }}
          style={{
            padding: '8px 12px',
            fontSize: '13px',
            backgroundColor: '#b400ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ✨ Futuristic
        </button>
        <button
          onClick={() => { setModernMode(true); setFuturisticMode(false); }}
          style={{
            padding: '8px 12px',
            fontSize: '13px',
            backgroundColor: '#FF6B6B',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          💬 Modern
        </button>
        <button
          onClick={() => setWorkspaceMode(true)}
          style={{
            padding: '8px 12px',
            fontSize: '13px',
            backgroundColor: '#0078d4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔲 Workspace
        </button>
        <button
          onClick={() => setShowPlugins(true)}
          style={{
            padding: '8px 12px',
            fontSize: '13px',
            backgroundColor: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔌 Plugins
        </button>
        <button
          onClick={() => setShowCredentials(true)}
          style={{
            padding: '8px 12px',
            fontSize: '13px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔑 Credentials
        </button>
        <Settings />
      </div>
      <div style={{ position: 'absolute', top: 12, left: 12 }}>
        <Search />
      </div>
      
      <div style={{ 
        padding: '12px 24px', 
        borderBottom: '1px solid #ddd',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <ProviderSelector
          selectedProvider={selectedProvider}
          onProviderChange={setSelectedProvider}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <input
            type="checkbox"
            checked={streamingEnabled}
            onChange={(e) => setStreamingEnabled(e.target.checked)}
          />
          Streaming
        </label>
      </div>
      
      <div className="message-list" ref={messageListRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.sender === 'ai' ? (
              <div>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                {message.streaming && (
                  <span style={{ 
                    display: 'inline-block', 
                    width: '8px', 
                    height: '14px', 
                    backgroundColor: '#4CAF50',
                    marginLeft: '2px',
                    animation: 'blink 1s infinite'
                  }}>|</span>
                )}
              </div>
            ) : (
              message.text
            )}
          </div>
        ))}
        {isLoading && !isStreaming && <div className="message ai"><i>Typing...</i></div>}
      </div>

      <form className="input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message or /command..."
          disabled={isLoading || isStreaming}
        />
        <button type="submit" disabled={isLoading || isStreaming}>
          {isStreaming ? 'Streaming...' : 'Send'}
        </button>
      </form>
    </div>
    )}
    <FirstRunModal visible={showFirstRun} onClose={()=>setShowFirstRun(false)} />
    <CredentialManager visible={showCredentials} onClose={() => setShowCredentials(false)} />
    {showPlugins && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '1400px',
          maxHeight: '90vh',
          width: '95%',
          overflow: 'auto',
          position: 'relative'
        }}>
          <button
            onClick={() => setShowPlugins(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              zIndex: 1001
            }}
          >
            ✕ Close
          </button>
          <PluginManager />
        </div>
      </div>
    )}
    <UpdateNotification />
    </>
  );
}

export default App;
