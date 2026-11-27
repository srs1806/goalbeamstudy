import React from 'react';
import { ActiveScreen, LanguageMode } from '../types/tracker';
import { LayoutDashboard, BookOpen, BarChart3, FileText, User } from 'lucide-react';
import { getT } from '../utils/translations';
import { SCREEN_SEO_MAP } from '../utils/seoMetadata';

interface BottomNavProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  language?: LanguageMode;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  language = 'en',
}) => {
  const t = getT(language);

  // Left Side of Home: Chapters, Resources (Spacious & uncluttered)
  const leftItems: Array<{ key: ActiveScreen; label: string; icon: React.ReactNode }> = [
    { key: 'chapters', label: t('nav.chapters', 'Chapters'), icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { key: 'resources', label: t('nav.resources', 'Resources'), icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ];

  // Right Side of Home: Insights, Profile (Edit Profile & Settings)
  const rightItems: Array<{ key: ActiveScreen; label: string; icon: React.ReactNode }> = [
    { key: 'insights', label: t('nav.insights', 'Insights'), icon: <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { key: 'settings', label: t('nav.settings', 'Profile'), icon: <User className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ];

  const isHomeActive = currentScreen === 'dashboard';

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, screen: ActiveScreen) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) {
      return;
    }
    e.preventDefault();
    onNavigate(screen);
  };

  return (
    <nav
      aria-label="Primary Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)]/95 backdrop-blur-md border-t border-[var(--border-color)] px-2 py-1 pb-[max(0.3rem,env(safe-area-inset-bottom))] transition-colors select-none shadow-2xl"
    >
      <div className="max-w-md mx-auto flex items-center justify-between relative px-1 h-13 sm:h-14">
        {/* Left 2 Items Symmetrically Distributed */}
        <div className="flex items-center justify-around flex-1 gap-1 min-w-0">
          {leftItems.map((item) => {
            const isActive = currentScreen === item.key;
            const cfg = SCREEN_SEO_MAP[item.key];
            return (
              <a
                key={item.key}
                href={cfg.path}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => handleLinkClick(e, item.key)}
                className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer flex-1 min-w-0 ${
                  isActive
                    ? 'text-cyan-400 font-black'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title={cfg.pageName}
              >
                <div className={`relative p-0.5 shrink-0 ${isActive ? 'text-cyan-400' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] sm:text-xs mt-0.5 tracking-tight font-extrabold break-words text-center leading-tight max-w-full">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -top-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_4px_#38bdf8]" />
                )}
              </a>
            );
          })}
        </div>

        {/* Central Anchor: Home Button */}
        <div className="relative -top-2 flex flex-col items-center justify-center px-2 shrink-0">
          <a
            href={SCREEN_SEO_MAP.dashboard.path}
            aria-current={isHomeActive ? 'page' : undefined}
            onClick={(e) => handleLinkClick(e, 'dashboard')}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex flex-col items-center justify-center transition-colors cursor-pointer nav-3d-button ${
              isHomeActive
                ? 'nav-3d-home-active text-white shadow-lg shadow-cyan-500/25'
                : 'nav-3d-home-inactive text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={SCREEN_SEO_MAP.dashboard.pageName}
          >
            <div className={`p-0.5 ${isHomeActive ? 'text-white' : 'text-cyan-400'}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
          </a>
          <span className={`text-[9px] sm:text-[10px] font-black tracking-tight mt-0.5 leading-none ${isHomeActive ? 'text-cyan-400 font-black' : 'text-[var(--text-secondary)]'}`}>
            {t('nav.home', 'Home')}
          </span>
        </div>

        {/* Right 2 Items Symmetrically Distributed */}
        <div className="flex items-center justify-around flex-1 gap-1 min-w-0">
          {rightItems.map((item) => {
            const isActive = currentScreen === item.key;
            const cfg = SCREEN_SEO_MAP[item.key];
            return (
              <a
                key={item.key}
                href={cfg.path}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => handleLinkClick(e, item.key)}
                className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer flex-1 min-w-0 ${
                  isActive
                    ? 'text-cyan-400 font-black'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title={cfg.pageName}
              >
                <div className={`relative p-0.5 shrink-0 ${isActive ? 'text-cyan-400' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] sm:text-xs mt-0.5 tracking-tight font-extrabold break-words text-center leading-tight max-w-full">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -top-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_4px_#38bdf8]" />
                )}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
