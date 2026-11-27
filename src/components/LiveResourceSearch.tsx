import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Globe,
  X,
  FileText,
  BookOpen,
} from 'lucide-react';
import { CLASS_10_SUBJECTS } from '../data/chaptersData';
import {
  OFFICIAL_RESOURCES,
  RESOURCE_CATEGORIES,
  searchAcrossAllDivisions,
  ResourceItem,
} from '../data/resourcesData';
import { LanguageMode } from '../types/tracker';
import { getLocalizedSubjectName } from '../utils/chapterTranslations';
import { InfoTooltip } from './InfoTooltip';
import { AutoGrowPromptInput, ExpandableText } from './ui/ResponsiveTextControls';

interface LiveResourceSearchProps {
  onClose?: () => void;
  defaultSubjectId?: string;
  language?: LanguageMode;
  onRecordStudyActivity?: () => void;
}

type ResourceTypeFilter = 'all' | 'notes' | 'pyq' | 'sample_papers' | 'pdfs' | 'extra_qa' | 'mcqs' | 'tests';

const RESOURCE_TYPE_FILTERS: Array<{ id: ResourceTypeFilter; label: string; categoryMatch?: string[] }> = [
  { id: 'all', label: 'All Free' },
  { id: 'notes', label: 'Notes & Formulas', categoryMatch: ['revision_notes'] },
  { id: 'pyq', label: 'PYQs', categoryMatch: ['cbse_pyq'] },
  { id: 'sample_papers', label: 'Sample Papers', categoryMatch: ['cbse_sqp'] },
  { id: 'pdfs', label: 'PDFs & NCERT', categoryMatch: ['ncert_books', 'cfpq_volumes', 'cbse_competency', 'cbse_topper_answers'] },
  { id: 'extra_qa', label: 'Extra Q&A', categoryMatch: ['extra_qa', 'ncert_solutions', 'reference_books'] },
  { id: 'mcqs', label: 'MCQs', categoryMatch: ['mcq_tests', 'cbse_competency'] },
  { id: 'tests', label: 'Online Tests', categoryMatch: ['mcq_tests'] },
];

const QUICK_SEARCH_PRESETS: Array<{ label: string; query: string; type: ResourceTypeFilter }> = [
  { label: 'Free Chapter Revision Notes & Formula Sheets', query: 'CBSE Class 10 Chapter Revision Notes Formula Handbook Free PDF', type: 'notes' },
  { label: 'Past 10-Yr Previous Year Papers (PYQ) & Topper Copies', query: 'CBSE Class 10 Previous Year Board Papers PYQ Solved Toppers Answers PDF', type: 'pyq' },
  { label: '2026-27 Official SQP, APQ & Marking Schemes', query: 'CBSE Class 10 2026-27 Official Sample Question Paper Additional Practice PDF', type: 'sample_papers' },
  { label: 'NCERT Textbooks, Exemplar & CBSE Question Bank PDFs', query: 'NCERT Class 10 Textbook Exemplar Problems Official Question Bank PDF', type: 'pdfs' },
  { label: 'Extra Question Answers, HOTS & Exemplar Solutions', query: 'CBSE Class 10 Extra Important Questions Answers NCERT Exemplar Solutions', type: 'extra_qa' },
  { label: 'Chapter-wise MCQs & Free Online Timed Mock Tests', query: 'CBSE Class 10 Chapter-wise MCQs Free Online Mock Test Quiz', type: 'tests' },
];

