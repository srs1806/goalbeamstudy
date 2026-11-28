import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Download,
  Film,
  Upload,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { AutoGrowPromptInput } from '../ui/ResponsiveTextControls';
import { buildCleanFilenameSlug } from '../../utils/seoMetadata';
import { buildOfflineStoryboard } from '../../utils/offlineStudyEngine';

interface StoryScene {
  heading: string;
  caption: string;
  keyFormula?: string;
  motionStyle?: string;
}

interface StoryboardData {
  title: string;
  accentHex?: string;
  scenes: StoryScene[];
}

/* ============================================================================
   1. SCENEREEL DIRECTOR (Text-to-Motion Storyboard + WebM Recorder)
   ============================================================================ */
export const SceneReelStudio: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspect, setAspect] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [storyboard, setStoryboard] = useState<StoryboardData>({
    title: 'Ohm’s Law & Circuit Potential',
    accentHex: '#22d3ee',
    scenes: [
      {
        heading: 'Scene 1 • Fundamental Law',
        caption: 'At constant temperature, current through a conductor is proportional to potential difference.',
        keyFormula: 'V = I · R',
      },
      {
        heading: 'Scene 2 • Charge Flow',
        caption: 'Free electrons drift steadily from negative terminal to positive potential.',
        keyFormula: 'I = Q / t',
      },
      {
        heading: 'Scene 3 • Series vs Parallel',
        caption: 'Series shares identical current; parallel maintains constant voltage across branches.',
        keyFormula: '1/Rp = 1/R1 + 1/R2',
      },
      {
        heading: 'Scene 4 • Board Exam Key',
        caption: 'Plot a linear V–I graph; its slope yields exact electrical resistance in Ohms.',
        keyFormula: 'R = Slope (ΔV / ΔI)',
      },
    ],
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  const handleGenerate = async (preset?: string) => {
    const q = (preset ?? prompt).trim();
    if (!q || isGenerating) return;
    setIsGenerating(true);

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('offline');
      }
      const res = await fetch('/api/aura/storyboard-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q, aspectRatio: aspect }),
      });
      const data = await res.json();
      if (data?.success && data.storyboard) {
        setStoryboard(data.storyboard);
        frameRef.current = 0;
        setIsPlaying(true);
      } else {
        setStoryboard(buildOfflineStoryboard(q));
        frameRef.current = 0;
        setIsPlaying(true);
      }
    } catch {
      setStoryboard(buildOfflineStoryboard(q));
      frameRef.current = 0;
      setIsPlaying(true);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = aspect === '16:9' ? 960 : 540;
    const height = aspect === '16:9' ? 540 : 960;
    canvas.width = width;
    canvas.height = height;

    let rafId = 0;
    const scenes = storyboard.scenes.length > 0 ? storyboard.scenes : [{ heading: 'Scene 1', caption: storyboard.title }];
    const accent = storyboard.accentHex || '#22d3ee';

    const wrapText = (text: string, maxWidth: number, lineHeight: number, startY: number) => {
      const words = text.split(/\s+/);
      let line = '';
      let y = startY;
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth) {
          ctx.fillText(line, width / 2, y);
          line = word;
          y += lineHeight;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, width / 2, y);
    };

    const draw = () => {
      if (isPlaying) frameRef.current += 1;
      const t = frameRef.current;
      const framesPerScene = 180;
      const sceneIdx = Math.floor(t / framesPerScene) % scenes.length;
      const localProgress = (t % framesPerScene) / framesPerScene;
      const scene = scenes[sceneIdx];

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.55, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle geometric orbits
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.lineWidth = 2;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * (0.28 + 0.04 * Math.sin(t * 0.03));
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, t * 0.01, t * 0.01 + Math.PI * 1.2);
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.25;
      ctx.stroke();
      ctx.restore();

      // Header bar
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(28, 24, width - 56, 46);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.strokeRect(28, 24, width - 56, 46);

      ctx.fillStyle = accent;
      ctx.font = '800 15px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(storyboard.title.slice(0, 48), 46, 52);

      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'right';
      ctx.fillText(`Scene ${sceneIdx + 1}/${scenes.length}`, width - 46, 52);

      // Center motion typography
      const slideOffset = Math.max(0, 1 - localProgress * 4) * 28;
      ctx.globalAlpha = Math.min(1, localProgress * 5);
      ctx.textAlign = 'center';

      ctx.fillStyle = accent;
      ctx.font = `900 ${aspect === '16:9' ? 30 : 26}px system-ui, sans-serif`;
      ctx.fillText(scene.heading, width / 2, cy - 54 + slideOffset);

      ctx.fillStyle = '#f8fafc';
      ctx.font = `600 ${aspect === '16:9' ? 21 : 19}px system-ui, sans-serif`;
      wrapText(scene.caption, width * 0.78, 30, cy - 6 + slideOffset);

      if (scene.keyFormula) {
        const boxW = Math.min(width * 0.72, 460);
        const boxY = cy + 78;
        ctx.fillStyle = 'rgba(34, 211, 238, 0.12)';
        ctx.fillRect(width / 2 - boxW / 2, boxY, boxW, 44);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(width / 2 - boxW / 2, boxY, boxW, 44);
        ctx.fillStyle = '#e0f2fe';
        ctx.font = '700 17px ui-monospace, monospace';
        ctx.fillText(scene.keyFormula, width / 2, boxY + 28);
      }

      ctx.globalAlpha = 1;

      // Timeline scrubber bar
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(36, height - 28, width - 72, 6);
      const totalProgress = ((sceneIdx + localProgress) / scenes.length) * (width - 72);
      ctx.fillStyle = accent;
      ctx.fillRect(36, height - 28, totalProgress, 6);

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [storyboard, aspect, isPlaying]);

  const handleRecordWebm = () => {
    const canvas = canvasRef.current as (HTMLCanvasElement & { captureStream?: (fps?: number) => MediaStream }) | null;
    if (!canvas || typeof MediaRecorder === 'undefined' || typeof canvas.captureStream !== 'function') {
      return;
    }
    setIsExporting(true);
    frameRef.current = 0;
    setIsPlaying(true);

    try {
      const stream = canvas.captureStream(30);
      const supportedType = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'].find(
        (t) => typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(t)
      );
      const recorder = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream);
      const ext = supportedType?.includes('mp4') ? 'mp4' : 'webm';
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: supportedType || 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const topicSlug = buildCleanFilenameSlug(prompt, 'cbse-concept-reel');
        const ratioTag = aspect === '16:9' ? 'landscape' : 'portrait';
        a.download = `aura-motion-reel-${topicSlug}-${ratioTag}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state !== 'inactive') recorder.stop();
      }, 6500);
    } catch {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5">
        <AutoGrowPromptInput
          value={prompt}
          onValueChange={setPrompt}
          onSubmitPrompt={() => handleGenerate()}
          placeholder="Describe the motion reel topic (e.g. Electromagnetic Induction, Carbon Bonding)..."
          className="flex-1 w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-amber-400 focus:outline-none text-xs sm:text-sm text-[var(--text-primary)]"
        />
        <button
          type="button"
          disabled={!prompt.trim() || isGenerating}
          onClick={() => handleGenerate()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Film className="w-4 h-4" />
          <span>{isGenerating ? 'Directing...' : 'Build Motion Reel'}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {(['16:9', '9:16'] as const).map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => setAspect(ratio)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                aspect === ratio
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
              }`}
            >
              {ratio === '16:9' ? '16:9 Landscape' : '9:16 Vertical'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleRecordWebm}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Recording 6.5s WebM...' : 'Export WebM Video'}</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-950 border border-[var(--border-color)] p-3 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`rounded-xl shadow-2xl max-w-full object-contain ${
            aspect === '16:9' ? 'w-full max-w-3xl aspect-video' : 'h-[360px] sm:h-[420px] w-auto aspect-[9/16]'
          }`}
        />
      </div>
    </div>
  );
};

/* ============================================================================
   2. KINETIPIC ANIMATOR (Still Image -> Animated Motion Video)
   ============================================================================ */
type MotionPreset = 'zoom' | 'pan' | 'kenburns' | 'spotlight';

export const KinetiPicStudio: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [aspect, setAspect] = useState<'16:9' | '9:16'>('16:9');
  const [motionPreset, setMotionPreset] = useState<MotionPreset>('kenburns');
  const [overlayText, setOverlayText] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgObjRef = useRef<HTMLImageElement | null>(null);
  const tickRef = useRef<number>(0);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const img = new Image();
        img.onload = () => {
          imgObjRef.current = img;
          setImageSrc(reader.result as string);
          tickRef.current = 0;
          setIsPlaying(true);
        };
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = aspect === '16:9' ? 960 : 540;
    const h = aspect === '16:9' ? 540 : 960;
    canvas.width = w;
    canvas.height = h;

    let rafId = 0;
    const render = () => {
      if (isPlaying) tickRef.current += 1;
      const t = (tickRef.current % 360) / 360;
      const img = imgObjRef.current;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      if (img) {
        const baseScale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        let scale = baseScale;
        let offsetX = 0;
        let offsetY = 0;

        if (motionPreset === 'zoom') {
          scale = baseScale * (1 + 0.22 * Math.sin(t * Math.PI));
        } else if (motionPreset === 'pan') {
          scale = baseScale * 1.18;
          offsetX = Math.sin(t * Math.PI * 2) * (w * 0.06);
        } else if (motionPreset === 'kenburns') {
          scale = baseScale * (1.06 + 0.16 * t);
          offsetX = (t - 0.5) * (w * 0.08);
          offsetY = (0.5 - t) * (h * 0.05);
        } else if (motionPreset === 'spotlight') {
          scale = baseScale * 1.08;
        }

        const drawW = img.naturalWidth * scale;
        const drawH = img.naturalHeight * scale;
        const x = (w - drawW) / 2 + offsetX;
        const y = (h - drawH) / 2 + offsetY;
        ctx.drawImage(img, x, y, drawW, drawH);

        if (motionPreset === 'spotlight') {
          const sx = w * (0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2)));
          const sy = h * 0.5;
          const rg = ctx.createRadialGradient(sx, sy, 40, sx, sy, w * 0.55);
          rg.addColorStop(0, 'rgba(255,255,255,0.08)');
          rg.addColorStop(1, 'rgba(2,6,23,0.72)');
          ctx.fillStyle = rg;
          ctx.fillRect(0, 0, w, h);
        }
      }

      if (overlayText.trim()) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.fillRect(0, h - 68, w, 68);
        ctx.fillStyle = '#f472b6';
        ctx.font = '800 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(overlayText.trim(), w / 2, h - 26);
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [imageSrc, aspect, motionPreset, overlayText, isPlaying]);

  const handleExportVideo = () => {
    const canvas = canvasRef.current as (HTMLCanvasElement & { captureStream?: (fps?: number) => MediaStream }) | null;
    if (!canvas || !imageSrc || typeof MediaRecorder === 'undefined' || typeof canvas.captureStream !== 'function') {
      return;
    }
    setIsExporting(true);
    tickRef.current = 0;
    setIsPlaying(true);

    try {
      const stream = canvas.captureStream(30);
      const supportedType = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'].find(
        (t) => typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(t)
      );
      const rec = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream);
      const ext = supportedType?.includes('mp4') ? 'mp4' : 'webm';
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: supportedType || 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const captionSlug = buildCleanFilenameSlug(overlayText, 'study-visual');
        const ratioTag = aspect === '16:9' ? 'landscape' : 'portrait';
        a.download = `aura-visual-explainer-${captionSlug}-${ratioTag}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };

      rec.start();
      setTimeout(() => {
        if (rec.state !== 'inactive') rec.stop();
      }, 6000);
    } catch {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:brightness-110 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>{imageSrc ? 'Replace Source Image' : 'Upload Photo or Diagram'}</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

        <AutoGrowPromptInput
          value={overlayText}
          onValueChange={setOverlayText}
          placeholder="Optional motion title caption..."
          className="flex-1 w-full px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] focus:border-rose-400 focus:outline-none text-xs sm:text-sm text-[var(--text-primary)]"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'kenburns', label: 'Ken Burns Sweep' },
              { id: 'zoom', label: 'Cinematic Zoom' },
              { id: 'pan', label: 'Smooth Pan' },
              { id: 'spotlight', label: 'Spotlight Focus' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMotionPreset(m.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                motionPreset === m.id
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {(['16:9', '9:16'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setAspect(r)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                aspect === r
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)]'
              }`}
            >
              {r}
            </button>
          ))}

          {imageSrc && (
            <>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  tickRef.current = 0;
                }}
                className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] cursor-pointer"
                title="Restart Loop"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={handleExportVideo}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Exporting...' : 'Export WebM'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-950 border border-[var(--border-color)] p-3 flex items-center justify-center min-h-[320px] overflow-hidden">
        {imageSrc ? (
          <canvas
            ref={canvasRef}
            className={`rounded-xl shadow-2xl max-w-full object-contain ${
              aspect === '16:9' ? 'w-full max-w-3xl aspect-video' : 'h-[360px] sm:h-[400px] w-auto aspect-[9/16]'
            }`}
          />
        ) : (
          <div className="text-center space-y-2 p-6">
            <Sparkles className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-bold text-[var(--text-primary)]">
              Upload any textbook figure, photo, or slide
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Applies smooth motion camera paths and exports downloadable WebM video
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
