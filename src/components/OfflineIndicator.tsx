import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="keep-dark-surface fixed bottom-20 left-3 sm:left-4 z-[60] flex items-center gap-2 rounded-xl bg-slate-950/95 border border-amber-400/70 px-3 py-2 text-xs font-bold text-amber-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2"
    >
      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
      <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>Offline Mode — Saved progress &amp; tools ready offline</span>
    </div>
  );
};