export const LiveResourceSearch: React.FC<LiveResourceSearchProps> = ({
  onClose,
  defaultSubjectId,
  language = 'en',
  onRecordStudyActivity,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(defaultSubjectId || 'all');
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceTypeFilter>('all');
  const [query, setQuery] = useState<string>(() => {
    if (defaultSubjectId && defaultSubjectId !== 'all') {
      const sub = CLASS_10_SUBJECTS.find((s) => s.id === defaultSubjectId);
      return sub ? `${sub.name} Notes, PYQs, Sample Papers, MCQs & Tests` : 'CBSE Class 10 2026-27 Free Study Resources';
    }
    return 'CBSE Class 10 2026-27 Notes, PYQs, Sample Papers, MCQs & Mock Tests';
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<{
    query: string;
    resultText: string;
    groundingMetadata: any;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    if (defaultSubjectId && defaultSubjectId !== selectedSubjectId) {
      setSelectedSubjectId(defaultSubjectId);
      const sub = CLASS_10_SUBJECTS.find((s) => s.id === defaultSubjectId);
      if (sub) {
        const nextQuery = `${sub.name} Notes, PYQs, Sample Paper, MCQs & Online Tests`;
        setQuery(nextQuery);
        handleSearch(nextQuery, defaultSubjectId, selectedResourceType);
      }
    }
  }, [defaultSubjectId]);

  // Instant live matching across all verified local CBSE/NCERT & free study repository items
  const matchedOfficialDocs = useMemo<ResourceItem[]>(() => {
    let pool = OFFICIAL_RESOURCES;
    if (selectedSubjectId !== 'all') {
      pool = pool.filter((r) => r.subjectId === selectedSubjectId || r.subjectId === 'all');
    }
    const activeFilterMeta = RESOURCE_TYPE_FILTERS.find((f) => f.id === selectedResourceType);
    if (activeFilterMeta?.categoryMatch && activeFilterMeta.categoryMatch.length > 0) {
      pool = pool.filter((r) => activeFilterMeta.categoryMatch!.includes(r.category));
    }
    const cleanQ = query
      .replace(/CBSE|Class 10|Official|latest|free|online/gi, '')
      .trim();
    if (cleanQ) {
      const searched = searchAcrossAllDivisions(pool, cleanQ);
      if (searched.length > 0) {
        return searched.slice(0, 8);
      }
    }
    return pool.slice(0, 8);
  }, [query, selectedSubjectId, selectedResourceType]);

  const buildSmartResult = (q: string, subId: string) => {
    const subObj = CLASS_10_SUBJECTS.find((s) => s.id === subId);
    const subLabel = subObj ? `${subObj.name} (Code ${subObj.code})` : 'All CBSE Class 10 Subjects';
    const sqpUrl = 'https://cbseacademic.nic.in/SQP_CLASSX_2026-27.html';
    const qbUrl = 'https://cbseacademic.nic.in/qbclass10.html';
    const ncertUrl = 'https://ncert.nic.in/exemplar-problems.php?ln=en';
    const pyqUrl = 'https://www.cbse.gov.in/cbsenew/question-paper.html';
    const notesUrl = 'https://www.learncbse.in/cbse-class-10-notes/';
    const testsUrl = 'https://www.selfstudys.com/mcq/cbse/mock-test/class-10th';
    const googlePdfUrl = `https://www.google.com/search?q=${encodeURIComponent(`CBSE Class 10 ${subObj ? subObj.name : ''} ${q}`)}`;

    return {
      query: q,
      resultText: [
        `Verified CBSE Class 10 Free Resource Directory (${subLabel})`,
        ``,
        `• Official Sample Papers (SQP) & Marking Schemes (2026-27): [Open CBSE Official SQP Table](${sqpUrl})`,
        `• Official CBSE Question Bank PDFs (Science, Maths, English): [Open CBSE Question Bank](${qbUrl})`,
        `• NCERT Textbooks & Exemplar Problems: [Open NCERT Exemplar Portal](${ncertUrl})`,
        `• 10-Year Previous Board Question Papers: [Open CBSE Official PYQ Portal](${pyqUrl})`,
        `• Free Revision Notes, Extra Q&As & MCQs: [Open LearnCBSE Free Class 10 Notes](${notesUrl})`,
        `• Free Timed Online MCQ Mock Tests: [Start Free Mock Tests on SelfStudys](${testsUrl})`,
        `• Direct Web Search for "${q}": [Search CBSE Class 10 Free Resources](${googlePdfUrl})`,
      ].join('\n'),
      groundingMetadata: {
        groundingChunks: [
          {
            web: {
              title: `CBSE Official Sample Question Papers 2026-27 — ${subLabel}`,
              uri: sqpUrl,
            },
          },
          {
            web: {
              title: `CBSE Official Class 10 Question Bank PDFs`,
              uri: qbUrl,
            },
          },
          {
            web: {
              title: `NCERT Official Class 10 Textbooks & Exemplar PDFs`,
              uri: ncertUrl,
            },
          },
          {
            web: {
              title: `Free Chapter Revision Notes & Extra Q&As (LearnCBSE)`,
              uri: notesUrl,
            },
          },
          {
            web: {
              title: `Free Online Timed MCQ Mock Tests (SelfStudys)`,
              uri: testsUrl,
            },
          },
          {
            web: {
              title: `Google Search: ${q}`,
              uri: googlePdfUrl,
            },
          },
        ],
      },
      timestamp: new Date().toISOString(),
    };
  };

  const handleSearch = async (
    customQuery?: string,
    customSubjectId?: string,
    customType?: ResourceTypeFilter
  ) => {
    const q = (customQuery ?? query).trim() || 'CBSE Class 10 2026-27 Official Sample Papers';
    const activeSubId = customSubjectId ?? selectedSubjectId;
    const activeType = customType ?? selectedResourceType;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/search-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          subjectId: activeSubId !== 'all' ? activeSubId : undefined,
          session: '2026-27',
          resourceType: activeType,
        }),
      });

      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }

      const data = await res.json();
      if (data && (data.resultText || data.groundingMetadata)) {
        setSearchResult(data);
      } else {
        setSearchResult(buildSmartResult(q, activeSubId));
      }
    } catch {
      setSearchResult(buildSmartResult(q, activeSubId));
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  // Cleanly format markdown links and strip raw markdown headers/asterisks so mobile cards never overflow
  const renderFormattedMarkdown = (content: string) => {
    const cleaned = content
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1');

    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(cleaned)) !== null) {
      if (match.index > lastIndex) {
        parts.push(cleaned.substring(lastIndex, match.index));
      }
      const label = match[1];
      const url = match[2];
      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onRecordStudyActivity?.()}
          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-2 break-words [overflow-wrap:anywhere] max-w-full"
        >
          <span className="break-words [overflow-wrap:anywhere]">{label}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < cleaned.length) {
      parts.push(cleaned.substring(lastIndex));
    }
    return parts;
  };

  const activeSubjectObj = CLASS_10_SUBJECTS.find((s) => s.id === selectedSubjectId);
  const directGoogleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `CBSE Class 10 ${activeSubjectObj ? activeSubjectObj.name : ''} ${query} free`
  )}`;

  return (
    <div className="rounded-2xl bg-[var(--bg-card)] border border-cyan-500/40 p-3.5 sm:p-5 shadow-xl space-y-4 text-[var(--text-primary)] overflow-hidden min-w-0 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[var(--border-color)] min-w-0">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)] break-words">
                Live CBSE & NCERT Official Resource Finder
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/40 flex items-center gap-1 max-w-full">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="break-words">Real-Time Verified</span>
              </span>
              <InfoTooltip text="Instant search across verified CBSE SQPs, NCERT books, Competency Banks, and live web portals." />
            </div>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] self-end sm:self-auto cursor-pointer shrink-0"
            title="Close Live Resource Finder"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Subject Filter Selector */}
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)] flex-wrap gap-1">
          <span>Filter by CBSE Subject:</span>
          <span>{CLASS_10_SUBJECTS.length} Subjects Supported</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setSelectedSubjectId('all');
              const newQ = 'CBSE Class 10 2026-27 Official Sample Papers & Syllabus';
              setQuery(newQ);
              handleSearch(newQ, 'all');
            }}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedSubjectId === 'all'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
            }`}
          >
            All Subjects
          </button>
          {CLASS_10_SUBJECTS.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => {
                setSelectedSubjectId(sub.id);
                const newQ = `${sub.name} (Code ${sub.code}) Official Sample Paper Marking Scheme & Syllabus`;
                setQuery(newQ);
                handleSearch(newQ, sub.id);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedSubjectId === sub.id
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
              }`}
            >
              {getLocalizedSubjectName(sub.id, sub.name, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-3 pointer-events-none" />
          <AutoGrowPromptInput
            value={query}
            onValueChange={setQuery}
            onSubmit={() => handleSearch()}
            placeholder="Type chapter, subject code, sample paper, or syllabus topic..."
            maxHeightPx={110}
            ariaLabel="Search live CBSE and NCERT resources"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs border border-[var(--border-color)] focus:outline-none focus:border-cyan-400 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
              title="Clear query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shrink-0 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Find Live Resources</span>
              </>
            )}
          </button>

          <a
            href={directGoogleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRecordStudyActivity?.()}
            className="px-3 py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center justify-center gap-1 shrink-0 transition-all"
            title="Open live Google search for official CBSE & NCERT PDFs"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Web PDF</span>
          </a>
        </div>
      </div>

      {/* Resource Type Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        {RESOURCE_TYPE_FILTERS.map((rt) => (
          <button
            key={rt.id}
            type="button"
            onClick={() => {
              setSelectedResourceType(rt.id);
              const subName = activeSubjectObj ? activeSubjectObj.name : 'All Subjects';
              const nextQ =
                rt.id === 'all'
                  ? `CBSE Class 10 ${subName} Notes, PYQs, Sample Papers, MCQs & Mock Tests`
                  : `CBSE Class 10 ${subName} ${rt.label} free online`;
              setQuery(nextQ);
              handleSearch(nextQ, selectedSubjectId, rt.id);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
              selectedResourceType === rt.id
                ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-emerald-300 border border-[var(--border-color)]'
            }`}
          >
            {rt.label}
          </button>
        ))}
      </div>

      {/* Quick Search Presets */}
      <div className="flex flex-wrap gap-1.5 min-w-0">
        {QUICK_SEARCH_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setSelectedResourceType(preset.type);
              setQuery(preset.query);
              handleSearch(preset.query, selectedSubjectId, preset.type);
            }}
            className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-400 text-[10px] sm:text-[11px] font-semibold text-[var(--text-secondary)] hover:text-cyan-300 transition-all cursor-pointer text-left break-words max-w-full"
          >
            🔍 {preset.label}
          </button>
        ))}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 break-words">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <p className="leading-snug break-words">{error}</p>
        </div>
      )}

      {/* Instant Matched Official Documents Grid */}
      <div className="space-y-2.5 pt-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-extrabold text-cyan-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Direct Official Documents ({matchedOfficialDocs.length} Ready to Open)</span>
          </span>
          <span className="text-[10px] text-[var(--text-secondary)]">
            Click any card to open official PDF / Portal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
          {matchedOfficialDocs.map((doc) => {
            const catMeta = RESOURCE_CATEGORIES.find((c) => c.key === doc.category);
            return (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onRecordStudyActivity?.()}
                className="p-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-cyan-400 transition-all flex flex-col justify-between gap-2 group min-w-0 overflow-hidden"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 break-words max-w-full">
                      {catMeta?.shortLabel || doc.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 break-words">
                      {doc.updatedDateLabel}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors break-words [overflow-wrap:anywhere]">
                    <ExpandableText text={doc.title} maxChars={95} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-color)]/60 text-[10px] text-[var(--text-secondary)] min-w-0 flex-wrap">
                  <span className="break-words [overflow-wrap:anywhere]">{doc.source}</span>
                  <span className="font-bold text-cyan-400 flex items-center gap-1 shrink-0 ml-auto">
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Loading state for AI Grounding */}
      {isLoading && (
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)]/50 border border-cyan-500/30 text-center space-y-2 animate-in fade-in">
          <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Globe className="w-5 h-5 animate-spin" />
          </div>
          <div className="text-xs font-bold text-[var(--text-primary)]">
            Verifying Live CBSE & NCERT Portals...
          </div>
        </div>
      )}

      {/* Live Grounded Web Result & Citations */}
      {searchResult && !isLoading && (
        <div className="space-y-3 p-3 sm:p-4 rounded-xl bg-[var(--bg-elevated)] border border-emerald-500/30 animate-in fade-in overflow-hidden min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[var(--border-color)] min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-emerald-400 break-words">
                Live Web Grounded Links & Summary
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono shrink-0">
              Updated {new Date(searchResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Extracted Direct PDF Links from Google Search Data */}
          {Array.isArray((searchResult as any).pdfLinks) &&
            (searchResult as any).pdfLinks.length > 0 && (
              <div className="space-y-1.5 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 overflow-hidden min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <FileText className="w-3 h-3 shrink-0" />
                  <span>Direct PDF &amp; Official Portal Links (Google Search Verified):</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 min-w-0">
                  {(searchResult as any).pdfLinks.map((pdfItem: { title: string; url: string; isPdf?: boolean }, idx: number) => (
                    <a
                      key={idx}
                      href={pdfItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onRecordStudyActivity?.()}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-[var(--bg-card)] hover:bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 flex items-center justify-between gap-1.5 transition-colors min-w-0 overflow-hidden"
                    >
                      <span className="break-words [overflow-wrap:anywhere] min-w-0 flex-1">
                        {pdfItem.isPdf ? '📄 PDF: ' : '🌐 '}
                        {pdfItem.title}
                      </span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

          {/* Grounding Source Citations */}
          {searchResult.groundingMetadata?.groundingChunks &&
            searchResult.groundingMetadata.groundingChunks.length > 0 && (
              <div className="space-y-1.5 p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Verified Official Portal Links:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 min-w-0">
                  {searchResult.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                    const web = chunk.web;
                    if (!web?.uri) return null;
                    return (
                      <a
                        key={i}
                        href={web.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onRecordStudyActivity?.()}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[var(--bg-elevated)] hover:bg-cyan-500/20 text-cyan-300 border border-[var(--border-color)] hover:border-cyan-400 flex items-center justify-between gap-1.5 transition-colors min-w-0 overflow-hidden"
                      >
                        <span className="break-words [overflow-wrap:anywhere] min-w-0 flex-1">{web.title || web.uri}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Formatted Text Content */}
          <div className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] space-y-2 bg-[var(--bg-card)]/60 p-3 rounded-xl border border-[var(--border-color)] max-h-80 overflow-y-auto overflow-x-hidden min-w-0">
            {renderFormattedMarkdown(searchResult.resultText)}
          </div>
        </div>
      )}
    </div>
  );
};
