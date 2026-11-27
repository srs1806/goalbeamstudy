import React, { useState } from 'react';
import logoImg256 from '../assets/logo-256.png';
import { getAppAssetUrl } from '../utils/seoMetadata';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  className?: string;
  showGlow?: boolean;
  fireEffect?: boolean;
  borderless?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showGlow = true,
  fireEffect = false,
  borderless = false,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(logoImg256);
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-10 h-10 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
    '2xl': 'w-32 h-32 sm:w-44 sm:h-44',
    hero: 'w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36',
  };

  const handleImgError = () => {
    if (currentSrc === logoImg256) {
      setCurrentSrc(getAppAssetUrl('logo.png'));
    } else {
      setImgError(true);
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden ${borderless ? 'border-0' : 'border-2 border-cyan-500/80'} bg-slate-950 shadow-md select-none ${sizeMap[size]} ${className}`}
    >
      {!imgError ? (
        <img
          src={currentSrc}
          alt="GOALBEAM Official Emblem"
          loading="eager"
          decoding="sync"
          className="w-full h-full object-cover select-none block pointer-events-none rounded-full"
          style={{ 
            imageRendering: '-webkit-optimize-contrast',
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'contrast(1.06) saturate(1.1)',
          }}
          onError={handleImgError}
        />
      ) : (
        /* Razor-sharp high-definition SVG vector crystal lightning insignia */
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-900 to-cyan-950 text-cyan-300 font-black">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3/4 h-3/4 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
          >
            <circle cx="20" cy="20" r="18" stroke="url(#cyanGlow)" strokeWidth="2.5" />
            <path
              d="M21 5L10 22H20L18 35L30 18H20L21 5Z"
              fill="url(#lightningGrad)"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="cyanGlow" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="0.5" stopColor="#06b6d4" />
                <stop offset="1" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="lightningGrad" x1="10" y1="5" x2="30" y2="35" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="0.5" stopColor="#f59e0b" />
                <stop offset="1" stopColor="#e11d48" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
};
