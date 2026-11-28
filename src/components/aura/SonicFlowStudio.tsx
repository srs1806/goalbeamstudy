import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Square,
  Download,
  Upload,
  Sparkles,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { AutoGrowPromptInput } from '../ui/ResponsiveTextControls';

interface ComposedTrack {
  title: string;
  bpm: number;
  musicalKey: string;
  style: string;
  lyrics: string;
  chords: string[];
  melodyMidi: number[];
}

const MOOD_PRESETS = [
  'Focus Lo-Fi',
  'Calm Ambient Piano',
  'Upbeat Memory Rhythm',
  'Cinematic Study Pulse',
  'Acoustic Recall Groove',
];

const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

const encodeWavBlob = (samples: Float32Array, sampleRate: number): Blob => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: 'audio/wav' });
};

export const SonicFlowStudio: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [mood, setMood] = useState<string>(MOOD_PRESETS[0]);
  const [lengthMode, setLengthMode] = useState<'clip' | 'pro'>('clip');
  const [refImage, setRefImage] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isExportingWav, setIsExportingWav] = useState<boolean>(false);
  const [activeBeatIdx, setActiveBeatIdx] = useState<number>(0);

  const [track, setTrack] = useState<ComposedTrack>({
    title: 'Aurora Midnight Revision',
    bpm: 86,
    musicalKey: 'A Minor',
    style: 'Focus Lo-Fi',
    lyrics:
      '[Verse]\nSteady focus under quiet light,\nEvery concept locks in crystal bright.\n[Chorus]\nBreathe in rhythm, stay in stride,\nZero rush with clarity inside.',
    chords: ['Am7', 'Fmaj7', 'C', 'G'],
    melodyMidi: [69, 72, 76, 74, 69, 72, 79, 76, 65, 69, 72, 74, 67, 71, 74, 72],
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopSynth = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => stopSynth();
  }, []);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') setRefImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCompose = async () => {
    const q = prompt.trim() || `${mood} study track`;
    if (isComposing) return;
    stopSynth();
    setIsComposing(true);

    try {
      const res = await fetch('/api/aura/compose-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q,
          lengthMode,
          mood,
          imageBase64: refImage || undefined,
          imageMime: 'image/jpeg',
        }),
      });
      const data = await res.json();
      if (data?.success && data.track) {
        setTrack(data.track);
      }
    } finally {
      setIsComposing(false);
    }
  };

  const triggerStepAudio = (ctx: BaseAudioContext, dest: AudioNode, step: number, time: number, tData: ComposedTrack) => {
    const midi = tData.melodyMidi[step % tData.melodyMidi.length] || 69;
    const freq = midiToFreq(midi);

    // Lead bell / warm sine
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.16, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.42);
    osc.connect(gain).connect(dest);
    osc.start(time);
    osc.stop(time + 0.45);

    // Bass root pulse every 4 beats
    if (step % 4 === 0) {
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(freq / 4, time);
      bassGain.gain.setValueAtTime(0.001, time);
      bassGain.gain.exponentialRampToValueAtTime(0.18, time + 0.04);
      bassGain.gain.exponentialRampToValueAtTime(0.001, time + 1.1);
      bass.connect(bassGain).connect(dest);
      bass.start(time);
      bass.stop(time + 1.15);
    }
  };

  const handleTogglePlay = async () => {
    if (isPlaying) {
      stopSynth();
      return;
    }

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;
    if (ctx.state === 'suspended') await ctx.resume();

    setIsPlaying(true);
    let step = 0;
    const stepMs = (60 / Math.max(65, Math.min(140, track.bpm || 86))) * 500;
    const maxSteps = lengthMode === 'clip' ? 60 : 128;

    const tick = () => {
      if (!audioCtxRef.current) return;
      triggerStepAudio(ctx, ctx.destination, step, ctx.currentTime, track);
      setActiveBeatIdx(step % 16);
      step += 1;
      if (step >= maxSteps) {
        stopSynth();
      }
    };

    tick();
    intervalRef.current = window.setInterval(tick, stepMs);
  };

  const handleExportWav = async () => {
    setIsExportingWav(true);
    try {
      const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
      if (!OfflineCtx) return;
      const sampleRate = 22050;
      const stepSec = 60 / Math.max(65, Math.min(140, track.bpm || 86)) / 2;
      const totalSteps = lengthMode === 'clip' ? 48 : 96;
      const durationSec = Math.min(45, totalSteps * stepSec + 1.5);

      const offline = new OfflineCtx(1, Math.ceil(sampleRate * durationSec), sampleRate);
      for (let i = 0; i < totalSteps; i++) {
        triggerStepAudio(offline, offline.destination, i, i * stepSec + 0.05, track);
      }

      const rendered = await offline.startRendering();
      const wavBlob = encodeWavBlob(rendered.getChannelData(0), sampleRate);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Offline audio export unsupported on restricted device
    } finally {
      setIsExportingWav(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-5 space-y-5">
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-start gap-2.5">
          <AutoGrowPromptInput
            value={prompt}
            onValueChange={setPrompt}
            onSubmitPrompt={() => handleCompose()}
            placeholder="Describe rhythm, instruments, or lyric theme (e.g. Lo-fi beat for chemistry formulas)..."
            className="flex-1 w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-emerald-400 focus:outline-none text-xs sm:text-sm text-[var(--text-primary)]"
          />

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isComposing}
              onClick={handleCompose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Music className="w-4 h-4" />
              <span>{isComposing ? 'Composing...' : 'Compose Score'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Inspire with Image</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImagePick}
            className="hidden"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {MOOD_PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                  mood === m
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLengthMode('clip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                lengthMode === 'clip'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
              }`}
            >
              30s Focus Clip
            </button>
            <button
              type="button"
              onClick={() => setLengthMode('pro')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                lengthMode === 'pro'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
              }`}
            >
              Full Study Track
            </button>
          </div>
        </div>

        {refImage && (
          <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <img src={refImage} alt="Mood inspiration" className="w-10 h-10 rounded-lg object-cover" />
            <span className="text-xs font-semibold">Visual inspiration attached</span>
            <button
              type="button"
              onClick={() => setRefImage(null)}
              className="p-1 text-[var(--text-muted)] hover:text-rose-400 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Player & Arrangement Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="keep-dark-surface lg:col-span-7 rounded-2xl bg-slate-950 border border-[var(--border-color)] p-5 flex flex-col justify-between space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {track.style} • {track.musicalKey} • {track.bpm} BPM
              </div>
              <h3 className="text-xl font-black text-white mt-1">{track.title}</h3>
            </div>
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          </div>

          {/* Interactive 16-bar Sequencer Grid */}
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 items-end h-28 pt-2">
            {Array.from({ length: 16 }).map((_, idx) => {
              const midi = track.melodyMidi[idx % track.melodyMidi.length] || 69;
              const heightPct = Math.max(22, Math.min(100, ((midi - 52) / 30) * 100));
              const isCurrent = isPlaying && activeBeatIdx === idx;
              return (
                <div
                  key={idx}
                  style={{ height: `${heightPct}%` }}
                  className={`rounded-t-md transition-all duration-150 ${
                    isCurrent
                      ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]'
                      : 'bg-emerald-500/30 border border-emerald-400/20'
                  }`}
                />
              );
            })}
          </div>

          {/* Chords */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Progression:</span>
            {track.chords.map((ch, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-bold text-emerald-300"
              >
                {ch}
              </span>
            ))}
          </div>

          {/* Transport Controls */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer ${
                isPlaying
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Stop Synth' : 'Play Arrangement'}</span>
            </button>

            <button
              type="button"
              disabled={isExportingWav}
              onClick={handleExportWav}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isExportingWav ? 'Rendering WAV...' : 'Download WAV'}</span>
            </button>
          </div>
        </div>

        {/* Lyrics / Study Vocal Cues */}
        <div className="lg:col-span-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] p-4 flex flex-col space-y-2.5">
          <div className="text-xs font-black uppercase tracking-wider text-emerald-400 border-b border-[var(--border-color)] pb-2">
            Written Verse &amp; Study Cues
          </div>
          <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-[var(--text-primary)] flex-1 overflow-y-auto max-h-64">
            {track.lyrics || 'Pure instrumental arrangement crafted for uninterrupted study concentration.'}
          </pre>
        </div>
      </div>
    </div>
  );
};
