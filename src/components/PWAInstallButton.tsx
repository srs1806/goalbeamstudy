import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Download,
  Smartphone,
  Monitor,
  CheckCircle2,
  X,
  Share,
  Wifi,
  HardDriveDownload,
  MoreVertical,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header-mobile' | 'header-desktop' | 'banner' | 'card' | 'footer';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'banner',
  className = '',
}) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isMobile,
    isInIframe,
    offlineReady,
    isPreparingOffline,
    install,
    prepareOfflineEverything,
  } = usePWAInstall();

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [offlineFeedback, setOfflineFeedback] = useState<string | null>(null);

  const handleActionClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    setShowGuideModal(true);
  };

  const handlePrepareOffline = async () => {
    const ok = await prepareOfflineEverything();
    setOfflineFeedback(
      ok
        ? 'Offline bundle cached! Your chapters, focus garden, quizzes & tracker work offline.'
        : 'Saved locally. Open once outside preview to finish full offline caching.'
    );
  };

  // Hide header/footer triggers when already launched as an installed standalone app
  if (isInstalled && variant !== 'card' && variant !== 'banner') {
    return null;
  }

  const modalNode =
    showGuideModal && typeof document !== 'undefined'
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-modal-title"
            className="fixed inset-0 z-[1050] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setShowGuideModal(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl overflow-hidden text-[var(--text-primary)] animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3
                      id="pwa-install-modal-title"
                      className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] truncate"
                    >
                      Install <span className="brand-wordmark">GOALBEAM</span> App
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate">
                      Add to Home Screen &amp; Desktop · Works Offline
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  aria-label="Close install dialog"
                  className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 space-y-3.5 text-xs">
                {isInstallable && (
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await install();
                      if (ok) setShowGuideModal(false);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-opacity"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Install GOALBEAM Now (1-Tap App Setup)</span>
                  </button>
                )}

                {isInIframe && !isInstallable && (
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 leading-relaxed font-medium">
                    Open Goalbeam directly in its own browser tab (Chrome, Edge, or Safari) so your device shows the native <strong>Install / Add to Home Screen</strong> prompt.
                  </div>
                )}

                {isIOS ? (
                  <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2">
                    <div className="flex items-center gap-2 font-extrabold text-[var(--text-primary)]">
                      <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>iPhone &amp; iPad (Safari)</span>
                    </div>
                    <ol className="space-y-1.5 text-[var(--text-secondary)] list-decimal pl-4 leading-relaxed">
                      <li>
                        Tap the <strong className="inline-flex items-center gap-1 text-[var(--text-primary)]"><Share className="w-3 h-3 text-cyan-400" /> Share</strong> button in Safari&apos;s toolbar.
                      </li>
                      <li>
                        Scroll down and tap <strong className="text-[var(--text-primary)]">Add to Home Screen</strong>.
                      </li>
                      <li>
                        Tap <strong className="text-[var(--text-primary)]">Add</strong> — Goalbeam launches as a full-screen offline app from your home screen.
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {isMobile ? (
                      <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2">
                        <div className="flex items-center gap-2 font-extrabold text-[var(--text-primary)]">
                          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Android Phone / Tablet (Chrome or Edge)</span>
                        </div>
                        <ol className="space-y-1.5 text-[var(--text-secondary)] list-decimal pl-4 leading-relaxed">
                          <li>
                            Tap the browser menu <strong className="inline-flex items-center text-[var(--text-primary)]"><MoreVertical className="w-3 h-3" /> (3 dots)</strong> at top-right.
                          </li>
                          <li>
                            Tap <strong className="text-[var(--text-primary)]">Add to Home screen</strong> → <strong className="text-[var(--text-primary)]">Install app</strong>.
                          </li>
                          <li>
                            The Goalbeam icon appears on your Home Screen and launches standalone!
                          </li>
                        </ol>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2">
                        <div className="flex items-center gap-2 font-extrabold text-[var(--text-primary)]">
                          <Monitor className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>Desktop &amp; Laptop (Chrome / Edge / Brave)</span>
                        </div>
                        <ol className="space-y-1.5 text-[var(--text-secondary)] list-decimal pl-4 leading-relaxed">
                          <li>
                            Click the <strong className="text-[var(--text-primary)]">Install (⊕ / Monitor)</strong> icon on the right side of the browser address bar, or open <strong className="text-[var(--text-primary)]">⋮ Menu → Cast, save, and share → Install page as app</strong>.
                          </li>
                          <li>
                            Click <strong className="text-[var(--text-primary)]">Install</strong> to pin Goalbeam to your Desktop, Start Menu, or Dock as a standalone app.
                          </li>
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {/* Offline-Everything Verification Control */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-emerald-500/35 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-300">
                      <Wifi className="w-4 h-4 shrink-0" />
                      <span>Full Offline Study Package</span>
                    </div>
                    {offlineReady && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold">
                        <CheckCircle2 className="w-3 h-3" />
                        Ready
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Once downloaded or cached, all 54 subjects, chapter trackers, timetables, 10-MCQ bank &amp; 3D Focus Garden run offline with zero internet required.
                  </p>
                  <button
                    type="button"
                    onClick={handlePrepareOffline}
                    disabled={isPreparingOffline}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/45 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60"
                  >
                    <HardDriveDownload className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {isPreparingOffline
                        ? 'Downloading Offline Assets...'
                        : offlineReady
                        ? 'Refresh Offline Cache'
                        : 'Download App Files for Offline Use'}
                    </span>
                  </button>
                  {offlineFeedback && (
                    <p className="text-[11px] text-emerald-300 font-semibold leading-snug">
                      {offlineFeedback}
                    </p>
                  )}
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
          onClick={isInstalled ? handlePrepareOffline : handleActionClick}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-emerald-400 text-left cursor-pointer transition-colors flex items-center justify-between gap-2.5 ${className}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              {isInstalled ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                {isInstalled ? 'Installed as Offline App' : 'Download App (Mobile & Desktop)'}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">
                {isInstalled
                  ? isPreparingOffline
                    ? 'Refreshing offline cache...'
                    : offlineReady
                    ? 'Offline everything active · Tap to refresh cache'
                    : 'Running standalone · Tap to sync offline cache'
                  : 'Add to Home Screen or Desktop & study offline'}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 whitespace-nowrap shrink-0 flex items-center gap-1">
            {isInstalled ? (
              <>
                <Sparkles className="w-3 h-3" />
                <span>Sync</span>
              </>
            ) : isInstallable ? (
              'Install'
            ) : (
              'Get App'
            )}
          </span>
        </button>
        {modalNode}
      </>
    );
  }

  if (variant === 'footer') {
    return (
      <>
        <button
          type="button"
          onClick={handleActionClick}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold cursor-pointer transition-colors shadow-sm whitespace-nowrap ${className}`}
          title="Install Goalbeam App on Mobile or Desktop for Offline Use"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Install Offline App</span>
        </button>
        {modalNode}
      </>
    );
  }

  if (variant === 'header-mobile') {
    return (
      <>
        <button
          type="button"
          onClick={handleActionClick}
          className={`inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[10px] font-extrabold bg-emerald-500/15 border border-emerald-500/45 text-emerald-300 hover:bg-emerald-500/25 transition-colors shrink-0 cursor-pointer shadow-sm leading-none whitespace-nowrap ${className}`}
          title="Install App to Home Screen & Offline"
        >
          <Download className="w-3 h-3 shrink-0" />
          <span>App</span>
        </button>
        {modalNode}
      </>
    );
  }

  if (variant === 'banner') {
    return (
      <>
        <button
          type="button"
          onClick={isInstalled ? handlePrepareOffline : handleActionClick}
          className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer shrink-0 shadow-sm whitespace-nowrap ${
            isInstalled
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
              : 'bg-emerald-500 hover:bg-emerald-400 border-emerald-400 text-slate-950'
          } ${className}`}
          title={
            isInstalled
              ? 'Installed as Offline App · Tap to refresh offline cache'
              : 'Install Goalbeam App on Mobile or Desktop for Offline Use'
          }
        >
          {isInstalled ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{isPreparingOffline ? 'Syncing Offline...' : 'Installed · Offline Ready'}</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
              <span>{isInstallable ? 'Install App (Free)' : 'Install App'}</span>
            </>
          )}
        </button>
        {modalNode}
      </>
    );
  }

  // Default: header-desktop
  return (
    <>
      <button
        type="button"
        onClick={handleActionClick}
        className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-500/15 border border-emerald-500/45 text-emerald-300 hover:bg-emerald-500/25 transition-colors cursor-pointer shrink-0 shadow-sm whitespace-nowrap ${className}`}
        title="Install Goalbeam as an Offline App on Desktop or Mobile"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>Install App</span>
      </button>
      {modalNode}
    </>
  );
};
