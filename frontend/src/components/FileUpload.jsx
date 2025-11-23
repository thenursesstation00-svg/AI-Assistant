// FileUpload.jsx - Modern file upload component with drag-drop
import React, { useState, useRef } from 'react';
import { getBackendApiKeyAsync } from '../config';

export default function FileUpload({ onFilesUploaded, maxFiles = 10 }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files).slice(0, maxFiles);
    if (files.length > 0) {
      await uploadFiles(files);
    }
    // Reset input
    e.target.value = '';
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const apiKey = await getBackendApiKeyAsync();
      
      const xhr = new XMLHttpRequest();
      
      // Progress tracking
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(Math.round(percentComplete));
        }
      });

      // Response handling
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (onFilesUploaded) {
            onFilesUploaded(response.files);
          }
        } else {
          console.error('Upload failed:', xhr.statusText);
          alert('Upload failed: ' + xhr.statusText);
        }
        setUploading(false);
        setProgress(0);
      });

      xhr.addEventListener('error', () => {
        console.error('Upload error');
        alert('Upload failed');
        setUploading(false);
        setProgress(0);
      });

      xhr.open('POST', 'http://127.0.0.1:3001/api/chat/upload');
      xhr.setRequestHeader('x-api-key', apiKey || '');
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="*/*"
      />

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          padding: '16px',
          border: `2px dashed ${dragging ? '#007bff' : '#444'}`,
          borderRadius: '8px',
          backgroundColor: dragging ? '#1e3a5f' : '#2d2d30',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'all 0.2s',
          textAlign: 'center'
        }}
      >
        {uploading ? (
          <div>
            <div style={{ color: '#cccccc', marginBottom: '8px' }}>
              📤 Uploading... {progress}%
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#444',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#007bff',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        ) : (
          <div style={{ color: '#cccccc' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              📎
            </div>
            <div>
              {dragging ? (
                <strong>Drop files here</strong>
              ) : (
                <>Click to select or drag & drop files</>
              )}
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
              Supports documents, images, code, archives (max {maxFiles} files)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
