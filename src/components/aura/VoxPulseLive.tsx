import React, { useState, useRef, useEffect } from 'react';
import { Mic, PhoneOff, Send, Volume2, Radio } from 'lucide-react';
import { AutoGrowPromptInput } from '../ui/ResponsiveTextControls';
import { generateOfflineTutorReply } from '../../utils/offlineStudyEngine';

interface TranscriptLine {
  id: string;
  speaker: 'You' | 'VoxPulse';
  text: string;
}

const VOICES = ['Zephyr', 'Kore', 'Puck', 'Charon', 'Fenrir'] as const;

const PERSONA_OPTIONS = [
  {
    id: 'mentor',
    label: 'Friendly Study Mentor',
    prompt:
      'You are Goalbeam VoxPulse, an articulate spoken Class 10 Course & Board Exam tutor. Give warm, concise, spoken-friendly explanations with memory tricks.',
  },
  {
    id: 'viva',
    label: 'Oral Viva Examiner',
    prompt:
      'You are an encouraging CBSE viva examiner. Ask the student one crisp conceptual question at a time, listen, and give immediate feedback.',
  },
  {
    id: 'language',
    label: 'Language & Debate Partner',
    prompt:
      'Speak clearly to help the student build fluency, pronunciation, and structured argument skills.',
  },
];

function floatTo16BitPcmBase64(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64PcmToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;
  return float32;
}

