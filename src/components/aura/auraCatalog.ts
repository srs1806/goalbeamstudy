export type AuraWorkspaceId =
  | 'hub'
  | 'minddesk'
  | 'canvas'
  | 'scenereel'
  | 'kinetipic'
  | 'sonicflow'
  | 'voxpulse'
  | 'pulseradar'
  | 'echonote'
  | 'scholarcast';

export type AuraCategory = 'all' | 'conversation' | 'visual' | 'audio-research';

export type AuraFocusTier = 'core-study' | 'creative-audio';

export interface AuraWorkspaceMeta {
  id: Exclude<AuraWorkspaceId, 'hub'>;
  name: string;
  tagline: string;
  category: Exclude<AuraCategory, 'all'>;
  tier: AuraFocusTier;
  accentGradient: string;
  accentText: string;
  accentBorder: string;
}

export const AURA_WORKSPACES: AuraWorkspaceMeta[] = [
  {
    id: 'minddesk',
    name: 'MindDesk Dialogue',
    tagline: 'Multi-turn academic chat with memory, personas & reasoning tiers',
    category: 'conversation',
    tier: 'core-study',
    accentGradient: 'from-cyan-500 to-blue-600',
    accentText: 'text-cyan-400',
    accentBorder: 'hover:border-cyan-400/70',
  },
  {
    id: 'pulseradar',
    name: 'PulseRadar Search',
    tagline: 'Live web intelligence with verified CBSE sources and direct PDF links',
    category: 'audio-research',
    tier: 'core-study',
    accentGradient: 'from-blue-500 to-cyan-600',
    accentText: 'text-blue-400',
    accentBorder: 'hover:border-blue-400/70',
  },
  {
    id: 'echonote',
    name: 'EchoNote Scribe',
    tagline: 'Convert voice recordings or uploaded audio lectures into clean study notes',
    category: 'audio-research',
    tier: 'core-study',
    accentGradient: 'from-teal-500 to-emerald-600',
    accentText: 'text-teal-400',
    accentBorder: 'hover:border-teal-400/70',
  },
  {
    id: 'voxpulse',
    name: 'VoxPulse Live',
    tagline: 'Real-time two-way spoken study mentor with selectable voices & live subtitles',
    category: 'conversation',
    tier: 'core-study',
    accentGradient: 'from-sky-500 to-indigo-600',
    accentText: 'text-sky-400',
    accentBorder: 'hover:border-sky-400/70',
  },
  {
    id: 'canvas',
    name: 'CanvasCraft Studio',
    tagline: 'Generate study diagrams and customize uploaded notes with live filters',
    category: 'visual',
    tier: 'core-study',
    accentGradient: 'from-violet-500 to-fuchsia-600',
    accentText: 'text-violet-400',
    accentBorder: 'hover:border-violet-400/70',
  },
  {
    id: 'scholarcast',
    name: 'ScholarCast Briefing',
    tagline: 'Dual-host audio discussion synced with whiteboard slides & 5-mark keys',
    category: 'conversation',
    tier: 'creative-audio',
    accentGradient: 'from-indigo-500 to-purple-600',
    accentText: 'text-indigo-400',
    accentBorder: 'hover:border-indigo-400/70',
  },
  {
    id: 'scenereel',
    name: 'SceneReel Director',
    tagline: 'Turn text prompts into animated 16:9 or 9:16 motion reels & WebM exports',
    category: 'visual',
    tier: 'creative-audio',
    accentGradient: 'from-amber-500 to-orange-600',
    accentText: 'text-amber-400',
    accentBorder: 'hover:border-amber-400/70',
  },
  {
    id: 'kinetipic',
    name: 'KinetiPic Animator',
    tagline: 'Transform static photos and diagrams into smooth motion sequences',
    category: 'visual',
    tier: 'creative-audio',
    accentGradient: 'from-rose-500 to-pink-600',
    accentText: 'text-rose-400',
    accentBorder: 'hover:border-rose-400/70',
  },
  {
    id: 'sonicflow',
    name: 'SonicFlow Composer',
    tagline: 'Compose focus beats, chord progressions & lyrics as 30s clips or full tracks',
    category: 'audio-research',
    tier: 'creative-audio',
    accentGradient: 'from-emerald-500 to-teal-600',
    accentText: 'text-emerald-400',
    accentBorder: 'hover:border-emerald-400/70',
  },
];
