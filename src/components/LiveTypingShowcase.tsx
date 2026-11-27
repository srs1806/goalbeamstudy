import React, { useState, useEffect } from 'react';

const GOALBEAM_EDGE_HIGHLIGHTS = [
  '54 CBSE Subjects',
  '100% Free Forever',
  '7-Stage Mastery',
  'Zero Login Friction',
  'Verified PYQ & SQPs',
  'Real Study Streaks',
  '10-MCQ Quiz Sprint',
  'Official NCERT Links',
  '3D Focus Garden',
  'Local-First Privacy',
  'Smart Exam Planner',
  'Real Syllabus Ranks',
  '5:00 AM Study Alerts',
  'Auto Exam Pace Sync',
  'Live Leaderboard',
  'Fast Catch-Up Wizard',
  'Recall Flashcards',
  'Mobile & Desktop App',
  '25 Textbook Mediums',
  'Full Offline App',
  'Goalbeam AI Studio',
  'Deep Focus Mode',
  'Chapter Study Notes',
];

function pickRandomItem(pool: string[], exclude?: string): string {
  const candidates = exclude && pool.length > 1 ? pool.filter((item) => item !== exclude) : pool;
  return candidates[Math.floor(Math.random() * candidates.length)] || pool[0];
}

export const LiveTypingShowcase: React.FC = () => {
  const [prefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  });

  const [currentItem, setCurrentItem] = useState<string>(() =>
    pickRandomItem(GOALBEAM_EDGE_HIGHLIGHTS)
  );
  const [typedLength, setTypedLength] = useState<number>(() =>
    prefersReducedMotion ? currentItem.length : 0
  );
  const [phase, setPhase] = useState<'typing' | 'clearing'>('typing');

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedLength(currentItem.length);
      return;
    }

    let timer: number;

    if (phase === 'typing') {
      if (typedLength < currentItem.length) {
        const nextChar = currentItem[typedLength];
        const delay =
          typedLength === 0
            ? 140
            : nextChar === ' '
            ? 82
            : 48 + Math.floor(Math.random() * 24);

        timer = window.setTimeout(() => {
          setTypedLength((prev) => prev + 1);
        }, delay);
      } else {
        timer = window.setTimeout(() => {
          setPhase('clearing');
        }, 2000);
      }
    } else {
      if (typedLength > 0) {
        timer = window.setTimeout(() => {
          setTypedLength((prev) => Math.max(0, prev - 2));
        }, 22);
      } else {
        setCurrentItem((prev) => pickRandomItem(GOALBEAM_EDGE_HIGHLIGHTS, prev));
        setPhase('typing');
      }
    }

    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion, phase, typedLength, currentItem]);

  const handleReshuffleNow = () => {
    const next = pickRandomItem(GOALBEAM_EDGE_HIGHLIGHTS, currentItem);
    setCurrentItem(next);
    if (prefersReducedMotion) {
      setTypedLength(next.length);
    } else {
      setTypedLength(0);
      setPhase('typing');
    }
  };

  const visibleText = prefersReducedMotion ? currentItem : currentItem.slice(0, typedLength);
  const isTyping =
    !prefersReducedMotion && phase === 'typing' && typedLength < currentItem.length;

  return (
    <div
      onClick={handleReshuffleNow}
      title="Goalbeam Edge · Live typing showcase (Click to shuffle)"
      className="cursor-pointer select-none pt-0.5 min-w-0 max-w-full"
    >
      <div className="flex flex-col gap-0.5 min-w-0 max-w-full">
        <span className="font-['Outfit',system-ui,sans-serif] text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[var(--accent-primary)] leading-tight truncate">
          Goalbeam Edge
        </span>
        <div className="flex items-center min-w-0 max-w-full overflow-hidden whitespace-nowrap">
          <span className="font-['Lora',Georgia,serif] italic font-bold text-[13px] min-[400px]:text-sm sm:text-base lg:text-lg leading-snug text-[var(--text-primary)] tracking-tight truncate">
            {visibleText}
          </span>
          {!prefersReducedMotion && (
            <span
              aria-hidden="true"
              className={`inline-block shrink-0 w-[2px] h-[1em] bg-[var(--accent-primary)] ml-1 rounded-full ${
                isTyping ? 'opacity-100' : 'animate-pulse'
              }`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
