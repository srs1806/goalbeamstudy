import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { BlinkingHeart } from './BlinkingHeart';
import { YouTubeChannelButton } from './YouTubeChannelButton';
import { ThemeMode, LanguageMode } from '../types/tracker';
import { THEME_IDENTITIES, getThemeIdentity } from '../data/themesCatalog';
import { Palette, ChevronDown, Check, RotateCcw, Film, MoreHorizontal } from 'lucide-react';

interface HeaderProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode, origin?: { x: number; y: number }) => void;
  onResetTracker: () => void;
  onBrandClick: () => void;
  onOpenVideoTour?: () => void;
  currentLanguage?: LanguageMode;
  onLanguageChange?: (lang: LanguageMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onThemeChange,
  onResetTracker,
  onBrandClick,
  onOpenVideoTour,
}) => {
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isStudyMenuOpen, setIsStudyMenuOpen] = useState(false);
  const [showHeaderResetConfirm, setShowHeaderResetConfirm] = useState(false);

  const mobileThemeMenuRef = useRef<HTMLDivElement>(null);
  const desktopThemeMenuRef = useRef<HTMLDivElement>(null);
  const mobileStudyMenuRef = useRef<HTMLDivElement>(null);
  const desktopStudyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inMobileTheme = mobileThemeMenuRef.current?.contains(target);
      const inDesktopTheme = desktopThemeMenuRef.current?.contains(target);
      if (!inMobileTheme && !inDesktopTheme) {
        setIsThemeOpen(false);
      }

      const inMobileMenu = mobileStudyMenuRef.current?.contains(target);
      const inDesktopMenu = desktopStudyMenuRef.current?.contains(target);
      if (!inMobileMenu && !inDesktopMenu) {
        setIsStudyMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsThemeOpen(false);
        setIsStudyMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Pre-decode all 5 mode icons immediately so opening the menu renders every photo instantaneously
  useEffect(() => {
    THEME_IDENTITIES.forEach((theme) => {
      const img = new Image();
      img.decoding = 'sync';
      img.src = theme.imageUrl;
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {});
      }
    });
  }, []);

  const currentThemeObj = getThemeIdentity(currentTheme);

  const renderThemeDropdown = (widthClass: string, headerLabel: string) => (
    <div
      className={`absolute right-0 mt-2 ${widthClass} max-h-[70dvh] overflow-y-auto rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95`}
    >
      <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-color)] mb-1 flex items-center gap-1.5">
        <Palette className="w-3 h-3 text-[var(--accent-primary)]" />
        {headerLabel}
      </div>
      {THEME_IDENTITIES.map((theme) => {
        const isSelected = currentTheme === theme.key;
        return (
          <button
            key={theme.key}
            type="button"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX || rect.left + rect.width / 2;
              const y = e.clientY || rect.top + rect.height / 2;
              setIsThemeOpen(false);
              onThemeChange(theme.key, { x, y });
            }}
            className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              isSelected
                ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={theme.imageUrl}
                alt={theme.name}
                width={20}
                height={20}
                loading="eager"
                decoding="sync"
                className="w-5 h-5 rounded-md object-cover shrink-0 bg-slate-900"
              />
              <span className="truncate">{theme.name}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                aria-hidden="true"
                className={`w-2.5 h-2.5 rounded-full ${theme.swatchClass}`}
              />
              {isSelected && <Check className="w-3.5 h-3.5" />}
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderStudyMenuDropdown = () => (
    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 space-y-1">
      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-color)] mb-1">
        Study Tools &amp; Options
      </div>

      {onOpenVideoTour && (
        <button
          type="button"
          onClick={() => {
            setIsStudyMenuOpen(false);
            onOpenVideoTour();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 transition-colors cursor-pointer text-left"
        >
          <Film className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
          <span>Website Master Guide</span>
        </button>
      )}

      <div
        onClick={() => setIsStudyMenuOpen(false)}
        className="w-full"
      >
        <YouTubeChannelButton variant="card" className="w-full justify-center" />
      </div>

      <div className="pt-1 border-t border-[var(--border-color)]/70">
        <button
          type="button"
          onClick={() => {
            setIsStudyMenuOpen(false);
            setShowHeaderResetConfirm(true);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer text-left"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-300 shrink-0" />
          <span>Reset Tracker to Step 1</span>
        </button>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 shrink-0 w-full backdrop-blur-md bg-[var(--bg-card)]/95 border-b border-[var(--border-color)] px-2.5 sm:px-6 py-1.5 sm:py-2.5 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto">
        {/* ========================================================
            MOBILE VIEW ONLY (< md):
            Clean Brand Lockup + Compact 2-Control Utility Row (Theme + Menu)
           ======================================================== */}
        <div className="flex flex-col gap-1.5 md:hidden">
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={onBrandClick}
              className="p-0.5 cursor-pointer shrink-0 transition-opacity hover:opacity-90"
              title="GOALBEAM Official Emblem"
            >
              <Logo size="sm" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-sm" />
            </button>

            <button
              type="button"
              onClick={onBrandClick}
              className="flex flex-col items-center justify-center text-center px-1 cursor-pointer min-w-0 flex-1 transition-opacity hover:opacity-90"
              title="GOALBEAM Study Tracker - Go to Dashboard"
            >
              <div className="flex items-center gap-1 justify-center flex-wrap">
                <span className="text-sm sm:text-lg flex items-center gap-0.5 leading-none">
                  <span className="brand-wordmark">GOALBEAM</span>
                  <span className="text-amber-400 select-none">⚡</span>
                </span>
              </div>
              <div className="creator-signature flex items-center justify-center gap-1 text-[10px] mt-0.5 flex-wrap leading-none">
                <span className="creator-prefix">Made with</span>
                <BlinkingHeart size="xs" />
                <span className="creator-author text-[12px] leading-none">by Shahid Shaikh</span>
              </div>
            </button>

            <button
              type="button"
              onClick={onBrandClick}
              className="p-0.5 cursor-pointer shrink-0 transition-opacity hover:opacity-90"
              title="GOALBEAM Official Emblem"
            >
              <Logo size="sm" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-sm" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1 border-t border-[var(--border-color)]/70 w-full">
            {/* Theme Mode Selector */}
            <div className="relative shrink-0" ref={mobileThemeMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsStudyMenuOpen(false);
                  setIsThemeOpen(!isThemeOpen);
                }}
                className="group inline-flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg text-[11px] font-semibold bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] cursor-pointer transition-colors shadow-sm leading-none whitespace-nowrap"
                title="Select Theme Mode"
              >
                <img
                  src={currentThemeObj.imageUrl}
                  alt={currentThemeObj.name}
                  width={16}
                  height={16}
                  loading="eager"
                  decoding="sync"
                  className="w-4 h-4 rounded object-cover shrink-0 bg-slate-900"
                />
                <span className="font-bold">{currentThemeObj.name}</span>
                <span
                  aria-hidden="true"
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${currentThemeObj.swatchClass}`}
                />
                <ChevronDown className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
              </button>

              {isThemeOpen && renderThemeDropdown('w-44', 'Themes')}
            </div>

            {/* Consolidated Study Menu (Master Guide, YouTube, Reset) */}
            <div className="relative shrink-0" ref={mobileStudyMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsThemeOpen(false);
                  setIsStudyMenuOpen(!isStudyMenuOpen);
                }}
                className="inline-flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg text-[11px] font-bold bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] cursor-pointer transition-colors shadow-sm leading-none whitespace-nowrap"
                title="Open Guide, YouTube & Reset Options"
                aria-expanded={isStudyMenuOpen}
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                <span>Menu</span>
              </button>

              {isStudyMenuOpen && renderStudyMenuDropdown()}
            </div>
          </div>
        </div>

        {/* ========================================================
            PC / DESKTOP VIEW ONLY (md: and above):
            Clean Calm Top Bar: Brand + Theme Switcher + Single More Menu
           ======================================================== */}
        <div className="hidden md:flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={onBrandClick}
            className="flex items-center gap-3 text-left group transition-opacity hover:opacity-95 focus:outline-none min-w-0 cursor-pointer"
            title="GOALBEAM Study Tracker - Go to Dashboard"
          >
            <div className="shrink-0 p-0.5 rounded-full bg-gradient-to-tr from-cyan-500/30 to-blue-500/30 border border-cyan-500/40">
              <Logo size="md" className="w-10 h-10 lg:w-11 lg:h-11 rounded-full shadow-sm" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="text-xl lg:text-2xl group-hover:brightness-125 transition-all flex items-center gap-1 shrink-0">
                  <span className="brand-wordmark">GOALBEAM</span>
                  <span className="text-amber-400 select-none">⚡</span>
                </span>
              </div>
              <div className="creator-signature flex items-center gap-1.5 text-xs mt-0.5">
                <span className="creator-prefix">Made with</span>
                <BlinkingHeart size="xs" />
                <span className="creator-author text-[15px] leading-none">by Shahid Shaikh</span>
              </div>
            </div>
          </button>

          {/* Calm Right Controls: Theme Dropdown + Consolidated Study Menu */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative shrink-0" ref={desktopThemeMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsStudyMenuOpen(false);
                  setIsThemeOpen(!isThemeOpen);
                }}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] transition-colors cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                title="Select Theme"
              >
                <img
                  src={currentThemeObj.imageUrl}
                  alt={currentThemeObj.name}
                  width={16}
                  height={16}
                  loading="eager"
                  decoding="sync"
                  className="w-4 h-4 rounded object-cover shrink-0 bg-slate-900"
                />
                <span className="font-bold">{currentThemeObj.name}</span>
                <span
                  aria-hidden="true"
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${currentThemeObj.swatchClass}`}
                />
                <ChevronDown className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
              </button>

              {isThemeOpen && renderThemeDropdown('w-48', 'Select Theme')}
            </div>

            <div className="relative shrink-0" ref={desktopStudyMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsThemeOpen(false);
                  setIsStudyMenuOpen(!isStudyMenuOpen);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] transition-colors cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                title="Study Guide, YouTube Channel & Reset Options"
                aria-expanded={isStudyMenuOpen}
              >
                <MoreHorizontal className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                <span>Menu</span>
                <ChevronDown className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
              </button>

              {isStudyMenuOpen && renderStudyMenuDropdown()}
            </div>
          </div>
        </div>
      </div>

      {/* Header Reset Confirmation Modal */}
      {showHeaderResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[var(--bg-card)] border-2 border-rose-500/60 rounded-2xl shadow-2xl p-5 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-rose-400">
              <span className="inline-flex">
                <RotateCcw className="w-5 h-5 shrink-0 text-rose-400" />
              </span>
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                Reset Study Tracker?
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              This will clear completed milestones and return directly to <strong>Step 1</strong> of setup.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowHeaderResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowHeaderResetConfirm(false);
                  onResetTracker();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 hover:opacity-95 text-white text-xs font-extrabold cursor-pointer shadow-md"
              >
                Yes, Reset to Step 1
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
