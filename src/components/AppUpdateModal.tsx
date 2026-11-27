import React from 'react';
import { Sparkles, ClipboardEdit, ArrowRight, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { PendingAppUpdateSummary, AppUpdateChangeItem } from '../data/appUpdates';

interface AppUpdateModalProps {
  update: PendingAppUpdateSummary | null;
  onDismiss: () => void;
  onOpenChangeTarget: (item: AppUpdateChangeItem) => void;
  onReloadToLatest?: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  update,
  onDismiss,
  onOpenChangeTarget,
  onReloadToLatest,
}) => {
  if (!update || !update.changes || update.changes.length === 0) {
    return null;
  }

  const hasFormChange = update.changes.some((c) => c.scope === 'form-change');
  const hasNewFeature = update.changes.some((c) => c.scope === 'new-feature');

  const headerSubtitle =
    hasFormChange && hasNewFeature
      ? 'Form Updates & New Features Added'
      : hasFormChange
      ? 'Setup Form Updated'
      : 'New Feature Added';

  const resolveDefaultLabel = (item: AppUpdateChangeItem): string => {
    if (item.actionLabel) return item.actionLabel;
    if (item.scope === 'form-change') return 'Review Form (Keep Progress)';
    return 'Explore Feature';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-update-modal-title"
      className="fixed inset-0 z-[126] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl max-h-[90dvh] rounded-2xl bg-[var(--bg-card)] border-2 border-cyan-500/50 shadow-2xl overflow-hidden flex flex-col text-[var(--text-primary)]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-cyan-500/20 via-indigo-500/15 to-emerald-500/20 border-b border-[var(--border-color)] flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950 flex items-center justify-center shadow-lg shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-black uppercase tracking-wider">
                  {headerSubtitle}
                </span>
                <span className="text-[11px] font-mono font-bold text-[var(--text-muted)]">
                  v{update.latestVersion}
                </span>
              </div>
              <h2
                id="app-update-modal-title"
                className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-1 leading-snug break-words"
              >
                {update.headline}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close update screen"
            className="p-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Qualifying Changes List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-3">
          {update.changes.map((item) => {
            const isForm = item.scope === 'form-change';
            const canOpenTarget = Boolean(item.actionScreen || isForm);

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-xl border transition-colors ${
                  isForm
                    ? 'bg-amber-500/10 border-amber-400/40'
                    : 'bg-cyan-500/10 border-cyan-400/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isForm
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}
                    >
                      {isForm ? (
                        <ClipboardEdit className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                            isForm
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                          }`}
                        >
                          {isForm ? 'Form Update' : 'New Feature'}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-[var(--text-primary)] leading-snug break-words">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed break-words">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                {canOpenTarget && (
                  <div className="mt-3 pt-2.5 border-t border-[var(--border-color)]/50 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onOpenChangeTarget(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isForm
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                          : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                      }`}
                    >
                      <span>{resolveDefaultLabel(item)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3.5 bg-[var(--bg-elevated)] border-t border-[var(--border-color)] flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 shrink-0">
          {update.isLiveServerUpdate && onReloadToLatest && (
            <button
              type="button"
              onClick={onReloadToLatest}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh to Load Update</span>
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Got It, Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
