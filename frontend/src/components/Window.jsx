// Window.jsx - Individual draggable window component
import React from 'react';

export default function Window({
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
  onMouseDown,
  onClose,
  onMinimize,
  onMaximize,
  children
}) {
  if (minimized) return null;

  const style = maximized
    ? { top: 0, left: 0, width: '100vw', height: '100vh' }
    : { top: y, left: x, width, height };

  const handleDoubleClick = () => {
    if (maximized) {
      // Restore handled by parent
    } else {
      onMaximize && onMaximize(id);
    }
  };

  return (
    <div
      className={`window-container ${active ? 'active' : ''} ${maximized ? 'maximized' : ''}`}
      style={style}
      onMouseDown={() => onMouseDown && onMouseDown({ preventDefault: () => {}, button: 0 }, id, 'activate')}
    >
      <div
        className="window-titlebar"
        onMouseDown={(e) => !maximized && onMouseDown && onMouseDown(e, id, 'move')}
        onDoubleClick={handleDoubleClick}
      >
        <div className="window-title">
          {icon && <span className="window-icon">{icon}</span>}
          <span>{title}</span>
        </div>
        <div className="window-controls">
          <button
            className="window-btn minimize"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize && onMinimize(id);
            }}
          >
            −
          </button>
          <button
            className="window-btn maximize"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize && onMaximize(id);
            }}
          >
            {maximized ? '⊡' : '□'}
          </button>
          <button
            className="window-btn close"
            onClick={(e) => {
              e.stopPropagation();
              onClose && onClose(id);
            }}
          >
            ×
          </button>
        </div>
      </div>
      <div className="window-content">
        {children}
      </div>
      {!maximized && (
        <>
          <div
            className="resize-handle right"
            onMouseDown={(e) => onMouseDown && onMouseDown(e, id, 'resize-right')}
          />
          <div
            className="resize-handle bottom"
            onMouseDown={(e) => onMouseDown && onMouseDown(e, id, 'resize-bottom')}
          />
          <div
            className="resize-handle corner"
            onMouseDown={(e) => onMouseDown && onMouseDown(e, id, 'resize-corner')}
          />
        </>
      )}
    </div>
  );
}
