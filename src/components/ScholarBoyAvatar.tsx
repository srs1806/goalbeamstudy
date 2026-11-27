import React from 'react';

interface ScholarBoyAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFlame?: boolean;
}

export const ScholarBoyAvatar: React.FC<ScholarBoyAvatarProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none border border-[var(--border-color)] bg-slate-900 overflow-hidden shadow-sm ${sizeMap[size]} ${className}`}
      style={{
        background: 'radial-gradient(circle at 50% 30%, #1e293b 0%, #0e1015 100%)',
      }}
      title="Class 10th Scholar Boy"
    >
      {/* Realistic Scholar Boy Vector Avatar */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-0.5 select-none pointer-events-none"
      >
        <defs>
          <linearGradient id="hairGrad" x1="12" y1="6" x2="36" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="24" y1="12" x2="24" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fba867" />
          </linearGradient>
          <linearGradient id="blazerGrad" x1="10" y1="34" x2="38" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>
          <linearGradient id="tieGrad" x1="24" y1="36" x2="24" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>

        {/* Scholar Boy Body / Collar / School Blazer */}
        <path
          d="M8 46C8 38 15 34 24 34C33 34 40 38 40 46"
          fill="url(#blazerGrad)"
          stroke="#38bdf8"
          strokeWidth="0.75"
        />

        {/* White Uniform Shirt Collar */}
        <polygon points="18,34 24,40 22,34" fill="#f8fafc" />
        <polygon points="30,34 24,40 26,34" fill="#f8fafc" />

        {/* Crimson Scholar Tie */}
        <polygon points="23,37 25,37 26,45 24,47 22,45" fill="url(#tieGrad)" />

        {/* Neck */}
        <path d="M20 28H28V36C28 36 26 37 24 37C22 37 20 36 20 36V28Z" fill="#fba867" />

        {/* Head / Face */}
        <ellipse cx="24" cy="22" rx="10" ry="11.5" fill="url(#skinGrad)" />

        {/* Smart Boy Styled Hair */}
        <path
          d="M13 19C13 13 17 8 24 8C31 8 35 13 35 19C33 16 30 15 27 15C24 15 21 17 18 15C15 17 13 18 13 19Z"
          fill="url(#hairGrad)"
        />
        {/* Hair Quiff / Swirl */}
        <path
          d="M21 8C26 6 32 9 34 14C31 12 27 12 23 13C19 14 17 13 16 11C18 9 20 8 21 8Z"
          fill="#4338ca"
          opacity="0.9"
        />

        {/* Scholar Smart Eyeglasses */}
        {/* Left Lens */}
        <rect x="16" y="19" width="6.5" height="5" rx="1.5" stroke="#38bdf8" strokeWidth="1" fill="#0284c7" fillOpacity="0.2" />
        {/* Right Lens */}
        <rect x="25.5" y="19" width="6.5" height="5" rx="1.5" stroke="#38bdf8" strokeWidth="1" fill="#0284c7" fillOpacity="0.2" />
        {/* Bridge */}
        <line x1="22.5" y1="21.5" x2="25.5" y2="21.5" stroke="#38bdf8" strokeWidth="1" />

        {/* Eyes behind lenses */}
        <circle cx="19.25" cy="21.5" r="1.1" fill="#0f172a" />
        <circle cx="28.75" cy="21.5" r="1.1" fill="#0f172a" />
        {/* Eye spark reflection */}
        <circle cx="19.5" cy="21.2" r="0.4" fill="#ffffff" />
        <circle cx="29" cy="21.2" r="0.4" fill="#ffffff" />

        {/* Confident Smile */}
        <path d="M21.5 27.5C22.5 29 25.5 29 26.5 27.5" stroke="#9a3412" strokeWidth="1" strokeLinecap="round" />

        {/* Rosy Cheeks */}
        <ellipse cx="16.5" cy="24.5" rx="1.2" ry="0.7" fill="#fb7185" opacity="0.6" />
        <ellipse cx="31.5" cy="24.5" rx="1.2" ry="0.7" fill="#fb7185" opacity="0.6" />
      </svg>
    </div>
  );
};
