// ModernChat.jsx - Enhanced chat interface with file upload
import React, { useState, useEffect, useRef } from 'react';
import { getBackendApiKeyAsync } from './config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FileUpload from './components/FileUpload';
import FileChip from './components/FileChip';
import './ModernChat.css';

export default function ModernChat() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I'm your AI Assistant. How can I help you today? You can also upload files to discuss them with me." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleFilesUploaded = (files) => {
    setAttachedFiles(prev => [...prev, ...files]);
    setShowFileUpload(false);
  };

  const removeFile = (fileToRemove) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileToRemove.id));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    const text = inputValue.trim();
    if (!text && attachedFiles.length === 0) return;

    // Build message with file context
    let messageText = text;
    if (attachedFiles.length > 0) {
      const fileContext = attachedFiles.map(f => 
        `[Attached file: ${f.name} (${f.type})]\\n${f.preview || ''}`
      ).join('\\n\\n');
      
      messageText = `${text}\\n\\n${fileContext}`;
    }

    const userMessage = {
      sender: 'user',
      text: text,
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    const sentFiles = [...attachedFiles];
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const apiKey = await getBackendApiKeyAsync();
      
      // Send to AI with file context
      const response = await fetch('http://127.0.0.1:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            {
              role: 'user',
              content: messageText
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.content) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: data.content
        }]);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: '❌ Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="modern-chat-container">
      {/* Header */}
      <div className="modern-chat-header">
        <div className="modern-chat-title">💬 AI Assistant</div>
        <div className="modern-chat-actions">
          <button className="modern-icon-button" title="Settings">
            ⚙️
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="modern-messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`modern-message ${message.sender}`}>
            <div className="modern-message-avatar">
              {message.sender === 'user' ? '👤' : '🤖'}
            </div>
            <div className="modern-message-content">
              <div className="modern-message-bubble">
                {message.sender === 'ai' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </ReactMarkdown>
                ) : (
                  message.text
                )}
                {message.files && message.files.length > 0 && (
                  <div className="modern-message-files">
                    {message.files.map((file, i) => (
                      <FileChip key={i} file={file} compact />
                    ))}
                  </div>
                )}
              </div>
              <div className="modern-message-actions">
                <button
                  className="modern-message-action-btn"
                  onClick={() => copyMessage(message.text)}
                  title="Copy"
                >
                  📋 Copy
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && !isStreaming && (
          <div className="modern-message ai">
            <div className="modern-message-avatar">🤖</div>
            <div className="modern-message-content">
              <div className="modern-message-bubble">
                <div className="modern-loading">
                  <div className="modern-loading-dot"></div>
                  <div className="modern-loading-dot"></div>
                  <div className="modern-loading-dot"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="modern-input-container">
        {/* File Upload Area */}
        {showFileUpload && (
          <div style={{ marginBottom: '12px' }}>
            <FileUpload onFilesUploaded={handleFilesUploaded} />
          </div>
        )}

        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="modern-file-preview-area">
            {attachedFiles.map((file, i) => (
              <FileChip key={i} file={file} onRemove={removeFile} />
            ))}
          </div>
        )}

        {/* Input Field */}
        <form onSubmit={handleSendMessage}>
          <div className="modern-input-wrapper">
            <div className="modern-input-actions">
              <button
                type="button"
                className="modern-icon-button"
                onClick={() => setShowFileUpload(!showFileUpload)}
                title="Attach files"
              >
                📎
              </button>
            </div>
            
            <textarea
              ref={inputRef}
              className="modern-input-field"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for new line)"
              disabled={isLoading}
              rows={1}
              style={{
                height: 'auto',
                minHeight: '20px'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            
            <button
              type="submit"
              className="modern-send-button"
              disabled={isLoading || (!inputValue.trim() && attachedFiles.length === 0)}
            >
              {isLoading ? '⏳' : '📤'} Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
