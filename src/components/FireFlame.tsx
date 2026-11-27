import React, { useId } from 'react';

interface FireFlameProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showEmbers?: boolean;
}

/**
 * Animated Vector Fire Flame with organic multi-layer waving, licking motion.
 * Uses bulletproof scoped gradient IDs and explicit vibrant fallback fills
 * so the flame is guaranteed blazing bright orange-gold and NEVER turns black.
 */
export const FireFlame: React.FC<FireFlameProps> = ({ 
  className = '', 
  size = 'md',
  showEmbers = true 
}) => {
  const uniqueId = useId().replace(/:/g, '_');

  const sizeMap = {
    xs: 'w-4 h-5',
    sm: 'w-5 h-6',
    md: 'w-6 h-7',
    lg: 'w-8 h-10',
    xl: 'w-12 h-14',
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Optional Floating Rising Embers */}
      {showEmbers && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          <span className="fire-ember-particle ember-1" />
          <span className="fire-ember-particle ember-2" />
          <span className="fire-ember-particle ember-3" />
        </div>
      )}

      {/* Primary Animated Multi-Tongue Flame SVG */}
      <svg
        viewBox="0 0 32 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeMap[size]} fire-flame-movement select-none`}
        style={{
          filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.95))',
        }}
      >
        <defs>
          {/* Outer crimson/ruby tongue */}
          <linearGradient id={`fireOuter_${uniqueId}`} x1="16" y1="38" x2="16" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          {/* Middle fiery amber/orange tongue */}
          <linearGradient id={`fireMid_${uniqueId}`} x1="16" y1="36" x2="16" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>

          {/* Inner intense yellow-white plasma core */}
          <linearGradient id={`fireCore_${uniqueId}`} x1="16" y1="34" x2="16" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="60%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Outer Burning Flame Body (Orange-Red fallback so it never turns black) */}
        <path
          className="fire-tongue-outer"
          d="M16 2C16 2 9 12 9 20C9 24.5 12 30 16 38C20 30 23 24.5 23 20C23 12 16 2 16 2Z"
          fill={`url(#fireOuter_${uniqueId})`}
          style={{ fill: '#ea580c' }}
        />

        {/* Secondary Left Wave Lick */}
        <path
          className="fire-tongue-left"
          d="M16 8C13 13 8 18 8 24C8 28.5 11 34 16 38C12 33 11 27 12 24C13 21 16 16 16 8Z"
          fill={`url(#fireOuter_${uniqueId})`}
          opacity="0.95"
          style={{ fill: '#f97316' }}
        />

        {/* Secondary Right Wave Lick */}
        <path
          className="fire-tongue-right"
          d="M16 6C18 12 24 17 24 23C24 28 21 34 16 38C19 33 21 28 20 23C19 19 16 14 16 6Z"
          fill={`url(#fireOuter_${uniqueId})`}
          opacity="0.95"
          style={{ fill: '#f97316' }}
        />

        {/* Middle Vibrant Golden Flame Tongue */}
        <path
          className="fire-tongue-mid"
          d="M16 12C14 16 11 21 11 26C11 31 13 35 16 37C19 35 21 31 21 26C21 21 18 16 16 12Z"
          fill={`url(#fireMid_${uniqueId})`}
          style={{ fill: '#fbbf24' }}
        />

        {/* Hot Intense Plasma Core (Yellow-White) */}
        <path
          className="fire-tongue-core"
          d="M16 20C15 23 13 26 13 29C13 32.5 14.5 35 16 36C17.5 35 19 32.5 19 29C19 26 17 23 16 20Z"
          fill={`url(#fireCore_${uniqueId})`}
          style={{ fill: '#fef08a' }}
        />
      </svg>
    </div>
  );
};
