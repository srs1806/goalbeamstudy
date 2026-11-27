import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Profile, LanguageMode } from '../types/tracker';
import { getOverallStats, getSubjectPaceCalculations } from '../utils/planner';
import { SUPPORTED_LANGUAGES } from '../utils/translations';
import { Logo } from './Logo';
import logoImg256 from '../assets/logo-256.png';
import { buildCleanFilenameSlug, getSiteOrigin } from '../utils/seoMetadata';
import confetti from 'canvas-confetti';
import {
  X,
  Download,
  Share2,
  Award,
  Copy,
  Check,
  Globe,
} from 'lucide-react';

const CERTIFICATE_WEBSITE_URL = getSiteOrigin();
const CERTIFICATE_WEBSITE_HOST = CERTIFICATE_WEBSITE_URL.replace(/^https?:\/\//, '');

interface FlexCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  language?: LanguageMode;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

async function loadWebsiteLogo(): Promise<HTMLImageElement | null> {
  const candidates = [logoImg256];
  for (const src of candidates) {
    try {
      return await loadImage(src);
    } catch {
      // Try next fallback logo asset
    }
  }
  return null;
}

export const FlexCertificateModal: React.FC<FlexCertificateModalProps> = ({
  isOpen,
  onClose,
  profile,
  language = 'en',
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stats = getOverallStats(profile);
  const paces = getSubjectPaceCalculations(profile);
  const boardInfo = { id: 'CBSE', shortName: 'CBSE', fullName: 'Central Board of Secondary Education' };
  const mediumInfo = useMemo(() => {
    const storedLang =
      language ||
      (typeof window !== 'undefined' ? (localStorage.getItem('cbse_study_language') as LanguageMode) : 'en') ||
      'en';
    return SUPPORTED_LANGUAGES.find((l) => l.code === storedLang) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  // Real progress milestone tier computed directly from user's progress & study streak
  const milestoneTier = useMemo(() => {
    if (stats.overallPercent >= 85 || (profile.streak?.count || 0) >= 21) return 'SYLLABUS MASTER MILESTONE';
    if (stats.overallPercent >= 60 || (profile.streak?.count || 0) >= 10) return 'HIGH MOMENTUM MILESTONE';
    if (stats.overallPercent >= 30 || (profile.streak?.count || 0) >= 5) return 'CONSISTENT SCHOLAR MILESTONE';
    return 'ACTIVE BOARD PREP MILESTONE';
  }, [stats.overallPercent, profile.streak?.count]);

  const issueDate = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 110,
          spread: 85,
          origin: { y: 0.55 },
          colors: ['#fbbf24', '#f59e0b', '#06b6d4', '#10b981', '#ffffff'],
        });
      } catch {}
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeStreakDays = profile.streak?.count || 0;
  const flexCaption = `🏅 ${boardInfo.shortName} CLASS 10 STUDY PROGRESS CERTIFICATE 📜\n👤 Student: ${profile.name || 'Class 10 Scholar'}\n🏛️ Board: ${boardInfo.shortName} • Medium: ${mediumInfo.name}\n📊 Syllabus Completed: ${stats.overallPercent}% (${stats.completedChapters}/${stats.totalChapters} Chapters)\n🔥 Study Streak: ${activeStreakDays} ${activeStreakDays === 1 ? 'Day' : 'Days'} Active\n🎯 Target Score: ${profile.targetPercentage}% in Class 10 Finals\n🌐 Track Your Progress & Build Your Certificate:\n👉 ${CERTIFICATE_WEBSITE_URL}`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(flexCaption);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(flexCaption)}`;

  const handleNativeShareClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (navigator.share) {
      e.preventDefault();
      navigator
        .share({
          title: `${boardInfo.shortName} Class 10 Progress Certificate — ${profile.name || 'Scholar'}`,
          text: flexCaption,
          url: CERTIFICATE_WEBSITE_URL,
        })
        .catch(() => {
          // If native share cancels/fails inside iframe, copy caption as seamless fallback
          navigator.clipboard?.writeText(flexCaption).catch(() => {});
        });
    }
  };

  // High-Resolution 1920x1080 Gold-Embossed Class 10 Study Progress Certificate Export
  const handleDownloadPng = async () => {
    setIsGeneratingPng(true);
    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      const width = 1920;
      const height = 1080;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const logoImg = await loadWebsiteLogo();

      // 1. Rich Obsidian Navy Parchment Background
      const bgGrad = ctx.createRadialGradient(width / 2, height * 0.42, 80, width / 2, height / 2, width * 0.72);
      bgGrad.addColorStop(0, '#0f1b33');
      bgGrad.addColorStop(0.55, '#091122');
      bgGrad.addColorStop(1, '#040812');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle Diagonal Watermark Lattice
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.045)';
      ctx.lineWidth = 1;
      for (let x = -height; x < width + height; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + height, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.restore();

      // Subtle Center Website Logo Watermark
      if (logoImg) {
        ctx.save();
        ctx.globalAlpha = 0.055;
        const wmRadius = 210;
        const wmCx = width / 2;
        const wmCy = height * 0.56;
        ctx.beginPath();
        ctx.arc(wmCx, wmCy, wmRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoImg, wmCx - wmRadius, wmCy - wmRadius, wmRadius * 2, wmRadius * 2);
        ctx.restore();
      }

      // 2. Triple Metallic Gold Borders
      const goldGrad = ctx.createLinearGradient(0, 0, width, height);
      goldGrad.addColorStop(0, '#b45309');
      goldGrad.addColorStop(0.25, '#fde68a');
      goldGrad.addColorStop(0.5, '#d97706');
      goldGrad.addColorStop(0.75, '#fef08a');
      goldGrad.addColorStop(1, '#92400e');

      // Outer Heavy Gold Frame
      ctx.strokeStyle = goldGrad;
      ctx.lineWidth = 14;
      ctx.strokeRect(32, 32, width - 64, height - 64);

      // Middle Hairline Cyan Accent Rule
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(52, 52, width - 104, height - 104);

      // Inner Ornamental Gold Rule
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.strokeRect(64, 64, width - 128, height - 128);

      // Corner Filigree Flourishes
      const drawCornerOrnament = (cx: number, cy: number, sx: number, sy: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(sx, sy);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(75, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 75);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(16, 16, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, 28, 28);
        ctx.restore();
      };
      drawCornerOrnament(64, 64, 1, 1);
      drawCornerOrnament(width - 64, 64, -1, 1);
      drawCornerOrnament(width - 64, height - 64, -1, -1);
      drawCornerOrnament(64, height - 64, 1, -1);

      // 3. Top Info Strip (Issue Date & Board/Medium — no user ID numbers)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText(`ISSUED: ${issueDate.toUpperCase()}`, 110, 104);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText(`${boardInfo.shortName.toUpperCase()} • ${mediumInfo.name.toUpperCase()}`, width - 110, 104);

      // Prominent Circular Website Logo Crest in Certificate Header
      const crestX = width / 2;
      const crestY = 128;
      const crestRadius = 40;
      if (logoImg) {
        ctx.save();
        const glowGrad = ctx.createRadialGradient(crestX, crestY, crestRadius * 0.6, crestX, crestY, crestRadius * 1.45);
        glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
        glowGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(crestX, crestY, crestRadius * 1.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(crestX, crestY, crestRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#020617';
        ctx.fill();
        ctx.clip();
        ctx.drawImage(logoImg, crestX - crestRadius, crestY - crestRadius, crestRadius * 2, crestRadius * 2);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(crestX, crestY, crestRadius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Center Website Brand Header
      ctx.textAlign = 'center';
      const brandHdrGrad = ctx.createLinearGradient(width / 2 - 260, 178, width / 2 + 260, 198);
      brandHdrGrad.addColorStop(0, '#38bdf8');
      brandHdrGrad.addColorStop(0.5, '#a5f3fc');
      brandHdrGrad.addColorStop(1, '#fbbf24');
      ctx.fillStyle = brandHdrGrad;
      ctx.font = '800 22px "Bricolage Grotesque", "Plus Jakarta Sans", Outfit, Inter, sans-serif';
      ctx.fillText(`GOALBEAM ⚡  •  CLASS 10 COURSE MATRIX`, width / 2, 194);

      // Main Certificate Headline
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 50px Georgia, serif';
      ctx.fillText('CERTIFICATE OF STUDY PROGRESS', width / 2, 248);

      // Sub-ribbon Milestone Badge
      ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 260, 266, 520, 36, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde68a';
      ctx.font = '800 17px Inter, sans-serif';
      ctx.fillText(`★  ${milestoneTier}  ★`, width / 2, 290);

      // Presentation Copy
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'italic 22px Georgia, serif';
      ctx.fillText('Proudly recognizes the Class 10 board preparation progress of', width / 2, 334);

      // Student Name (Prominent Embossed Gold)
      const nameGrad = ctx.createLinearGradient(width / 2 - 320, 345, width / 2 + 320, 415);
      nameGrad.addColorStop(0, '#fef08a');
      nameGrad.addColorStop(0.5, '#fbbf24');
      nameGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = nameGrad;
      ctx.font = '900 66px Georgia, serif';
      ctx.fillText((profile.name || 'Dedicated Scholar').toUpperCase(), width / 2, 400);

      // Underline ornament under Student Name
      const lineGrad = ctx.createLinearGradient(width / 2 - 420, 0, width / 2 + 420, 0);
      lineGrad.addColorStop(0, 'rgba(251, 191, 36, 0)');
      lineGrad.addColorStop(0.5, '#fbbf24');
      lineGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 420, 418);
      ctx.lineTo(width / 2 + 420, 418);
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 21px Inter, sans-serif';
      ctx.fillText(
        `Class 10 Student (${boardInfo.shortName}) • Target Score: ${profile.targetPercentage}% • First Exam: ${profile.firstPaperDate || 'Upcoming'}`,
        width / 2,
        450
      );

      // 4. LEFT & RIGHT PROGRESS PANELS
      const boxLeft = 120;
      const boxWidth = 780;
      const boxTop = 478;
      const boxHeight = 348;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, 16);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 21px Inter, sans-serif';
      ctx.fillText('CLASS 10 STUDY PROGRESS SUMMARY', boxLeft + 30, boxTop + 42);

      const statItems = [
        { label: 'Overall Syllabus Completed', val: `${stats.overallPercent}% Mastered` },
        { label: 'Full Chapters Completed', val: `${stats.completedChapters} of ${stats.totalChapters} Chapters` },
        { label: 'Study Stages Cleared', val: `${stats.completedStages} / ${stats.totalStages} Stages` },
        { label: 'Active Study Streak', val: `${activeStreakDays} ${activeStreakDays === 1 ? 'Day' : 'Days'} Active 🔥` },
        { label: 'Total Deep-Focus Logged', val: `${profile.totalFocusMinutes || 0} Minutes` },
      ];

      statItems.forEach((item, idx) => {
        const y = boxTop + 92 + idx * 52;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 19px Inter, sans-serif';
        ctx.fillText(item.label, boxLeft + 30, y);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#f8fafc';
        ctx.font = '800 20px Inter, sans-serif';
        ctx.fillText(item.val, boxLeft + boxWidth - 30, y);
        ctx.textAlign = 'left';
      });

      // Right Panel: Subject Mastery Breakdown
      const graphLeft = 960;
      const graphWidth = 840;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(graphLeft, boxTop, graphWidth, boxHeight, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 21px Inter, sans-serif';
      ctx.fillText('SUBJECT-WISE PROGRESS BREAKDOWN', graphLeft + 30, boxTop + 42);

      const displayPaces = paces.slice(0, 5);
      displayPaces.forEach((p, idx) => {
        const rowY = boxTop + 88 + idx * 52;
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.fillText(p.subjectName.slice(0, 32), graphLeft + 30, rowY);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#fde68a';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`${p.percentComplete}%`, graphLeft + graphWidth - 30, rowY);
        ctx.textAlign = 'left';

        const barX = graphLeft + 30;
        const barY = rowY + 8;
        const barW = graphWidth - 60;
        const barH = 10;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 5);
        ctx.fill();

        const fillW = Math.max(10, (p.percentComplete / 100) * barW);
        const barGrad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
        barGrad.addColorStop(0, '#06b6d4');
        barGrad.addColorStop(0.5, '#10b981');
        barGrad.addColorStop(1, '#fbbf24');
        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(barX, barY, fillW, barH, 5);
        ctx.fill();
      });

      // 5. Left Footer: Authentic Website Portal & Issue Date
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText('WEBSITE URL', 350, 874);

      ctx.fillStyle = '#67e8f9';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(CERTIFICATE_WEBSITE_HOST, 350, 904);

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(190, 918);
      ctx.lineTo(510, 918);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(`ISSUED ON ${issueDate.toUpperCase()}`, 350, 942);

      // 6. Embossed Scalloped 24-Point Metallic Gold Seal (Center)
      const sealX = width / 2;
      const sealY = 900;
      // Dual Ribbons (kept cleanly above the bottom strip at y=976)
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(sealX - 28, sealY + 20);
      ctx.lineTo(sealX - 42, sealY + 68);
      ctx.lineTo(sealX - 20, sealY + 56);
      ctx.lineTo(sealX - 4, sealY + 68);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(sealX + 28, sealY + 20);
      ctx.lineTo(sealX + 4, sealY + 68);
      ctx.lineTo(sealX + 20, sealY + 56);
      ctx.lineTo(sealX + 42, sealY + 68);
      ctx.closePath();
      ctx.fill();

      // Starburst Gold Seal
      ctx.save();
      ctx.translate(sealX, sealY);
      const spikes = 24;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? 54 : 45;
        const angle = (i * Math.PI) / spikes;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      const sealGrad = ctx.createRadialGradient(-10, -10, 6, 0, 0, 54);
      sealGrad.addColorStop(0, '#fef08a');
      sealGrad.addColorStop(0.5, '#f59e0b');
      sealGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = sealGrad;
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#451a03';
      ctx.font = '900 11px Inter, sans-serif';
      ctx.fillText('CLASS 10', 0, -8);
      ctx.font = '800 10px "Bricolage Grotesque", "Plus Jakarta Sans", Inter, sans-serif';
      ctx.fillText('GOALBEAM ⚡', 0, 10);
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('ACHIEVER', 0, 24);
      ctx.restore();

      // Right Signature (Founder)
      ctx.textAlign = 'center';
      const sigGrad = ctx.createLinearGradient(width - 460, 880, width - 240, 905);
      sigGrad.addColorStop(0, '#fde68a');
      sigGrad.addColorStop(0.55, '#fb7185');
      sigGrad.addColorStop(1, '#f472b6');
      ctx.fillStyle = sigGrad;
      ctx.font = 'bold 34px "Dancing Script", Georgia, serif';
      ctx.fillText('Shahid Shaikh', width - 350, 900);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width - 490, 918);
      ctx.lineTo(width - 210, 918);
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '800 14px "Bricolage Grotesque", "Plus Jakarta Sans", Inter, sans-serif';
      ctx.fillText('FOUNDER, GOALBEAM COURSE MATRIX', width - 350, 942);

      // 7. Prominent Bottom Website Portal Strip
      ctx.fillStyle = 'rgba(6, 182, 212, 0.14)';
      ctx.fillRect(66, height - 104, width - 132, 38);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#67e8f9';
      ctx.font = 'bold 19px Inter, sans-serif';
      ctx.fillText(
        `TRACK YOUR CLASS 10 SYLLABUS & CREATE YOUR CERTIFICATE AT:   ${CERTIFICATE_WEBSITE_HOST}`,
        width / 2,
        height - 78
      );

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const boardSlug = buildCleanFilenameSlug(boardInfo.id, 'cbse');
      const scholarSlug = buildCleanFilenameSlug(profile.name || '', 'scholar');
      link.download = `aura-${boardSlug}-class-10-progress-certificate-${scholarSlug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Certificate generation error:', e);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Class 10 Board Study Progress Certificate"
      className="keep-dark-surface fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/92 backdrop-blur-md overflow-y-auto animate-in fade-in select-none"
    >
      <div className="relative w-full max-w-5xl bg-slate-950 border-2 border-amber-400/60 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.28)] overflow-hidden flex flex-col my-auto">
        {/* Top Control Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-amber-500/30 gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 flex-wrap">
                <span>{boardInfo.shortName} Class 10 Study Progress Certificate (16:9)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  16:9 HD Diploma
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 break-words">
                Issued: <span className="text-cyan-300 font-semibold">{issueDate}</span> • Board: {boardInfo.shortName} • Medium: {mediumInfo.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isGeneratingPng}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs transition-colors shadow-md cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPng ? 'Rendering HD...' : 'Download HD PNG'}</span>
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleNativeShareClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-xs transition-colors shadow-md cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Flex on WhatsApp 📲</span>
            </a>

            <button
              type="button"
              onClick={handleCopyCaption}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 font-bold text-xs transition-all cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-auto sm:ml-0"
              aria-label="Close Certificate"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Preview Stage */}
        <div className="p-2.5 sm:p-5 bg-slate-950 overflow-x-auto flex justify-center items-center">
          <div
            className="w-full max-w-4xl rounded-xl sm:rounded-2xl bg-[radial-gradient(ellipse_at_top,_#132240_0%,_#091122_55%,_#040812_100%)] border-[4px] sm:border-[6px] border-amber-400/90 p-3.5 sm:p-7 flex flex-col justify-between gap-2.5 sm:gap-3.5 relative shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden min-w-[300px]"
          >
            {/* Diagonal lattice overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.07]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #fbbf24 0, #fbbf24 1px, transparent 1px, transparent 22px), repeating-linear-gradient(-45deg, #38bdf8 0, #38bdf8 1px, transparent 1px, transparent 22px)',
              }}
            />

            {/* Double Inner Border */}
            <div className="absolute inset-1.5 sm:inset-2.5 border border-cyan-400/40 pointer-events-none rounded-lg" />
            <div className="absolute inset-2.5 sm:inset-3.5 border border-amber-400/70 pointer-events-none rounded-md" />

            {/* Filigree Gold Corner Marks */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-5 h-5 border-t-2 border-l-2 border-amber-300 pointer-events-none" />
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 border-t-2 border-r-2 border-amber-300 pointer-events-none" />
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-5 h-5 border-b-2 border-l-2 border-amber-300 pointer-events-none" />
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-5 h-5 border-b-2 border-r-2 border-amber-300 pointer-events-none" />

            {/* Background Crest Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
              <Logo size="hero" className="w-72 h-72 rounded-full" />
            </div>

            {/* Top Date & Board Bar (no ID numbers) */}
            <div className="relative z-10 flex flex-wrap items-center justify-between text-[8px] sm:text-[10px] font-mono text-slate-300 border-b border-amber-400/25 pb-1.5 gap-2">
              <span className="break-words text-amber-200/90 font-bold uppercase">Issued: {issueDate}</span>
              <span className="break-words text-cyan-300 font-bold uppercase">
                {boardInfo.shortName} • {mediumInfo.name}
              </span>
            </div>

            {/* Website Logo Crest + Title & Recipient */}
            <div className="relative z-10 text-center space-y-1.5">
              <div className="flex flex-col items-center justify-center gap-1.5">
                <Logo
                  size="md"
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.35)] border-2 border-amber-400"
                />
                <span className="text-[9px] sm:text-xs font-black tracking-[0.18em] uppercase flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="brand-wordmark brand-wordmark-on-dark">GOALBEAM</span>
                  <span className="text-amber-400 select-none">⚡</span>
                  <span className="text-amber-300 !text-amber-300">• Class 10 Course Matrix</span>
                </span>
              </div>

              <h2 className="text-base sm:text-2xl md:text-3xl font-serif font-black text-white tracking-wide uppercase drop-shadow">
                Certificate of Study Progress
              </h2>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/60 text-[8px] sm:text-[10px] font-black tracking-widest text-amber-200 uppercase">
                ★ {milestoneTier} ★
              </div>

              <div className="pt-1">
                <span className="text-[9px] sm:text-xs italic font-serif text-slate-300 block">
                  Proudly recognizes the Class 10 board preparation progress of
                </span>
                <h1 className="text-xl sm:text-3xl md:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 tracking-wide uppercase drop-shadow-[0_2px_10px_rgba(251,191,36,0.35)] mt-0.5 break-words">
                  {profile.name || 'Dedicated Scholar'}
                </h1>
                <div className="w-48 sm:w-80 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-1" />
                <p className="text-[9px] sm:text-xs font-bold text-slate-200">
                  Class 10 Student ({boardInfo.shortName}) • Target Score:{' '}
                  <span className="text-amber-300 font-black">{profile.targetPercentage}%</span> • First Exam:{' '}
                  <span className="text-cyan-300 font-mono">{profile.firstPaperDate || 'Upcoming'}</span>
                </p>
              </div>
            </div>

            {/* Central Dual Panels: Progress Stats + Subject Breakdown */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
              {/* Left Progress Summary Panel */}
              <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/85 border border-amber-400/35 space-y-2 shadow-inner">
                <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-black text-amber-300 uppercase border-b border-slate-700/80 pb-1 gap-2">
                  <span>Study Progress Summary</span>
                  <span className="text-emerald-400">{stats.overallPercent}% Mastered</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[8px] sm:text-[9px]">Syllabus Completed</span>
                    <strong className="text-cyan-300 text-xs sm:text-sm font-black">{stats.overallPercent}% Done</strong>
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[8px] sm:text-[9px]">Chapters Mastered</span>
                    <strong className="text-emerald-400 text-xs sm:text-sm font-black">
                      {stats.completedChapters} / {stats.totalChapters}
                    </strong>
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[8px] sm:text-[9px]">Stages Cleared</span>
                    <strong className="text-indigo-300 text-xs sm:text-sm font-black">
                      {stats.completedStages} / {stats.totalStages}
                    </strong>
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 block text-[8px] sm:text-[9px]">Study Streak</span>
                    <strong className="text-amber-300 text-xs sm:text-sm font-black">
                      🔥 {activeStreakDays} {activeStreakDays === 1 ? 'Day' : 'Days'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Right Subject Breakdown Bars */}
              <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/85 border border-cyan-400/35 space-y-1.5 shadow-inner">
                <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-black text-cyan-300 uppercase border-b border-slate-700/80 pb-1">
                  <span>Subject Breakdown</span>
                  <span className="font-mono text-amber-300">{paces.length} Enrolled</span>
                </div>
                <div className="space-y-1.5">
                  {paces.slice(0, 4).map((p) => (
                    <div key={p.subjectId} className="space-y-0.5">
                      <div className="flex items-center justify-between gap-2 text-[9px] sm:text-[10px] font-bold text-slate-200">
                        <span className="break-words min-w-0 flex-1">{p.subjectName}</span>
                        <span className="text-amber-300 font-mono shrink-0">{p.percentComplete}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 rounded-full"
                          style={{ width: `${Math.max(4, p.percentComplete)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer: Website Portal + Embossed Gold Seal + Founder */}
            <div className="relative z-10 grid grid-cols-3 items-end gap-2 pt-2 border-t border-amber-400/25">
              {/* Left: Website URL & Issue Date */}
              <div className="text-left min-w-0">
                <div className="text-[7px] sm:text-[9px] text-slate-400 font-semibold uppercase">
                  Website URL
                </div>
                <div className="font-mono font-bold text-cyan-300 text-[9px] sm:text-xs break-all">
                  {CERTIFICATE_WEBSITE_HOST}
                </div>
                <div className="w-20 sm:w-32 h-[1px] bg-slate-500 my-0.5" />
                <div className="text-[7px] sm:text-[9px] text-slate-400 font-semibold uppercase">
                  Issued {issueDate}
                </div>
              </div>

              {/* Center: Scalloped Gold Foil Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-700 border-2 border-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.5)] flex flex-col items-center justify-center text-amber-950 font-black leading-none p-1">
                  <span className="text-[6px] sm:text-[7px] tracking-widest uppercase">Class 10</span>
                  <span className="text-[6.5px] sm:text-[9px] font-black my-0.5 font-['Bricolage_Grotesque',sans-serif] tracking-tight leading-tight text-center whitespace-nowrap">GOALBEAM ⚡</span>
                  <span className="text-[6px] sm:text-[7px] uppercase">Achiever</span>
                </div>
              </div>

              {/* Right: Founder Calligraphic Signature */}
              <div className="text-right">
                <div className="creator-author creator-author-on-dark text-sm sm:text-lg leading-tight">
                  Shahid Shaikh
                </div>
                <div className="w-20 sm:w-28 h-[1px] bg-slate-500 my-0.5 ml-auto" />
                <div className="text-[7px] sm:text-[9px] text-slate-400 font-semibold uppercase flex items-center justify-end gap-1">
                  <span>Founder,</span>
                  <span className="brand-wordmark brand-wordmark-on-dark text-[8px] sm:text-[10px]">GOALBEAM</span>
                  <span className="text-amber-400 select-none">⚡</span>
                </div>
              </div>
            </div>

            {/* Bottom Website URL CTA Banner */}
            <div className="relative z-10 rounded-lg bg-gradient-to-r from-cyan-500/20 via-emerald-500/15 to-amber-500/20 border border-cyan-400/40 px-3 py-1.5 flex items-center justify-center gap-2 text-center flex-wrap">
              <Globe className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span className="text-[9px] sm:text-xs font-bold text-slate-200">
                Track Your Class 10 Board Syllabus &amp; Create Yours:
              </span>
              <span className="font-mono text-[10px] sm:text-xs font-black text-cyan-300 tracking-wider break-all">
                {CERTIFICATE_WEBSITE_HOST}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Tip */}
        <div className="p-2.5 sm:p-3 bg-[var(--bg-elevated)] border-t border-[var(--border-color)] text-center text-[11px] sm:text-xs text-[var(--text-secondary)]">
          Tap <strong className="text-amber-400">Download HD PNG</strong> for your 16:9 gold-embossed certificate or{' '}
          <strong className="text-emerald-400">Flex on WhatsApp</strong> to share with <span className="font-mono text-cyan-400 break-all">{CERTIFICATE_WEBSITE_HOST}</span>!
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
