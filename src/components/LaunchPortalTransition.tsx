import React, { useEffect, useState, useRef } from 'react';
import { BlinkingHeart } from './BlinkingHeart';
import { Zap } from 'lucide-react';
import logoImg256 from '../assets/logo-256.png';
import { playSoftStartupChime } from '../utils/audio';
import { preloadAllWorkspacePages } from '../utils/pagePreloader';

export type LaunchTransitionMode = 'welcome-launch' | 'onboarding-complete' | 'tour-complete';

interface LaunchPortalTransitionProps {
  mode: LaunchTransitionMode;
  studentName?: string;
  targetPercentage?: number;
  firstPaperDate?: string;
  streakDays?: number;
  selectedSubjectsCount?: number;
  onComplete: () => void;
  autoDurationMs?: number;
}

export const LaunchPortalTransition: React.FC<LaunchPortalTransitionProps> = ({
  mode,
  studentName = 'Student',
  targetPercentage = 95,
  onComplete,
}) => {
  // Choreographed entrance while all app views preload in real time:
  // 1: Emblem appears & real preloading starts immediately
  // 2: Brand wordmark strikes in
  // 3: Pink light aura bursts
  // 4: Neon circles frame the emblem
  // 5: Creator signature & target line
  // 6: Progress bar tracks authentic module preloading to 100%
  const [animStage, setAnimStage] = useState<number>(1);
  const [loadingProgress, setLoadingProgress] = useState<number>(5);
  const [statusText, setStatusText] = useState<string>('Initializing CBSE Class 10 Workspace...');
  const [isFlippingOut, setIsFlippingOut] = useState<boolean>(false);
  const [logoSrc, setLogoSrc] = useState<string>(logoImg256);
  const isTerminatedRef = useRef<boolean>(false);
  const entranceDoneRef = useRef<boolean>(false);
  const preloadDoneRef = useRef<boolean>(false);

  const tryFinishTransition = () => {
    if (isTerminatedRef.current) return;
    if (entranceDoneRef.current && preloadDoneRef.current) {
      setTimeout(() => {
        handleFlipExit();
      }, 280);
    }
  };

  useEffect(() => {
    const t2 = setTimeout(() => {
      if (!isTerminatedRef.current) setAnimStage(2);
    }, 320);

    const t3 = setTimeout(() => {
      if (!isTerminatedRef.current) setAnimStage(3);
    }, 650);

    const t4 = setTimeout(() => {
      if (!isTerminatedRef.current) setAnimStage(4);
    }, 980);

    const t5 = setTimeout(() => {
      if (!isTerminatedRef.current) setAnimStage(5);
    }, 1250);

    const t6 = setTimeout(() => {
      if (!isTerminatedRef.current) {
        setAnimStage(6);
      }
    }, 1450);

    // Minimum crisp visual beat so the bar & rings are readable even on cached instant loads
    const tMinReady = setTimeout(() => {
      entranceDoneRef.current = true;
      tryFinishTransition();
    }, 2050);

    // Real parallel preloading of ALL 11 workspace views + fonts right from mount
    void preloadAllWorkspacePages((update) => {
      if (isTerminatedRef.current) return;
      setLoadingProgress((prev) => Math.max(prev, update.percent));
      setStatusText(update.label);
      if (update.loaded >= update.total) {
        preloadDoneRef.current = true;
        setLoadingProgress(100);
        setStatusText(`All Pages Ready! Entering Matrix (${targetPercentage}% Target) 🚀`);
        tryFinishTransition();
      }
    }).then(() => {
      if (isTerminatedRef.current) return;
      preloadDoneRef.current = true;
      setLoadingProgress(100);
      setStatusText(`All Pages Ready! Entering Matrix (${targetPercentage}% Target) 🚀`);
      tryFinishTransition();
    });

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(tMinReady);
    };
  }, [targetPercentage]);

  const handleFlipExit = () => {
    if (isTerminatedRef.current) return;
    isTerminatedRef.current = true;
    playSoftStartupChime();
    setIsFlippingOut(true);
    setTimeout(() => {
      onComplete();
    }, 550);
  };

  const handleLogoError = () => {
    if (logoSrc !== logoImg256) {
      setLogoSrc(logoImg256);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="GOALBEAM Launch Portal"
      className={`keep-dark-surface fixed inset-0 z-[99999] flex flex-col items-center justify-center p-3 sm:p-6 bg-slate-950/98 select-none transition-all overflow-x-hidden overflow-y-auto ${
        isFlippingOut ? 'portal-exit-flip' : 'opacity-100'
      }`}
      style={{ perspective: '1200px' }}
    >
      {/* Dynamic Cosmic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-gradient-to-tr from-cyan-600/15 via-pink-600/10 to-amber-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Center Cinematic Composition Container */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center text-center space-y-4 sm:space-y-5 my-auto px-2 py-4">
        <div className="relative flex items-center justify-center shrink-0 my-3 sm:my-4">
          {animStage >= 3 && (
            <div
              className="absolute -inset-7 sm:-inset-9 rounded-full bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-rose-500 pink-light-aura pointer-events-none"
              style={{ zIndex: 0 }}
            />
          )}

          {animStage >= 4 && (
            <>
              <div
                className="absolute -inset-5 sm:-inset-6 rounded-full border-2 border-dashed border-amber-400/80 animate-spin pointer-events-none shadow-[0_0_16px_rgba(245,158,11,0.6)]"
                style={{ animationDuration: '20s', zIndex: 1 }}
              />
              <div
                className="absolute -inset-2.5 sm:-inset-3 rounded-full border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.85)] animate-pulse pointer-events-none"
                style={{ zIndex: 1 }}
              />
            </>
          )}

          {/* Emblem Logo with object-contain + padding so zero edge clipping occurs */}
          <div
            className={`relative rounded-full overflow-hidden p-1.5 sm:p-2 border-2 border-cyan-400/90 shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-500 bg-slate-950 ${
              animStage >= 1
                ? 'panther-entrance opacity-100 scale-100'
                : 'opacity-0 scale-50'
            }`}
            style={{ zIndex: 2 }}
          >
            <img
              src={logoSrc}
              alt="GOALBEAM Official Emblem"
              loading="eager"
              decoding="async"
              className="w-[clamp(7.5rem,36vmin,12rem)] h-[clamp(7.5rem,36vmin,12rem)] aspect-square object-contain select-none block pointer-events-none rounded-full"
              onError={handleLogoError}
            />
          </div>
        </div>

        {/* ========================================================
            CHOREOGRAPHED ELEMENT 2:
            - TEXT ("GOALBEAM ⚡" Brand Identity)
           ======================================================== */}
        <div 
          className={`transition-all duration-700 transform ${
            animStage >= 2 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
          }`}
        >
          <h1 className="text-2xl sm:text-4xl mt-1 flex items-center justify-center gap-1.5 drop-shadow-[0_0_18px_rgba(6,182,212,0.5)]">
            <span className="brand-wordmark brand-wordmark-on-dark">GOALBEAM</span>
            <span className="text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] select-none">⚡</span>
          </h1>
        </div>

        {/* ========================================================
            CHOREOGRAPHED ELEMENT 5:
            - CREATOR NAME ("Made with ❤️ by Shahid Shaikh")
            - WEBSITE NAME & WELCOME TARGET
           ======================================================== */}
        <div 
          className={`transition-all duration-700 transform space-y-1.5 ${
            animStage >= 5 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-rose-500/30 shadow-lg">
            <span className="creator-signature text-xs sm:text-sm flex items-center gap-1.5">
              <span className="creator-prefix !text-rose-300">Made with</span>
              <BlinkingHeart size="xs" />
              <span className="creator-author creator-author-on-dark text-base sm:text-lg leading-none">by Shahid Shaikh</span>
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
            {mode === 'onboarding-complete'
              ? `Welcome aboard, ${studentName}! Syllabus calibrated.`
              : mode === 'tour-complete'
              ? `Mastery confirmed for ${studentName}! Ready to conquer boards.`
              : `Welcome back, ${studentName}! Board Target: ${targetPercentage}%`}
          </p>
        </div>

        {/* ========================================================
            CHOREOGRAPHED ELEMENT 6:
            - ALWAYS VISIBLE REAL LOADING PROGRESS BAR (Fills to 100%)
           ======================================================== */}
        <div
          className="w-full transition-all duration-500 space-y-1.5 opacity-100 translate-y-0"
        >
          <div className="flex items-center justify-between text-[11px] px-1">
            <span className="font-semibold text-cyan-300 truncate max-w-[80%] flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400 shrink-0 animate-pulse" />
              <span className="truncate">{statusText}</span>
            </span>
            <span className="font-mono font-black text-amber-400 shrink-0">
              {loadingProgress}%
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-900/90 overflow-hidden border border-cyan-500/40 p-0.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-cyan-400 to-amber-400 transition-all duration-75 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
