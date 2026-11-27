import React, { useState, useEffect, useMemo } from 'react';
import {
  OFFICIAL_RESOURCES,
  ResourceCategory,
  ResourceItem,
  sortResourcesByUpdatedDate,
  searchAcrossAllDivisions,
} from '../data/resourcesData';
import { CLASS_10_SUBJECTS } from '../data/chaptersData';
import { DEFAULT_SELECTED_SUBJECT_IDS } from '../utils/storage';
import { LanguageMode, Profile, Subject } from '../types/tracker';
import {
  BookOpen,
  ExternalLink,
  Search,
  FileCheck2,
  FileText,
  Download,
  X,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Copy,
  Check,
  ArrowUpRight,
  ChevronLeft,
  Plus,
  CheckSquare,
  Square,
  Globe,
  RefreshCw,
  MapPin,
  GitBranch,
  PlayCircle,
  Printer,
  CheckCircle2,
  Circle,
  Compass,
  Lock,
} from 'lucide-react';
import {
  getLocalizedSubjectName,
  getLocalizedChapterName,
  getLocalizedChapterPrefix,
} from '../utils/chapterTranslations';
import { InfoTooltip } from './InfoTooltip';
import { LiveResourceSearch } from './LiveResourceSearch';
import { AutoGrowPromptInput } from './ui/ResponsiveTextControls';
import {
  SST_SECTIONS_META,
  SST_STUDY_SHEETS,
  CBSE_SST_MAP_ITEMS,
  SstSectionKey,
  SstStudySheet,
} from '../data/sstStudyPack';

interface ResourcesViewProps {
  profile?: Profile;
  onUpdateProfile?: (profile: Profile) => void;
  onRecordStudyActivity?: () => void;
  initialSubjectFilter?: string;
  initialCategoryFilter?: ResourceCategory | 'all';
  initialSearchQuery?: string;
  enrolledSubjectIds?: string[];
  isIncompleteProfile?: boolean;
  onCompleteProfile?: () => void;
  language?: LanguageMode;
}

// Requirement Options for Step 2
interface RequirementOption {
  id: string;
  label: string;
  shortLabel: string;
  badge: string;
  desc: string;
  icon: string;
  category: ResourceCategory | 'all';
  matchFn: (res: ResourceItem) => boolean;
}

const REQUIREMENT_OPTIONS: RequirementOption[] = [
  {
    id: 'digraj_singh_rajput',
    label: 'Digraj Singh Rajput Resources (One-Shot Notes, Mind Maps, PYQs, Map Work & MCQs)',
    shortLabel: 'Digraj Singh Rajput 📘',
    badge: 'digrajsinghrajput.com Official SST Hub',
    desc: 'All Digraj Singh Rajput Class 10 SST One-Shot Notes, Marathon PDFs, Sure-Shot PYQs, Map Work Checklist & Test Series',
    icon: '📘',
    category: 'digraj_singh_rajput',
    matchFn: (res) => res.category === 'digraj_singh_rajput',
  },
  {
    id: 'revision_notes',
    label: 'Revision Notes & Formula Handbooks',
    shortLabel: 'Notes & Formulas 📝',
    badge: 'Free Chapter Notes',
    desc: 'Chapter-wise revision notes, summary sheets & formula handbooks',
    icon: '📝',
    category: 'revision_notes',
    matchFn: (res) =>
      res.category === 'revision_notes' ||
      res.title.toLowerCase().includes('notes') ||
      res.title.toLowerCase().includes('formula'),
  },
  {
    id: 'pyq',
    label: 'Previous Year Questions (PYQs)',
    shortLabel: 'PYQ ⏳',
    badge: '10-Year Board Papers',
    desc: '',
    icon: '⏳',
    category: 'cbse_pyq',
    matchFn: (res) =>
      res.category === 'cbse_pyq' ||
      res.title.toLowerCase().includes('pyq') ||
      res.title.toLowerCase().includes('previous year') ||
      res.title.toLowerCase().includes('board paper'),
  },
  {
    id: 'cbse_sqp',
    label: 'Sample Question Papers (SQP, APQ & Marking Schemes)',
    shortLabel: 'Sample Papers 📄',
    badge: 'Official CBSE SQP & APQ',
    desc: '',
    icon: '📄',
    category: 'cbse_sqp',
    matchFn: (res) =>
      res.category === 'cbse_sqp' ||
      res.title.toLowerCase().includes('sample') ||
      res.title.toLowerCase().includes('sqp') ||
      res.title.toLowerCase().includes('additional practice'),
  },
  {
    id: 'extra_qa',
    label: 'Extra Question Answers, HOTS & NCERT Exemplar Solutions',
    shortLabel: 'Extra Q&A ✍️',
    badge: '1/2/3/5-Mark & HOTS',
    desc: 'Free important extra board questions, HOTS & NCERT Exemplar answers',
    icon: '✍️',
    category: 'extra_qa',
    matchFn: (res) =>
      res.category === 'extra_qa' ||
      res.category === 'ncert_solutions' ||
      res.title.toLowerCase().includes('extra question') ||
      res.title.toLowerCase().includes('important') ||
      res.title.toLowerCase().includes('exemplar solution'),
  },
  {
    id: 'mcq_tests',
    label: 'Chapter-wise MCQs & Free Online Mock Tests',
    shortLabel: 'MCQs & Tests ⚡',
    badge: 'Timed Online Tests',
    desc: 'Interactive chapter quizzes, Khan Academy practice & timed MCQ mock tests',
    icon: '⚡',
    category: 'mcq_tests',
    matchFn: (res) =>
      res.category === 'mcq_tests' ||
      res.title.toLowerCase().includes('mcq') ||
      res.title.toLowerCase().includes('mock test') ||
      res.title.toLowerCase().includes('quiz'),
  },
  {
    id: 'qb_pdf',
    label: 'Question Bank PDF & Competency Items',
    shortLabel: 'Question Banks 🎯',
    badge: '50% Weightage Banks',
    desc: '50% board weightage competency questions & case studies',
    icon: '🎯',
    category: 'cbse_competency',
    matchFn: (res) =>
      res.category === 'cbse_competency' ||
      res.category === 'cfpq_volumes' ||
      res.title.toLowerCase().includes('question bank') ||
      res.title.toLowerCase().includes('competency') ||
      res.title.toLowerCase().includes('cfpq'),
  },
  {
    id: 'board_papers',
    label: 'Previous Year Board Papers (Set 1, 2, 3)',
    shortLabel: 'Board Papers 📜',
    badge: 'Official Exam Sets',
    desc: '',
    icon: '📜',
    category: 'cbse_pyq',
    matchFn: (res) =>
      res.category === 'cbse_pyq' ||
      res.title.toLowerCase().includes('paper') ||
      res.title.toLowerCase().includes('annual'),
  },
  {
    id: 'cfpq_volumes',
    label: 'Competency Practice Question Volumes (Vol 1-4)',
    shortLabel: 'CFPQ Volumes 📚',
    badge: 'Practice Volumes',
    desc: 'CBSE Competency Practice Problem Books (Vol 1-4)',
    icon: '📚',
    category: 'cfpq_volumes',
    matchFn: (res) =>
      res.category === 'cfpq_volumes' ||
      res.title.toLowerCase().includes('volume') ||
      res.title.toLowerCase().includes('cfpq'),
  },
  {
    id: 'reference_books',
    label: 'Reference Books & Formula Sheets (RD Sharma / Lakhmir Singh)',
    shortLabel: 'Reference Books 📘',
    badge: 'Core Concept Depth',
    desc: '',
    icon: '📘',
    category: 'reference_books',
    matchFn: (res) =>
      res.category === 'reference_books' ||
      res.title.toLowerCase().includes('reference') ||
      res.title.toLowerCase().includes('formula') ||
      res.title.toLowerCase().includes('handbook'),
  },
  {
    id: 'solutions',
    label: 'Solutions & Marking Schemes',
    shortLabel: 'Solutions 💡',
    badge: 'Step-by-Step Keys',
    desc: 'Official CBSE step-by-step marking keys and NCERT answers',
    icon: '💡',
    category: 'ncert_solutions',
    matchFn: (res) =>
      res.category === 'ncert_solutions' ||
      res.category === 'extra_qa' ||
      res.title.toLowerCase().includes('solution') ||
      res.title.toLowerCase().includes('marking scheme') ||
      !!res.markingSchemeUrl,
  },
  {
    id: 'ncert_books',
    label: 'NCERT Rationalized Books, Exemplars & Skill PDFs',
    shortLabel: 'NCERT & Skill PDFs 📖',
    badge: 'NCERT Official',
    desc: '',
    icon: '📖',
    category: 'ncert_books',
    matchFn: (res) =>
      res.category === 'ncert_books' ||
      res.title.toLowerCase().includes('ncert') ||
      res.title.toLowerCase().includes('exemplar'),
  },
  {
    id: 'toppers',
    label: 'Toppers 100/100 Handwritten Copies',
    shortLabel: 'Toppers Merit 🏆',
    badge: '100/100 Copies',
    desc: 'Official CBSE 100/100 merit student answer sheets',
    icon: '🏆',
    category: 'cbse_topper_answers',
    matchFn: (res) =>
      res.category === 'cbse_topper_answers' ||
      res.title.toLowerCase().includes('topper') ||
      res.title.toLowerCase().includes('merit'),
  },
  {
    id: 'pw_bookshelf',
    label: 'PhysicsWallah (PW) Free Bookshelf & DPPs',
    shortLabel: 'PW Bookshelf ⚡',
    badge: 'PW Free Digital',
    desc: '',
    icon: '⚡',
    category: 'pw_bookshelf',
    matchFn: (res) =>
      res.category === 'pw_bookshelf' ||
      res.title.toLowerCase().includes('pw') ||
      res.title.toLowerCase().includes('physics wallah'),
  },
  {
    id: 'circulars',
    label: 'CBSE Circulars & Syllabus Blueprints',
    shortLabel: 'Circulars 📋',
    badge: 'Curriculum & Rules',
    desc: '',
    icon: '📋',
    category: 'cbse_circulars',
    matchFn: (res) =>
      res.category === 'cbse_circulars' ||
      res.title.toLowerCase().includes('circular') ||
      res.title.toLowerCase().includes('curriculum') ||
      res.title.toLowerCase().includes('syllabus'),
  },
  {
    id: 'all',
    label: 'All Study Materials (Complete Collection)',
    shortLabel: 'All Materials 🏛️',
    badge: 'Complete Repository',
    desc: '',
    icon: '🏛️',
    category: 'all',
    matchFn: () => true,
  },
];

