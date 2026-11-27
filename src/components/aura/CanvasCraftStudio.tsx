import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Type as TypeIcon,
  Wand2,
} from 'lucide-react';
import { AutoGrowPromptInput } from '../ui/ResponsiveTextControls';
import { buildCleanFilenameSlug } from '../../utils/seoMetadata';
import { generateOfflineDiagramDataUrl } from '../../utils/offlineStudyEngine';

type AspectOption = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

interface EditFilters {
  brightness: number;
  contrast: number;
  saturate: number;
  sepia: number;
  caption: string;
}

const DEFAULT_FILTERS: EditFilters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  sepia: 0,
  caption: '',
};

export const CanvasCraftStudio: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectOption>('16:9');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [filters, setFilters] = useState<EditFilters>(DEFAULT_FILTERS);
  const [errorNote, setErrorNote] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async (presetPrompt?: string) => {
    const q = (presetPrompt ?? prompt).trim();
    if (!q || isGenerating) return;
    setIsGenerating(true);
    setErrorNote(null);

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('offline');
      }
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q, aspectRatio }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setSourceImageUrl(data.imageUrl);
        setFilters(DEFAULT_FILTERS);
      } else {
        const offlineUrl = generateOfflineDiagramDataUrl(q, aspectRatio);
        if (offlineUrl) {
          setSourceImageUrl(offlineUrl);
          setFilters(DEFAULT_FILTERS);
        } else {
          setErrorNote(data.error || 'Could not render this prompt. Try a study topic.');
        }
      }
    } catch {
      const offlineUrl = generateOfflineDiagramDataUrl(q, aspectRatio);
      if (offlineUrl) {
        setSourceImageUrl(offlineUrl);
        setFilters(DEFAULT_FILTERS);
      } else {
        setErrorNote('Could not generate visual diagram.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setSourceImageUrl(reader.result);
        setFilters(DEFAULT_FILTERS);
        setErrorNote(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Paint edited image onto HTML5 canvas whenever image or filters change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImageUrl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || 960;
      const h = img.naturalHeight || 540;
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);

      ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) sepia(${filters.sepia}%)`;
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';

      if (filters.caption.trim()) {
        const fontSize = Math.max(20, Math.round(w * 0.032));
        ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        const barH = fontSize * 1.9;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.fillRect(0, h - barH, w, barH);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(filters.caption.trim(), w / 2, h - barH * 0.34);
      }
    };
    img.src = sourceImageUrl;
  }, [sourceImageUrl, filters]);

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    const topicSlug = buildCleanFilenameSlug(prompt, 'cbse-class-10-study-diagram');
    link.download = `aura-diagram-${topicSlug}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="p-3.5 sm:p-5 space-y-5">
      {/* Prompt + Aspect + Upload Strip */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-start gap-2.5">
          <AutoGrowPromptInput
            value={prompt}
            onValueChange={setPrompt}
            onSubmitPrompt={() => handleGenerate()}
            placeholder="Describe a diagram, infographic, or visual (e.g. Human Heart Double Circulation, Solar System)..."
            className="flex-1 w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-violet-400 focus:outline-none text-xs sm:text-sm text-[var(--text-primary)]"
          />

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={!prompt.trim() || isGenerating}
              onClick={() => handleGenerate()}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:brightness-110 disabled:opacity-40 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isGenerating ? 'Crafting...' : 'Craft Visual'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-violet-400 text-xs font-bold text-[var(--text-primary)] flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Upload className="w-4 h-4 text-violet-400" />
              <span>Upload Photo</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadImage}
            className="hidden"
          />
        </div>

        {/* Aspect Ratio & Preset Ideas */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[var(--text-muted)] mr-1">Frame:</span>
            {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectOption[]).map((ar) => (
              <button
                key={ar}
                type="button"
                onClick={() => setAspectRatio(ar)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  aspectRatio === ar
                    ? 'bg-violet-500/20 border-violet-400 text-violet-300'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              'Human Eye Myopia Correction',
              'Dispersion of Light through Prism',
              'Nephron Filtration Schematic',
              'Methane Covalent Bonding',
            ].map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => {
                  setPrompt(idea);
                  handleGenerate(idea);
                }}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:border-violet-400/50 border border-[var(--border-color)] text-[11px] font-semibold text-[var(--text-secondary)] hover:text-violet-300 text-left break-words cursor-pointer"
              >
                {idea}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorNote && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-300 font-semibold">
          {errorNote}
        </div>
      )}

      {/* Workspace Grid: Live Canvas Preview + Filter/Caption Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 rounded-2xl bg-slate-950 border border-[var(--border-color)] p-3 flex items-center justify-center min-h-[320px] sm:min-h-[380px] overflow-hidden">
          {sourceImageUrl ? (
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[380px] rounded-xl object-contain shadow-xl"
            />
          ) : (
            <div className="text-center space-y-2 p-6">
              <Sparkles className="w-8 h-8 text-violet-400 mx-auto" />
              <p className="text-sm font-bold text-[var(--text-primary)]">
                Craft a study visual or upload an image to customize
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Adjust tone, contrast, captions, and export high-resolution PNG
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-violet-400" />
              <h4 className="text-xs font-black uppercase tracking-wider">Canvas Controls</h4>
            </div>
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-[11px] font-bold text-[var(--text-muted)] hover:text-violet-400 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <label className="block space-y-1">
              <div className="flex justify-between font-semibold text-[var(--text-secondary)]">
                <span>Brightness</span>
                <span>{filters.brightness}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={160}
                value={filters.brightness}
                onChange={(e) => setFilters((f) => ({ ...f, brightness: Number(e.target.value) }))}
                className="w-full accent-violet-500"
              />
            </label>

            <label className="block space-y-1">
              <div className="flex justify-between font-semibold text-[var(--text-secondary)]">
                <span>Contrast</span>
                <span>{filters.contrast}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={170}
                value={filters.contrast}
                onChange={(e) => setFilters((f) => ({ ...f, contrast: Number(e.target.value) }))}
                className="w-full accent-violet-500"
              />
            </label>

            <label className="block space-y-1">
              <div className="flex justify-between font-semibold text-[var(--text-secondary)]">
                <span>Saturation</span>
                <span>{filters.saturate}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={180}
                value={filters.saturate}
                onChange={(e) => setFilters((f) => ({ ...f, saturate: Number(e.target.value) }))}
                className="w-full accent-violet-500"
              />
            </label>

            <label className="block space-y-1">
              <div className="flex justify-between font-semibold text-[var(--text-secondary)]">
                <span>Warm / Archival Tone</span>
                <span>{filters.sepia}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={filters.sepia}
                onChange={(e) => setFilters((f) => ({ ...f, sepia: Number(e.target.value) }))}
                className="w-full accent-violet-500"
              />
            </label>

            <div className="space-y-1 pt-1">
              <label className="flex items-center gap-1.5 font-semibold text-[var(--text-secondary)]">
                <TypeIcon className="w-3.5 h-3.5 text-violet-400" />
                <span>Label / Caption Stamp</span>
              </label>
              <AutoGrowPromptInput
                value={filters.caption}
                onValueChange={(val) => setFilters((f) => ({ ...f, caption: val }))}
                placeholder="Add label text on image..."
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-violet-400"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!sourceImageUrl}
            onClick={handleDownloadPng}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
