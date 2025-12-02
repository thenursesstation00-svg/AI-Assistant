// ChatWindow.jsx - AI chat with file upload support
import React, { useState, useRef, useEffect } from 'react';
import { buildCfeSnapshotFromWindowManager } from '../utils/cfe';
import { requestSystemPrompt } from '../api/personality';
import ReactMarkdown from 'react-markdown';
import FileUpload from '../components/FileUpload';
import FileChip from '../components/FileChip';
import { uploadFiles, deleteFile, sendMessage } from '../api';

// Accept uiState and callLLM as props for CFE/context-aware prompt
export default function ChatWindow({ uiState, callLLM }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20240620');
  const messagesEndRef = useRef(null);

  const availableModels = [
    { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFilesUploaded = (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = async (fileId) => {
    try {
      await deleteFile(fileId);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Failed to remove file:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && uploadedFiles.length === 0) return;

    const userMessage = {
      role: 'user',
      content: inputText,
      files: uploadedFiles,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    const currentFiles = uploadedFiles;
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      // Build CFE snapshot from uiState
      const cfe = buildCfeSnapshotFromWindowManager(uiState || {});
      // Get system prompt from backend
      const systemPrompt = (await requestSystemPrompt(cfe))
        || 'You are a helpful AI assistant integrated into a multi-window developer OS.';

      // Compose LLM messages
      const llmMessages = [
        { role: 'system', content: systemPrompt },
        ...messages,
        userMessage,
      ];

      // Use callLLM if provided, else fallback to sendMessage
      let replyContent = null;
      if (callLLM) {
        replyContent = await callLLM(llmMessages, selectedModel);
      } else {
        // Fallback: use sendMessage API (legacy)
        const response = await sendMessage({
          messages: llmMessages.map(m => ({ role: m.role, content: m.content })),
          fileIds: currentFiles.map(f => f.id),
          model: selectedModel,
          provider: selectedModel.startsWith('gpt') ? 'openai' : 'anthropic'
        });
        replyContent = response.content;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header" style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: '#aaa' }}>Model:</span>
        <select 
          value={selectedModel} 
          onChange={(e) => setSelectedModel(e.target.value)}
          style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid #444', borderRadius: '4px', padding: '4px 8px' }}
        >
          {availableModels.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              {msg.files && msg.files.length > 0 && (
                <div className="message-files">
                  {msg.files.map(file => (
                    <FileChip key={file.id} file={file} compact />
                  ))}
                </div>
              )}
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        {uploadedFiles.length > 0 && (
          <div className="chat-files-preview">
            {uploadedFiles.map(file => (
              <FileChip
                key={file.id}
                file={file}
                onRemove={() => handleRemoveFile(file.id)}
              />
            ))}
          </div>
        )}
        <div className="chat-input-row">
          <FileUpload onFilesUploaded={handleFilesUploaded} maxFiles={5} />
          <input
            type="text"
            className="chat-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask your AI assistant..."
          />
          <button className="chat-send-btn" onClick={handleSend} disabled={isLoading}>
            {isLoading ? '⏳' : '🚀'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .chat-window {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: rgba(10, 10, 30, 0.4);
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .chat-message {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .message-avatar {
          font-size: 32px;
          flex-shrink: 0;
        }
        .message-content {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 12px;
          padding: 12px 16px;
          color: #e0e0f0;
        }
        .message-files {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 0;
        }
        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #00f0ff;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-10px); opacity: 1; }
        }
        .chat-input-area {
          border-top: 1px solid rgba(0, 240, 255, 0.2);
          padding: 16px;
        }
        .chat-files-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }
        .chat-input-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .chat-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 240, 255, 0.3);
          border-radius: 24px;
          padding: 12px 20px;
          color: #e0e0f0;
          font-size: 14px;
          outline: none;
          transition: all 0.3s;
        }
        .chat-input:focus {
          border-color: #00f0ff;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
        }
        .chat-send-btn {
          background: linear-gradient(135deg, #00f0ff, #b400ff);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .chat-send-btn:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(0, 240, 255, 0.6);
        }
        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
