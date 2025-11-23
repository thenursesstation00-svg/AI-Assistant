// FileChip.jsx - Display file attachments as chips
import React from 'react';

const getFileIcon = (type) => {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('sheet') || type.includes('excel')) return '📊';
  if (type.includes('presentation') || type.includes('powerpoint')) return '📽️';
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return '📦';
  if (type.startsWith('text/')) return '📃';
  return '📎';
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function FileChip({ file, onRemove, compact = false }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: compact ? '4px 8px' : '6px 10px',
      backgroundColor: '#3a3d41',
      border: '1px solid #555',
      borderRadius: '16px',
      fontSize: compact ? '11px' : '12px',
      color: '#cccccc',
      maxWidth: compact ? '150px' : '200px',
      cursor: onRemove ? 'default' : 'pointer',
      transition: 'all 0.2s',
      marginRight: '6px',
      marginBottom: compact ? '4px' : '6px'
    }}>
      <span style={{ fontSize: compact ? '14px' : '16px' }}>
        {getFileIcon(file.type)}
      </span>
      <span style={{
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {file.name}
      </span>
      {!compact && (
        <span style={{ fontSize: '10px', color: '#888' }}>
          {formatFileSize(file.size)}
        </span>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(file);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#ff6b6b',
            cursor: 'pointer',
            padding: '0 4px',
            fontSize: '16px',
            lineHeight: 1
          }}
          title="Remove file"
        >
          ×
        </button>
      )}
    </div>
  );
}
