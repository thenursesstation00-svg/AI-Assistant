// frontend/src/UpdateNotification.jsx
// Auto-update notification UI component

import React, { useState, useEffect } from 'react';

export default function UpdateNotification() {
  const [updateState, setUpdateState] = useState({
    checking: false,
    available: false,
    downloaded: false,
    progress: 0,
    error: null,
    info: null
  });
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!window.electronUpdater) return;

    const handleChecking = () => {
      setUpdateState(prev => ({ ...prev, checking: true, error: null }));
    };

    const handleAvailable = (info) => {
      setUpdateState(prev => ({
        ...prev,
        checking: false,
        available: true,
        info
      }));
      setShowNotification(true);
    };

    const handleNotAvailable = () => {
      setUpdateState(prev => ({ ...prev, checking: false, available: false }));
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleProgress = (progress) => {
      setUpdateState(prev => ({ ...prev, progress: progress.percent || 0 }));
    };

    const handleDownloaded = (info) => {
      setUpdateState(prev => ({
        ...prev,
        downloaded: true,
        progress: 100,
        info
      }));
      setShowNotification(true);
    };

    const handleError = (error) => {
      setUpdateState(prev => ({
        ...prev,
        checking: false,
        error: error.message
      }));
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    };

    // Register listeners
    window.electronUpdater.on('update-checking', handleChecking);
    window.electronUpdater.on('update-available', handleAvailable);
    window.electronUpdater.on('update-not-available', handleNotAvailable);
    window.electronUpdater.on('update-download-progress', handleProgress);
    window.electronUpdater.on('update-downloaded', handleDownloaded);
    window.electronUpdater.on('update-error', handleError);

    // Cleanup
    return () => {
      if (window.electronUpdater.removeListener) {
        window.electronUpdater.removeListener('update-checking', handleChecking);
        window.electronUpdater.removeListener('update-available', handleAvailable);
        window.electronUpdater.removeListener('update-not-available', handleNotAvailable);
        window.electronUpdater.removeListener('update-download-progress', handleProgress);
        window.electronUpdater.removeListener('update-downloaded', handleDownloaded);
        window.electronUpdater.removeListener('update-error', handleError);
      }
    };
  }, []);

  const handleInstall = () => {
    if (window.electronUpdater) {
      window.electronUpdater.applyUpdate();
    }
  };

  const handleCheckManually = () => {
    if (window.electronUpdater) {
      setShowNotification(true);
      window.electronUpdater.checkForUpdates();
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification) {
    // Always show "Check for Updates" button when not showing notification
    return (
      <button
        onClick={handleCheckManually}
        disabled={updateState.checking}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 16px',
          fontSize: '13px',
          backgroundColor: updateState.checking ? '#999' : '#0078d4',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: updateState.checking ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {updateState.checking ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
            Checking...
          </>
        ) : (
          <>
            🔄 Check for Updates
          </>
        )}
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      minWidth: '300px',
      maxWidth: '400px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      padding: '16px',
      zIndex: 10000,
      border: '1px solid #ddd'
    }}>
      {/* Close button */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          color: '#666',
          padding: '4px 8px'
        }}
      >
        ×
      </button>

      {/* Checking state */}
      {updateState.checking && (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>
            🔍 Checking for updates...
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            Please wait while we check for new versions.
          </div>
        </div>
      )}

      {/* Update available - downloading */}
      {updateState.available && !updateState.downloaded && (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', color: '#0078d4' }}>
            📥 Update Available
          </div>
          <div style={{ fontSize: '13px', color: '#333', marginBottom: '12px' }}>
            Version {updateState.info?.version} is downloading...
          </div>
          
          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              width: `${updateState.progress}%`,
              height: '100%',
              backgroundColor: '#0078d4',
              transition: 'width 0.3s ease'
            }} />
          </div>
          
          <div style={{ fontSize: '12px', color: '#666' }}>
            {updateState.progress.toFixed(0)}% complete
          </div>
        </div>
      )}

      {/* Update downloaded - ready to install */}
      {updateState.downloaded && (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', color: '#0dbc79' }}>
            ✅ Update Ready
          </div>
          <div style={{ fontSize: '13px', color: '#333', marginBottom: '16px' }}>
            Version {updateState.info?.version} has been downloaded and is ready to install.
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleInstall}
              style={{
                flex: 1,
                padding: '10px 16px',
                fontSize: '13px',
                backgroundColor: '#0dbc79',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Install & Restart
            </button>
            <button
              onClick={handleDismiss}
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {updateState.error && (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', color: '#c33' }}>
            ❌ Update Error
          </div>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
            {updateState.error}
          </div>
          <button
            onClick={handleCheckManually}
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
            Try Again
          </button>
        </div>
      )}

      {/* No updates available */}
      {!updateState.checking && !updateState.available && !updateState.error && (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>
            ✨ You're up to date!
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            You're running the latest version.
          </div>
        </div>
      )}

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
