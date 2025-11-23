// frontend/src/panels/ChatPanel.jsx
// Chat panel for workspace - integrates existing chat functionality

import React, { useState, useEffect, useRef } from 'react';
import { sendChat } from '../api';
import { getBackendApiKeyAsync } from '../config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProviderSelector from '../components/ProviderSelector';

export default function ChatPanel() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I'm your AI Assistant. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messageListRef = useRef(null);
  const [selectedProvider, setSelectedProvider] = useState('anthropic');
  const [selectedModel, setSelectedModel] = useState('');
  const [streamingEnabled, setStreamingEnabled] = useState(true);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const userMessage = { sender: 'user', text: inputValue };
    const isCommand = inputValue.trim().startsWith('/');
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    
    const commandText = inputValue.trim();
    setInputValue('');

    try {
      if (isCommand) {
        setIsLoading(true);
        const command = commandText.substring(1);
        
        try {
          const apiKey = await getBackendApiKeyAsync();
          
          if (!apiKey) {
            setMessages(prev => [...prev, { 
              text: '❌ **No API key configured.** Please click the 🔑 Credentials button to set up your API key.', 
              sender: 'ai' 
            }]);
            setIsLoading(false);
            return;
          }
          
          const response = await fetch('http://127.0.0.1:3001/api/command', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey
            },
            body: JSON.stringify({ command })
          });
          
          const data = await response.json();
          const output = data.success 
            ? `✅ **Command executed:**\n\`\`\`\n${data.output}\n\`\`\``
            : `❌ **Command failed:**\n\`\`\`\n${data.output || data.error}\n\`\`\``;
          
          setMessages(prev => [...prev, { text: output, sender: 'ai' }]);
        } catch (cmdError) {
          setMessages(prev => [...prev, { 
            text: `❌ **Command error:** ${cmdError.message}`, 
            sender: 'ai' 
          }]);
        }
        setIsLoading(false);
        return;
      }
      
      if (streamingEnabled) {
        handleStreamingChat(newHistory);
      } else {
        handleRegularChat(newHistory);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { text: `Error: ${error.message}`, sender: 'ai' }]);
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleStreamingChat = async (conversationHistory) => {
    setIsStreaming(true);
    const placeholderIndex = messages.length;
    setMessages(prev => [...prev, { sender: 'ai', text: '', streaming: true }]);

    try {
      const apiKey = await getBackendApiKeyAsync();
      
      if (!apiKey) {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[placeholderIndex + 1] = {
            sender: 'ai',
            text: '❌ **No API key configured.** Please click the 🔑 Credentials button to set up your backend API key and AI provider credentials.',
            streaming: false
          };
          return newMessages;
        });
        setIsStreaming(false);
        return;
      }
      
      const apiFormattedHistory = conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await fetch(`http://127.0.0.1:3001/api/stream/${selectedProvider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          messages: apiFormattedHistory,
          options: selectedModel ? { model: selectedModel } : {}
        })
      });

      if (!response.ok) throw new Error(`Streaming failed: ${response.statusText}`);

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
          text: `Error: ${error.message}`,
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
      const apiFormattedHistory = conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await sendChat(apiFormattedHistory);
      setMessages(prev => [...prev, { 
        text: response.reply || response.output_text || JSON.stringify(response), 
        sender: 'ai' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-header" style={{
        padding: '8px 12px',
        backgroundColor: '#2d2d30',
        borderBottom: '1px solid #3e3e42',
        cursor: 'move',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#cccccc' }}>💬 Chat</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#cccccc' }}>
          <input
            type="checkbox"
            checked={streamingEnabled}
            onChange={(e) => setStreamingEnabled(e.target.checked)}
          />
          Stream
        </label>
      </div>

      <div style={{ padding: '8px 12px', backgroundColor: '#1e1e1e', borderBottom: '1px solid #3e3e42' }}>
        <ProviderSelector
          selectedProvider={selectedProvider}
          onProviderChange={setSelectedProvider}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>

      <div ref={messageListRef} style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((message, index) => (
          <div key={index} style={{
            padding: '10px 12px',
            borderRadius: '6px',
            maxWidth: '85%',
            alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: message.sender === 'user' ? '#0e639c' : '#2d2d30',
            color: '#cccccc',
            fontSize: '13px',
            lineHeight: '1.5'
          }}>
            {message.sender === 'ai' ? (
              <div>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                {message.streaming && (
                  <span style={{ 
                    display: 'inline-block', 
                    width: '6px', 
                    height: '12px', 
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
        {isLoading && !isStreaming && (
          <div style={{ 
            padding: '10px 12px', 
            color: '#888', 
            fontStyle: 'italic',
            fontSize: '13px'
          }}>
            Typing...
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} style={{
        padding: '12px',
        borderTop: '1px solid #3e3e42',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message or /command..."
          disabled={isLoading || isStreaming}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#3c3c3c',
            border: '1px solid #3e3e42',
            borderRadius: '3px',
            color: '#cccccc',
            fontSize: '13px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={isLoading || isStreaming}
          style={{
            padding: '8px 16px',
            backgroundColor: isLoading || isStreaming ? '#3e3e42' : '#0e639c',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: isLoading || isStreaming ? 'not-allowed' : 'pointer',
            fontSize: '13px'
          }}
        >
          {isStreaming ? 'Streaming...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
