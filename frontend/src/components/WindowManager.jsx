// WindowManager.jsx - Futuristic draggable window system hook
import { useState, useEffect } from 'react';

export default function useWindowManager({ initialWindows = [] }) {
  const [windows, setWindows] = useState(initialWindows);
  const [activeWindow, setActiveWindow] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragState) {
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;

        setWindows((wins) =>
          wins.map((w) =>
            w.id === dragState.id
              ? {
                  ...w,
                  x: dragState.initialX + deltaX,
                  y: dragState.initialY + deltaY
                }
              : w
          )
        );
      }

      if (resizeState) {
        const deltaX = e.clientX - resizeState.startX;
        const deltaY = e.clientY - resizeState.startY;

        setWindows((wins) =>
          wins.map((w) => {
            if (w.id !== resizeState.id) return w;

            let newWidth = w.width;
            let newHeight = w.height;

            if (resizeState.handle.includes('right') || resizeState.handle.includes('corner')) {
              newWidth = Math.max(300, resizeState.initialWidth + deltaX);
            }
            if (resizeState.handle.includes('bottom') || resizeState.handle.includes('corner')) {
              newHeight = Math.max(200, resizeState.initialHeight + deltaY);
            }

            return { ...w, width: newWidth, height: newHeight };
          })
        );
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
      setResizeState(null);
    };

    if (dragState || resizeState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, resizeState]);

  const handleMouseDown = (e, windowId, type) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();

    const window = windows.find((w) => w.id === windowId);
    if (!window) return;

    setActiveWindow(windowId);

    if (type === 'move') {
      setDragState({
        id: windowId,
        startX: e.clientX,
        startY: e.clientY,
        initialX: window.x,
        initialY: window.y
      });
    } else if (type.startsWith('resize')) {
      setResizeState({
        id: windowId,
        startX: e.clientX,
        startY: e.clientY,
        initialWidth: window.width,
        initialHeight: window.height,
        handle: type
      });
    }
  };

  const closeWindow = (id) => {
    setWindows((wins) => wins.filter((w) => w.id !== id));
  };

  const minimizeWindow = (id) => {
    setWindows((wins) =>
      wins.map((w) => (w.id === id ? { ...w, minimized: true } : w))
    );
  };

  const restoreWindow = (id) => {
    setWindows((wins) =>
      wins.map((w) =>
        w.id === id ? { ...w, minimized: false, maximized: false } : w
      )
    );
    setActiveWindow(id);
  };

  const maximizeWindow = (id) => {
    setWindows((wins) =>
      wins.map((w) => {
        if (w.id === id) {
          return w.maximized
            ? { ...w, maximized: false }
            : { ...w, maximized: true };
        }
        return w;
      })
    );
  };

  const addWindow = ({ title, icon, type, width = 600, height = 500 }) => {
    const newWindow = {
      id: `${type}-${Date.now()}`,
      title,
      icon,
      type,
      x: 50 + windows.length * 30,
      y: 50 + windows.length * 30,
      width,
      height,
      minimized: false,
      maximized: false
    };
    setWindows((wins) => [...wins, newWindow]);
    setActiveWindow(newWindow.id);
  };

  return {
    windows,
    activeWindow,
    handleMouseDown,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    maximizeWindow,
    addWindow
  };
}
        startY: e.clientY,
        initialWidth: window.width,
        initialHeight: window.height,
        initialX: window.x,
        initialY: window.y
      });
    }

    e.preventDefault();
  };

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragState) {
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;

        setWindows(prev => prev.map(w => 
          w.id === dragState.id
            ? { ...w, x: dragState.initialX + deltaX, y: dragState.initialY + deltaY }
            : w
        ));
      }

      if (resizeState) {
        const deltaX = e.clientX - resizeState.startX;
        const deltaY = e.clientY - resizeState.startY;

        setWindows(prev => prev.map(w =>
          w.id === resizeState.id
            ? {
                ...w,
                width: Math.max(300, resizeState.initialWidth + deltaX),
                height: Math.max(200, resizeState.initialHeight + deltaY)
              }
            : w
        ));
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
      setResizeState(null);
    };

    if (dragState || resizeState) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, resizeState]);

  // Window actions
  const closeWindow = (id) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const minimizeWindow = (id) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, minimized: true } : w
    ));
  };

  const restoreWindow = (id) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, minimized: false, maximized: false } : w
    ));
    setActiveWindow(id);
  };

  const maximizeWindow = (id) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, maximized: !w.maximized } : w
    ));
  };

  const addWindow = (windowConfig) => {
    const newWindow = {
      id: `window-${Date.now()}`,
      x: 100 + windows.length * 30,
      y: 100 + windows.length * 30,
      width: 800,
      height: 600,
      minimized: false,
      maximized: false,
      ...windowConfig
    };
    setWindows(prev => [...prev, newWindow]);
    setActiveWindow(newWindow.id);
  };

  return {
    windows,
    activeWindow,
    setActiveWindow,
    handleMouseDown,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    maximizeWindow,
    addWindow,
    setWindows
  };
}

// Window component
export function Window({
  id,
  title,
  icon,
  x,
  y,
  width,
  height,
  minimized,
  maximized,
  active,
  children,
  onMouseDown,
  onClose,
  onMinimize,
  onMaximize,
  className = ''
}) {
  if (minimized) return null;

  const style = maximized
    ? { top: 36, left: 0, width: '100vw', height: 'calc(100vh - 36px)' }
    : { top: y, left: x, width, height };

  return (
    <div
      className={`window-container ${active ? 'active' : ''} ${maximized ? 'maximized' : ''} ${className}`}
      style={style}
      onClick={() => onMouseDown && onMouseDown(null, id, 'activate')}
    >
      {/* Title bar */}
      <div
        className="window-titlebar hologram"
        onMouseDown={(e) => !maximized && onMouseDown && onMouseDown(e, id, 'move')}
        onDoubleClick={() => onMaximize && onMaximize(id)}
      >
        <div className="window-title">
          <span className="window-icon">{icon}</span>
          <span>{title}</span>
        </div>
        <div className="window-controls">
          <div
            className="window-control-btn"
            onClick={(e) => { e.stopPropagation(); onMinimize && onMinimize(id); }}
            title="Minimize"
          >
            −
          </div>
          <div
            className="window-control-btn"
            onClick={(e) => { e.stopPropagation(); onMaximize && onMaximize(id); }}
            title="Maximize"
          >
            {maximized ? '◱' : '□'}
          </div>
          <div
            className="window-control-btn close"
            onClick={(e) => { e.stopPropagation(); onClose && onClose(id); }}
            title="Close"
          >
            ✕
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="window-content">
        {children}
      </div>

      {/* Resize handles */}
      {!maximized && (
        <>
          <div
            className="resize-handle right"
            onMouseDown={(e) => onMouseDown && onMouseDown(e, id, 'resize')}
          />
          <div
            className="resize-handle bottom"
            onMouseDown={(e) => onMouseDown && onMouseDown(e, id, 'resize')}
          />
          <div
            className="resize-handle corner"
            onMouseDown={(e) => onMouseDown && onMouseDown(e, id, 'resize')}
          />
        </>
      )}
    </div>
  );
}
