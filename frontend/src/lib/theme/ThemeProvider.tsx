import React, { createContext, useContext, useEffect, useState } from 'react';
import { applyAccentToCss } from './colorUtils';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemePreset {
  id: string;
  name: string;
  hex: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'blue', name: 'JobWise Blue', hex: '#2563eb' },
  { id: 'violet', name: 'Electric Violet', hex: '#6366f1' },
  { id: 'cyan', name: 'Oceanic Cyan', hex: '#06b6d4' },
  { id: 'emerald', name: 'Emerald Mint', hex: '#10b981' },
  { id: 'amber', name: 'Sunset Amber', hex: '#f59e0b' },
  { id: 'rose', name: 'Rose Neon', hex: '#f43f5e' },
  { id: 'titanium', name: 'Monochrome', hex: '#71717a' },
];

interface ThemeContextType {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  accentColor: string;
  setAccentColor: (hex: string) => void;
  activePreset: string | null;
  setPreset: (presetId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('jobwise_theme') as ThemeMode) || 'light';
  });

  const [accentColor, setAccentColorState] = useState<string>(() => {
    return localStorage.getItem('jobwise_accent_color') || '#2563eb';
  });

  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');

  // Compute resolved mode based on system preference
  useEffect(() => {
    const updateResolved = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const target = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
      setResolvedMode(target);
      document.documentElement.setAttribute('data-theme', target);
    };

    updateResolved();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (mode === 'system') updateResolved();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [mode]);

  // Apply accent color whenever it changes
  useEffect(() => {
    applyAccentToCss(accentColor);
    localStorage.setItem('jobwise_accent_color', accentColor);
  }, [accentColor]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('jobwise_theme', newMode);
  };

  const setAccentColor = (hex: string) => {
    setAccentColorState(hex);
  };

  const setPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setAccentColorState(preset.hex);
    }
  };

  const activePreset = THEME_PRESETS.find((p) => p.hex.toLowerCase() === accentColor.toLowerCase())?.id || null;

  return (
    <ThemeContext.Provider
      value={{
        mode,
        resolvedMode,
        setMode,
        accentColor,
        setAccentColor,
        activePreset,
        setPreset,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};
