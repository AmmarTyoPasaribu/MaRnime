'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { VIEW_COOKIE, type DisplayMode } from '@/lib/display';

export type { DisplayMode };

interface DisplayModeContextType {
  mode: DisplayMode;
  setMode: (mode: DisplayMode) => void;
}

const DisplayModeContext = createContext<DisplayModeContextType>({ mode: 'card', setMode: () => {} });

export function useDisplayMode() {
  return useContext(DisplayModeContext);
}

/**
 * Global "Cards / Text" preference. Stored in a cookie so the server renders
 * the right mode on first paint (no flash), and every list reads it from here.
 */
export default function DisplayModeProvider({ initialMode, children }: { initialMode: DisplayMode; children: React.ReactNode }) {
  const [mode, setModeState] = useState<DisplayMode>(initialMode);

  const setMode = useCallback((next: DisplayMode) => {
    setModeState(next);
    document.cookie = `${VIEW_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);
  return <DisplayModeContext.Provider value={value}>{children}</DisplayModeContext.Provider>;
}
