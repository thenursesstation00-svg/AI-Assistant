import { useEffect, useRef } from "react";

const STORAGE_KEY = "futuristic_workspace_v1";

export function useWorkspacePersistence(windows, activeWindowId, setWindows, setActiveWindow) {
  const loadedRef = useRef(false);

  // Load on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Array.isArray(saved.windows)) {
        setWindows(saved.windows);
      }
      if (saved.activeWindowId) {
        setActiveWindow(saved.activeWindowId);
      }
    } catch (err) {
      console.warn("Failed to restore workspace", err);
    }
  }, [setWindows, setActiveWindow]);

  // Save on change (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const payload = {
          windows,
          activeWindowId,
          lastSaved: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn("Failed to save workspace", err);
      }
    }, 300);

    return () => clearTimeout(id);
  }, [windows, activeWindowId]);
}
