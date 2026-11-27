import React from 'react';
import { ThemeMode } from '../types/tracker';

export interface ActiveModeTransition {
  key: number;
  targetTheme: ThemeMode;
  x: number;
  y: number;
  usesFallback?: boolean;
}

interface ThemeTransitionOverlayProps {
  transition: ActiveModeTransition | null;
}

const MODE_CLASS: Record<ThemeMode, string> = {
  dark: 'theme-fx-dusk',
  light: 'theme-fx-pearl',
  gold: 'theme-fx-amber',
  matrix: 'theme-fx-jade',
  cyberpunk: 'theme-fx-prism',
};

export const ThemeTransitionOverlay: React.FC<ThemeTransitionOverlayProps> = ({ transition }) => {
  if (!transition) return null;

  const modeClass = MODE_CLASS[transition.targetTheme] || MODE_CLASS.dark;
  const fallbackClass = transition.usesFallback ? 'theme-fx-fallback' : '';

  return (
    <div
      key={transition.key}
      aria-hidden="true"
      className={`theme-fx-root fixed inset-0 z-[2147483647] pointer-events-none overflow-hidden ${modeClass} ${fallbackClass}`}
      style={
        {
          '--fx-x': `${transition.x}px`,
          '--fx-y': `${transition.y}px`,
        } as React.CSSProperties
      }
    >
      <div className="theme-fx-veil" />
      <div className="theme-fx-aurora" />
    </div>
  );
};
