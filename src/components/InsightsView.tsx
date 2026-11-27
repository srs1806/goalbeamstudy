import React, { useState } from 'react';
import { Profile, LanguageMode } from '../types/tracker';
import { getOverallStats, getDaysUntilFirstPaper } from '../utils/planner';
import { CLASS_10_SUBJECTS, STAGES_CONFIG } from '../data/chaptersData';
import { DEFAULT_SELECTED_SUBJECT_IDS } from '../utils/storage';
import {
  TrendingUp,
  Layers,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  LineChart as LineChartIcon,
} from 'lucide-react';
import { getLocalizedSubjectName } from '../utils/chapterTranslations';
import { InfoTooltip } from './InfoTooltip';
import { LockedFeatureOverlay } from './LockedFeatureOverlay';

interface InsightsViewProps {
  profile: Profile;
  onNavigateToSubject: (subjectId: string) => void;
  isIncompleteProfile?: boolean;
  onCompleteProfile?: () => void;
  language?: LanguageMode;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  profile,
  onNavigateToSubject,
  isIncompleteProfile = false,
  onCompleteProfile,
  language = 'en',
}) => {
  const isGuestLocked = isIncompleteProfile || !profile?.id || profile.id === 'guest-preview';
  const triggerCompleteProfile = () => {
    onCompleteProfile?.();
  };
  const stats = getOverallStats(profile);
  const daysLeft = getDaysUntilFirstPaper(profile.firstPaperDate);
  const [highlightedSubject, setHighlightedSubject] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    subjectName: string;
    stageLabel: string;
    percent: number;
    doneCount: number;
    totalCount: number;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  const enrolledIds =
    Array.isArray(profile.selectedSubjectIds) && profile.selectedSubjectIds.length > 0
      ? profile.selectedSubjectIds
      : DEFAULT_SELECTED_SUBJECT_IDS;

  const enrolledSubjects = CLASS_10_SUBJECTS.filter((s) => enrolledIds.includes(s.id));

  // Helper to retrieve allowed chapter IDs with fallback to full syllabus
  const getAllowedChapters = (sub: (typeof CLASS_10_SUBJECTS)[0]) => {
    const custom = profile?.examSyllabus?.[sub.id];
    if (Array.isArray(custom) && custom.length > 0) return custom;
    return sub.groups.flatMap((g) => g.chapters.map((c) => c.id));
  };

  // Trajectory Milestones across the X-axis from 0% baseline to 100% Target Mastery
  const TRAJECTORY_MILESTONES = [
    { key: 'baseline', label: 'Start Baseline', shortLabel: 'Start' },
    { key: 'ncert', label: 'Stage 1: NCERT Exercises', shortLabel: 'NCERT' },
    { key: 'ref_book', label: 'Stage 2: Reference Book Study', shortLabel: 'Ref Book' },
    { key: 'pyq_cbq', label: 'Stage 3: PYQ & Competency CBQ', shortLabel: 'PYQ & CBQ' },
    { key: 'worksheet', label: 'Stage 4: Worksheet & Practice', shortLabel: 'Worksheet' },
    { key: 'mastery', label: 'Board Target Mastery', shortLabel: 'Mastery' },
  ];

  // Compute 4-stage completion analytics across enrolled subjects
  const stageStats = STAGES_CONFIG.map((stage) => {
    let totalCount = 0;
    let doneCount = 0;
    let inProgressCount = 0;

    enrolledSubjects.forEach((sub) => {
      const allowedChapters = getAllowedChapters(sub);
      const subProg = profile?.progress?.[sub.id] || {};
      sub.groups.forEach((g) => {
        g.chapters.forEach((ch) => {
          if (allowedChapters.includes(ch.id)) {
            totalCount++;
            const st = subProg[ch.id]?.stages?.[stage.key];
            if (st === 'done') doneCount++;
            else if (st === 'in_progress') inProgressCount++;
          }
        });
      });
    });

    const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    return {
      key: stage.key,
      label: stage.label,
      shortLabel: stage.shortLabel,
      doneCount,
      inProgressCount,
      totalCount,
      percent,
    };
  });

  // Calculate neon progression curves per subject across all 6 trajectory milestones
  const subjectCurves = enrolledSubjects.map((sub, subIdx) => {
    const allowedChapters = getAllowedChapters(sub);
    const subProg = profile?.progress?.[sub.id] || {};
    const totalChapters = allowedChapters.length || 1;

    // Compute subject overall percent
    let allStagesDone = 0;
    let allStagesTotal = totalChapters * STAGES_CONFIG.length;
    sub.groups.forEach((g) => {
      g.chapters.forEach((ch) => {
        if (allowedChapters.includes(ch.id)) {
          STAGES_CONFIG.forEach((st) => {
            if (subProg[ch.id]?.stages?.[st.key] === 'done') allStagesDone++;
          });
        }
      });
    });
    const overallPct = allStagesTotal > 0 ? Math.round((allStagesDone / allStagesTotal) * 100) : 0;

    const points = TRAJECTORY_MILESTONES.map((m) => {
      if (m.key === 'baseline') {
        return {
          milestoneKey: m.key,
          stageLabel: m.shortLabel,
          fullLabel: m.label,
          done: 0,
          total: totalChapters,
          percent: 0,
        };
      }
      if (m.key === 'mastery') {
        return {
          milestoneKey: m.key,
          stageLabel: m.shortLabel,
          fullLabel: m.label,
          done: allStagesDone,
          total: allStagesTotal,
          percent: overallPct,
        };
      }

      const stageKey = m.key as (typeof STAGES_CONFIG)[0]['key'];
      let done = 0;
      sub.groups.forEach((g) => {
        g.chapters.forEach((ch) => {
          if (allowedChapters.includes(ch.id)) {
            if (subProg[ch.id]?.stages?.[stageKey] === 'done') {
              done++;
            }
          }
        });
      });
      const pct = Math.round((done / totalChapters) * 100);
      return {
        milestoneKey: m.key,
        stageLabel: m.shortLabel,
        fullLabel: m.label,
        done,
        total: totalChapters,
        percent: pct,
      };
    });

    return {
      subjectId: sub.id,
      name: sub.name,
      code: sub.code,
      color: sub.color,
      points,
      overallPct,
      subIdx,
    };
  });

  // Overall Curve trajectory points across 6 milestones
  const overallMilestonePoints = TRAJECTORY_MILESTONES.map((m) => {
    if (m.key === 'baseline') return 0;
    if (m.key === 'mastery') return stats.overallPercent;
    const foundStage = stageStats.find((s) => s.key === m.key);
    return foundStage ? foundStage.percent : 0;
  });

  // SVG Chart Geometry Constants
  const chartWidth = 720;
  const chartHeight = 280;
  const padLeft = 45;
  const padRight = 35;
  const padTop = 28;
  const padBottom = 54;
  const plotWidth = chartWidth - padLeft - padRight;
  const plotHeight = chartHeight - padTop - padBottom;

  const getCoordinates = (
    milestoneIndex: number,
    percent: number,
    subIdx: number = 0,
    isOverall: boolean = false
  ) => {
    const x = padLeft + (milestoneIndex / (TRAJECTORY_MILESTONES.length - 1)) * plotWidth;
    // Tiny vertical offset (up to +/- 2.5px) if subjects share identical percent to make all lines visible
    const offset = isOverall ? 0 : (subIdx - (enrolledSubjects.length - 1) / 2) * 2;
    const clampedPct = Math.max(0, Math.min(100, percent));
    const y = padTop + plotHeight - (clampedPct / 100) * plotHeight + offset;
    return { x, y };
  };

  // Helper to generate smooth SVG cubic bezier path
  const makePathD = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  // Overall Curve coords
  const overallCoords = overallMilestonePoints.map((pct, i) =>
    getCoordinates(i, pct, 0, true)
  );
  const overallLineD = makePathD(overallCoords);
  const overallAreaD =
    overallCoords.length > 0
      ? `${overallLineD} L ${overallCoords[overallCoords.length - 1].x} ${
          padTop + plotHeight
        } L ${overallCoords[0].x} ${padTop + plotHeight} Z`
      : '';

  // Handlers for pixel-aligned smooth focus dot when hovering over curve paths
  const handleLineHover = (
    e: React.MouseEvent<SVGPathElement>,
    coords: { x: number; y: number }[],
    subjectName: string,
    color: string,
    points: { stageLabel: string; fullLabel: string; percent: number; done: number; total: number }[]
  ) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg || coords.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * chartWidth;

    let closestIdx = 0;
    let minDiff = Infinity;
    coords.forEach((c, idx) => {
      const diff = Math.abs(c.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    const coord = coords[closestIdx];
    const pt = points[closestIdx];
    if (coord && pt) {
      setHoveredPoint({
        subjectName,
        stageLabel: `${pt.stageLabel}: ${pt.fullLabel}`,
        percent: pt.percent,
        doneCount: pt.done,
        totalCount: pt.total,
        color,
        x: coord.x,
        y: coord.y,
      });
    }
  };

  const handleOverallLineHover = (e: React.MouseEvent<SVGPathElement>) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg || overallCoords.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * chartWidth;

    let closestIdx = 0;
    let minDiff = Infinity;
    overallCoords.forEach((c, idx) => {
      const diff = Math.abs(c.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    const coord = overallCoords[closestIdx];
    const m = TRAJECTORY_MILESTONES[closestIdx];
    const pct = overallMilestonePoints[closestIdx];
    if (coord && m) {
      setHoveredPoint({
        subjectName: 'Overall Board Mastery',
        stageLabel: `${m.shortLabel}: ${m.label}`,
        percent: pct,
        doneCount: Math.round((pct / 100) * (stats.totalStages || 1)),
        totalCount: stats.totalStages || 1,
        color: '#22d3ee',
        x: coord.x,
        y: coord.y,
      });
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 min-w-0">
      {/* Header Banner - Compact & Space Efficient */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LineChartIcon className="w-5 h-5 text-cyan-400 shrink-0" />
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-[var(--text-primary)]">
            Syllabus Mastery Trajectory
          </h1>
          <InfoTooltip
            text="Multi-subject progression curves and completion milestones across NCERT, Reference Books, PYQs/CBQs, and Worksheets."
            label="Syllabus trajectory info"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold shrink-0 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{daysLeft} Days to 1st Paper</span>
        </div>
      </div>


      {/* Main Dedicated Neon Multi-Line Curve Graph */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-5 shadow-sm space-y-3.5">
        {/* Neon Subject Filter & Highlighting Legend Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-[var(--text-muted)] mr-1">Neon Curves:</span>

            {/* Overall Curve Pill */}
            <button
              type="button"
              onClick={() => setHighlightedSubject(null)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                highlightedSubject === null
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              <span>Overall ({stats.overallPercent}%)</span>
            </button>

            {/* Enrolled Subject Curves with authentic home-screen neon colors */}
            {subjectCurves.map((sc) => {
              const isSelected = highlightedSubject === sc.subjectId;
              return (
                <button
                  key={sc.subjectId}
                  type="button"
                  onClick={() =>
                    setHighlightedSubject(isSelected ? null : sc.subjectId)
                  }
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'shadow-md text-slate-950 font-black'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: sc.color,
                          borderColor: sc.color,
                          boxShadow: `0 0 14px ${sc.color}80`,
                        }
                      : undefined
                  }
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: sc.color,
                      boxShadow: `0 0 6px ${sc.color}`,
                    }}
                  />
                  <span>
                    {getLocalizedSubjectName(sc.subjectId, sc.name, language)} ({sc.overallPct}%)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SVG Neon Multi-Line Graph Canvas */}
        <div className="keep-dark-surface relative pt-2 pb-2 px-1 sm:px-4 rounded-xl bg-slate-950/80 border border-[var(--border-color)] overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto max-h-[350px] select-none"
          >
            <defs>
              {/* Overall gradient area fill */}
              <linearGradient id="neonOverallGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#10b981" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>

              {/* Glowing Neon Drop Shadow Filters */}
              <filter id="neonGlowOverall" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#22d3ee" floodOpacity="0.9" />
              </filter>

              {enrolledSubjects.map((sub) => (
                <filter
                  key={`glow-${sub.id}`}
                  id={`neonGlow-${sub.id}`}
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="3.5"
                    floodColor={sub.color}
                    floodOpacity="0.85"
                  />
                </filter>
              ))}
            </defs>

            {/* Y-Axis Grid Lines & Percentage Scale */}
            {[0, 25, 50, 75, 100].map((pct) => {
              const y = padTop + plotHeight - (pct / 100) * plotHeight;
              return (
                <g key={pct}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={chartWidth - padRight}
                    y2={y}
                    stroke="rgba(148, 163, 184, 0.12)"
                    strokeDasharray={pct === 0 || pct === 100 ? undefined : '4 4'}
                    strokeWidth={pct === 0 ? '1.5' : '1'}
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 3.5}
                    fill="rgba(148, 163, 184, 0.7)"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="700"
                    textAnchor="end"
                  >
                    {pct}%
                  </text>
                </g>
              );
            })}

            {/* Vertical Milestone Guide Lines */}
            {TRAJECTORY_MILESTONES.map((_, i) => {
              const x = padLeft + (i / (TRAJECTORY_MILESTONES.length - 1)) * plotWidth;
              return (
                <line
                  key={i}
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={padTop + plotHeight}
                  stroke="rgba(148, 163, 184, 0.12)"
                  strokeDasharray="2 4"
                />
              );
            })}

            {/* Overall Area Glow Under Curve */}
            {overallAreaD && (
              <path
                d={overallAreaD}
                fill="url(#neonOverallGrad)"
                className="transition-all duration-500"
              />
            )}

            {/* Individual Subject Neon Lines */}
            {subjectCurves.map((sc) => {
              const isHighlighted = highlightedSubject === sc.subjectId;
              const isDimmed = highlightedSubject !== null && !isHighlighted;
              const coords = sc.points.map((pt, i) =>
                getCoordinates(i, pt.percent, sc.subIdx, false)
              );
              const pathD = makePathD(coords);

              return (
                <g key={sc.subjectId}>
                  {/* Invisible wide stroke for easy line hover interaction */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="20"
                    className="cursor-pointer"
                    onMouseMove={(e) => handleLineHover(e, coords, sc.name, sc.color, sc.points)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  <path
                    d={pathD}
                    fill="none"
                    stroke={sc.color}
                    strokeWidth={isHighlighted ? '4.5' : '3'}
                    strokeOpacity={isDimmed ? '0.15' : isHighlighted ? '1' : '0.9'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={isHighlighted || highlightedSubject === null ? `url(#neonGlow-${sc.subjectId})` : undefined}
                    className="transition-all duration-300 pointer-events-none"
                  />

                  {/* Subject Milestone Data Points */}
                  {coords.map((coord, i) => {
                    const pt = sc.points[i];
                    return (
                      <circle
                        key={i}
                        cx={coord.x}
                        cy={coord.y}
                        r={isHighlighted ? '6.5' : '4.5'}
                        fill={sc.color}
                        stroke="#030712"
                        strokeWidth="2"
                        opacity={isDimmed ? '0.2' : '1'}
                        className="cursor-pointer"
                        onMouseEnter={() =>
                          setHoveredPoint({
                            subjectName: sc.name,
                            stageLabel: `${pt.stageLabel}: ${pt.fullLabel}`,
                            percent: pt.percent,
                            doneCount: pt.done,
                            totalCount: pt.total,
                            color: sc.color,
                            x: coord.x,
                            y: coord.y,
                          })
                        }
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* Overarching Overall Mastery Neon Line */}
            {overallLineD && (
              <g>
                {/* Invisible wide stroke for overall line hover interaction */}
                <path
                  d={overallLineD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  className="cursor-pointer"
                  onMouseMove={handleOverallLineHover}
                  onMouseLeave={() => setHoveredPoint(null)}
                />

                <path
                  d={overallLineD}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3.5"
                  strokeOpacity={highlightedSubject !== null ? '0.4' : '1'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#neonGlowOverall)"
                  className="transition-all duration-300 pointer-events-none"
                />

                {/* Overall Milestone Nodes */}
                {overallCoords.map((coord, i) => {
                  const m = TRAJECTORY_MILESTONES[i];
                  const pct = overallMilestonePoints[i];
                  return (
                    <circle
                      key={i}
                      cx={coord.x}
                      cy={coord.y}
                      r="6"
                      fill="#22d3ee"
                      stroke="#ffffff"
                      strokeWidth="2"
                      opacity={highlightedSubject !== null ? '0.4' : '1'}
                      className="cursor-pointer shadow-[0_0_8px_#22d3ee]"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          subjectName: 'Overall Board Mastery',
                          stageLabel: `${m.shortLabel}: ${m.label}`,
                          percent: pct,
                          doneCount: Math.round((pct / 100) * (stats.totalStages || 1)),
                          totalCount: stats.totalStages || 1,
                          color: '#22d3ee',
                          x: coord.x,
                          y: coord.y,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </g>
            )}

            {/* Precision Pixel-Aligned Animated Focus Reticle on Line Hover */}
            {hoveredPoint && (
              <g pointerEvents="none" className="transition-all duration-150 ease-out">
                {/* Vertical milestone tracking guide */}
                <line
                  x1={hoveredPoint.x}
                  y1={padTop}
                  x2={hoveredPoint.x}
                  y2={padTop + plotHeight}
                  stroke={hoveredPoint.color}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  strokeOpacity="0.45"
                />
                {/* Horizontal coordinate guide */}
                <line
                  x1={padLeft}
                  y1={hoveredPoint.y}
                  x2={chartWidth - padRight}
                  y2={hoveredPoint.y}
                  stroke={hoveredPoint.color}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  strokeOpacity="0.3"
                />
                {/* Animated outer ping pulse ring */}
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="14"
                  fill="none"
                  stroke={hoveredPoint.color}
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                  className="animate-ping"
                  style={{ transformOrigin: `${hoveredPoint.x}px ${hoveredPoint.y}px` }}
                />
                {/* Precision concentric glow ring */}
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="9"
                  fill={hoveredPoint.color}
                  fillOpacity="0.25"
                  stroke={hoveredPoint.color}
                  strokeWidth="2"
                />
                {/* Pixel-aligned solid focus core dot */}
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="4.5"
                  fill="#ffffff"
                  stroke={hoveredPoint.color}
                  strokeWidth="2.5"
                  filter="drop-shadow(0 0 6px rgba(255,255,255,0.9))"
                />
              </g>
            )}

            {/* X-Axis Milestone Labels: 6 Trajectory Milestones */}
            {TRAJECTORY_MILESTONES.map((m, i) => {
              const x = padLeft + (i / (TRAJECTORY_MILESTONES.length - 1)) * plotWidth;
              return (
                <g key={m.key} className="select-none">
                  <text
                    x={x}
                    y={padTop + plotHeight + 18}
                    fill="var(--text-primary)"
                    fontSize="10"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {m.shortLabel}
                  </text>
                  <text
                    x={x}
                    y={padTop + plotHeight + 31}
                    fill="rgba(148, 163, 184, 0.7)"
                    fontSize="8.5"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {i === 0 ? 'Baseline' : i === TRAJECTORY_MILESTONES.length - 1 ? '100% Target' : `Stage ${i}`}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Popup */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none z-20 px-3 py-2 rounded-xl bg-slate-950/95 border text-xs shadow-2xl backdrop-blur-md -translate-x-1/2 -translate-y-full mb-3"
              style={{
                left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                top: `${(hoveredPoint.y / chartHeight) * 100}%`,
                borderColor: hoveredPoint.color,
                boxShadow: `0 0 16px ${hoveredPoint.color}50`,
              }}
            >
              <div
                className="font-black text-xs flex items-center gap-1.5"
                style={{ color: hoveredPoint.color }}
              >
                <span>{hoveredPoint.subjectName}</span>
                <span>• {hoveredPoint.percent}%</span>
              </div>
              <div className="text-slate-200 text-[11px] font-bold mt-0.5">
                {hoveredPoint.stageLabel}
              </div>
              <div className="text-[10px] text-slate-400">
                {hoveredPoint.doneCount} of {hoveredPoint.totalCount} completed
              </div>
            </div>
          )}
        </div>

        {/* 3 High-Yield Insights Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-start sm:items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                Leading Stage
              </div>
              <div className="text-xs font-black text-[var(--text-primary)] break-words [overflow-wrap:anywhere] leading-snug">
                {stageStats.reduce((max, s) => (s.percent > max.percent ? s : max), stageStats[0]).label} (
                {stageStats.reduce((max, s) => (s.percent > max.percent ? s : max), stageStats[0]).percent}%)
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-start sm:items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                Highest Board Weightage
              </div>
              <div className="text-xs font-black text-[var(--text-primary)] break-words [overflow-wrap:anywhere] leading-snug">
                50% Competency (PYQ &amp; CBQ)
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-start sm:items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                Board Readiness Index
              </div>
              <div className="text-xs font-black text-[var(--text-primary)] break-words [overflow-wrap:anywhere] leading-snug">
                {stats.overallPercent >= 75
                  ? 'Distinction Track (90%+ Ready)'
                  : stats.overallPercent >= 45
                  ? 'Accelerating (On Schedule)'
                  : 'Foundation Building Phase'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-wise Pace & 4-Stage Pipeline Breakdown (Locked with chains until profile setup completed) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subject-Wise Pace Card */}
        {(() => {
          const paceCard = (
            <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-5 shadow-sm space-y-3 h-full">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
                <h2 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                  Subject Pace &amp; Daily Target
                </h2>
              </div>

              <div className="space-y-2.5">
                {stats.paces.map((p) => {
                  const subMeta = CLASS_10_SUBJECTS.find((s) => s.id === p.subjectId);
                  const subColor = subMeta?.color || '#22d3ee';
                  const subCode = subMeta?.code || '';
                  return (
                    <div
                      key={p.subjectId}
                      onClick={() => onNavigateToSubject(p.subjectId)}
                      className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]/40 transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                            style={{ backgroundColor: subColor, boxShadow: `0 0 6px ${subColor}` }}
                          />
                          <span className="font-extrabold text-xs text-[var(--text-primary)] break-words [overflow-wrap:anywhere]">
                            {getLocalizedSubjectName(p.subjectId, p.subjectName, language)}
                          </span>
                          {subCode && (
                            <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                              ({subCode})
                            </span>
                          )}
                        </div>
                        <span
                          className="sub-accent-text text-xs font-mono font-bold shrink-0"
                          style={{ '--sub-hex': subColor } as React.CSSProperties}
                        >
                          {p.percentComplete}%
                        </span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-[var(--bg-card)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${p.percentComplete}%`, backgroundColor: subColor }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                        <span>
                          {p.completedChapters}/{p.totalChaptersInSyllabus} Ch • {p.completedStages}/{p.totalStages} Stg
                        </span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          Target: {p.stagesPerDayNeeded} stg/day
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );

          return isGuestLocked ? (
            <LockedFeatureOverlay
              featureLabel="Subject Pace & Daily Targets"
              onCompleteProfile={triggerCompleteProfile}
            >
              {paceCard}
            </LockedFeatureOverlay>
          ) : (
            paceCard
          );
        })()}

        {/* 4-Stage Mastery Pipeline Card */}
        {(() => {
          const pipelineCard = (
            <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-5 shadow-sm space-y-3 h-full">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
                <h2 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                  4-Stage Mastery Pipeline
                </h2>
              </div>

              <div className="space-y-3">
                {stageStats.map((st, idx) => (
                  <div key={st.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--text-primary)]">
                        Stage {idx + 1}: {st.label}
                      </span>
                      <span className="font-mono text-[var(--text-secondary)] text-[11px]">
                        <strong className="text-emerald-400">{st.doneCount}</strong> / {st.totalCount} ({st.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${st.percent}%` }}
                      />
                      {st.inProgressCount > 0 && (
                        <div
                          className="h-full bg-amber-400 transition-all duration-500"
                          style={{
                            width: `${Math.round((st.inProgressCount / (st.totalCount || 1)) * 100)}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

          return isGuestLocked ? (
            <LockedFeatureOverlay
              featureLabel="4-Stage Mastery Pipeline"
              onCompleteProfile={triggerCompleteProfile}
            >
              {pipelineCard}
            </LockedFeatureOverlay>
          ) : (
            pipelineCard
          );
        })()}
      </div>
    </div>
  );
};
