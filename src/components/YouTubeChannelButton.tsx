import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Youtube, CheckCircle2, ExternalLink, Lock, X, ShieldCheck } from 'lucide-react';

export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@TrendzOfShahid';
export const YOUTUBE_SUB_CONFIRM_URL = 'https://www.youtube.com/@TrendzOfShahid?sub_confirmation=1';
const YT_SUB_STORAGE_KEY = 'aura_yt_subscribed_trendzofshahid';

interface YouTubeChannelButtonProps {
  variant?: 'footer' | 'card' | 'guide' | 'header';
  compact?: boolean;
  className?: string;
}

export const YouTubeChannelButton: React.FC<YouTubeChannelButtonProps> = ({
  variant = 'footer',
  compact = false,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasOpenedConfirmLink, setHasOpenedConfirmLink] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(YT_SUB_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const syncStatus = () => {
      try {
        setIsSubscribed(localStorage.getItem(YT_SUB_STORAGE_KEY) === 'true');
      } catch {
        // ignore storage errors
      }
    };
    window.addEventListener('aura:yt-sub-updated', syncStatus);
    return () => window.removeEventListener('aura:yt-sub-updated', syncStatus);
  }, []);

  const handleTriggerClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmSubscription = () => {
    if (!hasOpenedConfirmLink) return;
    try {
      localStorage.setItem(YT_SUB_STORAGE_KEY, 'true');
    } catch {
      // ignore storage errors
    }
    setIsSubscribed(true);
    window.dispatchEvent(new CustomEvent('aura:yt-sub-updated'));
    setIsModalOpen(false);
  };

  const modalContent =
    isModalOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="yt-subscribe-modal-title"
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl overflow-hidden text-[var(--text-primary)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between gap-3 bg-gradient-to-r from-rose-500/15 via-[var(--bg-elevated)] to-[var(--bg-card)]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3
                      id="yt-subscribe-modal-title"
                      className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate"
                    >
                      @TrendzOfShahid on YouTube
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Official Creator Channel · Subscribe Confirmation
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close YouTube confirmation dialog"
                  className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  To visit <strong className="text-[var(--text-primary)]">@TrendzOfShahid</strong>, open the official YouTube subscription confirmation link below and confirm your subscription.
                </p>

                {/* Step 1: Mandatory Confirmation Link (?sub_confirmation=1) */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                    <span>Step 1 · Compulsory Subscribe Link</span>
                    {hasOpenedConfirmLink && (
                      <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Link opened
                      </span>
                    )}
                  </div>

                  <a
                    href={YOUTUBE_SUB_CONFIRM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setHasOpenedConfirmLink(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
                  >
                    <Youtube className="w-4 h-4 shrink-0" />
                    <span>Open &amp; Subscribe to @TrendzOfShahid</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-90" />
                  </a>
                  <p className="text-[11px] text-[var(--text-muted)] text-center font-mono break-all">
                    youtube.com/@TrendzOfShahid?sub_confirmation=1
                  </p>
                </div>

                {/* Step 2: Compulsory Confirmation Action */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                    {hasOpenedConfirmLink ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span>
                      {hasOpenedConfirmLink
                        ? 'Step 2 · Confirm your channel subscription'
                        : 'Step 2 unlocks after clicking the Subscribe link above'}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!hasOpenedConfirmLink}
                    onClick={handleConfirmSubscription}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors ${
                      hasOpenedConfirmLink
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-md'
                        : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-color)] cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      {isSubscribed
                        ? 'Subscription Confirmed · Keep Watching'
                        : 'I Confirm I Subscribed to @TrendzOfShahid'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  if (variant === 'card') {
    return (
      <>
        <button
          type="button"
          onClick={handleTriggerClick}
          className={`w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-red-500/70 text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${className}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-red-600 text-white shrink-0">
              <Youtube className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                YouTube · @TrendzOfShahid
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">
                {isSubscribed
                  ? 'Subscribed · Study strategies & updates'
                  : 'Click to subscribe compulsorily & open channel'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-red-600/15 text-red-400 border border-red-500/30 text-[11px] font-bold shrink-0 whitespace-nowrap flex items-center gap-1">
            {isSubscribed ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Subscribed</span>
              </>
            ) : (
              <span>Subscribe</span>
            )}
          </span>
        </button>
        {modalContent}
      </>
    );
  }

  if (variant === 'header') {
    return (
      <>
        <button
          type="button"
          onClick={handleTriggerClick}
          className={`inline-flex items-center justify-center gap-1 rounded-lg font-extrabold cursor-pointer transition-colors whitespace-nowrap shrink-0 leading-none shadow-sm ${
            compact
              ? 'py-1 px-2 text-[10px]'
              : 'px-2.5 py-1.5 text-xs'
          } ${
            isSubscribed
              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300'
              : 'bg-red-600 hover:bg-red-500 border border-red-400/60 text-white'
          } ${className}`}
          title={isSubscribed ? 'Subscribed to @TrendzOfShahid' : 'Subscribe to @TrendzOfShahid on YouTube'}
        >
          <Youtube className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} shrink-0`} />
          <span>{isSubscribed ? 'Subscribed ✓' : 'Subscribe'}</span>
        </button>
        {modalContent}
      </>
    );
  }

  if (variant === 'guide') {
    return (
      <>
        <button
          type="button"
          onClick={handleTriggerClick}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all whitespace-nowrap shrink-0 ${
            isSubscribed
              ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-300'
              : 'bg-red-600 hover:bg-red-500 text-white'
          } ${className}`}
          title="Subscribe on YouTube"
        >
          <Youtube className="w-3.5 h-3.5 shrink-0" />
          <span>{isSubscribed ? 'Subscribed ✓' : 'Subscribe'}</span>
        </button>
        {modalContent}
      </>
    );
  }

  // Default 'footer' variant
  return (
    <>
      <button
        type="button"
        onClick={handleTriggerClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
          isSubscribed
            ? 'bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-emerald-300'
            : 'bg-red-600 hover:bg-red-500 border border-red-400/50 text-white'
        } ${className}`}
        title="Visit @TrendzOfShahid on YouTube (Subscribe Confirmation)"
      >
        <Youtube className="w-3.5 h-3.5 shrink-0" />
        <span>{isSubscribed ? 'Subscribed ✓' : 'Subscribe'}</span>
      </button>
      {modalContent}
    </>
  );
};
