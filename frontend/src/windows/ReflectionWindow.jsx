// ReflectionWindow.jsx - Personal reflection and note-taking
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ReflectionWindow() {
  const [reflections, setReflections] = useState([
    {
      id: 1,
      date: '2025-01-21',
      title: 'Project Progress',
      content: '# Progress Today\n\n- ✅ Implemented futuristic UI system\n- ✅ Created 7 window components\n- 🔄 Working on customization features\n\n## Next Steps\n- Add layout persistence\n- Implement keyboard shortcuts\n- Create theme switcher',
      tags: ['development', 'progress']
    },
    {
      id: 2,
      date: '2025-01-20',
      title: 'AI Agent Ideas',
      content: '# New Agent Ideas\n\n1. **Documentation Generator** - Auto-generates docs from code\n2. **Performance Optimizer** - Monitors and suggests optimizations\n3. **Security Auditor** - Continuous vulnerability scanning\n\n*Need to implement priority queue for agent tasks*',
      tags: ['ai', 'ideas']
    }
  ]);

  const [selectedReflection, setSelectedReflection] = useState(reflections[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  const handleEdit = () => {
    setEditContent(selectedReflection.content);
    setIsEditing(true);
  };

  const handleSave = () => {
    setReflections(reflections.map(r =>
      r.id === selectedReflection.id
        ? { ...r, content: editContent }
        : r
    ));
    setSelectedReflection({ ...selectedReflection, content: editContent });
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    if (!newTitle.trim()) return;

    const newReflection = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      title: newTitle,
      content: '# New Reflection\n\nStart writing...',
      tags: []
    };

    setReflections([newReflection, ...reflections]);
    setSelectedReflection(newReflection);
    setNewTitle('');
    setShowNewForm(false);
    setIsEditing(true);
    setEditContent(newReflection.content);
  };

  return (
    <div className="reflection-window">
      <div className="reflection-sidebar">
        <div className="sidebar-header">
          <h3>🧠 Reflections</h3>
          <button
            className="new-btn"
            onClick={() => setShowNewForm(!showNewForm)}
          >
            ✨ New
          </button>
        </div>

        {showNewForm && (
          <div className="new-form">
            <input
              type="text"
              className="title-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Reflection title..."
              autoFocus
            />
            <div className="form-actions">
              <button className="create-btn" onClick={handleCreateNew}>
                Create
              </button>
              <button className="cancel-btn" onClick={() => setShowNewForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="reflection-list">
          {reflections.map(reflection => (
            <div
              key={reflection.id}
              className={`reflection-item ${selectedReflection?.id === reflection.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedReflection(reflection);
                setIsEditing(false);
              }}
            >
              <div className="reflection-date">{reflection.date}</div>
              <div className="reflection-title">{reflection.title}</div>
              {reflection.tags.length > 0 && (
                <div className="reflection-tags">
                  {reflection.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="reflection-content">
        {selectedReflection && (
          <>
            <div className="content-header">
              <div className="header-info">
                <h2>{selectedReflection.title}</h2>
                <div className="content-meta">
                  <span>📅 {selectedReflection.date}</span>
                </div>
              </div>
              <div className="header-actions">
                {isEditing ? (
                  <>
                    <button className="action-btn primary" onClick={handleSave}>
                      💾 Save
                    </button>
                    <button className="action-btn" onClick={() => setIsEditing(false)}>
                      ❌ Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="action-btn" onClick={handleEdit}>
                      ✏️ Edit
                    </button>
                    <button className="action-btn">🤖 AI Enhance</button>
                    <button className="action-btn">🔗 Share</button>
                  </>
                )}
              </div>
            </div>

            <div className="content-body">
              {isEditing ? (
                <textarea
                  className="content-editor"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write your thoughts..."
                />
              ) : (
                <div className="content-preview">
                  <ReactMarkdown>{selectedReflection.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .reflection-window {
          display: flex;
          height: 100%;
          background: rgba(10, 10, 30, 0.4);
        }
        .reflection-sidebar {
          width: 280px;
          border-right: 1px solid rgba(0, 240, 255, 0.2);
          display: flex;
          flex-direction: column;
          background: rgba(0, 0, 0, 0.2);
        }
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid rgba(0, 240, 255, 0.2);
        }
        .sidebar-header h3 {
          color: #00f0ff;
          margin: 0;
          font-size: 16px;
        }
        .new-btn {
          background: linear-gradient(135deg, #00f0ff, #b400ff);
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s;
        }
        .new-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.5);
        }
        .new-form {
          padding: 12px;
          border-bottom: 1px solid rgba(0, 240, 255, 0.2);
          background: rgba(0, 240, 255, 0.05);
        }
        .title-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 240, 255, 0.3);
          border-radius: 6px;
          padding: 8px 12px;
          color: #e0e0f0;
          font-size: 13px;
          margin-bottom: 8px;
          outline: none;
        }
        .form-actions {
          display: flex;
          gap: 8px;
        }
        .create-btn, .cancel-btn {
          flex: 1;
          padding: 6px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s;
        }
        .create-btn {
          background: linear-gradient(135deg, #00f0ff, #b400ff);
          color: white;
          font-weight: 600;
        }
        .cancel-btn {
          background: rgba(255, 255, 255, 0.05);
          color: #a0a0d0;
          border: 1px solid rgba(0, 240, 255, 0.2);
        }
        .reflection-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }
        .reflection-item {
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.3s;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(0, 240, 255, 0.1);
        }
        .reflection-item:hover {
          background: rgba(0, 240, 255, 0.1);
          border-color: #00f0ff;
        }
        .reflection-item.selected {
          background: rgba(0, 240, 255, 0.15);
          border-color: #00f0ff;
        }
        .reflection-date {
          color: #a0a0d0;
          font-size: 11px;
          margin-bottom: 4px;
        }
        .reflection-title {
          color: #e0e0f0;
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 6px;
        }
        .reflection-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .tag {
          background: rgba(180, 0, 255, 0.2);
          border: 1px solid rgba(180, 0, 255, 0.4);
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 10px;
          color: #b400ff;
        }
        .reflection-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px;
          border-bottom: 1px solid rgba(0, 240, 255, 0.2);
        }
        .content-header h2 {
          color: #00f0ff;
          margin: 0 0 8px 0;
        }
        .content-meta {
          display: flex;
          gap: 16px;
          color: #a0a0d0;
          font-size: 13px;
        }
        .header-actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 240, 255, 0.3);
          border-radius: 6px;
          padding: 8px 12px;
          color: #e0e0f0;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.3s;
        }
        .action-btn:hover {
          background: rgba(0, 240, 255, 0.2);
          border-color: #00f0ff;
        }
        .action-btn.primary {
          background: linear-gradient(135deg, #00f0ff, #b400ff);
          border: none;
          color: white;
          font-weight: 600;
        }
        .content-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
        .content-editor {
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 240, 255, 0.2);
          border-radius: 8px;
          padding: 16px;
          color: #e0e0f0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          line-height: 1.6;
          resize: none;
          outline: none;
        }
        .content-preview {
          color: #e0e0f0;
          line-height: 1.8;
        }
        .content-preview h1 {
          color: #00f0ff;
          margin-top: 0;
        }
        .content-preview h2 {
          color: #00f0ff;
        }
        .content-preview code {
          background: rgba(0, 240, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
        }
        .content-preview ul, .content-preview ol {
          margin-left: 20px;
        }
      `}</style>
    </div>
  );
}
