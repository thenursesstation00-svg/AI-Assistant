// Stub WindowManager hook - minimal implementation for FuturisticUI
import { useState } from 'react';

export default function useWindowManager({ initialWindows = [] }) {
  const [windows, setWindows] = useState(initialWindows);
  const [activeWindow, setActiveWindow] = useState(null);

  const addWindow = (config) => {
    const newWindow = {
      ...config,
      id: config.id || `window-${Date.now()}`,
      x: config.x || 100,
      y: config.y || 100,
      width: config.width || 600,
      height: config.height || 400,
      minimized: false,
      maximized: false
    };
    setWindows(prev => [...prev, newWindow]);
    setActiveWindow(newWindow.id);
  };

  const closeWindow = (id) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindow === id) setActiveWindow(null);
  };

  const minimizeWindow = (id) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, minimized: true } : w
    ));
  };

  const maximizeWindow = (id) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, maximized: !w.maximized } : w
    ));
  };

  const restoreWindow = (id) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, minimized: false } : w
    ));
    setActiveWindow(id);
  };

  const handleMouseDown = (id) => {
    setActiveWindow(id);
  };

  // Snapping logic
  const SNAP_THRESHOLD = 24;
  const SNAP_MARGIN = 16; // padding inside viewport
  const SNAP_GRID = 32;   // optional grid

  function snapPosition(x, y, width, height, viewportWidth, viewportHeight) {
    let newX = x;
    let newY = y;

    // Snap to edges if close enough
    if (Math.abs(x - SNAP_MARGIN) < SNAP_THRESHOLD) newX = SNAP_MARGIN;
    if (Math.abs((x + width) - (viewportWidth - SNAP_MARGIN)) < SNAP_THRESHOLD) {
      newX = viewportWidth - SNAP_MARGIN - width;
    }

    if (Math.abs(y - 40) < SNAP_THRESHOLD) newY = 40; // e.g., below status bar
    if (Math.abs((y + height) - (viewportHeight - SNAP_MARGIN)) < SNAP_THRESHOLD) {
      newY = viewportHeight - SNAP_MARGIN - height;
    }

    // Optional grid snap
    newX = Math.round(newX / SNAP_GRID) * SNAP_GRID;
    newY = Math.round(newY / SNAP_GRID) * SNAP_GRID;

    return { x: newX, y: newY };
  }

  // Call this on drag end
  function handleDragEnd(windowId, finalX, finalY, width, height) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const snapped = snapPosition(finalX, finalY, width, height, viewportWidth, viewportHeight);

    setWindows(prev =>
      prev.map(w =>
        w.id === windowId ? { ...w, x: snapped.x, y: snapped.y } : w
      )
    );
  }

  return {
    windows,
    activeWindow,
    addWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    handleMouseDown,
    handleDragEnd,
    snapPosition
  };
}