// Academic Years (Last 10 Academic Years + All Years)
interface AcademicYearOption {
  id: string;
  label: string;
  badge: string;
  desc?: string;
}

const ACADEMIC_YEARS: AcademicYearOption[] = [
  { id: '2026-27', label: 'Academic Year 2026-27', badge: 'Latest Session 2026-27 🌟' },
  { id: '2025-26', label: 'Academic Year 2025-26', badge: 'Board Session 2025-26 📄' },
  { id: '2024-25', label: 'Academic Year 2024-25', badge: 'Current Board Papers 📄' },
  { id: '2023-24', label: 'Academic Year 2023-24', badge: 'Board Archive 📚' },
  { id: '2022-23', label: 'Academic Year 2022-23', badge: 'Board Archive 📚' },
  { id: '2021-22', label: 'Academic Year 2021-22 (Term 1 & Term 2)', badge: 'Term 1 & 2 📝' },
  { id: '2020-21', label: 'Academic Year 2020-21', badge: 'Board Archive 📚' },
  { id: '2019-20', label: 'Academic Year 2019-20', badge: 'Board Archive 📚' },
  { id: '2018-19', label: 'Academic Year 2018-19', badge: '10-Year PYQ ⏳' },
  { id: '2017-18', label: 'Academic Year 2017-18', badge: '10-Year PYQ ⏳' },
  { id: '2016-17', label: 'Academic Year 2016-17', badge: '10-Year PYQ ⏳' },
  { id: '2015-16', label: 'Academic Year 2015-16', badge: '10-Year PYQ ⏳' },
  { id: 'all', label: 'All Academic Years / Universal Archive', badge: 'All 10 Years ⏳' },
];

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  profile,
  onUpdateProfile,
  onRecordStudyActivity,
  initialSubjectFilter = 'all',
  initialCategoryFilter = 'all',
  initialSearchQuery = '',
  enrolledSubjectIds,
  isIncompleteProfile = false,
  onCompleteProfile,
  language = 'en',
}) => {
  const isGuestLocked = isIncompleteProfile || !profile?.id || profile.id === 'guest-preview';
  // Guided Wizard Steps: 1 = Subject, 2 = Requirement, 3 = Academic Year, 4 = Results
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Selections
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubjectFilter);
  const [selectedRequirement, setSelectedRequirement] = useState<string>('all');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);

  // SST Sub-Section Filter & Interactive Map Work / Study Sheet State (strictly inside /resources)
  const [selectedSstSection, setSelectedSstSection] = useState<'all' | SstSectionKey>('all');
  const [showMapChecklistPanel, setShowMapChecklistPanel] = useState<boolean>(false);
  const [mapFilterType, setMapFilterType] = useState<'all' | 'history' | 'geography' | 'pending' | 'mastered'>('all');
  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');
  const [masteredMapIds, setMasteredMapIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aura_sst_map_checklist_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });
  const [activeStudySheet, setActiveStudySheet] = useState<SstStudySheet | null>(null);
  const [studySheetTab, setStudySheetTab] = useState<'notes' | 'mindmap' | 'sureshot' | 'video'>('notes');

  useEffect(() => {
    try {
      localStorage.setItem('aura_sst_map_checklist_v1', JSON.stringify(masteredMapIds));
    } catch {
      // ignore storage errors
    }
  }, [masteredMapIds]);

  const toggleMapItemMastered = (itemId: string) => {
    setMasteredMapIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleOpenStudySheet = (
    sheetId: string,
    defaultTab: 'notes' | 'mindmap' | 'sureshot' | 'video' = 'notes'
  ) => {
    const found = SST_STUDY_SHEETS[sheetId];
    if (found) {
      setActiveStudySheet(found);
      setStudySheetTab(defaultTab);
      onRecordStudyActivity?.();
    }
  };

  // Add Subject & Chapter Checklist Modal state
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState<boolean>(false);
  const [addSubjectSelectedSub, setAddSubjectSelectedSub] = useState<Subject | null>(null);
  const [addSubjectSelectedChapters, setAddSubjectSelectedChapters] = useState<string[]>([]);
  const [addSubjectChapterSearch, setAddSubjectChapterSearch] = useState<string>('');

  // Inline PDF Launch & Safe Viewer Modal state
  const [activePdfModal, setActivePdfModal] = useState<{
    title: string;
    url: string;
    markingSchemeUrl?: string;
    subjectId?: string;
    badge?: string;
    fileSize?: string;
  } | null>(null);
  const [modalReaderMode, setModalReaderMode] = useState<'launcher' | 'reader'>('launcher');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  // Google Search Data live sync state inside Step 4
  const [isGoogleSyncLoading, setIsGoogleSyncLoading] = useState<boolean>(false);
  const [googleSyncResult, setGoogleSyncResult] = useState<{
    summary: string;
    groundedLinks: Array<{ title: string; url: string }>;
    timestamp: string;
  } | null>(null);
  const [showGoogleSyncDetails, setShowGoogleSyncDetails] = useState<boolean>(false);

  const handleFetchGoogleSearchData = async () => {
    setIsGoogleSyncLoading(true);
    setShowGoogleSyncDetails(true);
    try {
      const activeYear = selectedAcademicYear === 'all' ? '2026-27' : selectedAcademicYear;
      const subName = selectedSubject === 'all' ? 'All Subjects' : getSubjectLabel(selectedSubject);
      const reqObj = getRequirementObj(selectedRequirement);
      const reqTypeMap: Record<string, string> = {
        revision_notes: 'notes',
        pyq: 'pyq',
        board_papers: 'pyq',
        cbse_sqp: 'sample_papers',
        ncert_books: 'pdfs',
        qb_pdf: 'pdfs',
        cfpq_volumes: 'pdfs',
        extra_qa: 'extra_qa',
        solutions: 'extra_qa',
        mcq_tests: 'tests',
      };
      const res = await fetch('/api/search-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `CBSE Class 10 ${subName} ${reqObj.id === 'all' ? 'notes PYQ sample papers NCERT PDF extra questions MCQs free online tests' : reqObj.label} ${activeYear}`,
          subjectId: selectedSubject,
          session: activeYear,
          resourceType: reqTypeMap[reqObj.id] || 'all',
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        const pdfItems = Array.isArray(data.pdfLinks) ? data.pdfLinks : [];
        const chunks = data.groundingMetadata?.groundingChunks || [];
        const chunkLinks = chunks
          .filter((c: any) => c.web?.uri)
          .map((c: any) => ({
            title: c.web.title || 'Official CBSE / Study Resource',
            url: c.web.uri,
          }));
        const seenUrls = new Set<string>();
        const mergedLinks: Array<{ title: string; url: string }> = [];
        for (const p of pdfItems) {
          if (p?.url && !seenUrls.has(p.url)) {
            seenUrls.add(p.url);
            mergedLinks.push({
              title: `${p.isPdf ? '📄 PDF: ' : ''}${p.title}`,
              url: p.url,
            });
          }
        }
        for (const c of chunkLinks) {
          if (c?.url && !seenUrls.has(c.url)) {
            seenUrls.add(c.url);
            mergedLinks.push(c);
          }
        }
        setGoogleSyncResult({
          summary: data.resultText || 'CBSE Class 10 free resources verified via Google Search data.',
          groundedLinks: mergedLinks,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    } catch {
      setGoogleSyncResult({
        summary: `CBSE Class 10 resources are verified with CBSE Academic, NCERT & free student study portals for ${selectedAcademicYear}.`,
        groundedLinks: [
          { title: 'CBSE Official SQP Table 2026-27', url: 'https://cbseacademic.nic.in/SQP_CLASSX_2026-27.html' },
          { title: 'CBSE Official Class 10 Question Bank', url: 'https://cbseacademic.nic.in/qbclass10.html' },
          { title: 'NCERT Textbooks & Exemplar Problems', url: 'https://ncert.nic.in/exemplar-problems.php?ln=en' },
          { title: 'Free Timed Online MCQ Mock Tests', url: 'https://www.selfstudys.com/mcq/cbse/mock-test/class-10th' },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setIsGoogleSyncLoading(false);
    }
  };

  const activeSubjectIds =
    profile?.selectedSubjectIds && profile.selectedSubjectIds.length > 0
      ? profile.selectedSubjectIds
      : Array.isArray(enrolledSubjectIds) && enrolledSubjectIds.length > 0
      ? enrolledSubjectIds
      : DEFAULT_SELECTED_SUBJECT_IDS;

  const enrolledSubjectsList = CLASS_10_SUBJECTS.filter((s) => activeSubjectIds.includes(s.id));
  const unEnrolledSubjectsList = CLASS_10_SUBJECTS.filter((s) => !activeSubjectIds.includes(s.id));

  useEffect(() => {
    if (initialSubjectFilter && initialSubjectFilter !== 'all') {
      setSelectedSubject(initialSubjectFilter);
    }
  }, [initialSubjectFilter]);

  useEffect(() => {
    if (initialCategoryFilter && initialCategoryFilter !== 'all') {
      const matchedReq = REQUIREMENT_OPTIONS.find((r) => r.category === initialCategoryFilter);
      if (matchedReq) setSelectedRequirement(matchedReq.id);
    }
  }, [initialCategoryFilter]);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Subject helpers
  const getSubjectLabel = (subId: string) => {
    if (subId === 'all') return 'All Subjects';
    const found = CLASS_10_SUBJECTS.find((s) => s.id === subId);
    return found ? getLocalizedSubjectName(found.id, found.name, language) : subId;
  };

  const getSubjectColor = (subId: string) => {
    const found = CLASS_10_SUBJECTS.find((s) => s.id === subId);
    return found ? found.color : '#22d3ee';
  };

  // Requirement helper
  const getRequirementObj = (reqId: string) => {
    return REQUIREMENT_OPTIONS.find((r) => r.id === reqId) || REQUIREMENT_OPTIONS[REQUIREMENT_OPTIONS.length - 1];
  };

  const resourceMatchesRequirement = (res: ResourceItem, reqOpt: RequirementOption) => {
    if (reqOpt.id === 'all' || reqOpt.category === 'all') return true;
    if (reqOpt.category === 'digraj_singh_rajput') {
      return res.category === 'digraj_singh_rajput';
    }
    // Strictly keep Digraj Singh Rajput resources isolated in their own Step 2 filter
    if (res.category === 'digraj_singh_rajput') {
      return false;
    }
    return res.category === reqOpt.category || reqOpt.matchFn(res);
  };

  const resourceMatchesYear = (res: ResourceItem, yearId: string) => {
    if (yearId === 'all') return true;
    if (!res.year) return false;
    return res.year.trim().toLowerCase().includes(yearId.trim().toLowerCase());
  };

  // Strict Subject Pool: only subjects that actually have curated resources (or 'all' when available)
  const availableEnrolledSubjects = useMemo(() => {
    return enrolledSubjectsList.filter((sub) =>
      OFFICIAL_RESOURCES.some((res) => res.subjectId === sub.id)
    );
  }, [enrolledSubjectsList]);

  // Pool for currently selected subject
  const subjectPool = useMemo(() => {
    if (selectedSubject === 'all') return OFFICIAL_RESOURCES;
    return OFFICIAL_RESOURCES.filter((res) => res.subjectId === selectedSubject);
  }, [selectedSubject]);

  // Step 2 Requirements: strictly hide any option with 0 matching resources for selectedSubject
  const availableRequirementsForSubject = useMemo(() => {
    return REQUIREMENT_OPTIONS.filter((opt) =>
      subjectPool.some((res) => resourceMatchesRequirement(res, opt))
    );
  }, [subjectPool]);

  // Step 3 Academic Years: strictly hide any year with 0 matching resources for selectedSubject + selectedRequirement
  const availableYearsForSelection = useMemo(() => {
    const reqObj = getRequirementObj(selectedRequirement);
    const reqFilteredPool =
      selectedRequirement === 'all'
        ? subjectPool
        : subjectPool.filter((res) => resourceMatchesRequirement(res, reqObj));

    return ACADEMIC_YEARS.filter((yr) =>
      reqFilteredPool.some((res) => resourceMatchesYear(res, yr.id))
    );
  }, [subjectPool, selectedRequirement]);

  // Filtered pool before SST sub-section filter (used to calculate exact SST book counts)
  const preSectionResources = useMemo(() => {
    const reqObj = getRequirementObj(selectedRequirement);

    let pool = OFFICIAL_RESOURCES.filter((res) => {
      if (selectedSubject === 'all') return true;
      return res.subjectId === selectedSubject;
    });

    if (selectedRequirement !== 'all') {
      pool = pool.filter((res) => resourceMatchesRequirement(res, reqObj));
    }

    if (selectedAcademicYear !== 'all') {
      pool = pool.filter((res) => resourceMatchesYear(res, selectedAcademicYear));
    }

    if (searchQuery.trim()) {
      pool = searchAcrossAllDivisions(pool, searchQuery.trim());
    }

    return sortResourcesByUpdatedDate(pool, 'desc');
  }, [selectedSubject, selectedRequirement, selectedAcademicYear, searchQuery]);

  const sstSectionCounts = useMemo(() => {
    const counts: Record<'all' | SstSectionKey, number> = {
      all: preSectionResources.length,
      history: 0,
      geography: 0,
      civics: 0,
      economics: 0,
      map_work: 0,
    };
    if (selectedSubject !== 'sst') return counts;
    for (const item of preSectionResources) {
      if (item.sstSection && item.sstSection in counts) {
        counts[item.sstSection] += 1;
      }
    }
    return counts;
  }, [preSectionResources, selectedSubject]);

  // Strictly filtered resources for Step 4 Results
  const filteredResources = useMemo(() => {
    if (selectedSubject === 'sst' && selectedSstSection !== 'all') {
      return preSectionResources.filter((res) => res.sstSection === selectedSstSection);
    }
    return preSectionResources;
  }, [preSectionResources, selectedSubject, selectedSstSection]);

  const sstMapStats = useMemo(() => {
    const histTotal = CBSE_SST_MAP_ITEMS.filter((i) => i.subject === 'history').length;
    const histDone = CBSE_SST_MAP_ITEMS.filter(
      (i) => i.subject === 'history' && masteredMapIds.includes(i.id)
    ).length;
    const geoTotal = CBSE_SST_MAP_ITEMS.filter((i) => i.subject === 'geography').length;
    const geoDone = CBSE_SST_MAP_ITEMS.filter(
      (i) => i.subject === 'geography' && masteredMapIds.includes(i.id)
    ).length;
    return {
      total: CBSE_SST_MAP_ITEMS.length,
      done: histDone + geoDone,
      histTotal,
      histDone,
      geoTotal,
      geoDone,
    };
  }, [masteredMapIds]);

  const filteredMapItems = useMemo(() => {
    return CBSE_SST_MAP_ITEMS.filter((item) => {
      const isDone = masteredMapIds.includes(item.id);
      if (mapFilterType === 'history' && item.subject !== 'history') return false;
      if (mapFilterType === 'geography' && item.subject !== 'geography') return false;
      if (mapFilterType === 'pending' && isDone) return false;
      if (mapFilterType === 'mastered' && !isDone) return false;
      if (mapSearchQuery.trim()) {
        const q = mapSearchQuery.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.chapter.toLowerCase().includes(q) ||
          item.stateOrHint.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [masteredMapIds, mapFilterType, mapSearchQuery]);

  // Auto-fetch live Google Search Grounding PDFs if Step 4 search/combination yields zero local items
  useEffect(() => {
    if (wizardStep === 4 && filteredResources.length === 0 && !isGoogleSyncLoading && !googleSyncResult) {
      handleFetchGoogleSearchData();
    }
  }, [wizardStep, filteredResources.length]);

  // Handle adding subject with selected chapters into user profile
  const handleConfirmAddSubject = () => {
    if (!addSubjectSelectedSub || addSubjectSelectedChapters.length === 0) return;
    const newSubId = addSubjectSelectedSub.id;

    if (profile && onUpdateProfile) {
      const updatedSubjectIds = Array.from(
        new Set([...(profile.selectedSubjectIds || []), newSubId])
      );
      const updatedSyllabus = {
        ...profile.examSyllabus,
        [newSubId]: addSubjectSelectedChapters,
      };
      const updatedProgress = { ...profile.progress };
      if (!updatedProgress[newSubId]) {
        updatedProgress[newSubId] = {};
        for (const chId of addSubjectSelectedChapters) {
          updatedProgress[newSubId][chId] = {
            stages: {
              ncert: 'none',
              ref_book: 'none',
              pyq_cbq: 'none',
              worksheet: 'none',
              theory: 'none',
              exemplar: 'none',
              pyq: 'none',
              cbq: 'none',
              revision: 'none',
              test: 'none',
            },
          };
        }
      }
      const updatedProfile: Profile = {
        ...profile,
        selectedSubjectIds: updatedSubjectIds,
        examSyllabus: updatedSyllabus,
        progress: updatedProgress,
      };
      onUpdateProfile(updatedProfile);
    }

    setSelectedSubject(newSubId);
    setIsAddSubjectModalOpen(false);
    setAddSubjectSelectedSub(null);
    setAddSubjectSelectedChapters([]);
    setWizardStep(2);
  };

  // Restart guided wizard
  const handleResetWizard = () => {
    setWizardStep(1);
    setSelectedSubject('all');
    setSelectedRequirement('all');
    setSelectedAcademicYear('all');
    setSelectedSstSection('all');
    setShowMapChecklistPanel(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-300 min-w-0 pb-16">
      {/* ========================================================================= */}
      {/* OFFICIAL CBSE PORTALS DIRECT QUICK BAR (Compact Single Row)               */}
      {/* ========================================================================= */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] px-3 py-2 text-xs flex items-center justify-between flex-wrap gap-2 shadow-sm">
        <div className="flex items-center gap-1.5 text-[var(--text-muted)] font-black text-[11px] uppercase tracking-wider shrink-0">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[var(--text-primary)]">CBSE Official Tabs:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <a
            href="https://cbseacademic.nic.in/SQP_CLASSX_2026-27.html"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRecordStudyActivity?.()}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-extrabold text-[11px] flex items-center gap-1 border border-cyan-400/40 transition-all"
            title="Official Class X CBSE SQP & Marking Scheme Table Portal"
          >
            <span>SQP Table 2026-27 ↗</span>
          </a>
          <a
            href="https://cbseacademic.nic.in/qbclass10.html"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRecordStudyActivity?.()}
            className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-cyan-300 font-bold text-[11px] flex items-center gap-1 border border-[var(--border-color)] transition-all"
            title="CBSE Class 10 Official Question Bank PDFs"
          >
            <span>Question Bank ↗</span>
          </a>
          <a
            href="https://cbseacademic.nic.in/additionalPQ.html"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRecordStudyActivity?.()}
            className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-cyan-300 font-bold text-[11px] flex items-center gap-1 border border-[var(--border-color)] transition-all"
            title="CBSE Official Additional Practice Question Papers"
          >
            <span>Practice Papers ↗</span>
          </a>
          <a
            href="https://ncert.nic.in/exemplar-problems.php?ln=en"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRecordStudyActivity?.()}
            className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-cyan-300 font-bold text-[11px] flex items-center gap-1 border border-[var(--border-color)] transition-all"
            title="NCERT Official Exemplar Problem PDFs"
          >
            <span>NCERT Exemplar ↗</span>
          </a>
          <a
            href="https://www.cbse.gov.in/cbsenew/question-paper.html"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRecordStudyActivity?.()}
            className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-cyan-300 font-bold text-[11px] flex items-center gap-1 border border-[var(--border-color)] transition-all"
            title="CBSE Official 10-Year Question Paper Archive"
          >
            <span>10-Yr PYQs ↗</span>
          </a>
          <a
            href="https://www.cbse.gov.in/cbsenew/model-answer.html"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRecordStudyActivity?.()}
            className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-cyan-300 font-bold text-[11px] flex items-center gap-1 border border-[var(--border-color)] transition-all"
            title="CBSE Toppers Handwritten Model Answer Sheets"
          >
            <span>Topper Copies ↗</span>
          </a>
          <a
            href="https://diksha.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRecordStudyActivity?.()}
            className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-cyan-300 font-bold text-[11px] flex items-center gap-1 border border-[var(--border-color)] transition-all"
            title="DIKSHA National School Portal"
          >
            <span>DIKSHA ↗</span>
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GUIDED RESOURCE FINDER WIZARD                                            */}
      {/* ========================================================================= */}
      
      {/* Compact Stepper Navigation */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-2.5 sm:p-3 shadow-sm space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase text-cyan-400 tracking-wider">
              Step {wizardStep} of 4:
            </span>
            <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
              {wizardStep === 1
                ? 'Select Subject'
                : wizardStep === 2
                ? 'Select Requirement'
                : wizardStep === 3
                ? 'Select Academic Year'
                : 'Verified Resources'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {wizardStep > 1 && (
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-xs font-bold text-cyan-300 flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                title="Go back to Step 1 to pick another subject"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Change Subject</span>
              </button>
            )}

            {wizardStep > 1 && (
              <button
                type="button"
                onClick={handleResetWizard}
                className="px-2 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer transition-all"
                title="Restart finder"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Start Over</span>
              </button>
            )}
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          {[
            { stepNo: 1, label: '1. Subject', val: getSubjectLabel(selectedSubject) },
            { stepNo: 2, label: '2. Requirement', val: getRequirementObj(selectedRequirement).shortLabel },
            { stepNo: 3, label: '3. Year', val: selectedAcademicYear === 'all' ? 'All Years' : selectedAcademicYear },
            { stepNo: 4, label: '4. Results', val: `${filteredResources.length} docs` },
          ].map((s) => {
            const isPast = wizardStep > s.stepNo;
            const isCurrent = wizardStep === s.stepNo;
            return (
              <button
                key={s.stepNo}
                type="button"
                onClick={() => setWizardStep(s.stepNo)}
                className={`text-left p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                    : isPast
                    ? 'bg-[var(--bg-elevated)] border-emerald-500/40 hover:border-emerald-400'
                    : 'bg-[var(--bg-elevated)]/60 border-[var(--border-color)] hover:border-cyan-400/40'
                }`}
                title={`Go to Step ${s.stepNo}: ${s.label}`}
              >
                <div className="flex items-center justify-between text-[10px] font-black uppercase">
                  <span className={isCurrent ? 'text-cyan-400' : isPast ? 'text-emerald-400' : 'text-[var(--text-muted)]'}>
                    {s.label}
                  </span>
                  {isPast && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                </div>
                <div className="text-[11px] font-bold text-[var(--text-primary)] break-words [overflow-wrap:anywhere] leading-snug mt-0.5">
                  {s.val}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: SELECT SUBJECT (Compact Row/Grid of Enrolled Subjects Only)        */}
      {/* ========================================================================= */}
      {wizardStep === 1 && (
        <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-3 sm:p-4 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                Step 1: Choose Enrolled Subject
              </h3>
              <InfoTooltip text={`Showing your ${enrolledSubjectsList.length} enrolled Class 10 subjects. Tap any subject to continue.`} />
            </div>
            {isGuestLocked ? (
              <button
                type="button"
                onClick={() => onCompleteProfile?.()}
                title="Click on me to unlock for free"
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-500/60 hover:border-amber-400/80 text-slate-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm grayscale hover:grayscale-0"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>+ Add Subject 🔒</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAddSubjectSelectedSub(null);
                  setAddSubjectSelectedChapters([]);
                  setAddSubjectChapterSearch('');
                  setIsAddSubjectModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>+ Add Subject</span>
              </button>
            )}
          </div>

          {/* All Subjects Complete Hub Banner + Enrolled Subjects Grid */}
          {availableEnrolledSubjects.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedSubject('all');
                setSelectedRequirement('all');
                setSelectedAcademicYear('all');
                setSelectedSstSection('all');
                setShowMapChecklistPanel(false);
                setGoogleSyncResult(null);
                setWizardStep(2);
              }}
              className={`w-full p-2.5 sm:p-3 rounded-xl border transition-all text-left flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 cursor-pointer group ${
                selectedSubject === 'all'
                  ? 'bg-cyan-500/15 border-cyan-400 ring-1 ring-cyan-400/50'
                  : 'bg-gradient-to-r from-cyan-500/10 via-[var(--bg-elevated)] to-emerald-500/10 border-cyan-500/35 hover:border-cyan-400'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-lg shrink-0">🏛️</span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)] group-hover:text-cyan-300 transition-colors break-words">
                    All Class 10 Subjects — Free Complete Resource Hub
                  </h4>
                  <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] block break-words">
                    Notes, Past 10-Yr PYQs, Official SQPs, NCERT Textbooks &amp; Exemplar PDFs, Extra Q&amp;As, MCQs &amp; Free Online Mock Tests
                  </span>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-bold shrink-0 flex items-center gap-1 ml-auto">
                <span>Explore All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          )}

          {/* Compact 2-Column Responsive Grid (Only Enrolled Subjects with Available Resources) */}
          {availableEnrolledSubjects.length === 0 ? (
            <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-extrabold text-cyan-300">
                  Live Google Search PDF Finder Ready
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubject('all');
                    setSelectedRequirement('all');
                    setSelectedAcademicYear('all');
                    setWizardStep(2);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 font-black text-xs cursor-pointer"
                >
                  Browse All Verified Subjects →
                </button>
              </div>
              <LiveResourceSearch language={language} onRecordStudyActivity={onRecordStudyActivity} />
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableEnrolledSubjects.map((sub) => {
              const isSelected = selectedSubject === sub.id;
              const userChs = profile?.examSyllabus?.[sub.id];
              const chCount = Array.isArray(userChs) && userChs.length > 0
                ? userChs.length
                : sub.groups.reduce((acc, g) => acc + g.chapters.length, 0);

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubject(sub.id);
                    setSelectedRequirement('all');
                    setSelectedAcademicYear('all');
                    setSelectedSstSection('all');
                    setShowMapChecklistPanel(false);
                    setGoogleSyncResult(null);
                    setWizardStep(2);
                  }}
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all text-left flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 cursor-pointer group ${
                    isSelected
                      ? 'border-2 shadow-sm ring-1 ring-cyan-400/50'
                      : 'bg-[var(--bg-elevated)] border-[var(--border-color)] hover:border-cyan-400/50 hover:bg-[var(--bg-card)]'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${sub.color}15`,
                          borderColor: sub.color,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className="w-2 h-7 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="sub-accent-pill border px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0"
                          style={{ '--sub-hex': sub.color } as React.CSSProperties}
                        >
                          Code {sub.code}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-medium">
                          {chCount} chs
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors break-words [overflow-wrap:anywhere] leading-snug mt-0.5">
                        {getLocalizedSubjectName(sub.id, sub.name, language)}
                      </h4>
                    </div>
                  </div>

                  <div
                    className="sub-accent-pill px-2.5 py-1 rounded-md border text-xs font-bold shrink-0 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform ml-auto"
                    style={{ '--sub-hex': sub.color } as React.CSSProperties}
                  >
                    <span>Select</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
          )}

          {/* Add Subject Option at Bottom */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setAddSubjectSelectedSub(null);
                setAddSubjectSelectedChapters([]);
                setAddSubjectChapterSearch('');
                setIsAddSubjectModalOpen(true);
              }}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>+ Add Another Class 10 Subject to Syllabus</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: MATERIAL REQUIREMENT (Compact 2/3 Column Grid)                     */}
      {/* ========================================================================= */}
      {wizardStep === 2 && (
        <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-3 sm:p-4 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[var(--border-color)]">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: getSubjectColor(selectedSubject) }}
                />
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                  Subject: {getSubjectLabel(selectedSubject)}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)] mt-0.5">
                Step 2: What study material do you require?
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-cyan-400 flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              title="Go back to Step 1 to select another subject"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Change Subject</span>
            </button>
          </div>

          {/* Contextual SST & Digraj Singh Rajput Guide inside Step 2 */}
          {selectedSubject === 'sst' && (
            <div className="px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-[var(--text-secondary)] leading-snug">
                <span className="font-bold text-amber-300">Digraj Singh Rajput Resources</span>
                <span> has its own dedicated filter below (covering </span>
                <span className="font-semibold text-[var(--text-primary)]">History · Geography · Civics · Economics · Map Work · MCQs</span>
                <span>) — kept separate from general Notes, PYQs &amp; Extra Q&amp;A.</span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] font-medium whitespace-nowrap shrink-0">
                Source: digrajsinghrajput.com
              </span>
            </div>
          )}

          {/* Compact 2-Column Grid (Only Options with Available Resources) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableRequirementsForSubject.map((opt) => {
              const isSelected = selectedRequirement === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedRequirement(opt.id);
                    setSelectedAcademicYear('all');
                    setGoogleSyncResult(null);
                    setWizardStep(3);
                  }}
                  className={`p-2.5 rounded-xl border transition-all text-left flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 cursor-pointer group ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                      : 'bg-[var(--bg-elevated)] border-[var(--border-color)] hover:border-cyan-400/50 hover:bg-[var(--bg-card)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-lg shrink-0">{opt.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors break-words [overflow-wrap:anywhere] leading-snug">
                          {opt.label}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-[var(--text-muted)] break-words [overflow-wrap:anywhere] block mt-0.5">
                        {opt.badge}
                      </span>
                    </div>
                  </div>

                  <div className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 text-xs font-bold shrink-0 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform ml-auto">
                    <span>Select</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back: Choose Another Subject</span>
            </button>
            <span className="text-xs text-[var(--text-muted)]">Step 2 of 4</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: ACADEMIC YEAR (Compact Grid, 2026-27 at Top)                       */}
      {/* ========================================================================= */}
      {wizardStep === 3 && (
        <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-3 sm:p-4 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[var(--border-color)]">
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getSubjectColor(selectedSubject) }}
                />
                <span className="font-bold text-[var(--text-primary)]">
                  {getSubjectLabel(selectedSubject)}
                </span>
                <span className="text-[var(--text-muted)]">•</span>
                <span className="text-cyan-400 font-bold">
                  {getRequirementObj(selectedRequirement).shortLabel}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)] mt-0.5">
                Step 3: Which Academic Year do you want?
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-all"
                title="Go back to Step 1 to pick another subject"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Subject</span>
              </button>
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-xs font-bold text-cyan-300 flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                title="Go back to Step 2 to change study material"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Material</span>
              </button>
            </div>
          </div>

          {/* Academic Years Compact Grid (Only Years with Available Resources) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {availableYearsForSelection.map((yr) => {
              const isSelected = selectedAcademicYear === yr.id;
              const isLatest = yr.id === '2026-27' || yr.id === '2025-26';

              return (
                <button
                  key={yr.id}
                  type="button"
                  onClick={() => {
                    setSelectedAcademicYear(yr.id);
                    setGoogleSyncResult(null);
                    setWizardStep(4);
                  }}
                  className={`p-2.5 rounded-xl border transition-all text-left flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 cursor-pointer group ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                      : isLatest
                      ? 'bg-amber-500/10 border-amber-400/40 hover:border-amber-400 hover:bg-amber-500/15'
                      : 'bg-[var(--bg-elevated)] border-[var(--border-color)] hover:border-cyan-400/50 hover:bg-[var(--bg-card)]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded font-mono shrink-0 ${
                        isLatest
                          ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50'
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      }`}
                    >
                      {yr.id === 'all' ? 'All Years' : yr.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-extrabold text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors break-words [overflow-wrap:anywhere] leading-snug">
                        {yr.label}
                      </h4>
                      <span className="text-[10px] text-[var(--text-muted)] break-words [overflow-wrap:anywhere] block mt-0.5">
                        {yr.badge}
                      </span>
                    </div>
                  </div>

                  <div className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 text-xs font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0 ml-auto">
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-cyan-400 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back: Choose Another Subject (Step 1)</span>
            </button>
            <span className="text-xs text-[var(--text-muted)]">Step 3 of 4</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: VERIFIED OFFICIAL CBSE TABLE FORMAT                                */}
      {/* ========================================================================= */}
      {wizardStep === 4 && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Active Filter Criteria Bar */}
          <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-3 shadow-sm space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Step 4: Official CBSE Document Matrix</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                  Showing {filteredResources.length} Verified Document{filteredResources.length === 1 ? '' : 's'} for {getSubjectLabel(selectedSubject)}
                </h3>
              </div>

              {/* Action Buttons: Choose Subject & Live Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-xs font-black text-cyan-300 flex items-center justify-center gap-1 cursor-pointer transition-all shrink-0 shadow-sm"
                  title="Return to Step 1 to select another subject"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Choose Another Subject</span>
                </button>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2.5 pointer-events-none" />
                  <AutoGrowPromptInput
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    placeholder="Search docs..."
                    maxHeightPx={96}
                    ariaLabel="Search documents"
                    className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-cyan-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Clickable Quick Filter Badges */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[var(--border-color)] text-xs">
              <span className="text-[11px] font-bold text-[var(--text-muted)]">Active:</span>

              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className="px-2.5 py-1 rounded-lg text-xs font-black border transition-all cursor-pointer flex items-center gap-1"
                style={{
                  backgroundColor: `${getSubjectColor(selectedSubject)}20`,
                  borderColor: getSubjectColor(selectedSubject),
                  color: getSubjectColor(selectedSubject),
                }}
                title="Tap to change subject"
              >
                <span>Subject: {getSubjectLabel(selectedSubject)}</span>
                <span className="text-[10px] underline ml-0.5">✎ Change</span>
              </button>

              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Tap to change requirement"
              >
                <span>{getRequirementObj(selectedRequirement).shortLabel}</span>
                <span className="text-[10px] underline ml-0.5">✎ Change</span>
              </button>

              <button
                type="button"
                onClick={() => setWizardStep(3)}
                className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Tap to change academic year"
              >
                <span>Year: {selectedAcademicYear === 'all' ? 'All Years' : selectedAcademicYear}</span>
                <span className="text-[10px] underline ml-0.5">✎ Change</span>
              </button>

              <button
                type="button"
                onClick={handleResetWizard}
                className="ml-auto px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)] text-[11px] font-bold cursor-pointer"
              >
                Start Over ↺
              </button>
            </div>

            {/* Google Search Data Live Grounding & Sync Toolbar directly inside Step 4 */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-[11px] font-extrabold text-cyan-400">
                  Google Search Grounding:
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {selectedSubject === 'all' ? 'All Subjects' : getSubjectLabel(selectedSubject)} • {selectedAcademicYear === 'all' ? '2026-27 & Archive' : selectedAcademicYear}
                </span>
              </div>

              <button
                type="button"
                onClick={handleFetchGoogleSearchData}
                disabled={isGoogleSyncLoading}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                title="Search Google for latest CBSE Class 10 syllabus updates & official documents"
              >
                <RefreshCw className={`w-3 h-3 ${isGoogleSyncLoading ? 'animate-spin' : ''}`} />
                <span>{isGoogleSyncLoading ? 'Searching Google...' : 'Live Sync via Google Search'}</span>
              </button>
            </div>

            {/* If Google Search Sync results exist, show compact accordion right here in Step 4 */}
            {googleSyncResult && showGoogleSyncDetails && (
              <div className="mt-2 p-3 rounded-xl bg-[var(--bg-elevated)] border border-cyan-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-cyan-400">
                    Live Verified CBSE &amp; Free Resource Search ({googleSyncResult.timestamp})
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGoogleSyncDetails(false)}
                    className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Dismiss ✕
                  </button>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">
                  {googleSyncResult.summary}
                </div>
                {googleSyncResult.groundedLinks.length > 0 && (
                  <div className="pt-1.5 border-t border-[var(--border-color)]/60 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">Grounded Sources:</span>
                    {googleSyncResult.groundedLinks.map((link, lIdx) => (
                      <a
                        key={lIdx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onRecordStudyActivity?.()}
                        className="px-2 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1 max-w-full"
                      >
                        <span className="break-words [overflow-wrap:anywhere]">{link.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SST SECTION SWITCHER & MAP CHECKLIST LAUNCH BAR (Visible strictly inside SST Step 4 when DSR / SST section packs are active) */}
            {selectedSubject === 'sst' &&
              (selectedRequirement === 'digraj_singh_rajput' ||
                preSectionResources.some((r) => Boolean(r.sstSection))) && (
              <div className="pt-2.5 border-t border-[var(--border-color)] space-y-2.5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedSstSection('all')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                        selectedSstSection === 'all'
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      All Sections ({sstSectionCounts.all})
                    </button>
                    {SST_SECTIONS_META.map((sec) => {
                      const isActive = selectedSstSection === sec.key;
                      const count = sstSectionCounts[sec.key];
                      return (
                        <button
                          key={sec.key}
                          type="button"
                          onClick={() => {
                            setSelectedSstSection(sec.key);
                            if (sec.key === 'map_work') {
                              setShowMapChecklistPanel(true);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                            isActive
                              ? 'bg-cyan-600 text-white shadow-sm'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {sec.label} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMapChecklistPanel((prev) => !prev)}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                      showMapChecklistPanel || selectedSstSection === 'map_work'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-emerald-500/50'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {showMapChecklistPanel || selectedSstSection === 'map_work'
                        ? `Hide Map Checklist (${sstMapStats.done}/${sstMapStats.total})`
                        : `Interactive Map Checklist (${sstMapStats.done}/${sstMapStats.total})`}
                    </span>
                  </button>
                </div>

                {selectedSstSection !== 'all' && (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)] px-0.5">
                    <div>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {SST_SECTIONS_META.find((s) => s.key === selectedSstSection)?.bookTitle}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span>
                        Board Weightage: {SST_SECTIONS_META.find((s) => s.key === selectedSstSection)?.marksWeightage}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSstSection('all')}
                      className="text-cyan-400 hover:underline font-semibold cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Show All SST Sections
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* INTERACTIVE CBSE CLASS 10 SST MAP WORK MASTERY CHECKLIST (Inside /resources Step 4) */}
          {selectedSubject === 'sst' &&
            (selectedRequirement === 'digraj_singh_rajput' ||
              preSectionResources.some((r) => Boolean(r.sstSection))) &&
            (showMapChecklistPanel || selectedSstSection === 'map_work') && (
            <div
              id="sst-map-checklist-panel"
              className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 sm:p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <Compass className="w-4 h-4 shrink-0" />
                    <span>CBSE Class 10 Board Map Work Mastery (5 Guaranteed Marks)</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                    Interactive Syllabus Location Checklist
                  </h4>
                  <div className="text-xs text-[var(--text-muted)] tabular-nums">
                    History (2 Marks): {sstMapStats.histDone}/{sstMapStats.histTotal}
                    <span aria-hidden="true"> · </span>
                    Geography (3 Marks): {sstMapStats.geoDone}/{sstMapStats.geoTotal}
                    <span aria-hidden="true"> · </span>
                    Saved Offline Automatically
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleOpenStudySheet('sst_map_work_master_guide', 'notes')}
                    className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Map Memory Tricks</span>
                  </button>
                  {masteredMapIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setMasteredMapIds([])}
                      className="px-3 py-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                    >
                      Reset Progress
                    </button>
                  )}
                </div>
              </div>

              {/* Dual-bar History (2M) & Geography (3M) Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)]">History: Nationalism in India (2 Marks)</span>
                    <span className="font-mono tabular-nums text-emerald-400 font-bold">
                      {sstMapStats.histDone}/{sstMapStats.histTotal}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--bg-card)] overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-200"
                      style={{ width: `${Math.round((sstMapStats.histDone / sstMapStats.histTotal) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)]">Geography: Dams, Crops, Mines &amp; Ports (3 Marks)</span>
                    <span className="font-mono tabular-nums text-cyan-400 font-bold">
                      {sstMapStats.geoDone}/{sstMapStats.geoTotal}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--bg-card)] overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 transition-all duration-200"
                      style={{ width: `${Math.round((sstMapStats.geoDone / sstMapStats.geoTotal) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Map Checklist Filters & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-x-auto">
                  {(
                    [
                      { key: 'all', label: 'All Points' },
                      { key: 'history', label: 'History (2M)' },
                      { key: 'geography', label: 'Geography (3M)' },
                      { key: 'pending', label: 'Pending' },
                      { key: 'mastered', label: 'Mastered' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setMapFilterType(tab.key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        mapFilterType === tab.key
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={mapSearchQuery}
                    onChange={(e) => setMapSearchQuery(e.target.value)}
                    placeholder="Filter dam, port, state..."
                    aria-label="Filter CBSE map locations"
                    className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-cyan-400 focus:outline-none"
                  />
                  {mapSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMapSearchQuery('')}
                      className="absolute right-2 top-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Checkable Map Location Rows */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-color)] border border-[var(--border-color)] rounded-lg">
                {filteredMapItems.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[var(--text-muted)] space-y-2">
                    <p>No map points match your current filter.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setMapFilterType('all');
                        setMapSearchQuery('');
                      }}
                      className="text-cyan-400 font-semibold hover:underline cursor-pointer"
                    >
                      Reset Map Filter
                    </button>
                  </div>
                ) : (
                  filteredMapItems.map((item) => {
                    const isMastered = masteredMapIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleMapItemMastered(item.id)}
                        className="w-full min-h-[44px] px-3 py-2.5 text-left flex items-start sm:items-center justify-between gap-3 hover:bg-cyan-500/[0.04] transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          {isMastered ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="text-xs font-bold text-[var(--text-primary)] break-words">
                              {item.label}
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] break-words">
                              <span>{item.subject === 'history' ? 'History' : 'Geography'}</span>
                              <span aria-hidden="true"> · </span>
                              <span>{item.chapter}</span>
                              <span aria-hidden="true"> · </span>
                              <span>{item.taskType}</span>
                              <span aria-hidden="true"> · </span>
                              <span>{item.stateOrHint}</span>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`text-[11px] font-semibold whitespace-nowrap shrink-0 flex items-center gap-1 ${
                            isMastered ? 'text-emerald-400' : 'text-[var(--text-muted)]'
                          }`}
                        >
                          {isMastered ? (
                            <>
                              <Check className="w-3.5 h-3.5 shrink-0" />
                              <span>Mastered</span>
                            </>
                          ) : (
                            <span>Pending</span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Table Matrix View (Never shows 'not available' — auto-loads Google Search PDFs if query narrows beyond local matrix) */}
          {filteredResources.length === 0 ? (
            <div className="rounded-xl bg-[var(--bg-card)] border border-cyan-500/30 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 text-cyan-400 ${isGoogleSyncLoading ? 'animate-spin' : ''}`} />
                  <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                    Live Google Search PDF Links for {getSubjectLabel(selectedSubject)}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedAcademicYear('all');
                    setSelectedSstSection('all');
                  }}
                  className="px-3 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-bold text-xs cursor-pointer"
                >
                  Show All Verified PDFs
                </button>
              </div>
              {googleSyncResult?.groundedLinks && googleSyncResult.groundedLinks.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {googleSyncResult.groundedLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onRecordStudyActivity?.()}
                      className="p-2.5 rounded-xl bg-[var(--bg-elevated)] hover:border-cyan-400 border border-[var(--border-color)] flex items-center justify-between gap-2 text-xs font-bold text-cyan-300 min-w-0"
                    >
                      <span className="break-words [overflow-wrap:anywhere] min-w-0">{link.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-b border-[var(--border-color)] text-[11px] uppercase tracking-wider font-extrabold">
                    <th className="py-2.5 px-3 whitespace-nowrap">Subject &amp; Code</th>
                    <th className="py-2.5 px-3 whitespace-nowrap min-w-[200px]">Document / Session</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">Direct Resource / PDF</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">Answers / Marking Scheme</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">Official Portal / Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredResources.map((res: ResourceItem) => {
                    const subColor = getSubjectColor(res.subjectId);
                    const officialPortal = res.officialPortalUrl || 'https://cbseacademic.nic.in/SQP_CLASSX_2026-27.html';

                    // Sublinks if present (SQP, MS, PDFs, Mock Tests, Portal links)
                    const primarySubLinks = res.subLinks?.filter((sl) => sl.type !== 'ms') || [];
                    const msSubLinks = res.subLinks?.filter((sl) => sl.type === 'ms') || [];

                    const primaryActionLabel =
                      res.category === 'digraj_singh_rajput'
                        ? 'Open digrajsinghrajput.com ↗'
                        : res.category === 'revision_notes'
                        ? 'Open Notes ↗'
                        : res.category === 'extra_qa'
                        ? 'Open Extra Q&A ↗'
                        : res.category === 'mcq_tests'
                        ? res.title.toLowerCase().includes('mock test') || res.url.includes('mock-test')
                          ? 'Start Free Test ↗'
                          : 'Practice MCQs ↗'
                        : res.category === 'cbse_pyq'
                        ? 'Open PYQ ↗'
                        : res.category === 'ncert_books'
                        ? 'Open NCERT PDF ↗'
                        : res.category === 'ncert_solutions' || res.category === 'reference_books'
                        ? 'Open Solutions ↗'
                        : res.category === 'cbse_topper_answers'
                        ? 'View Topper Copies ↗'
                        : res.category === 'cbse_sqp'
                        ? 'Open Official SQP ↗'
                        : 'Open Resource ↗';

                    return (
                      <tr
                        key={res.id}
                        className="hover:bg-cyan-500/[0.03] transition-colors"
                      >
                        {/* 1. Subject & Code */}
                        <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-6 rounded-full shrink-0"
                              style={{ backgroundColor: subColor }}
                            />
                            <div>
                              <span
                                className="sub-accent-pill border px-1.5 py-0.5 rounded text-[10px] font-black uppercase block w-fit"
                                style={{ '--sub-hex': subColor } as React.CSSProperties}
                              >
                                {getSubjectLabel(res.subjectId)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Document & Session */}
                        <td className="py-2.5 px-3 align-middle">
                          <div className="space-y-0.5">
                            <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 flex-wrap">
                              <span>{res.year || res.updatedDateLabel || 'CBSE Official'}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-cyan-400 font-medium">{res.badge}</span>
                              {res.sstSection && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="capitalize">{res.sstSection.replace('_', ' ')}</span>
                                </>
                              )}
                            </div>
                            <div className="text-xs font-bold text-[var(--text-primary)] leading-tight">
                              {res.title}
                            </div>
                            {res.description && (
                              <div className="text-[11px] text-[var(--text-muted)] line-clamp-2 max-w-md">
                                {res.description}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 3. Direct Resource / PDF / Interactive Study Sheet */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-center align-middle">
                          {res.studySheetId || res.opensMapChecklist ? (
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {res.studySheetId && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenStudySheet(
                                      res.studySheetId!,
                                      res.id.includes('pyq') || res.id.includes('extra_qa')
                                        ? 'sureshot'
                                        : 'notes'
                                    )
                                  }
                                  className="inline-flex px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
                                >
                                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                                  <span>
                                    {res.id.includes('pyq') || res.id.includes('extra_qa')
                                      ? 'Read Sure-Shot Q&As'
                                      : 'Read Notes & Mind Map'}
                                  </span>
                                </button>
                              )}
                              {res.opensMapChecklist && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowMapChecklistPanel(true);
                                    const el = document.getElementById('sst-map-checklist-panel');
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                  }}
                                  className="inline-flex px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
                                >
                                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                                  <span>Open Map Checklist</span>
                                </button>
                              )}
                            </div>
                          ) : primarySubLinks.length > 0 ? (
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {primarySubLinks.map((sl, idx) => (
                                <a
                                  key={idx}
                                  href={sl.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => onRecordStudyActivity?.()}
                                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm transition-all"
                                  title={`Open ${sl.label} directly in new tab`}
                                >
                                  <FileText className="w-3.5 h-3.5 shrink-0" />
                                  <span>{sl.label.replace(' (PDF)', '')} ↗</span>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => onRecordStudyActivity?.()}
                              className="inline-flex px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs items-center gap-1 shadow-sm transition-all"
                              title={`Open ${res.title} in new tab`}
                            >
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span>{primaryActionLabel}</span>
                            </a>
                          )}
                        </td>

                        {/* 4. Answers / Marking Scheme (MS) / Mind Map & Video Companion */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-center align-middle">
                          {res.studySheetId ? (
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleOpenStudySheet(res.studySheetId!, 'mindmap')}
                                className="inline-flex px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-400/50 text-[var(--text-primary)] font-bold text-xs items-center gap-1 transition-all cursor-pointer whitespace-nowrap shrink-0"
                              >
                                <GitBranch className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span>Mind Map</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenStudySheet(res.studySheetId!, 'video')}
                                className="inline-flex px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-emerald-400/50 text-emerald-400 font-bold text-xs items-center gap-1 transition-all cursor-pointer whitespace-nowrap shrink-0"
                              >
                                <PlayCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>Video Guide</span>
                              </button>
                            </div>
                          ) : msSubLinks.length > 0 ? (
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {msSubLinks.map((sl, idx) => (
                                <a
                                  key={idx}
                                  href={sl.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => onRecordStudyActivity?.()}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs flex items-center gap-1 transition-all"
                                  title={`Open ${sl.label} in new tab`}
                                >
                                  <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>{sl.label.replace(' (PDF)', '')} ↗</span>
                                </a>
                              ))}
                            </div>
                          ) : res.markingSchemeUrl ? (
                            <a
                              href={res.markingSchemeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => onRecordStudyActivity?.()}
                              className="inline-flex px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs items-center gap-1 transition-all"
                              title="Open solutions or marking scheme in new tab"
                            >
                              <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                              <span>{res.category === 'revision_notes' ? 'Alt Notes Portal ↗' : res.category === 'mcq_tests' ? 'Chapter MCQs ↗' : 'Marking Scheme ↗'}</span>
                            </a>
                          ) : (
                            <span className="text-[11px] text-[var(--text-muted)] italic">
                              Answers Included
                            </span>
                          )}
                        </td>

                        {/* 5. Official Portal / Source */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-center align-middle">
                          <a
                            href={officialPortal}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onRecordStudyActivity?.()}
                            className="inline-flex px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-400/50 text-[var(--text-secondary)] hover:text-cyan-300 font-bold text-xs items-center gap-1 transition-all"
                            title={`Open ${res.source} in new tab`}
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>
                              {res.category === 'digraj_singh_rajput'
                                ? 'digrajsinghrajput.com ↗'
                                : 'Official Portal ↗'}
                            </span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom Navigation Toolbar */}
          <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Select Another Subject (Step 1)</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Change Material (Step 2)
              </button>
              <button
                type="button"
                onClick={() => setWizardStep(3)}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Change Year (Step 3)
              </button>
            </div>
          </div>

          {/* Live Google Search PDF Discovery Bar */}
          <LiveResourceSearch
            defaultSubjectId={selectedSubject}
            language={language}
            onRecordStudyActivity={onRecordStudyActivity}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL CBSE DOCUMENT LAUNCHER & SAFE READER MODAL                       */}
      {/* ========================================================================= */}
      {activePdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified CBSE Document</span>
                    </span>
                    {activePdfModal.fileSize && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-bold">
                        {activePdfModal.fileSize}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] break-words [overflow-wrap:anywhere] mt-0.5">
                    {activePdfModal.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActivePdfModal(null)}
                  className="p-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-rose-500/20 hover:text-rose-400 text-[var(--text-secondary)] border border-[var(--border-color)] transition-all cursor-pointer"
                  title="Close Modal (Escape)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode Selector within Modal: Official Direct Launcher vs Safe Google Docs Reader */}
            <div className="px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-between gap-2 flex-wrap">
              <div className="inline-flex p-0.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setModalReaderMode('launcher')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    modalReaderMode === 'launcher'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <RocketIcon className="w-3.5 h-3.5" />
                  <span>Official Direct Launcher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalReaderMode('reader')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    modalReaderMode === 'reader'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Safe In-App Preview</span>
                </button>
              </div>

              {/* Direct Copy Button */}
              <button
                type="button"
                onClick={() => handleCopyLink(activePdfModal.url)}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] transition-all flex items-center gap-1.5 cursor-pointer"
                title="Copy direct official URL"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Link Copied! ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Direct Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
              {modalReaderMode === 'launcher' ? (
                <div className="space-y-4">
                  {/* Verified Document Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-elevated)] border border-blue-500/35 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                          Official High-Resolution PDF
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                          {activePdfModal.title}
                        </h4>
                      </div>
                      <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Official URL display */}
                    <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[11px] font-mono text-[var(--text-secondary)] break-all select-all flex items-center justify-between gap-2">
                      <span className="break-all">{activePdfModal.url}</span>
                    </div>

                    {/* Prominent Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <a
                        href={activePdfModal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onRecordStudyActivity?.()}
                        className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:opacity-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
                      >
                        <span>Open Official PDF (New Tab)</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>

                      <a
                        href={activePdfModal.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onRecordStudyActivity?.()}
                        className="py-3 px-4 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Download PDF Directly</span>
                      </a>
                    </div>

                    {/* Marking Scheme Button if available */}
                    {activePdfModal.markingSchemeUrl && (
                      <div className="pt-2 border-t border-slate-800">
                        <a
                          href={activePdfModal.markingSchemeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onRecordStudyActivity?.()}
                          className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                        >
                          <FileCheck2 className="w-4 h-4" />
                          <span>Open Official CBSE Step-by-Step Marking Scheme ↗</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Informational Security Notice */}
                  <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Direct official CBSE/NCERT PDF launcher</span>
                    </div>
                    <InfoTooltip
                      text="CBSE and NCERT servers block iframe embedding (X-Frame-Options). Opening in a new tab guarantees high-resolution zoom, search, and printing."
                      align="right"
                    />
                  </div>
                </div>
              ) : (
                /* Google Docs Safe Proxy Reader Embed */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>Safe In-App Proxy Reader (Google Docs Viewer)</span>
                    <a
                      href={activePdfModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onRecordStudyActivity?.()}
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>Open in Browser Tab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="relative w-full h-[500px] rounded-xl border border-[var(--border-color)] overflow-hidden bg-slate-950">
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                        activePdfModal.url
                      )}&embedded=true`}
                      className="w-full h-full border-0"
                      title={activePdfModal.title}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD SUBJECT & CHAPTER CHECKBOX POPUP MODAL                                */}
      {/* ========================================================================= */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                  {addSubjectSelectedSub ? 'Step 2: Chapter Selection' : 'Step 1: Choose Subject'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  {addSubjectSelectedSub
                    ? `Select Chapters for ${getLocalizedSubjectName(addSubjectSelectedSub.id, addSubjectSelectedSub.name, language)}`
                    : 'Add Subject to Your Class 10 Syllabus'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddSubjectModalOpen(false);
                  setAddSubjectSelectedSub(null);
                  setAddSubjectSelectedChapters([]);
                }}
                className="p-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-rose-500/20 hover:text-rose-400 text-[var(--text-secondary)] border border-[var(--border-color)] transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
              {!addSubjectSelectedSub ? (
                /* Stage A: Pick Subject from Available Subjects */
                <div className="space-y-3">
                  {unEnrolledSubjectsList.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1.5">
                      <div className="text-2xl">🎉</div>
                      <h4 className="text-sm font-black text-[var(--text-primary)]">
                        All Available Subjects Enrolled!
                      </h4>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {unEnrolledSubjectsList.map((sub) => {
                        const totalChs = sub.groups.reduce((acc, g) => acc + g.chapters.length, 0);
                        return (
                          <div
                            key={sub.id}
                            className="p-3.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-400/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span
                                className="w-2.5 h-10 rounded-full shrink-0"
                                style={{ backgroundColor: sub.color }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className="sub-accent-pill border px-2 py-0.5 rounded text-[10px] font-black uppercase"
                                    style={{ '--sub-hex': sub.color } as React.CSSProperties}
                                  >
                                    Code {sub.code}
                                  </span>
                                  <span className="text-[11px] font-bold text-[var(--text-muted)]">
                                    {totalChs} Chapters
                                  </span>
                                </div>
                                <h4 className="text-sm font-extrabold text-[var(--text-primary)] break-words [overflow-wrap:anywhere] mt-0.5">
                                  {getLocalizedSubjectName(sub.id, sub.name, language)}
                                </h4>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setAddSubjectSelectedSub(sub);
                                setAddSubjectSelectedChapters(
                                  sub.groups.flatMap((g) => g.chapters.map((c) => c.id))
                                );
                                setAddSubjectChapterSearch('');
                              }}
                              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-400/40 text-xs font-black shrink-0 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>Select Chapters</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Stage B: Chapter Checklist with Checkboxes, Select All / Deselect All, and Search */
                <div className="space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-color)]">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: addSubjectSelectedSub.color }}
                      />
                      <span className="text-xs font-extrabold text-[var(--text-primary)]">
                        {addSubjectSelectedChapters.length} of{' '}
                        {addSubjectSelectedSub.groups.reduce((acc, g) => acc + g.chapters.length, 0)} Chapters Selected
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const allChIds = addSubjectSelectedSub.groups.flatMap((g) =>
                            g.chapters.map((c) => c.id)
                          );
                          setAddSubjectSelectedChapters(allChIds);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] hover:border-cyan-400 transition-colors cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddSubjectSelectedChapters([])}
                        className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Chapter Filter Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5 pointer-events-none" />
                    <AutoGrowPromptInput
                      value={addSubjectChapterSearch}
                      onValueChange={setAddSubjectChapterSearch}
                      placeholder="Filter chapters by name or number..."
                      maxHeightPx={96}
                      ariaLabel="Filter chapters"
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-cyan-400 focus:outline-none"
                    />
                    {addSubjectChapterSearch && (
                      <button
                        type="button"
                        onClick={() => setAddSubjectChapterSearch('')}
                        className="absolute right-2.5 top-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Checkbox list of chapters */}
                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
                    {addSubjectSelectedSub.groups.map((group) => {
                      const filteredChapters = group.chapters.filter((ch) => {
                        if (!addSubjectChapterSearch.trim()) return true;
                        const q = addSubjectChapterSearch.toLowerCase();
                        return ch.name.toLowerCase().includes(q) || String(ch.no).includes(q);
                      });

                      if (filteredChapters.length === 0) return null;

                      return (
                        <div key={group.id} className="space-y-1.5">
                          {group.name && (
                            <div className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)] px-1">
                              {group.name}
                            </div>
                          )}
                          <div className="space-y-1.5">
                            {filteredChapters.map((ch) => {
                              const isChecked = addSubjectSelectedChapters.includes(ch.id);
                              return (
                                <div
                                  key={ch.id}
                                  onClick={() => {
                                    setAddSubjectSelectedChapters((prev) =>
                                      prev.includes(ch.id)
                                        ? prev.filter((id) => id !== ch.id)
                                        : [...prev, ch.id]
                                    );
                                  }}
                                  className={`p-2.5 rounded-xl border text-xs flex items-start sm:items-center justify-between gap-2.5 transition-all cursor-pointer ${
                                    isChecked
                                      ? 'bg-cyan-500/15 border-cyan-400 text-[var(--text-primary)]'
                                      : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-cyan-400/40'
                                  }`}
                                >
                                  <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                                    {isChecked ? (
                                      <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
                                    ) : (
                                      <Square className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5 sm:mt-0" />
                                    )}
                                    <span className="font-bold leading-snug break-words flex-1 min-w-0">
                                      {getLocalizedChapterPrefix(language)} {ch.no}:{' '}
                                      {getLocalizedChapterName(ch.id, ch.name, language)}
                                    </span>
                                  </div>

                                  {ch.highYield && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-extrabold shrink-0">
                                      High-Yield
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-[var(--border-color)] bg-[var(--bg-elevated)] flex flex-wrap items-center justify-between gap-2">
              {addSubjectSelectedSub ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setAddSubjectSelectedSub(null);
                      setAddSubjectSelectedChapters([]);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-bold transition-all cursor-pointer"
                  >
                    ← Back to Subject List
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAddSubject}
                    disabled={addSubjectSelectedChapters.length === 0}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Confirm &amp; Add Subject ({addSubjectSelectedChapters.length} Chapters)</span>
                    <Check className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModalOpen(false)}
                  className="ml-auto px-4 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SST ONE-SHOT NOTES, MIND MAP, SURE-SHOT PYQ & VIDEO COMPANION READER MODAL*/}
      {/* ========================================================================= */}
      {activeStudySheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label={activeStudySheet.title}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
              <div className="space-y-1 min-w-0">
                <div className="text-xs text-[var(--text-muted)] flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-cyan-400">{activeStudySheet.chapterLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeStudySheet.weightageLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeStudySheet.readTimeMinutes} min read</span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] leading-snug">
                  {activeStudySheet.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {activeStudySheet.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveStudySheet(null)}
                className="p-2 rounded-xl bg-[var(--bg-card)] hover:bg-rose-500/20 hover:text-rose-400 text-[var(--text-secondary)] border border-[var(--border-color)] transition-colors cursor-pointer shrink-0"
                title="Close Study Reader"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reader Navigation Tabs + Print/External Controls */}
            <div className="px-4 py-2.5 border-b border-[var(--border-color)] bg-[var(--bg-card)] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-x-auto">
                {(
                  [
                    { key: 'notes', label: 'One-Shot Notes' },
                    { key: 'mindmap', label: 'Rapid Mind Map' },
                    { key: 'sureshot', label: 'Sure-Shot PYQs' },
                    { key: 'video', label: 'Video Companion' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setStudySheetTab(t.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      studySheetTab === t.key
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onRecordStudyActivity?.();
                    window.print();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                  title="Print or save this revision sheet as PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Print / Save PDF</span>
                </button>
                <a
                  href={activeStudySheet.externalReferenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onRecordStudyActivity?.()}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
                >
                  <span>{activeStudySheet.externalReferenceLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Reader Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {studySheetTab === 'notes' && (
                <div className="space-y-4">
                  {activeStudySheet.oneShotPoints.map((block, bIdx) => (
                    <div
                      key={bIdx}
                      className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2.5"
                    >
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">
                        {block.heading}
                      </h4>
                      <ul className="space-y-2 list-disc pl-5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                        {block.bullets.map((bullet, idx) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {studySheetTab === 'mindmap' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                    <div className="text-[11px] font-semibold text-cyan-400">
                      Central Topic Node
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] mt-0.5">
                      {activeStudySheet.chapterLabel}: {activeStudySheet.title.split('—')[0].trim()}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeStudySheet.mindMapBranches.map((branch, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2.5"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                          <GitBranch className="w-4 h-4 shrink-0" />
                          <span>{branch.branchTitle}</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                          {branch.nodes.map((node, nIdx) => (
                            <li
                              key={nIdx}
                              className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]"
                            >
                              {node}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {studySheetTab === 'sureshot' && (
                <div className="space-y-3.5">
                  {activeStudySheet.sureShotQuestions.map((qItem, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-amber-400">
                          Question {qIdx + 1} · {qItem.marks}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                        {qItem.question}
                      </h4>
                      <div className="pt-2 border-t border-[var(--border-color)] space-y-1.5">
                        <div className="text-[11px] font-semibold text-emerald-400">
                          CBSE Marking Scheme Value Points:
                        </div>
                        <ul className="space-y-1.5 list-disc pl-5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                          {qItem.answerPoints.map((pt, pIdx) => (
                            <li key={pIdx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {studySheetTab === 'video' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-emerald-400">
                        {activeStudySheet.videoCompanion.durationLabel}
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                        {activeStudySheet.videoCompanion.searchTitle}
                      </h4>
                    </div>
                    <a
                      href={activeStudySheet.videoCompanion.videoSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Watch CBSE One-Shot Video ↗</span>
                    </a>
                  </div>

                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-[var(--text-muted)]">
                      Key Topics to Cover During Video Revision:
                    </div>
                    {activeStudySheet.videoCompanion.segments.map((seg, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="text-xs font-bold text-[var(--text-primary)]">
                          {sIdx + 1}. {seg.topic}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {seg.focus}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mini rocket icon helper for the launcher button
function RocketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
