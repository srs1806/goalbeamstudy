import React, { useId } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

interface LockedFeatureOverlayProps {
  onCompleteProfile: () => void;
  children: React.ReactNode;
  variant?: 'card' | 'screen' | 'compact';
  featureLabel?: string;
  className?: string;
}

/**
 * Renders a grayscale, chain-locked overlay over gated features when the visitor
 * has not completed all 6 steps of profile setup. Clicking anywhere unlocks onboarding.
 */
export const LockedFeatureOverlay: React.FC<LockedFeatureOverlayProps> = ({
  onCompleteProfile,
  children,
  variant = 'card',
  featureLabel,
  className = '',
}) => {
  const isScreen = variant === 'screen';
  const isCompact = variant === 'compact';
  const rawId = useId().replace(/:/g, '');
  const chainAId = `chainLinkA-${rawId}`;
  const chainBId = `chainLinkB-${rawId}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onCompleteProfile}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCompleteProfile();
        }
      }}
      className={`keep-dark-surface relative overflow-hidden cursor-pointer group select-none border border-slate-500/40 bg-slate-900/50 ${
        isCompact ? 'rounded-xl min-h-[74px]' : 'rounded-2xl'
      } ${isScreen ? 'h-full min-h-[340px] flex-1 flex flex-col' : ''} ${className}`}
      title="Click on me to unlock for free"
    >
      {/* Grayed-out, blurred underlying preview */}
      <div
        aria-hidden="true"
        className={`pointer-events-none select-none grayscale contrast-75 opacity-30 blur-[1px] ${
          isScreen ? 'flex-1 min-h-0 overflow-hidden' : ''
        }`}
      >
        {children}
      </div>

      {/* Criss-cross Metallic Chains SVG Overlay */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-80"
        preserveAspectRatio="none"
        viewBox="0 0 400 240"
      >
        <defs>
          <pattern id={chainAId} width="28" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(26)">
            <rect x="2" y="2" width="16" height="10" rx="5" fill="none" stroke="#94a3b8" strokeWidth="2.6" />
            <rect x="13" y="4" width="14" height="6" rx="3" fill="none" stroke="#cbd5e1" strokeWidth="2" />
          </pattern>
          <pattern id={chainBId} width="28" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-26)">
            <rect x="2" y="2" width="16" height="10" rx="5" fill="none" stroke="#64748b" strokeWidth="2.6" />
            <rect x="13" y="4" width="14" height="6" rx="3" fill="none" stroke="#cbd5e1" strokeWidth="2" />
          </pattern>
        </defs>
        <line x1="-20" y1="20" x2="420" y2="220" stroke={`url(#${chainAId})`} strokeWidth="14" />
        <line x1="-20" y1="220" x2="420" y2="20" stroke={`url(#${chainBId})`} strokeWidth="14" />
        <line x1="0" y1="120" x2="400" y2="120" stroke={`url(#${chainAId})`} strokeWidth="10" opacity="0.55" />
      </svg>

      {/* Center Lock Badge & Unlock Prompt */}
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center bg-slate-950/60 backdrop-blur-[1.5px] group-hover:bg-slate-950/50 transition-colors ${
          isCompact ? 'p-1.5 sm:p-2' : 'p-3 sm:p-5'
        }`}
      >
        {isCompact ? (
          <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/92 border border-slate-400/50 group-hover:border-amber-400/80 shadow-lg transition-all">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-500/60 group-hover:border-amber-400 text-amber-300 flex items-center justify-center shrink-0">
              <Lock className="w-3 h-3" />
            </div>
            {featureLabel && (
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-200">
                {featureLabel} Locked
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 group-hover:bg-amber-300 text-slate-950 font-black text-[10px] sm:text-[11px] shadow-sm shrink-0 transition-colors">
              <span>Click on me to unlock for free</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        ) : (
          <div
            className={`flex flex-col items-center text-center rounded-2xl bg-slate-950/92 border border-slate-400/50 group-hover:border-amber-400/80 shadow-2xl transition-colors ${
              isScreen ? 'max-w-sm p-5 sm:p-6 gap-3' : 'max-w-xs px-3.5 py-3 sm:px-4 sm:py-3.5 gap-2'
            }`}
          >
            <div
              className={`rounded-full bg-slate-800 border border-slate-500/60 group-hover:border-amber-400 text-amber-300 flex items-center justify-center shadow-lg shrink-0 ${
                isScreen ? 'w-11 h-11' : 'w-8 h-8'
              }`}
            >
              <Lock className={isScreen ? 'w-5 h-5' : 'w-4 h-4'} />
            </div>

            {featureLabel && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-600/60">
                🔒 {featureLabel} Locked
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 group-hover:bg-amber-300 text-slate-950 font-black text-[11px] sm:text-xs shadow-md transition-colors">
              <span>Click on me to unlock for free</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
