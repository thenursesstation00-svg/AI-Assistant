// FileExplorerWindow.jsx - System file browser
import React, { useState, useEffect } from 'react';

export default function FileExplorerWindow() {
  const [currentPath, setCurrentPath] = useState('/home');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Mock file system data
  useEffect(() => {
    const mockFiles = [
      { name: 'Documents', type: 'folder', size: '-', modified: '2025-01-15', icon: '📁' },
      { name: 'Downloads', type: 'folder', size: '-', modified: '2025-01-18', icon: '📁' },
      { name: 'Projects', type: 'folder', size: '-', modified: '2025-01-20', icon: '📁' },
      { name: 'AI-Assistant', type: 'folder', size: '-', modified: '2025-01-21', icon: '📁' },
      { name: 'notes.txt', type: 'file', size: '4.2 KB', modified: '2025-01-19', icon: '📄' },
      { name: 'config.json', type: 'file', size: '1.8 KB', modified: '2025-01-20', icon: '⚙️' },
      { name: 'screenshot.png', type: 'file', size: '256 KB', modified: '2025-01-18', icon: '🖼️' },
      { name: 'backup.zip', type: 'file', size: '12.4 MB', modified: '2025-01-17', icon: '📦' }
    ];
    setFiles(mockFiles);
  }, [currentPath]);

  const handleFileClick = (file) => {
    if (file.type === 'folder') {
      setCurrentPath(`${currentPath}/${file.name}`);
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
    }
  };

  const handleBack = () => {
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/') || '/');
  };

  return (
    <div className="file-explorer">
      <div className="explorer-toolbar">
        <button className="nav-btn" onClick={handleBack} disabled={currentPath === '/'}>
          ⬅️ Back
        </button>
        <div className="path-bar">
          <span className="path-icon">📍</span>
          <span className="path-text">{currentPath}</span>
        </div>
        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List
          </button>
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            🔲 Grid
          </button>
        </div>
      </div>

      <div className={`explorer-content ${viewMode}`}>
        <div className="file-list">
          {files.map((file, idx) => (
            <div
              key={idx}
              className={`file-item ${selectedFile?.name === file.name ? 'selected' : ''}`}
              onClick={() => handleFileClick(file)}
              onDoubleClick={() => file.type === 'folder' && handleFileClick(file)}
            >
              <div className="file-icon">{file.icon}</div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                {viewMode === 'list' && (
                  <div className="file-meta">
                    <span className="file-size">{file.size}</span>
                    <span className="file-modified">{file.modified}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedFile && (
          <div className="file-details">
            <h3>📄 File Details</h3>
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{selectedFile.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Size:</span>
              <span className="detail-value">{selectedFile.size}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Modified:</span>
              <span className="detail-value">{selectedFile.modified}</span>
            </div>
            <div className="detail-actions">
              <button className="action-btn">📤 Upload to Chat</button>
              <button className="action-btn">👁️ Preview</button>
              <button className="action-btn">📋 Copy Path</button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .file-explorer {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: rgba(10, 10, 30, 0.4);
        }
        .explorer-toolbar {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-bottom: 1px solid rgba(0, 240, 255, 0.2);
          align-items: center;
        }
        .nav-btn, .view-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 240, 255, 0.3);
          border-radius: 6px;
          padding: 8px 16px;
          color: #e0e0f0;
          cursor: pointer;
          transition: all 0.3s;
        }
        .nav-btn:hover:not(:disabled), .view-btn:hover {
          background: rgba(0, 240, 255, 0.2);
          border-color: #00f0ff;
        }
        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .view-btn.active {
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(180, 0, 255, 0.2));
          border-color: #00f0ff;
        }
        .path-bar {
          flex: 1;
          display: flex;
          gap: 8px;
          align-items: center;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          padding: 8px 16px;
        }
        .path-icon { font-size: 16px; }
        .path-text {
          color: #00f0ff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
        }
        .view-controls {
          display: flex;
          gap: 8px;
        }
        .explorer-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .file-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .explorer-content.grid .file-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 16px;
        }
        .file-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(0, 240, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 8px;
        }
        .explorer-content.grid .file-item {
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 0;
        }
        .file-item:hover {
          background: rgba(0, 240, 255, 0.1);
          border-color: #00f0ff;
          transform: translateX(4px);
        }
        .explorer-content.grid .file-item:hover {
          transform: translateY(-4px) scale(1.05);
        }
        .file-item.selected {
          background: rgba(0, 240, 255, 0.15);
          border-color: #00f0ff;
        }
        .file-icon {
          font-size: 32px;
          flex-shrink: 0;
        }
        .file-info {
          flex: 1;
          min-width: 0;
        }
        .file-name {
          color: #e0e0f0;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .file-meta {
          display: flex;
          gap: 16px;
          margin-top: 4px;
          font-size: 12px;
          color: #a0a0d0;
        }
        .file-details {
          width: 280px;
          border-left: 1px solid rgba(0, 240, 255, 0.2);
          padding: 20px;
          background: rgba(0, 0, 0, 0.3);
          overflow-y: auto;
        }
        .file-details h3 {
          color: #00f0ff;
          margin-bottom: 16px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(0, 240, 255, 0.1);
        }
        .detail-label {
          color: #a0a0d0;
          font-size: 13px;
        }
        .detail-value {
          color: #e0e0f0;
          font-size: 13px;
        }
        .detail-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 16px;
        }
        .action-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 240, 255, 0.3);
          border-radius: 6px;
          padding: 10px;
          color: #e0e0f0;
          cursor: pointer;
          transition: all 0.3s;
        }
        .action-btn:hover {
          background: rgba(0, 240, 255, 0.2);
          border-color: #00f0ff;
        }
      `}</style>
    </div>
  );
}
