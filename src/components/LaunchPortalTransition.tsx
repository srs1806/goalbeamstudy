import React, { useEffect, useState, useRef } from 'react';
import { BlinkingHeart } from './BlinkingHeart';
import { Sparkles, Zap } from 'lucide-react';
import logoImg256 from '../assets/logo-256.png';

import { playSoftStartupChime } from '../utils/audio';

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
  firstPaperDate = '15/02/2027',
  streakDays = 0,
  selectedSubjectsCount = 5,
  onComplete,
  autoDurationMs = 3800,
}) => {
  // Choreographed animation stage:
  // 1: Animal Panther appears
  // 2: Text "GOALBEAM ⚡" strikes
  // 3: Pink light aura bursts
  // 4: Neon Circle frames the emblem
  // 5: Name "Made with ❤️ by Shahid Shaikh" & Website title
  // 6: Loading bar begins filling to 100%
  // 7: 3D Flip exit to website
  const [animStage, setAnimStage] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Awakening Beast Core...');
  const [isFlippingOut, setIsFlippingOut] = useState<boolean>(false);
  const [logoSrc, setLogoSrc] = useState<string>(logoImg256);
  const isTerminatedRef = useRef<boolean>(false);

  useEffect(() => {
    // Stage 1: Panther emerges
    const t1 = setTimeout(() => {
      if (!isTerminatedRef.current) setAnimStage(1);
    }, 200);

    // Stage 2: Text strikes in
    const t2 = setTimeout(() => {
      if (!isTerminatedRef.current) setAnimStage(2);
    }, 1200);

    // Stage 3: Pink light aura bursts
    const t3 = setTimeout(() => {
      if (!isTerminatedRef.current) setAnimStage(3);
    }, 2400);

    // Stage 4: Circle locks in
    const t4 = setTimeout(() => {
      if (!isTerminatedRef.current) setAnimStage(4);
    }, 3600);

    // Stage 5: Name & Website name appear
    const t5 = setTimeout(() => {
      if (!isTerminatedRef.current) setAnimStage(5);
    }, 4800);

    // Stage 6: Loading bar starts filling
    const t6 = setTimeout(() => {
      if (!isTerminatedRef.current) setAnimStage(6);
    }, 5800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  // Smooth loading bar progress & milestone messages
  useEffect(() => {
    if (animStage < 6) return;

    const start = Date.now();
    const duration = 2800; // deliberate 2.8s authentic loading

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setLoadingProgress(pct);

      if (pct < 25) {
        setStatusText('Calibrating Enrolled CBSE Subjects & Syllabus...');
      } else if (pct < 55) {
        setStatusText('Aligning 7-Stage Mastery Matrix (NCERT • Ref • PYQ)...');
      } else if (pct < 85) {
        setStatusText('Synchronizing 5:00 AM Streak Rollover & Timers...');
      } else {
        setStatusText(`Ready! Launching CBSE Matrix (${targetPercentage}% Target) 🚀`);
      }

      if (pct >= 100) {
        clearInterval(interval);
        // Stage 7: Trigger 3D flip exit automatically to enter website
        setTimeout(() => {
          handleFlipExit();
        }, 400);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [animStage, targetPercentage]);

  const handleFlipExit = () => {
    if (isTerminatedRef.current) return;
    isTerminatedRef.current = true;
    playSoftStartupChime();
    setIsFlippingOut(true);
    setTimeout(() => {
      onComplete();
    }, 600); // match 3D flip duration
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
      className={`keep-dark-surface fixed inset-0 z-[99999] flex flex-col items-center justify-center p-3 sm:p-6 bg-slate-950/98 select-none transition-all overflow-hidden ${
        isFlippingOut ? 'portal-exit-flip' : 'opacity-100'
      }`}
      style={{ perspective: '1200px' }}
    >
      {/* Dynamic Cosmic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Ambient Dark Nebula */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-gradient-to-tr from-cyan-600/15 via-pink-600/10 to-amber-600/15 rounded-full blur-3xl animate-pulse" />
        
        {/* Floating cyber particles */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Center Cinematic Composition Container: Centered vertically on ALL screens */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md flex flex-col items-center text-center space-y-3 sm:space-y-4 my-auto px-2">
        {/* ========================================================
            CHOREOGRAPHED ELEMENT 1, 3, 4:
            - PANTHER EMBLEM (Step 1)
            - PINK LIGHT AURA (Step 3)
            - NEON CIRCLE (Step 4)
           ======================================================== */}
        <div className="relative flex items-center justify-center shrink-0">
          {/* STEP 3: That Pink Light (Bursting magenta aura behind panther) */}
          {animStage >= 3 && (
            <div 
              className="absolute -inset-6 sm:-inset-8 rounded-full bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-rose-500 pink-light-aura pointer-events-none"
              style={{ zIndex: 0 }}
            />
          )}

          {/* STEP 4: That Circle (Concentric rotating cybernetic and orbital neon rings) */}
          {animStage >= 4 && (
            <>
              {/* Outer dashed spinning golden-cyan ring */}
              <div 
                className="absolute -inset-4 sm:-inset-5 rounded-full border-2 border-dashed border-amber-400/80 animate-spin pointer-events-none shadow-[0_0_16px_rgba(245,158,11,0.6)]"
                style={{ animationDuration: '20s', zIndex: 1 }}
              />
              {/* Inner glowing electric cyan ring */}
              <div 
                className="absolute -inset-2 sm:-inset-2.5 rounded-full border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.85)] animate-pulse pointer-events-none"
                style={{ zIndex: 1 }}
              />
            </>
          )}

          {/* STEP 1: That Animal Panther Logo (Full Screen high definition emblem) */}
          <div 
            className={`relative rounded-full overflow-hidden border-2 border-cyan-400/90 shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-700 bg-slate-900 ${
              animStage >= 1 
                ? 'panther-entrance opacity-100 scale-100' 
                : 'opacity-0 scale-50'
            }`}
            style={{ zIndex: 2 }}
          >
            <img
              src={logoSrc}
              alt="GOALBEAM Panther Emblem"
              loading="eager"
              decoding="async"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-cover select-none block pointer-events-none rounded-full"
              style={{ 
                imageRendering: 'auto',
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
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
            - ALWAYS VISIBLE LOADING PROGRESS BAR (Fills to 100%)
           ======================================================== */}
        <div 
          className={`w-full transition-all duration-700 space-y-1.5 transform ${
            animStage >= 6 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
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
