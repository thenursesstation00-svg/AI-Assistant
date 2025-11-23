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

  return {
    windows,
    activeWindow,
    addWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    handleMouseDown
  };
}
