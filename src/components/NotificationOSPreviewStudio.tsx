import React, { useEffect, useRef, useState } from 'react';
import {
  Smartphone,
  Monitor,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { MorningNotificationPayload } from '../utils/notifications';
import {
  NotificationPreviewCopy,
  buildDefaultPreviewCopy,
  renderMobileNotificationScreen,
  renderPCNotificationScreen,
} from '../utils/notificationOSMedia';

interface NotificationOSPreviewStudioProps {
  payload: MorningNotificationPayload;
}

const getPhaseLabel = (progress: number, device: 'mobile' | 'pc'): string => {
  if (progress < 0.22) {
    return device === 'mobile'
      ? 'Normal Mobile Screen (Notification closed)'
      : 'Normal PC Desktop (Notification closed)';
  }
  if (progress < 0.65) {
    return device === 'mobile'
      ? 'Scrolling down notification bar...'
      : 'Opening PC notification tray...';
  }
  return 'GOALBEAM Notification visible ✓';
};

export const NotificationOSPreviewStudio: React.FC<NotificationOSPreviewStudioProps> = ({
  payload,
}) => {
  // Automatically detect screen size: big screen -> PC view, small screen -> Mobile view
  const [device, setDevice] = useState<'mobile' | 'pc'>(() =>
    typeof window !== 'undefined' && window.innerWidth >= 768 ? 'pc' : 'mobile'
  );

  useEffect(() => {
    const handleResize = () => {
      setDevice(window.innerWidth >= 768 ? 'pc' : 'mobile');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [copy, setCopy] = useState<NotificationPreviewCopy>(() => buildDefaultPreviewCopy(payload));
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<number>(0);

  // Fetch personalized OS copy for the video frames
  useEffect(() => {
    let active = true;
    setCopy(buildDefaultPreviewCopy(payload));
    progressRef.current = 0;
    setProgress(0);
    setIsPlaying(true);

    const fetchPersonalizedCopy = async () => {
      try {
        const top = payload.sectionTargets?.[0] || null;
        const res = await fetch('/api/notification-preview/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: payload.studentName,
            reminderTime: payload.reminderTime,
            daysLeft: payload.daysLeft,
            streakCount: payload.streakCount,
            dailyStageGoal: payload.dailyStageGoal,
            overallPercent: payload.overallPercent,
            topTarget: top
              ? {
                  subjectName: top.subjectName,
                  sectionName: top.sectionName,
                  chapterPrefix: top.chapterPrefix,
                  chapterNo: top.chapterNo,
                  chapterName: top.chapterName,
                  nextStageLabel: top.nextStageLabel,
                  hexPrimary: top.hexPrimary,
                }
              : null,
          }),
        });
        const data = await res.json();
        if (active && data?.success && data.copy) {
          setCopy(data.copy);
        }
      } catch {
        // Default copy already loaded cleanly
      }
    };

    fetchPersonalizedCopy();
    return () => {
      active = false;
    };
  }, [payload]);

  // Always play animated scroll-down reveal video on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderFrame = (p: number) => {
      if (device === 'mobile') {
        renderMobileNotificationScreen(canvas, payload, copy, p);
      } else {
        renderPCNotificationScreen(canvas, payload, copy, p);
      }
    };

    let rafId = 0;
    let lastTs = performance.now();

    const step = (now: number) => {
      const dt = Math.min(80, now - lastTs);
      lastTs = now;

      if (isPlaying) {
        progressRef.current += dt / 5600;
        if (progressRef.current > 1.15) {
          progressRef.current = 0;
        }
      }
      const clamped = Math.min(1, progressRef.current);
      renderFrame(clamped);
      setProgress(clamped);
      rafId = requestAnimationFrame(step);
    };

    renderFrame(Math.min(1, progressRef.current));
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, device, payload, copy]);

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
      {/* Compact Device Video Title Bar */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {device === 'pc' ? (
            <Monitor className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
          )}
          <span className="text-xs font-black text-[var(--text-primary)] truncate">
            {device === 'pc'
              ? 'PC Desktop Video Preview (No Website Open)'
              : 'Mobile Screen Video Preview (No Website Open)'}
          </span>
        </div>
      </div>

      {/* Fitted Viewport Video Container — automatically sized so ZERO scrolling is needed */}
      <div className="keep-dark-surface flex-1 min-h-0 rounded-xl bg-slate-950 border border-[var(--border-color)] p-2 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`max-h-full max-w-full rounded-lg object-contain shadow-xl ${
            device === 'pc' ? 'aspect-video' : 'aspect-[9/16]'
          }`}
        />
      </div>

      {/* Compact Video Playback & Phase Bar */}
      <div className="shrink-0 flex items-center gap-2.5 px-1">
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[11px] font-bold text-[var(--text-primary)] flex items-center gap-1 cursor-pointer shrink-0"
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            progressRef.current = 0;
            setProgress(0);
            setIsPlaying(true);
          }}
          className="px-2 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1 cursor-pointer shrink-0"
          title="Replay scroll animation"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-cyan-300 truncate">
            {getPhaseLabel(progress, device)}
          </span>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-75"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
