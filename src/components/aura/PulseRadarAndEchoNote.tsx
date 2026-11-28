import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Search,
  ExternalLink,
  FileDown,
  Mic,
  Square,
  Upload,
  Copy,
  Check,
  Download,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AutoGrowPromptInput } from '../ui/ResponsiveTextControls';
import { getIsoDateStamp } from '../../utils/seoMetadata';
import { searchOfflineResources } from '../../utils/offlineStudyEngine';

/* ============================================================================
   1. PULSERADAR SEARCH (Live Grounded Web Intelligence & Direct PDFs)
   ============================================================================ */
interface GroundingChunk {
  web?: {
    title?: string;
    uri?: string;
  };
}

interface PdfLinkItem {
  label?: string;
  url?: string;
}

export const PulseRadarSearch: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [summaryText, setSummaryText] = useState<string>('');
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [pdfLinks, setPdfLinks] = useState<PdfLinkItem[]>([]);

  const runSearch = async (preset?: string) => {
    const q = (preset ?? query).trim();
    if (!q || isSearching) return;
    if (preset) setQuery(preset);

    setIsSearching(true);
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('offline');
      }
      const res = await fetch('/api/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error('api_error');
      const data = await res.json();
      setSummaryText(data?.text || 'No grounded summary returned.');
      setSources(Array.isArray(data?.groundingChunks) ? data.groundingChunks : []);
      setPdfLinks(Array.isArray(data?.pdfLinks) ? data.pdfLinks : []);
    } catch {
      const offline = searchOfflineResources(q);
      setSummaryText(offline.text);
      setSources(offline.groundingChunks.map((c) => ({ web: { title: c.title, uri: c.uri } })));
      setPdfLinks(offline.pdfLinks);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-5 space-y-5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-blue-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <AutoGrowPromptInput
            value={query}
            onValueChange={setQuery}
            onSubmitPrompt={() => runSearch()}
            placeholder="Query latest circulars, syllabus revisions, exam patterns, or scientific facts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-blue-400 focus:outline-none text-xs sm:text-sm text-[var(--text-primary)]"
          />
        </div>
        <button
          type="button"
          disabled={!query.trim() || isSearching}
          onClick={() => runSearch()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 hover:brightness-110 disabled:opacity-40 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Globe className="w-4 h-4" />
          <span>{isSearching ? 'Scanning Web...' : 'Scan Live Web'}</span>
        </button>
      </div>

      {/* Quick Exam Presets */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          'CBSE Class 10 2026-27 Science Sample Question Paper & Marking Scheme PDF',
          'CBSE Class 10 Maths Standard Rationalized Syllabus Deleted Topics',
          '50% Competency Based Questions Exam Pattern CBSE Class 10',
          'NCERT Class 10 Social Science Map Work Official List',
        ].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => runSearch(item)}
            className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:border-blue-400/60 border border-[var(--border-color)] text-[11px] font-semibold text-[var(--text-secondary)] hover:text-blue-300 text-left break-words cursor-pointer"
          >
            {item}
          </button>
        ))}
      </div>

      {summaryText ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2.5">
            <div className="text-xs font-black uppercase tracking-wider text-blue-400">
              Verified Intelligence Briefing
            </div>
            <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-[var(--text-primary)] max-h-[420px] overflow-y-auto pr-1">
              {summaryText}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-3">
            {pdfLinks.length > 0 && (
              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Direct PDF Resources
                </div>
                {pdfLinks.slice(0, 6).map((pdf, idx) => (
                  <a
                    key={idx}
                    href={pdf.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-emerald-400 text-xs font-bold text-[var(--text-primary)]"
                  >
                    <span className="break-words [overflow-wrap:anywhere]">{pdf.label || 'Open PDF Document'}</span>
                    <FileDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </a>
                ))}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-blue-400">
                Web Citations ({sources.length})
              </div>
              {sources
                .filter((s) => s.web?.uri)
                .slice(0, 6)
                .map((src, idx) => (
                  <a
                    key={idx}
                    href={src.web?.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-blue-400 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <span className="break-words [overflow-wrap:anywhere] font-semibold">{src.web?.title || src.web?.uri}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  </a>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] p-10 text-center space-y-2">
          <Globe className="w-8 h-8 text-blue-400 mx-auto" />
          <p className="text-sm font-bold text-[var(--text-primary)]">
            Search verified educational updates &amp; official PDFs
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Every response attaches live grounded sources and clickable PDF references
          </p>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   2. ECHONOTE SCRIBE (Live Mic & Uploaded Audio -> Clean Study Transcript)
   ============================================================================ */
interface EchoNoteScribeProps {
  onSendToMindDesk?: (text: string) => void;
}

export const EchoNoteScribe: React.FC<EchoNoteScribeProps> = ({ onSendToMindDesk }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (mrRef.current && mrRef.current.state !== 'inactive') {
        mrRef.current.stop();
      }
    };
  }, []);

  const sendAudioBlob = (blob: Blob, mimeType: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch('/api/transcribe-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: reader.result as string,
            mimeType,
          }),
        });
        const data = await res.json();
        if (data?.success && typeof data.transcript === 'string') {
          setTranscript((prev) => (prev ? `${prev}\n\n${data.transcript}` : data.transcript));
        } else {
          setErrorMsg(data?.error || 'Could not process audio recording.');
        }
      } catch {
        setErrorMsg('Failed to process audio file.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(blob);
  };

  const handleToggleRecord = async () => {
    if (isRecording && mrRef.current) {
      mrRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        setErrorMsg('Audio recording is unavailable on this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mimeType =
        ['audio/webm', 'audio/mp4', 'audio/ogg'].find(
          (t) => typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(t)
        ) || '';
      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mrRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const resolvedType = mr.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: resolvedType });
        if (blob.size > 100) sendAudioBlob(blob, resolvedType);
      };

      mr.start();
      setElapsedSec(0);
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setElapsedSec((s) => s + 1);
      }, 1000);
    } catch {
      setErrorMsg('Microphone permission is required to record voice notes.');
    }
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sendAudioBlob(file, file.type || 'audio/mp3');
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-voice-study-notes-${getIsoDateStamp()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3.5 sm:p-5 space-y-5">
      {/* Recorder & File Upload Strip */}
      <div className="rounded-2xl bg-slate-950 border border-[var(--border-color)] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleToggleRecord}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl cursor-pointer transition-colors ${
              isRecording
                ? 'bg-rose-500 text-white'
                : 'bg-gradient-to-br from-teal-500 to-emerald-600 text-slate-950'
            }`}
          >
            {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
          </button>

          <div>
            <h3 className="text-sm sm:text-base font-black text-white">
              {isRecording
                ? `Recording Voice Note (${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, '0')})`
                : isProcessing
                ? 'Converting Speech to Notes...'
                : 'Tap Mic to Record Lecture or Voice Doubt'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Or upload an .mp3, .wav, .m4a, or .webm classroom clip
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isProcessing || isRecording}
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4 text-teal-400" />
          <span>Upload Audio Clip</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          onChange={handleUploadFile}
          className="hidden"
        />
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-300 font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Editable Transcript Area */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-teal-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Captured Notes</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!transcript.trim()}
              onClick={() => {
                navigator.clipboard.writeText(transcript);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              disabled={!transcript.trim()}
              onClick={handleDownloadTxt}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Export TXT</span>
            </button>

            {onSendToMindDesk && (
              <button
                type="button"
                disabled={!transcript.trim()}
                onClick={() => onSendToMindDesk(transcript)}
                className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open in MindDesk Dialogue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <textarea
          rows={10}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your spoken or uploaded audio text appears here — edit freely before exporting or solving..."
          className="w-full p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-teal-400 focus:outline-none text-xs sm:text-sm leading-relaxed text-[var(--text-primary)]"
        />
      </div>
    </div>
  );
};
