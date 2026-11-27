import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { BlinkingHeart } from './BlinkingHeart';
import { YouTubeChannelButton } from './YouTubeChannelButton';
import { ThemeMode, LanguageMode } from '../types/tracker';
import { THEME_IDENTITIES, getThemeIdentity } from '../data/themesCatalog';
import { Palette, ChevronDown, Check, RotateCcw, Film } from 'lucide-react';

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
  const [showHeaderResetConfirm, setShowHeaderResetConfirm] = useState(false);
  const mobileThemeMenuRef = useRef<HTMLDivElement>(null);
  const desktopThemeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inMobileTheme = mobileThemeMenuRef.current?.contains(target);
      const inDesktopTheme = desktopThemeMenuRef.current?.contains(target);
      if (!inMobileTheme && !inDesktopTheme) {
        setIsThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  return (
    <header className="sticky top-0 z-50 shrink-0 w-full backdrop-blur-md bg-[var(--bg-card)]/95 border-b border-[var(--border-color)] px-2.5 sm:px-6 py-1.5 sm:py-2.5 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto">
        {/* ========================================================
            MOBILE VIEW ONLY (< md):
            Section 1: GOALBEAM ⚡ pinned brand name with logo on both sides
            Section 2: Dedicated controls below name: Guide, Reset, Theme, Profile
           ======================================================== */}
        <div className="flex flex-col gap-1.5 md:hidden">
          {/* Section 1: Mobile Centered Brand with GOALBEAM ⚡ and Logo */}
          <div className="flex items-center justify-between w-full">
            {/* Left Flank Logo */}
            <button
              type="button"
              onClick={onBrandClick}
              className="p-0.5 cursor-pointer shrink-0 transition-opacity hover:opacity-90"
              title="GOALBEAM Official Emblem"
            >
              <Logo size="sm" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-sm" />
            </button>

            {/* Center: Pinned GOALBEAM ⚡ Website Name & Made with love arranged under website name */}
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
              {/* Made with love arranged under website name in distinct signature font & color */}
              <div className="creator-signature flex items-center justify-center gap-1 text-[10px] mt-0.5 flex-wrap leading-none">
                <span className="creator-prefix">Made with</span>
                <BlinkingHeart size="xs" />
                <span className="creator-author text-[12px] leading-none">by Shahid Shaikh</span>
              </div>
            </button>

            {/* Right Flank Logo */}
            <button
              type="button"
              onClick={onBrandClick}
              className="p-0.5 cursor-pointer shrink-0 transition-opacity hover:opacity-90"
              title="GOALBEAM Official Emblem"
            >
              <Logo size="sm" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-sm" />
            </button>
          </div>

          {/* Section 2: Mobile Action Controls Row (Guide, Subscribe, Reset Tracker, Theme, Profile) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 border-t border-[var(--border-color)]/70 w-full">
            {onOpenVideoTour && (
              <button
                type="button"
                onClick={onOpenVideoTour}
                className="inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 transition-colors shrink-0 cursor-pointer shadow-sm leading-none whitespace-nowrap"
                title="Open Master Video Guide"
              >
                <Film className="w-3 h-3 text-cyan-300 shrink-0" />
                <span>Guide</span>
              </button>
            )}

            <YouTubeChannelButton variant="header" compact />

            {/* Reset Tracker Button */}
            <button
              type="button"
              onClick={() => setShowHeaderResetConfirm(true)}
              className="group inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[10px] font-extrabold bg-gradient-to-r from-rose-500/25 via-red-500/20 to-orange-500/20 border border-rose-500/50 text-rose-300 hover:from-rose-500/35 hover:to-orange-500/30 transition-colors shrink-0 cursor-pointer shadow-sm leading-none whitespace-nowrap"
              title="Reset Study Tracker to Step 1"
            >
              <span className="shrink-0">
                <RotateCcw className="w-3 h-3 text-rose-300" />
              </span>
              <span>Reset</span>
            </button>

            {/* Theme Mode Selector */}
            <div className="relative shrink-0" ref={mobileThemeMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsThemeOpen(!isThemeOpen)}
                  className="group inline-flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[10px] font-semibold bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] cursor-pointer transition-colors shadow-sm leading-none whitespace-nowrap"
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
                </button>

                {isThemeOpen && (
                  <div className="absolute right-0 mt-2 w-44 max-h-[65dvh] overflow-y-auto rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-1.5 z-50 animate-in fade-in">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-color)] mb-1 flex items-center gap-1.5">
                      <Palette className="w-3 h-3 text-[var(--accent-primary)]" />
                      Themes
                    </div>
                    {THEME_IDENTITIES.map((theme) => {
                      const isSelected = currentTheme === theme.key;
                      return (
                        <button
                          key={theme.key}
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
                )}
              </div>
          </div>
        </div>

        {/* ========================================================
            PC / DESKTOP VIEW ONLY (md: and above):
            Pinned GOALBEAM ⚡ Brand Name + Scholar Greeting & Good Thought on Left
            Made with love by Shahid Shaikh beside Reset Tracker + Theme + Profile on Right
           ======================================================== */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Pinned Website Name: GOALBEAM ⚡ with Made with love under website name in small font */}
          <button
            onClick={onBrandClick}
            className="flex items-center gap-3 text-left group transition-opacity hover:opacity-95 focus:outline-none min-w-0 cursor-pointer"
            title="GOALBEAM Study Tracker - Go to Dashboard"
          >
            <div className="shrink-0 p-0.5 rounded-full bg-gradient-to-tr from-cyan-500/30 to-blue-500/30 border border-cyan-500/40">
              <Logo size="md" className="w-10 h-10 lg:w-11 lg:h-11 rounded-full shadow-sm" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              {/* Permanent Pinned Brand: GOALBEAM ⚡ */}
              <div className="flex items-center gap-2">
                <span className="text-xl lg:text-2xl group-hover:brightness-125 transition-all flex items-center gap-1 shrink-0">
                  <span className="brand-wordmark">GOALBEAM</span>
                  <span className="text-amber-400 select-none">⚡</span>
                </span>
              </div>
              {/* Made with love by Shahid Shaikh arranged under website name in distinct font & color */}
              <div className="creator-signature flex items-center gap-1.5 text-xs mt-0.5">
                <span className="creator-prefix">Made with</span>
                <BlinkingHeart size="xs" />
                <span className="creator-author text-[15px] leading-none">by Shahid Shaikh</span>
              </div>
            </div>
          </button>

          {/* Action Controls: Guide, Subscribe, Reset Tracker, Theme, Profile */}
          <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
            {onOpenVideoTour && (
              <button
                type="button"
                onClick={onOpenVideoTour}
                className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 transition-colors cursor-pointer shrink-0 shadow-sm whitespace-nowrap"
                title="Open Master Video Guide"
              >
                <Film className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span>Guide</span>
              </button>
            )}

            <YouTubeChannelButton variant="header" />

            {/* Permanent Reset Tracker Button */}
            <button
              type="button"
              onClick={() => setShowHeaderResetConfirm(true)}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold bg-gradient-to-r from-rose-500/25 via-red-500/20 to-orange-500/20 border border-rose-500/50 text-rose-300 hover:from-rose-500/35 hover:to-orange-500/30 transition-colors cursor-pointer shrink-0 shadow-sm whitespace-nowrap"
              title="Reset Study Tracker to Step 1"
            >
              <span className="inline-flex">
                <RotateCcw className="w-3.5 h-3.5 text-rose-300" />
              </span>
              <span>Reset Tracker</span>
            </button>

            {/* Theme Dropdown */}
            <div className="relative shrink-0" ref={desktopThemeMenuRef}>
              <button
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] transition-colors cursor-pointer shadow-sm whitespace-nowrap shrink-0"
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

              {isThemeOpen && (
                <div className="absolute right-0 mt-2 w-48 max-h-[70dvh] overflow-y-auto rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-color)] mb-1 flex items-center gap-1.5">
                    <Palette className="w-3 h-3 text-[var(--accent-primary)]" />
                    Select Theme
                  </div>
                  {THEME_IDENTITIES.map((theme) => {
                    const isSelected = currentTheme === theme.key;
                    return (
                      <button
                        key={theme.key}
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
              )}
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