export const VoxPulseLive: React.FC = () => {
  const [selectedVoice, setSelectedVoice] = useState<(typeof VOICES)[number]>('Zephyr');
  const [personaId, setPersonaId] = useState<string>('mentor');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [textFollowup, setTextFollowup] = useState<string>('');
  const [transcripts, setTranscripts] = useState<TranscriptLine[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  const stopAllAudioSources = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {}
    });
    activeSourcesRef.current = [];
    if (outputCtxRef.current) {
      nextStartTimeRef.current = outputCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
  };

  const cleanupSession = () => {
    stopAllAudioSources();
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (inputCtxRef.current) {
      inputCtxRef.current.close().catch(() => {});
      inputCtxRef.current = null;
    }
    if (outputCtxRef.current) {
      outputCtxRef.current.close().catch(() => {});
      outputCtxRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    setStatus('idle');
  };

  useEffect(() => {
    return () => cleanupSession();
  }, []);

  const appendTranscript = (speaker: 'You' | 'VoxPulse', chunk: string) => {
    if (!chunk) return;
    setTranscripts((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.speaker === speaker) {
        return [...prev.slice(0, -1), { ...last, text: last.text + chunk }];
      }
      return [...prev, { id: `${speaker}_${Date.now()}`, speaker, text: chunk }];
    });
  };

  const schedulePcmOutput = (base64Pcm: string) => {
    const outCtx = outputCtxRef.current;
    if (!outCtx) return;
    const samples = base64PcmToFloat32(base64Pcm);
    const buffer = outCtx.createBuffer(1, samples.length, 24000);
    buffer.getChannelData(0).set(samples);

    const source = outCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(outCtx.destination);

    const now = outCtx.currentTime;
    const startAt = Math.max(now + 0.02, nextStartTimeRef.current);
    source.start(startAt);
    nextStartTimeRef.current = startAt + buffer.duration;
    activeSourcesRef.current.push(source);
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
    };
  };

  const startLiveSession = async () => {
    if (status === 'connecting' || status === 'live') return;
    setErrorMsg(null);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setStatus('live');
      const welcome =
        'Offline Spoken Mentor active. Ask any Class 10 chapter question below and I will read the step-by-step board answer aloud.';
      appendTranscript('VoxPulse', welcome);
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(welcome);
          u.rate = 1;
          window.speechSynthesis.speak(u);
        } catch {}
      }
      return;
    }

    setStatus('connecting');

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = micStream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inCtx = new AudioCtx({ sampleRate: 16000 });
      const outCtx = new AudioCtx({ sampleRate: 24000 });
      inputCtxRef.current = inCtx;
      outputCtxRef.current = outCtx;
      nextStartTimeRef.current = outCtx.currentTime;

      const personaPrompt =
        PERSONA_OPTIONS.find((p) => p.id === personaId)?.prompt || PERSONA_OPTIONS[0].prompt;
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/api/aura-live?voice=${encodeURIComponent(
        selectedVoice
      )}&persona=${encodeURIComponent(personaPrompt)}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        const source = inCtx.createMediaStreamSource(micStream);
        const processor = inCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (event) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const channelData = event.inputBuffer.getChannelData(0);
          const b64 = floatTo16BitPcmBase64(channelData);
          ws.send(JSON.stringify({ audio: b64 }));
        };

        source.connect(processor);
        processor.connect(inCtx.destination);
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === 'ready') {
            setStatus('live');
          } else if (msg.type === 'audio' && msg.audio) {
            schedulePcmOutput(msg.audio);
          } else if (msg.type === 'inputTranscript' && msg.text) {
            appendTranscript('You', msg.text);
          } else if (msg.type === 'outputTranscript' && msg.text) {
            appendTranscript('VoxPulse', msg.text);
          } else if (msg.type === 'interrupted') {
            stopAllAudioSources();
          } else if (msg.type === 'error') {
            setErrorMsg(msg.message || 'Live voice stream encountered an error.');
            cleanupSession();
          }
        } catch {}
      };

      ws.onerror = () => {
        setErrorMsg('Unable to open real-time voice link.');
        cleanupSession();
      };

      ws.onclose = () => {
        cleanupSession();
      };
    } catch (err: any) {
      setErrorMsg(err?.message || 'Microphone access is required for VoxPulse Live.');
      cleanupSession();
    }
  };

  const submitMessageText = (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    appendTranscript('You', `${q} `);
    setTextFollowup('');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: q }));
      return;
    }

    // Offline / WebSocket-free spoken reply fallback
    const reply = generateOfflineTutorReply(q).replace(/[#*`>]/g, '');
    appendTranscript('VoxPulse', reply);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(reply.slice(0, 600));
        u.rate = 1;
        window.speechSynthesis.speak(u);
      } catch {}
    }
  };

  const handleSendTextTurn = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessageText(textFollowup);
  };

  return (
    <div className="p-3.5 sm:p-5 space-y-5">
      {/* Voice & Role Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2.5">
          <div className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Select Mentor Voice</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {VOICES.map((v) => (
              <button
                key={v}
                type="button"
                disabled={status !== 'idle'}
                onClick={() => setSelectedVoice(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer disabled:opacity-50 ${
                  selectedVoice === v
                    ? 'bg-sky-500 text-slate-950 border-sky-400'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2.5">
          <div className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            <span>Session Style</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PERSONA_OPTIONS.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={status !== 'idle'}
                onClick={() => setPersonaId(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer disabled:opacity-50 ${
                  personaId === p.id
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Call Control Card */}
      <div className="keep-dark-surface rounded-2xl bg-slate-950 border border-[var(--border-color)] p-6 flex flex-col items-center justify-center text-center space-y-4">
        <button
          type="button"
          onClick={status === 'idle' || status === 'error' ? startLiveSession : cleanupSession}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-colors cursor-pointer ${
            status === 'live'
              ? 'bg-rose-500 hover:bg-rose-400 text-white'
              : status === 'connecting'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-gradient-to-br from-sky-500 to-indigo-600 hover:brightness-110 text-white'
          }`}
        >
          {status === 'live' || status === 'connecting' ? (
            <PhoneOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>

        <div>
          <h3 className="text-base font-black text-white">
            {status === 'live'
              ? `Connected to VoxPulse (${selectedVoice})`
              : status === 'connecting'
              ? 'Establishing Two-Way Audio Link...'
              : 'Tap Mic to Start Two-Way Session'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {status === 'live'
              ? 'Speak naturally — you can interrupt anytime while VoxPulse responds'
              : 'Uses low-latency bidirectional PCM voice streaming'}
          </p>
        </div>

        {errorMsg && (
          <div className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 font-semibold">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Live Subtitles & Text Side-Channel */}
      <div className="space-y-3">
        <div className="h-56 overflow-y-auto p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2.5">
          {transcripts.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] text-center pt-16">
              Live conversation captions will appear here as you and VoxPulse speak.
            </p>
          ) : (
            transcripts.map((line) => (
              <div
                key={line.id}
                className={`p-2.5 rounded-lg text-xs ${
                  line.speaker === 'You'
                    ? 'bg-sky-500/15 border border-sky-400/30 ml-8'
                    : 'bg-[var(--bg-card)] border border-[var(--border-color)] mr-8'
                }`}
              >
                <span className="font-black text-sky-400 block mb-0.5">{line.speaker}</span>
                <span className="leading-relaxed">{line.text}</span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {(status === 'live' || (typeof navigator !== 'undefined' && !navigator.onLine)) && (
          <form onSubmit={handleSendTextTurn} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
            <AutoGrowPromptInput
              value={textFollowup}
              onValueChange={setTextFollowup}
              onSubmitPrompt={() => submitMessageText(textFollowup)}
              placeholder="Ask a spoken tutor question (works online or offline)..."
              className="flex-1 w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs sm:text-sm focus:outline-none focus:border-sky-400"
            />
            <button
              type="submit"
              disabled={!textFollowup.trim()}
              className="px-4 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
