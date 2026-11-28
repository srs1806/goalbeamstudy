import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  BookOpen,
  FileText,
  TrendingUp,
  Home,
  User,
  Sparkles,
  Smartphone,
  Monitor,
  Tablet,
  Trophy,
  Mic,
  MicOff,
  RefreshCw,
  Download,
  Image as ImageIcon,
  Film,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Check,
  Target,
  Calendar,
  TreeDeciduous,
  Compass,
  MapPin,
  X,
} from 'lucide-react';
import { Logo } from './Logo';
import { FireFlame } from './FireFlame';
import { ScholarBoyAvatar } from './ScholarBoyAvatar';
import { InfoTooltip } from './InfoTooltip';
import { YouTubeChannelButton } from './YouTubeChannelButton';

interface ManualVideoTourProps {
  onProceedToDashboard: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export type DeviceScreenSize = 'mobile' | 'tablet' | 'desktop';

export interface VideoTourChapter {
  id: string;
  title: string;
  shortTitle: string;
  timestamp: string;
  durationSeconds: number;
  icon: string;
  headline: string;
  subheadline: string;
  stepCallouts: [string, string, string];
  spokenScriptHinglish: string;
  spokenScriptEnglish: string;
  keyPoints: string[];
}

export const TOUR_CHAPTERS: VideoTourChapter[] = [
  {
    id: 'tab_home',
    title: '01. Home Dashboard & Streak',
    shortTitle: 'Home Dashboard',
    timestamp: '00:00',
    durationSeconds: 18,
    icon: '🏠',
    headline: 'Home Dashboard: Exam Countdown, 5:00 AM Streak & Live Ranks',
    subheadline:
      'Instant access with no login wall, real-time 1st paper countdown, daily target queue, and compact live leaderboard access',
    stepCallouts: [
      'Live First Paper Countdown & 5:00 AM Daily Streak',
      'Compact Clickable Live Leaderboard of Syllabus Banner',
      'Today’s Priority Chapters & Shareable Flex Certificate',
    ],
    spokenScriptHinglish:
      'Namaste scholars! GOALBEAM Class 10 Course Tracker bina kisi login wall ke turant open hota hai. Home Dashboard par sabse upar aapko apna overall progress ring, First Board Paper ka live countdown, aur 5:00 AM daily streak dikhti hai. Yahin se aap Live Leaderboard card par tap karke real student rankings check kar sakte hain aur Today Focus queue se chapters complete mark kar sakte hain.',
    spokenScriptEnglish:
      'Welcome scholars! GOALBEAM opens directly into your live Class 10 course dashboard with zero login friction. Track your exact first-paper countdown, 5:00 AM automatic streak rollover, today’s priority targets, and tap the compact Live Leaderboard card anytime.',
    keyPoints: [
      'Instant Dashboard Entry: Start tracking boards, chapters, and quizzes immediately.',
      'Real-Time Exam Countdown: Counts days left until your scheduled first board paper.',
      '5:00 AM Streak Rollover: Daily streak updates cleanly at 5:00 AM local time.',
      'Flex Progress Certificate: Export a crisp study progress report card in one click.',
    ],
  },
  {
    id: 'tab_chapters',
    title: '02. CBSE Class 10 · 54 Subjects',
    shortTitle: 'Chapters Matrix',
    timestamp: '00:18',
    durationSeconds: 20,
    icon: '📚',
    headline: 'Chapters Mastery: 54 CBSE Class 10 Subjects & Custom Stages',
    subheadline:
      'Track NCERT, Reference Books, PYQs/CBQs, Worksheets, custom stages, personal revision notes & Batch Catch-Up Wizard',
    stepCallouts: [
      'Pick From All 54 Official CBSE Class 10 Subjects',
      'Tick 4+ Study Stages & Save Personal Chapter Notes',
      'Fast Batch Catch-Up Wizard for Bulk Progress Updates',
    ],
    spokenScriptHinglish:
      'Doosra workspace hai Chapters Mastery, jo strictly CBSE Class 10 students ke liye 54 official subjects support karta hai. Har chapter me NCERT, Reference Book, PYQ aur Worksheet stages tick karne ko milte hain. Aap apne custom stages add kar sakte hain, har chapter ke liye personal notes aur formulas save kar sakte hain, aur Batch Catch-Up Wizard se ek click me purana progress update kar sakte hain.',
    spokenScriptEnglish:
      'Chapters Mastery is tailored strictly for CBSE Class 10 students with all 54 official subjects. Track NCERT, Reference Books, PYQs, Worksheets, and custom stages while storing personal formulas inside each chapter’s notes drawer.',
    keyPoints: [
      'Strictly CBSE Class 10 (54 Subjects): Maths, Science, SST, Languages, AI 417, IT 402 & more.',
      'Multi-Stage Checklists: Customize stages per subject with instant percentage updates.',
      'Personal Notes Drawer: Store key formulas, dates, and chemical equations per chapter.',
      'Batch Catch-Up Wizard: Mark multiple finished chapters & stages together cleanly.',
    ],
  },
  {
    id: 'tab_practice',
    title: '03. 10-MCQ Arena & Flashcards',
    shortTitle: 'Practice Arena',
    timestamp: '00:38',
    durationSeconds: 20,
    icon: '🎯',
    headline: 'Practice Arena: Chapter-Wise 10-MCQ Sprints & Flip Flashcards',
    subheadline:
      'AI-grounded CBSE competency MCQs per chapter with detailed step-by-step solutions and interactive active-recall flashcards',
    stepCallouts: [
      'Pick Any Enrolled Subject & Specific Chapter',
      'Solve 10 CBSE Board-Pattern Competency MCQs',
      'Flip High-Yield Formula & Definition Flashcards',
    ],
    spokenScriptHinglish:
      'Teesra section hai Practice Arena. Yahan kisi bhi subject aur chapter ko choose karke aap turant 10 CBSE board-level MCQs ka test de sakte hain. Har question ke baad instant answer check aur step-by-step explanation milta hai. Revision ke liye interactive Formula aur Definition Flashcards bhi yahan built-in hain.',
    spokenScriptEnglish:
      'Enter the Practice Arena to take instant chapter-wise 10-question CBSE competency sprints with explanations, or switch to interactive flip flashcards for fast formula and concept recall.',
    keyPoints: [
      '10-MCQ Chapter Sprints: Competency, assertion-reason, and case-study board practice.',
      'Instant Answer Grading: Immediate accuracy score with concise board explanations.',
      'Active-Recall Flashcards: Flip cards for equations, dates, and definitions.',
      'Curriculum Grounded: Strictly aligned to rationalized NCERT Class 10 chapters.',
    ],
  },
  {
    id: 'tab_resources',
    title: '04. Resources Vault & SST Map Work',
    shortTitle: 'Resources Vault',
    timestamp: '00:58',
    durationSeconds: 22,
    icon: '📑',
    headline: 'Resources Vault: One-Shot Notes, SST Map Work & Official SQPs',
    subheadline:
      'Chapter-wise revision sheets, interactive Class 10 SST Map Work checklist, Official CBSE SQPs, PYQs & Live Search Finder',
    stepCallouts: [
      'Filter by Step: Revision Notes, PYQs & Official SQPs',
      'Interactive Class 10 SST Map Work Checklist & Rapid Sheets',
      'Live Google Search Official NCERT / CBSE Resource Finder',
    ],
    spokenScriptHinglish:
      'Chautha powerhouse hai Resources Vault. Yahan step-by-step filters me aapko Revision Notes, PYQs, Mind Maps aur Official 2026-27 Sample Question Papers Marking Schemes ke saath milte hain. Class 10 SST ke liye chapter-wise One-Shot notes aur interactive Map Work practice checklist bhi yahin integrated hai, saath hi Live Search tool se aap verified NCERT aur CBSE PDFs search kar sakte hain.',
    spokenScriptEnglish:
      'The Resources Vault organizes Revision Notes, PYQs, Official CBSE Sample Papers, Marking Schemes, Class 10 SST study sheets, an interactive Map Work checklist, and a live verified official resource search.',
    keyPoints: [
      'Class 10 SST Pack & Map Work: Interactive History & Geography map checklist built in.',
      'Official CBSE SQPs & Marking Schemes: Direct verified links with zero broken redirects.',
      'Chapter-Wise Notes & Mind Maps: Clean rapid revision sheets ready before exams.',
      'Live Official Resource Search: Query verified cbseacademic.nic.in and ncert.nic.in materials.',
    ],
  },
  {
    id: 'tab_aura_ai',
    title: '05. Goalbeam AI Study Studio (6 Tools)',
    shortTitle: 'Goalbeam AI Studio',
    timestamp: '01:20',
    durationSeconds: 22,
    icon: '⚡',
    headline: 'Goalbeam AI Study Studio: 6 Specialized Course Preparation Workspaces',
    subheadline:
      'MindDesk Doubt Solver, CanvasCraft Diagrams, Motion Video, PulseRadar Search & EchoNote, ScholarCast Briefing, SonicFlow Beats',
    stepCallouts: [
      'MindDesk Chat & ScholarCast 60s Chapter Briefings',
      'CanvasCraft Scientific Diagrams & Motion Explainers',
      'PulseRadar Grounded Search, EchoNote Voice & SonicFlow Focus Audio',
    ],
    spokenScriptHinglish:
      'Paanchva feature hai Goalbeam AI Study Studio jisme 6 dedicated study tools milte hain: MindDesk AI step-by-step board doubts solve karta hai, CanvasCraft Science diagrams draw karta hai, Motion Workspace concepts ko animate karta hai, PulseRadar live web citations dhoondhta hai, ScholarCast 60-second revision briefing sunata hai, aur SonicFlow concentration music generate karta hai.',
    spokenScriptEnglish:
      'Goalbeam AI Study Studio brings together 6 focused tools: MindDesk Tutor for step-by-step CBSE answers, CanvasCraft for diagrams, Motion Video explainers, PulseRadar Search & Voice, ScholarCast 60-second briefings, and SonicFlow focus audio.',
    keyPoints: [
      'MindDesk & Voice Dictation: Ask Science, Maths & SST doubts via text or microphone.',
      'CanvasCraft & Motion Explainers: Generate labeled diagrams and conceptual step sequences.',
      'ScholarCast & PulseRadar: Get concise 60-second topic briefings with web sources.',
      'Strict Academic Focus Guard: Keeps AI sessions 100% centered on study topics.',
    ],
  },
  {
    id: 'tab_focus_planner',
    title: '06. 3D Focus Garden & Planner',
    shortTitle: 'Focus & Planner',
    timestamp: '01:42',
    durationSeconds: 20,
    icon: '🌲',
    headline: '3D Pomodoro Focus Garden & Exam Date-Sheet Timetable',
    subheadline:
      'Grow a real Three.js 3D tree during deep study blocks with tab-switch distraction protection, plus custom daily timetable blocks',
    stepCallouts: [
      'Three.js 3D Interactive Tree Growth Timer',
      'Anti-Distraction Tab Guard Protects Your Focus Streak',
      'Date-Sheet Exam Countdowns & Daily Study Timetable',
    ],
    spokenScriptHinglish:
      'Chhatha feature hai 3D Focus Garden aur Smart Planner. Jaise-jaise aap Pomodoro timer ke saath padhai karte hain, ek 3D tree real time me grow hota hai, aur agar aap study tab chhodte hain toh anti-distraction guard turant alert deta hai. Planner tab me aap apne har subject ki exact exam date aur daily morning-evening study timetable set kar sakte hain.',
    spokenScriptEnglish:
      'Stay locked in with the Three.js 3D Focus Garden that grows trees as you complete Pomodoro sprints, backed by distraction detection and a customizable board exam date-sheet & daily study planner.',
    keyPoints: [
      'Interactive 3D Focus Garden: Real WebGL 3D study tree evolves through growth stages.',
      'Anti-Distraction Guard: Tracks focus focus integrity and awards Focus Points.',
      'Subject Exam Date-Sheet: Enter individual exam dates for countdown alerts.',
      'Daily Time-Block Planner: Organize school, coaching, and self-study slots cleanly.',
    ],
  },
  {
    id: 'tab_leaderboard_insights',
    title: '07. Analytics & Live Leaderboard',
    shortTitle: 'Live Leaderboard',
    timestamp: '02:02',
    durationSeconds: 20,
    icon: '🏆',
    headline: 'Progress Analytics & 100% Real Live Leaderboard of Syllabus',
    subheadline:
      'Multi-line subject trajectory graphs paired with live SSE-synced rankings across all website users by syllabus % & subject average',
    stepCallouts: [
      'Live Leaderboard of Syllabus Synced Across All Users',
      'Ranked by Overall Syllabus % & All-Subject Average',
      'Subject Trajectory Analytics & Lagging Chapter Detector',
    ],
    spokenScriptHinglish:
      'Saatva feature hai Analytics aur 100% Real Live Leaderboard of Syllabus. Insights tab me aapko har subject ki completion trajectory dikhti hai taaki pichhe chhutte subjects jaldi pakad me aayein. Aur Live Leaderboard par website ke saare real students ke syllabus completion percentage aur all-subject average ke hisaab se live rankings update hoti hain.',
    spokenScriptEnglish:
      'Monitor your pace in Analytics with multi-line subject completion curves, and check the real SSE-synced Live Leaderboard ranking students across the website by overall syllabus completed percentage and all-subject average.',
    keyPoints: [
      'Live Leaderboard of Syllabus: Real server-synced student rankings updated live.',
      'Transparent Metrics: Ranked by overall syllabus completed % and all-subject average.',
      'Multi-Line Analytics: Compare Science, Maths, SST & Language progress side by side.',
      'Lagging Subject Alerts: Spot chapters falling behind your target exam date early.',
    ],
  },
  {
    id: 'tab_settings',
    title: '08. Edit Profile, Languages, Themes & Alarms',
    shortTitle: 'Profile & Settings',
    timestamp: '02:22',
    durationSeconds: 18,
    icon: '👤',
    headline: 'Edit Profile & Customization: Switch Profiles, 25 Languages & Daily Alerts',
    subheadline:
      'Manage scholar profiles, switch textbook medium, pick from 5 signature UI themes, enable daily study notifications, and subscribe on YouTube',
    stepCallouts: [
      'Scholar Profile Switcher, + Add New Profile & Goals',
      '25 Textbook Language Mediums & Dusk / Pearl / Amber / Jade / Prism Themes',
      'Daily Study Target Notifications & @TrendzOfShahid',
    ],
    spokenScriptHinglish:
      'Aakhiri section hai Profile aur Customization. Yahan aap apna scholar profile edit ya switch kar sakte hain, 25 textbook mediums select kar sakte hain, Dusk, Pearl, Amber, Jade aur Prism themes switch kar sakte hain, bina data khoye naye subjects enroll kar sakte hain, aur daily study notifications manage kar sakte hain. Saath hi updates ke liye hamare YouTube channel @TrendzOfShahid ko subscribe zaroor karein!',
    spokenScriptEnglish:
      'Personalize GOALBEAM in Profile (Edit Profile): manage or switch scholar profiles, choose from 25 textbook language mediums, switch among our 5 signature themes (Dusk, Pearl, Amber, Jade, Prism), enroll in new Class 10 course subjects without resetting, configure daily study notifications, and subscribe to @TrendzOfShahid on YouTube.',
    keyPoints: [
      '25 Multilingual Mediums: Localized chapter names matching your school textbook.',
      '5 Signature Themes: Dusk, Pearl, Amber, Jade & Prism.',
      'Zero-Reset Subject Manager: Add or adjust subjects anytime without losing progress.',
      'Daily Notifications & Backup: Custom alert chimes plus instant offline JSON export.',
    ],
  },
];

const TOTAL_DURATION_SECONDS = TOUR_CHAPTERS.reduce((sum, ch) => sum + ch.durationSeconds, 0);

function formatRuntime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const ManualVideoTour: React.FC<ManualVideoTourProps> = ({
  onProceedToDashboard,
  isModal = false,
  onClose,
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [chapterElapsed, setChapterElapsed] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [scriptLanguage, setScriptLanguage] = useState<'hinglish' | 'english'>('hinglish');
  const [activeTab, setActiveTab] = useState<'interactive_tour' | 'ai_multimedia_studio' | 'written_handbook'>('interactive_tour');
  const [deviceSize, setDeviceSize] = useState<DeviceScreenSize>('desktop');

  // AI Multimedia Studio States (preserved)
  const [aiStudioMode, setAiStudioMode] = useState<'create_edit_image' | 'animate_image_to_video' | 'generate_video_from_text' | 'transcribe_audio'>('create_edit_image');
  const [aiPrompt, setAiPrompt] = useState<string>('Visual educational diagram explaining the 4-stage chapter mastery in Goalbeam Class 10 course tracker');
  const [aiAspectRatio, setAiAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [aiSelectedImage, setAiSelectedImage] = useState<string | null>(null);
  const [aiIsLoading, setAiIsLoading] = useState<boolean>(false);
  const [aiOutputImage, setAiOutputImage] = useState<string | null>(null);
  const [aiOutputVideo, setAiOutputVideo] = useState<string | null>(null);
  const [aiAnimationSteps, setAiAnimationSteps] = useState<string[] | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Audio recording state for gemini-3.5-transcribe
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentChapter = TOUR_CHAPTERS[currentChapterIndex] || TOUR_CHAPTERS[0];
  const chapterProgressPct = Math.min(100, (chapterElapsed / currentChapter.durationSeconds) * 100);
  const activeSubStep = chapterProgressPct < 34 ? 0 : chapterProgressPct < 68 ? 1 : 2;

  const totalElapsedSeconds = useMemo(() => {
    const prior = TOUR_CHAPTERS.slice(0, currentChapterIndex).reduce((acc, ch) => acc + ch.durationSeconds, 0);
    return Math.min(TOTAL_DURATION_SECONDS, prior + chapterElapsed);
  }, [currentChapterIndex, chapterElapsed]);

  // Continuous smooth video playback timer (runs even if browser blocks TTS or user mutes)
  useEffect(() => {
    if (!isPlaying || activeTab !== 'interactive_tour') return;
    const interval = setInterval(() => {
      setChapterElapsed((prev) => {
        const next = prev + 0.15 * playbackSpeed;
        if (next >= currentChapter.durationSeconds) {
          if (currentChapterIndex < TOUR_CHAPTERS.length - 1) {
            setCurrentChapterIndex((idx) => Math.min(TOUR_CHAPTERS.length - 1, idx + 1));
            return 0;
          } else {
            setIsPlaying(false);
            return currentChapter.durationSeconds;
          }
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isPlaying, activeTab, playbackSpeed, currentChapterIndex, currentChapter.durationSeconds]);

  // Keyboard shortcuts for video theater controls
  useEffect(() => {
    if (activeTab !== 'interactive_tour') return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (currentChapterIndex < TOUR_CHAPTERS.length - 1) {
          setCurrentChapterIndex((idx) => idx + 1);
          setChapterElapsed(0);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (currentChapterIndex > 0) {
          setCurrentChapterIndex((idx) => idx - 1);
          setChapterElapsed(0);
        }
      } else if (e.key.toLowerCase() === 'm') {
        setIsAudioMuted((m) => !m);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, currentChapterIndex]);

  // Clean phonetic text for SpeechSynthesis with natural Hinglish pronunciation
  const getPhoneticSpokenText = (rawText: string): string => {
    return rawText
      .replace(/CBSE/g, 'C.B.S.E.')
      .replace(/NCERT/g, 'N.C.E.R.T.')
      .replace(/PYQ/g, 'P.Y.Q.')
      .replace(/SQP/g, 'S.Q.P.')
      .replace(/CBQ/g, 'C.B.Q.')
      .replace(/SST/g, 'S.S.T.')
      .replace(/MCQ/g, 'M.C.Q.')
      .replace(/SSE/g, 'S.S.E.')
      .replace(/3D/g, 'Three-D')
      .replace(/Three\.js/g, 'Three-J-S')
      .replace(/AI/g, 'A.I.')
      .replace(/5:00 AM/g, 'Subah Paanch Baje')
      .replace(/@TrendzOfShahid/g, 'Trendz Of Shahid');
  };

  const speakChapter = (textToSpeak: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      if (isAudioMuted || !isPlaying) return;

      const cleanScript = getPhoneticSpokenText(textToSpeak);
      const utterance = new SpeechSynthesisUtterance(cleanScript);
      utterance.rate = 1.02 * playbackSpeed;
      utterance.pitch = 1.0;
      utterance.lang = scriptLanguage === 'hinglish' ? 'hi-IN' : 'en-IN';

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          (scriptLanguage === 'hinglish' && (v.lang.includes('hi') || v.lang.includes('IN'))) ||
          (scriptLanguage === 'english' && (v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en')))
      );
      if (preferredVoice) utterance.voice = preferredVoice;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore SpeechSynthesis errors cleanly
    }
  };

  useEffect(() => {
    if (isPlaying && !isAudioMuted && activeTab === 'interactive_tour') {
      const text =
        scriptLanguage === 'hinglish'
          ? currentChapter.spokenScriptHinglish
          : currentChapter.spokenScriptEnglish;
      speakChapter(text);
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [currentChapterIndex, isPlaying, isAudioMuted, playbackSpeed, scriptLanguage, activeTab]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const selectChapter = (idx: number, autoPlay = true) => {
    setCurrentChapterIndex(idx);
    setChapterElapsed(0);
    if (autoPlay) setIsPlaying(true);
  };

  // Audio Recording with gemini-3.5-transcribe
  const handleStartAudioRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        setAiError('Microphone recording is not supported on this browser.');
        return;
      }
      setAiError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mimeType =
        ['audio/webm', 'audio/mp4', 'audio/ogg'].find(
          (t) => typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(t)
        ) || '';
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const resolvedType = mediaRecorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: resolvedType });
        if (audioBlob.size < 200) return;

        setAiIsLoading(true);
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const res = await fetch('/api/transcribe-audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Audio, mimeType: resolvedType }),
            });
            const data = await res.json();
            if (data.success && data.transcript) {
              setAiPrompt(data.transcript);
            } else if (data.error) {
              setAiError(data.error);
            }
          };
          reader.readAsDataURL(audioBlob);
        } catch (err: any) {
          setAiError(err.message || 'Audio transcription failed.');
        } finally {
          setAiIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setAiError(err.message || 'Microphone access denied.');
      setIsRecordingAudio(false);
    }
  };

  const handleStopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAiSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAiImage = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Please enter a description or prompt.');
      return;
    }
    setAiIsLoading(true);
    setAiError(null);
    setAiOutputImage(null);

    try {
      const payload: any = {
        prompt: aiPrompt.trim(),
        aspectRatio: aiAspectRatio === '16:9' ? '16:9' : aiAspectRatio === '9:16' ? '9:16' : '1:1',
      };
      if (aiSelectedImage) {
        payload.image = { imageBytes: aiSelectedImage, mimeType: 'image/png' };
      }

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data && data.success && data.imageUrl) {
        setAiOutputImage(data.imageUrl);
      } else {
        throw new Error(data.error || 'Failed to generate image.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Image generation error.');
    } finally {
      setAiIsLoading(false);
    }
  };

  const handleRunAiVideo = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Please enter a prompt describing the video.');
      return;
    }
    if (aiStudioMode === 'animate_image_to_video' && !aiSelectedImage) {
      setAiError('Please upload an image to animate into a video.');
      return;
    }

    setAiIsLoading(true);
    setAiError(null);
    setAiOutputVideo(null);
    setAiAnimationSteps(null);

    try {
      const payload: any = {
        prompt: aiPrompt.trim(),
        aspectRatio: aiAspectRatio === '9:16' ? '9:16' : '16:9',
      };
      if (aiStudioMode === 'animate_image_to_video' && aiSelectedImage) {
        payload.image = { imageBytes: aiSelectedImage, mimeType: 'image/png' };
      }

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data && data.success) {
        if (data.videoUrl) {
          setAiOutputVideo(data.videoUrl);
        } else if (data.steps || data.isConceptualAnimation) {
          setAiAnimationSteps(
            data.steps || [
              'Stage 1: NCERT First Principles & Fundamental Postulate Formulation',
              'Stage 2: Dynamic Transition & Energy Conversion in Motion',
              'Stage 3: Boundary Conditions & Mathematical Formulations',
              'Stage 4: CBSE Board 5-Mark Solution Takeaways',
            ]
          );
        }
      } else {
        throw new Error(data.error || 'Failed to generate video.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Video generation error.');
    } finally {
      setAiIsLoading(false);
    }
  };

  const deviceMaxWidth =
    deviceSize === 'mobile' ? 'max-w-[360px]' : deviceSize === 'tablet' ? 'max-w-[600px]' : 'max-w-full';

  return (
    <div className={`w-full max-w-6xl mx-auto min-w-0 ${isModal ? 'p-1 sm:p-2' : 'py-3 px-2 sm:px-4'}`}>
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-[var(--text-primary)]">
        {/* ========================================================
            MASTER GUIDE TOP BAR
           ======================================================== */}
        <div className="p-3.5 sm:px-5 sm:py-4 bg-gradient-to-r from-slate-900 via-[var(--bg-elevated)] to-slate-900 border-b border-[var(--border-color)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size="md" fireEffect={false} className="shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--text-primary)] flex items-center gap-1.5">
                  <span className="brand-wordmark">GOALBEAM</span>
                  <span className="text-amber-400 select-none">⚡</span>
                  <span>Website Master Guide Video</span>
                </h2>
                <InfoTooltip text="Interactive 8-chapter walkthrough covering all workspaces, Hinglish/English narration, AI visual generator & written manual." />
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                8 Guided Scenes · {formatRuntime(TOTAL_DURATION_SECONDS)} Total Walkthrough · Hinglish &amp; English Narration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
            {/* Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('interactive_tour')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeTab === 'interactive_tour'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Master Video</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setActiveTab('ai_multimedia_studio');
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeTab === 'ai_multimedia_studio'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Studio</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setActiveTab('written_handbook');
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeTab === 'written_handbook'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Handbook</span>
              </button>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Master Guide"
                className="p-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] cursor-pointer transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================
            TAB 1: TWO-ZONE CINEMA MASTER GUIDE VIDEO
           ======================================================== */}
        {activeTab === 'interactive_tour' && (
          <div className="p-3.5 sm:p-5 space-y-4">
            {/* Theater Control Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
              {/* Left: Primary Play/Pause + Runtime + Step Indicator */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      currentChapterIndex === TOUR_CHAPTERS.length - 1 &&
                      chapterElapsed >= currentChapter.durationSeconds - 0.3
                    ) {
                      setCurrentChapterIndex(0);
                      setChapterElapsed(0);
                      setIsPlaying(true);
                    } else {
                      setIsPlaying((p) => !p);
                    }
                  }}
                  className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors whitespace-nowrap shrink-0"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause Tour</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{totalElapsedSeconds > 0 && totalElapsedSeconds < TOTAL_DURATION_SECONDS ? 'Resume Tour' : 'Play Master Video'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsAudioMuted((m) => !m)}
                  className={`p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
                    isAudioMuted
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                      : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                  }`}
                  title={isAudioMuted ? 'Unmute Voiceover (M)' : 'Mute Voiceover (M)'}
                >
                  {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="text-xs font-mono tabular-nums text-[var(--text-secondary)] px-2">
                  {formatRuntime(totalElapsedSeconds)} / {formatRuntime(TOTAL_DURATION_SECONDS)}
                </span>
              </div>

              {/* Right: Language + Speed + Frame Size */}
              <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                {/* Hinglish / English Voice Toggle */}
                <div className="flex items-center p-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setScriptLanguage('hinglish')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                      scriptLanguage === 'hinglish'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Hinglish
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptLanguage('english')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                      scriptLanguage === 'english'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    English
                  </button>
                </div>

                {/* Speed */}
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="px-2 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer focus:outline-none"
                  aria-label="Narration playback speed"
                >
                  <option value={0.85}>0.85x</option>
                  <option value={1}>1.0x</option>
                  <option value={1.25}>1.25x</option>
                </select>

                {/* Preview Viewport Size */}
                <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => setDeviceSize('desktop')}
                    title="Desktop View"
                    className={`p-1.5 rounded cursor-pointer transition-colors ${
                      deviceSize === 'desktop' ? 'bg-cyan-500 text-slate-950' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceSize('tablet')}
                    title="Tablet View"
                    className={`p-1.5 rounded cursor-pointer transition-colors ${
                      deviceSize === 'tablet' ? 'bg-cyan-500 text-slate-950' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceSize('mobile')}
                    title="Mobile View"
                    className={`p-1.5 rounded cursor-pointer transition-colors ${
                      deviceSize === 'mobile' ? 'bg-cyan-500 text-slate-950' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* TWO-ZONE SANDBOX STAGE + PLAYLIST */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* LEFT ZONE (8 cols): Interactive Cinema Video Viewport */}
              <div className="keep-dark-surface lg:col-span-8 flex flex-col rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
                {/* Spotlight Step Banner */}
                <div className="px-4 py-2.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{currentChapter.icon}</span>
                    <span className="text-xs sm:text-sm font-bold text-white truncate">
                      {currentChapter.headline}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-cyan-300 whitespace-nowrap shrink-0">
                    Focus: {currentChapter.stepCallouts[activeSubStep]}
                  </span>
                </div>

                {/* Stage Area with Responsive Preview Frame */}
                <div className="relative flex-1 p-3 sm:p-5 bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_60%)] flex items-center justify-center min-h-[370px]">
                  <div
                    onClick={() => setIsPlaying((p) => !p)}
                    title="Click screen to Play / Pause video guide"
                    className={`w-full ${deviceMaxWidth} mx-auto rounded-2xl bg-[var(--bg-card)] border border-slate-700/80 shadow-2xl overflow-hidden transition-all duration-300 cursor-pointer select-none flex flex-col`}
                  >
                    {/* Simulated Real App Top Bar */}
                    <div className="px-3.5 py-2.5 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Logo size="sm" className="w-7 h-7 rounded-full" />
                        <div className="flex items-center gap-1.5 text-xs font-extrabold">
                          <span className="brand-wordmark">GOALBEAM</span>
                          <span className="text-amber-400">⚡</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-[11px] font-semibold">
                        <span className="flex items-center gap-1 text-amber-300">
                          <FireFlame size="xs" showEmbers={false} />
                          <span className="tabular-nums">14d</span>
                        </span>
                        <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                          <ScholarBoyAvatar size="xs" />
                          <span className="hidden sm:inline">Scholar</span>
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Scene Screen Content (0..7) */}
                    <div className="p-3.5 sm:p-4 space-y-3 min-h-[250px] text-xs bg-[var(--bg-primary)]/40">
                      {/* SCENE 0: HOME DASHBOARD */}
                      {currentChapterIndex === 0 && (
                        <div className="space-y-3 animate-in fade-in duration-200">
                          <div className="grid grid-cols-2 gap-2.5">
                            <div
                              className={`p-3 rounded-xl bg-slate-900/90 border transition-all ${
                                activeSubStep === 0 ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800'
                              }`}
                            >
                              <span className="text-[10px] text-slate-400 font-semibold block">1st Board Paper</span>
                              <div className="text-xl font-black text-amber-400 font-mono tabular-nums mt-0.5">90 Days Left</div>
                              <span className="text-[10px] text-cyan-300">5:00 AM Rollover Active</span>
                            </div>
                            <div
                              className={`p-3 rounded-xl bg-slate-900/90 border transition-all ${
                                activeSubStep === 0 ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-800'
                              }`}
                            >
                              <span className="text-[10px] text-slate-400 font-semibold block">Syllabus Done</span>
                              <div className="text-xl font-black text-emerald-400 font-mono tabular-nums mt-0.5">68%</div>
                              <div className="w-full h-1.5 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
                                <div className="h-full w-[68%] bg-gradient-to-r from-emerald-400 to-cyan-400" />
                              </div>
                            </div>
                          </div>

                          <div
                            className={`p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/70 to-cyan-950/60 border flex items-center justify-between gap-2 transition-all ${
                              activeSubStep === 1 ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-cyan-500/30'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="font-bold text-white truncate">Live Leaderboard of Syllabus · View Real Student Ranks</span>
                            </div>
                            <span className="text-cyan-300 font-bold text-[11px] shrink-0">Open →</span>
                          </div>

                          <div
                            className={`p-2.5 rounded-xl bg-slate-900/90 border flex items-center justify-between gap-2 transition-all ${
                              activeSubStep === 2 ? 'border-emerald-400 ring-2 ring-emerald-400/40' : 'border-slate-800'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">Today’s Target: Light Reflection &amp; Refraction</span>
                              <span className="text-[10px] text-slate-400">Science · 4 Stages · + Flex Progress Certificate</span>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-[10px] shrink-0">
                              Mark Done ✓
                            </span>
                          </div>
                        </div>
                      )}

                      {/* SCENE 1: STRICTLY CBSE CLASS 10 · 54 SUBJECTS & CHAPTERS */}
                      {currentChapterIndex === 1 && (
                        <div className="space-y-3 animate-in fade-in duration-200">
                          <div
                            className={`p-2.5 rounded-xl bg-slate-900 border flex items-center justify-between gap-2 transition-all ${
                              activeSubStep === 0 ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800'
                            }`}
                          >
                            <span className="text-slate-300 font-semibold">Strictly CBSE Class 10 · 54 Official Subjects</span>
                            <span className="text-cyan-400 font-bold text-[11px]">CBSE Exclusively</span>
                          </div>

                          <div
                            className={`p-3 rounded-xl bg-slate-900 border space-y-2 transition-all ${
                              activeSubStep === 1 ? 'border-emerald-400 ring-2 ring-emerald-400/40' : 'border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">Ch 6 · Life Processes (Science)</span>
                              <span className="text-emerald-400 font-mono font-bold tabular-nums">100%</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
                              <div className="py-1.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">NCERT ✓</div>
                              <div className="py-1.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">Ref Book ✓</div>
                              <div className="py-1.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">PYQ/CBQ ✓</div>
                              <div className="py-1.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">Notes 📝</div>
                            </div>
                          </div>

                          <div
                            className={`p-2.5 rounded-xl bg-slate-900 border flex items-center justify-between transition-all ${
                              activeSubStep === 2 ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-800'
                            }`}
                          >
                            <span className="text-slate-300">Already finished chapters earlier?</span>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[10px]">
                              Batch Catch-Up Wizard ⚡
                            </span>
                          </div>
                        </div>
                      )}

                      {/* SCENE 2: PRACTICE ARENA (10-MCQ & FLASHCARDS) */}
                      {currentChapterIndex === 2 && (
                        <div className="space-y-3 animate-in fade-in duration-200">
                          <div
                            className={`p-2.5 rounded-xl bg-slate-900 border flex items-center justify-between transition-all ${
                              activeSubStep === 0 ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800'
                            }`}
                          >
                            <span className="font-bold text-white">Maths · Quadratic Equations · 10-MCQ Sprint</span>
                            <span className="font-mono text-cyan-300 tabular-nums font-bold">Q 4 / 10</span>
                          </div>

                          <div
                            className={`p-3 rounded-xl bg-slate-900 border space-y-2 transition-all ${
                              activeSubStep === 1 ? 'border-emerald-400 ring-2 ring-emerald-400/40' : 'border-slate-800'
                            }`}
                          >
                            <p className="font-semibold text-white">If discriminant D = b² - 4ac &gt; 0, roots are:</p>
                            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                              <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold">
                                ✓ A. Real &amp; Distinct
                              </div>
                              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400">
                                B. Equal Roots
                              </div>
                            </div>
                          </div>

                          <div
                            className={`p-2.5 rounded-xl bg-slate-900 border flex items-center justify-between transition-all ${
                              activeSubStep === 2 ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-800'
                            }`}
                          >
                            <span className="text-amber-300 font-semibold">Switch Mode: Formula Flip Flashcards</span>
                            <span className="text-[11px] font-bold text-white">Tap to Flip ↻</span>
                          </div>
                        </div>
                      )}

                      {/* SCENE 3: RESOURCES VAULT & SST MAP WORK */}
                      {currentChapterIndex === 3 && (
                        <div className="space-y-2.5 animate-in fade-in duration-200">
                          <div
                            className={`p-2 rounded-xl bg-slate-900 border flex items-center justify-between gap-2 text-[10px] font-bold transition-all ${
                              activeSubStep === 0 ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800'
                            }`}
                          >
                            <span className="px-2 py-1 rounded bg-cyan-500 text-slate-950">Step 1 · Subject</span>
                            <span className="px-2 py-1 rounded bg-slate-800 text-slate-200">Step 2 · Notes / SST / PYQs</span>
                            <span className="px-2 py-1 rounded bg-slate-800 text-slate-200">Step 3 · Open PDF</span>
                          </div>

                          <div
                            className={`p-3 rounded-xl bg-slate-900 border space-y-1.5 transition-all ${
                              activeSubStep === 1 ? 'border-emerald-400 ring-2 ring-emerald-400/40' : 'border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Class 10 SST Complete Map Work &amp; Rapid Sheets</span>
                              </span>
                              <span className="text-emerald-400 font-bold text-[10px]">Interactive Checklist</span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              History Congress Sessions, Major Soil Types, Dams, Ports &amp; Power Plants
                            </p>
                          </div>

                          <div
                            className={`p-2.5 rounded-xl bg-slate-900 border flex items-center justify-between transition-all ${
                              activeSubStep === 2 ? 'border-blue-400 ring-2 ring-blue-400/40' : 'border-slate-800'
                            }`}
                          >
                            <span className="text-slate-300">Official 2026-27 SQP &amp; Live CBSE Search Vault</span>
                            <span className="px-2 py-1 rounded bg-blue-600 text-white font-bold text-[10px]">Verified PDF ↗</span>
                          </div>
                        </div>
                      )}

                      {/* SCENE 4: GOALBEAM AI STUDY STUDIO (6 TOOLS) */}
                      {currentChapterIndex === 4 && (
                        <div className="space-y-2.5 animate-in fade-in duration-200">
                          <div className="grid grid-cols-3 gap-2 text-[10px]">
                            <div
                              className={`p-2.5 rounded-xl bg-slate-900 border transition-all ${
                                activeSubStep === 0 ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800'
                              }`}
                            >
                              <span className="font-bold text-cyan-300 block">MindDesk Chat</span>
                              <span className="text-slate-400">5-mark CBSE doubts</span>
                            </div>
                            <div
                              className={`p-2.5 rounded-xl bg-slate-900 border transition-all ${
                                activeSubStep === 1 ? 'border-indigo-400 ring-2 ring-indigo-400/40' : 'border-slate-800'
                              }`}
                            >
                              <span className="font-bold text-indigo-300 block">CanvasCraft</span>
                              <span className="text-slate-400">Science diagrams</span>
                            </div>
                            <div
                              className={`p-2.5 rounded-xl bg-slate-900 border transition-all ${
                                activeSubStep === 1 ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-800'
                              }`}
                            >
                              <span className="font-bold text-amber-300 block">Motion Studio</span>
                              <span className="text-slate-400">Concept animation</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-[10px]">
                            <div
                              className={`p-2.5 rounded-xl bg-slate-900 border transition-all ${
                                activeSubStep === 2 ? 'border-emerald-400 ring-2 ring-emerald-400/40' : 'border-slate-800'
                              }`}
                            >
                              <span className="font-bold text-emerald-300 block">PulseRadar &amp; Voice</span>
                              <span className="text-slate-400">Grounded search</span>
                            </div>
                            <div
                              className={`p-2.5 rounded-xl bg-slate-900 border transition-all ${
                                activeSubStep === 0 ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800'
                              }`}
                            >
                              <span className="font-bold text-cyan-300 block">ScholarCast</span>
                              <span className="text-slate-400">60s Audio brief</span>
                            </div>
                            <div
                              className={`p-2.5 rounded-xl bg-slate-900 border transition-all ${
                                activeSubStep === 2 ? 'border-rose-400 ring-2 ring-rose-400/40' : 'border-slate-800'
                              }`}
                            >
                              <span className="font-bold text-rose-300 block">SonicFlow Beats</span>
                              <span className="text-slate-400">Focus soundscapes</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SCENE 5: 3D FOCUS GARDEN & PLANNER */}
                      {currentChapterIndex === 5 && (
                        <div className="grid grid-cols-2 gap-2.5 animate-in fade-in duration-200">
                          <div
                            className={`p-3 rounded-xl bg-slate-900 border space-y-2 transition-all ${
                              activeSubStep <= 1 ? 'border-emerald-400 ring-2 ring-emerald-400/40' : 'border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-300 flex items-center gap-1">
                                <TreeDeciduous className="w-4 h-4" />
                                <span>3D Focus Garden</span>
                              </span>
                              <span className="font-mono tabular-nums text-white font-bold">25:00</span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Grow a real WebGL 3D study tree · Tab-switch distraction alert active
                            </p>
                          </div>

                          <div
                            className={`p-3 rounded-xl bg-slate-900 border space-y-2 transition-all ${
                              activeSubStep === 2 ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-cyan-300 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Date-Sheet Planner</span>
                              </span>
                              <span className="text-[10px] text-amber-300 font-bold">Board Prep</span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Custom morning &amp; evening study blocks + subject exam dates
                            </p>
                          </div>
                        </div>
                      )}

                      {/* SCENE 6: ANALYTICS & LIVE LEADERBOARD */}
                      {currentChapterIndex === 6 && (
                        <div className="space-y-2.5 animate-in fade-in duration-200">
                          <div
                            className={`p-3 rounded-xl bg-slate-900 border space-y-2 transition-all ${
                              activeSubStep <= 1 ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                                <Trophy className="w-4 h-4" />
                                <span>Live Leaderboard of Syllabus (100% Real SSE Sync)</span>
                              </span>
                              <span className="text-[10px] text-emerald-400 font-semibold">Ranked by % Done</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono tabular-nums">
                              <div className="p-1.5 rounded bg-slate-800/80 text-white">Overall Syllabus %</div>
                              <div className="p-1.5 rounded bg-slate-800/80 text-cyan-300">All-Subject Avg %</div>
                              <div className="p-1.5 rounded bg-slate-800/80 text-emerald-300">Live Rank Updates</div>
                            </div>
                          </div>

                          <div
                            className={`p-2.5 rounded-xl bg-slate-900 border flex items-center justify-between transition-all ${
                              activeSubStep === 2 ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800'
                            }`}
                          >
                            <span className="text-slate-300 flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                              <span>InsightsView · Multi-Line Subject Pace Analytics</span>
                            </span>
                            <span className="text-cyan-300 font-bold text-[10px]">Lag Detector ✓</span>
                          </div>
                        </div>
                      )}

                      {/* SCENE 7: SETTINGS, 25 LANGUAGES, THEMES & CREATOR CHANNEL */}
                      {currentChapterIndex === 7 && (
                        <div className="space-y-2.5 animate-in fade-in duration-200">
                          <div className="grid grid-cols-2 gap-2.5">
                            <div
                              className={`p-2.5 rounded-xl bg-slate-900 border transition-all ${
                                activeSubStep === 0 ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800'
                              }`}
                            >
                              <span className="font-bold text-white block">25 Textbook Languages</span>
                              <span className="text-[10px] text-cyan-300">5 Signature Themes (Dusk, Pearl, Amber…)</span>
                            </div>
                            <div
                              className={`p-2.5 rounded-xl bg-slate-900 border transition-all ${
                                activeSubStep === 1 ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-800'
                              }`}
                            >
                              <span className="font-bold text-white block">Daily Study Alerts</span>
                              <span className="text-[10px] text-amber-300">Enroll Subjects Without Resetting</span>
                            </div>
                          </div>

                          <div
                            className={`p-2.5 rounded-xl bg-slate-900 border flex items-center justify-between transition-all ${
                              activeSubStep === 2 ? 'border-red-500 ring-2 ring-red-500/40' : 'border-slate-800'
                            }`}
                          >
                            <span className="text-slate-200 font-semibold">Official YouTube Updates · @TrendzOfShahid</span>
                            <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                              Subscribe 🔔
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Real App Bottom Navigation Mirror */}
                    <div className="px-2 py-1.5 bg-[var(--bg-card)] border-t border-[var(--border-color)] flex items-center justify-between text-[9px] font-semibold">
                      {[
                        { label: 'Home', icon: Home, activeOn: [0] },
                        { label: 'Chapters', icon: BookOpen, activeOn: [1] },
                        { label: 'Practice', icon: Target, activeOn: [2] },
                        { label: 'Resources', icon: FileText, activeOn: [3] },
                        { label: 'Goalbeam AI', icon: Sparkles, activeOn: [4] },
                        { label: 'Focus', icon: TreeDeciduous, activeOn: [5] },
                        { label: 'Ranks', icon: Trophy, activeOn: [6] },
                        { label: 'Profile', icon: User, activeOn: [7] },
                      ].map((navItem) => {
                        const NavIcon = navItem.icon;
                        const isHighlighted = navItem.activeOn.includes(currentChapterIndex);
                        return (
                          <div
                            key={navItem.label}
                            className={`flex-1 flex flex-col items-center py-0.5 rounded transition-colors ${
                              isHighlighted ? 'text-cyan-400 font-bold' : 'text-slate-500'
                            }`}
                          >
                            <NavIcon className="w-3.5 h-3.5" />
                            <span className="mt-0.5 truncate">
                              {navItem.label === 'Goalbeam AI' ? (
                                <><span className="brand-wordmark-solid">Goalbeam</span> AI</>
                              ) : (
                                navItem.label
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Interactive Scrubbing Timeline (All 8 Segments) */}
                <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 space-y-2">
                  <div className="flex items-center gap-1" role="progressbar" aria-label="Master Guide Timeline">
                    {TOUR_CHAPTERS.map((chap, idx) => {
                      const fillPct =
                        idx < currentChapterIndex
                          ? 100
                          : idx === currentChapterIndex
                          ? chapterProgressPct
                          : 0;
                      return (
                        <button
                          key={chap.id}
                          type="button"
                          onClick={() => selectChapter(idx, true)}
                          style={{ flexGrow: chap.durationSeconds }}
                          title={`${chap.title} (${chap.timestamp})`}
                          className="group relative h-2 rounded-full bg-slate-800 overflow-hidden cursor-pointer hover:h-2.5 transition-all"
                        >
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-[width] duration-150"
                            style={{ width: `${fillPct}%` }}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Timed Narration Subtitles + Waveform Bars */}
                  <div className="flex items-start gap-3 pt-1">
                    <div className="flex items-end gap-0.5 h-5 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 shrink-0 mt-0.5">
                      {[45, 85, 60, 95, 50].map((heightPct, idx) => (
                        <span
                          key={idx}
                          className={`w-1 rounded-full bg-cyan-400 transition-all ${
                            isPlaying && !isAudioMuted ? 'animate-pulse' : 'opacity-40'
                          }`}
                          style={{
                            height: isPlaying && !isAudioMuted ? `${heightPct}%` : '25%',
                            animationDelay: `${idx * 120}ms`,
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed flex-1">
                      <span className="font-bold text-amber-300 mr-1.5">
                        {scriptLanguage === 'hinglish' ? 'Hinglish Narration:' : 'English Narration:'}
                      </span>
                      {scriptLanguage === 'hinglish'
                        ? currentChapter.spokenScriptHinglish
                        : currentChapter.spokenScriptEnglish}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT ZONE (4 cols): 8-Chapter Playlist & Takeaways */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                {/* Playlist */}
                <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] p-3 flex flex-col gap-1.5 max-h-[290px] overflow-y-auto">
                  <div className="flex items-center justify-between px-1 pb-1 border-b border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)]">
                    <span>Guide Chapters (01–08)</span>
                    <span className="font-mono tabular-nums">{currentChapterIndex + 1} / {TOUR_CHAPTERS.length}</span>
                  </div>
                  {TOUR_CHAPTERS.map((chap, idx) => {
                    const isActive = idx === currentChapterIndex;
                    const isDone = idx < currentChapterIndex;
                    return (
                      <button
                        key={chap.id}
                        type="button"
                        onClick={() => selectChapter(idx, true)}
                        className={`w-full text-left px-2.5 py-2 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-cyan-500/15 border-cyan-500/60 text-[var(--text-primary)] font-bold'
                            : 'bg-transparent border-transparent hover:bg-[var(--bg-card)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm shrink-0">{chap.icon}</span>
                          <span className="truncate">{chap.title}</span>
                        </div>
                        <span className="text-[11px] font-mono tabular-nums shrink-0 flex items-center gap-1">
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          <span>{chap.timestamp}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Key Takeaways for Active Scene */}
                <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] p-3.5 space-y-2 flex-1">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Key Features in {currentChapter.shortTitle}</span>
                  </h3>
                  <ul className="space-y-2">
                    {currentChapter.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Navigation + Compulsory Subscribe Link + Enter Website CTA */}
            <div className="pt-3 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentChapterIndex === 0}
                  onClick={() => selectChapter(Math.max(0, currentChapterIndex - 1), true)}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-cyan-400 text-xs font-semibold text-[var(--text-primary)] disabled:opacity-40 cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChapterElapsed(0);
                    setIsPlaying(true);
                    speakChapter(
                      scriptLanguage === 'hinglish'
                        ? currentChapter.spokenScriptHinglish
                        : currentChapter.spokenScriptEnglish
                    );
                  }}
                  className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-amber-400 text-amber-300 cursor-pointer transition-colors"
                  title="Replay Scene"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentChapterIndex === TOUR_CHAPTERS.length - 1}
                  onClick={() => selectChapter(Math.min(TOUR_CHAPTERS.length - 1, currentChapterIndex + 1), true)}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-cyan-400 text-xs font-semibold text-[var(--text-primary)] disabled:opacity-40 cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-end">
                <YouTubeChannelButton variant="guide" />
                <button
                  type="button"
                  onClick={onProceedToDashboard}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-95 text-slate-950 font-extrabold text-xs shadow cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all"
                >
                  <span>Start Studying in <span className="brand-wordmark-solid">GOALBEAM</span></span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: AI MULTIMEDIA STUDIO (PRESERVED)
           ======================================================== */}
        {activeTab === 'ai_multimedia_studio' && (
          <div className="p-3.5 sm:p-6 space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>Interactive AI Visual &amp; Video Studio</span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Create study diagrams, animate images to conceptual video steps, or dictate queries via voice.
                </p>
              </div>

              <div className="flex items-center gap-1 flex-wrap p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAiStudioMode('create_edit_image')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    aiStudioMode === 'create_edit_image' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Create/Edit Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAiStudioMode('animate_image_to_video')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    aiStudioMode === 'animate_image_to_video' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Animate Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAiStudioMode('generate_video_from_text')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    aiStudioMode === 'generate_video_from_text' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Text to Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAiStudioMode('transcribe_audio')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    aiStudioMode === 'transcribe_audio' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice Transcribe</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)]">Enter Prompt / Study Query:</span>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {(['16:9', '9:16', '1:1'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAiAspectRatio(r)}
                      className={`px-2 py-0.5 rounded text-[10px] border cursor-pointer ${
                        aiAspectRatio === r
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                          : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the guide illustration, website animation, or academic topic..."
                  className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:border-cyan-400 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={isRecordingAudio ? handleStopAudioRecording : handleStartAudioRecording}
                  className={`absolute right-3 bottom-3 p-2 rounded-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all ${
                    isRecordingAudio
                      ? 'bg-rose-500 text-white animate-pulse shadow-lg'
                      : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40'
                  }`}
                >
                  {isRecordingAudio ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecordingAudio ? `Recording (${recordingSeconds}s)...` : 'Voice Mic'}</span>
                </button>
              </div>

              {(aiStudioMode === 'animate_image_to_video' || aiStudioMode === 'create_edit_image') && (
                <div className="pt-2 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-400 text-xs font-bold text-[var(--text-primary)] cursor-pointer flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-4 h-4 text-cyan-400" />
                      <span>{aiSelectedImage ? 'Change Image' : 'Upload Image / Screenshot'}</span>
                    </button>
                    {aiSelectedImage && (
                      <button
                        type="button"
                        onClick={() => setAiSelectedImage(null)}
                        className="text-xs text-rose-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {aiSelectedImage && (
                    <div className="flex items-center gap-2">
                      <img src={aiSelectedImage} alt="Selected" className="w-10 h-10 object-cover rounded-lg border border-cyan-500/50" />
                      <span className="text-[10px] text-emerald-400 font-bold">Image ready ✓</span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-[var(--text-secondary)]">
                  {aiIsLoading ? 'Generating visual content...' : 'Ready to create guide multimedia.'}
                </span>

                <button
                  type="button"
                  disabled={aiIsLoading}
                  onClick={aiStudioMode === 'create_edit_image' ? handleRunAiImage : handleRunAiVideo}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer transition-all"
                >
                  {aiIsLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {aiStudioMode === 'create_edit_image'
                          ? aiSelectedImage
                            ? 'Apply Edits to Image'
                            : 'Create Image'
                          : aiStudioMode === 'animate_image_to_video'
                          ? 'Animate Image into Video'
                          : 'Generate Video from Text'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {aiError}
                </div>
              )}
            </div>

            {aiOutputImage && (
              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Generated Academic Illustration ({aiAspectRatio})</span>
                  </span>
                  <a href={aiOutputImage} download="goalbeam-guide-diagram.png" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
                <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center p-2">
                  <img src={aiOutputImage} alt="Generated Guide" className="max-h-96 object-contain rounded-lg" />
                </div>
              </div>
            )}

            {aiOutputVideo && (
              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Generated Video ({aiAspectRatio})</span>
                  </span>
                  <a href={aiOutputVideo} download="goalbeam-guide-video.mp4" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </a>
                </div>
                <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center">
                  <video src={aiOutputVideo} controls autoPlay loop className="max-h-96 w-full object-contain" />
                </div>
              </div>
            )}

            {aiAnimationSteps && (
              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-cyan-400" />
                    <span>Multi-Step Conceptual Animation Sequence</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {aiAnimationSteps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/40 border border-slate-800 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-[var(--text-primary)] leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 3: WRITTEN MASTER HANDBOOK
           ======================================================== */}
        {activeTab === 'written_handbook' && (
          <div className="p-4 sm:p-6 space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2 flex-wrap">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <span><span className="brand-wordmark">GOALBEAM</span> Complete Written Handbook</span>
                </h3>
                <InfoTooltip text="Step-by-step documentation across all 8 GOALBEAM Class 10 course workspaces." />
              </div>

              <div className="flex items-center p-0.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setScriptLanguage('hinglish')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    scriptLanguage === 'hinglish' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  Hinglish
                </button>
                <button
                  type="button"
                  onClick={() => setScriptLanguage('english')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    scriptLanguage === 'english' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {TOUR_CHAPTERS.map((chap) => (
                <div key={chap.id} className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <span className="text-base">{chap.icon}</span>
                      <span>{chap.headline}</span>
                    </h4>
                    <span className="text-xs font-mono tabular-nums text-cyan-400">
                      {chap.timestamp} · {chap.durationSeconds}s
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {scriptLanguage === 'hinglish' ? chap.spokenScriptHinglish : chap.spokenScriptEnglish}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {chap.keyPoints.map((kp, i) => (
                      <div key={i} className="text-[11px] text-[var(--text-primary)] flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{kp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
              <YouTubeChannelButton variant="guide" />
              <button
                type="button"
                onClick={onProceedToDashboard}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-95 text-slate-950 font-bold text-xs shadow cursor-pointer flex items-center gap-1.5"
              >
                <span>Open <span className="brand-wordmark-solid">GOALBEAM</span> Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
