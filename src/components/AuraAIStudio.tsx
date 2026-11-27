import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  Palette,
  Film,
  Clapperboard,
  Music,
  AudioLines,
  Globe,
  FileAudio,
  Radio,
  ArrowLeft,
  ArrowRight,
  X,
} from 'lucide-react';
import {
  AURA_WORKSPACES,
  AuraCategory,
  AuraWorkspaceId,
} from './aura/auraCatalog';
import { MindDeskChat } from './aura/MindDeskChat';
import { CanvasCraftStudio } from './aura/CanvasCraftStudio';
import { SceneReelStudio, KinetiPicStudio } from './aura/MotionVideoWorkspaces';
import { SonicFlowStudio } from './aura/SonicFlowStudio';
import { VoxPulseLive } from './aura/VoxPulseLive';
import { PulseRadarSearch, EchoNoteScribe } from './aura/PulseRadarAndEchoNote';
import { ScholarCastBriefing } from './aura/ScholarCastBriefing';

const WORKSPACE_ICONS: Record<Exclude<AuraWorkspaceId, 'hub'>, React.FC<{ className?: string }>> = {
  minddesk: MessageSquare,
  canvas: Palette,
  scenereel: Film,
  kinetipic: Clapperboard,
  sonicflow: Music,
  voxpulse: AudioLines,
  pulseradar: Globe,
  echonote: FileAudio,
  scholarcast: Radio,
};

export const AuraAIStudio: React.FC<{ initialTopic?: string; onClose?: () => void }> = ({
  initialTopic,
  onClose,
}) => {
  const [activeWorkspace, setActiveWorkspace] = useState<AuraWorkspaceId>('hub');
  const [categoryFilter, setCategoryFilter] = useState<AuraCategory>('all');
  const [mindDeskSeedPrompt, setMindDeskSeedPrompt] = useState<string>(initialTopic || '');

  const activeMeta =
    activeWorkspace === 'hub'
      ? null
      : AURA_WORKSPACES.find((w) => w.id === activeWorkspace) || null;

  const filteredWorkspaces =
    categoryFilter === 'all'
      ? AURA_WORKSPACES
      : AURA_WORKSPACES.filter((w) => w.category === categoryFilter);

  const scrollContainerTop = () => {
    const mainEl = document.getElementById('app-main-scroll');
    if (mainEl) mainEl.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  const openWorkspace = (id: Exclude<AuraWorkspaceId, 'hub'>) => {
    setActiveWorkspace(id);
    scrollContainerTop();
  };

  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl overflow-hidden flex flex-col text-[var(--text-primary)]">
      {/* Studio Top Bar */}
      <div className="p-4 sm:p-5 bg-[var(--bg-elevated)] border-b border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {activeWorkspace !== 'hub' ? (
            <button
              type="button"
              onClick={() => {
                setActiveWorkspace('hub');
                scrollContainerTop();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-card)] hover:border-cyan-400 border border-[var(--border-color)] text-xs font-black text-[var(--text-primary)] cursor-pointer shrink-0 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>All <span className="brand-wordmark">Goalbeam</span> Modes</span>
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-black tracking-tight break-words leading-snug">
              {activeMeta ? activeMeta.name : <><span className="brand-wordmark">Goalbeam</span> AI Suite</>}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] break-words leading-relaxed mt-0.5">
              {activeMeta
                ? activeMeta.tagline
                : <>Select a specialized <span className="brand-wordmark">Goalbeam</span> Class 10 course workspace to begin</>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end shrink-0 w-full sm:w-auto">
          {activeWorkspace !== 'hub' && (
            <select
              value={activeWorkspace}
              onChange={(e) => openWorkspace(e.target.value as Exclude<AuraWorkspaceId, 'hub'>)}
              className="flex-1 sm:flex-initial min-w-0 max-w-full px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-cyan-400 cursor-pointer"
              aria-label="Switch Goalbeam Workspace"
            >
              {AURA_WORKSPACES.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-color)] cursor-pointer"
              title="Close Goalbeam AI"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Launcher Hub */}
      {activeWorkspace === 'hub' && (
        <div className="p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: 'All Modes' },
                { id: 'conversation', label: 'Dialogue & Voice' },
                { id: 'visual', label: 'Visual & Motion' },
                { id: 'audio-research', label: 'Audio & Research' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkspaces.map((ws) => {
              const IconComp = WORKSPACE_ICONS[ws.id];
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => openWorkspace(ws.id)}
                  className={`group text-left p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] ${ws.accentBorder} transition-colors cursor-pointer flex flex-col justify-between gap-4 hover:shadow-xl`}
                >
                  <div className="space-y-3">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ws.accentGradient} text-white flex items-center justify-center shadow-md`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[var(--text-primary)] tracking-tight">
                        {ws.name}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                        {ws.tagline}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 text-xs font-black ${ws.accentText} pt-2 border-t border-[var(--border-color)]/60`}
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Workspace Screen */}
      {activeWorkspace === 'minddesk' && <MindDeskChat initialPrompt={mindDeskSeedPrompt} />}
      {activeWorkspace === 'canvas' && <CanvasCraftStudio />}
      {activeWorkspace === 'scenereel' && <SceneReelStudio />}
      {activeWorkspace === 'kinetipic' && <KinetiPicStudio />}
      {activeWorkspace === 'sonicflow' && <SonicFlowStudio />}
      {activeWorkspace === 'voxpulse' && <VoxPulseLive />}
      {activeWorkspace === 'pulseradar' && <PulseRadarSearch />}
      {activeWorkspace === 'echonote' && (
        <EchoNoteScribe
          onSendToMindDesk={(text) => {
            setMindDeskSeedPrompt(text);
            openWorkspace('minddesk');
          }}
        />
      )}
      {activeWorkspace === 'scholarcast' && <ScholarCastBriefing initialTopic={initialTopic} />}
    </div>
  );
};
