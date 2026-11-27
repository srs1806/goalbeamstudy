export interface SubjectColorTheme {
  subjectId: string;
  name: string;
  color: string; // Primary hex
  secondaryHex: string; // Secondary hex for gradients
  accentBg: string; // Semi-transparent rgba for badges/highlights
  colorName: string; // Descriptive human name
  colorEmoji: string; // Unique visual emoji
  gradientClass: string; // Tailwind gradient
  borderClass: string; // Tailwind border
  badgeBgClass: string; // Tailwind badge styling
  textAccentClass: string; // Tailwind text color
  ringClass: string; // Focus/active ring
}

export const SUBJECT_COLOR_REGISTRY: Record<string, SubjectColorTheme> = {
  science: {
    subjectId: 'science',
    name: 'Science',
    color: '#38bdf8', // Sky Blue
    secondaryHex: '#0284c7',
    accentBg: 'rgba(56, 189, 248, 0.12)',
    colorName: 'Sky Blue',
    colorEmoji: '🔬',
    gradientClass: 'from-sky-500/25 via-blue-500/15 to-indigo-600/20',
    borderClass: 'border-sky-400/60',
    badgeBgClass: 'bg-sky-500 text-slate-950',
    textAccentClass: 'text-sky-300',
    ringClass: 'ring-sky-400/50',
  },
  maths: {
    subjectId: 'maths',
    name: 'Mathematics',
    color: '#10b981', // Emerald Neon Green
    secondaryHex: '#059669',
    accentBg: 'rgba(16, 185, 129, 0.12)',
    colorName: 'Emerald Green',
    colorEmoji: '📐',
    gradientClass: 'from-emerald-500/25 via-teal-500/15 to-green-600/20',
    borderClass: 'border-emerald-400/60',
    badgeBgClass: 'bg-emerald-500 text-slate-950',
    textAccentClass: 'text-emerald-300',
    ringClass: 'ring-emerald-400/50',
  },
  sst: {
    subjectId: 'sst',
    name: 'Social Science (SST)',
    color: '#f97316', // Vibrant Orange
    secondaryHex: '#ea580c',
    accentBg: 'rgba(249, 115, 22, 0.14)',
    colorName: 'Sunset Orange',
    colorEmoji: '🌍',
    gradientClass: 'from-orange-500/25 via-amber-500/15 to-yellow-600/20',
    borderClass: 'border-orange-400/60',
    badgeBgClass: 'bg-orange-500 text-slate-950',
    textAccentClass: 'text-orange-300',
    ringClass: 'ring-orange-400/50',
  },
  hindi_b: {
    subjectId: 'hindi_b',
    name: 'Hindi (Course B)',
    color: '#ec4899', // Bright Pink
    secondaryHex: '#db2777',
    accentBg: 'rgba(236, 72, 153, 0.12)',
    colorName: 'Lotus Pink',
    colorEmoji: '🌸',
    gradientClass: 'from-pink-500/25 via-rose-500/15 to-fuchsia-600/20',
    borderClass: 'border-pink-400/60',
    badgeBgClass: 'bg-pink-500 text-white',
    textAccentClass: 'text-pink-300',
    ringClass: 'ring-pink-400/50',
  },
  english: {
    subjectId: 'english',
    name: 'English (Lang & Lit)',
    color: '#a855f7', // Royal Purple
    secondaryHex: '#7c3aed',
    accentBg: 'rgba(168, 85, 247, 0.12)',
    colorName: 'Royal Purple',
    colorEmoji: '📖',
    gradientClass: 'from-purple-500/25 via-violet-500/15 to-indigo-600/20',
    borderClass: 'border-purple-400/60',
    badgeBgClass: 'bg-purple-500 text-white',
    textAccentClass: 'text-purple-300',
    ringClass: 'ring-purple-400/50',
  },
  marathi: {
    subjectId: 'marathi',
    name: 'मराठी (Marathi)',
    color: '#ef4444', // Crimson Flame
    secondaryHex: '#dc2626',
    accentBg: 'rgba(239, 68, 68, 0.14)',
    colorName: 'Crimson Red',
    colorEmoji: '🚩',
    gradientClass: 'from-red-500/25 via-rose-500/15 to-orange-600/20',
    borderClass: 'border-red-400/60',
    badgeBgClass: 'bg-red-500 text-white',
    textAccentClass: 'text-red-300',
    ringClass: 'ring-red-400/50',
  },
  it_402: {
    subjectId: 'it_402',
    name: 'Information Technology',
    color: '#06b6d4', // Cyan Teal
    secondaryHex: '#0891b2',
    accentBg: 'rgba(6, 182, 212, 0.12)',
    colorName: 'Cyber Cyan',
    colorEmoji: '💻',
    gradientClass: 'from-cyan-500/25 via-teal-500/15 to-blue-600/20',
    borderClass: 'border-cyan-400/60',
    badgeBgClass: 'bg-cyan-500 text-slate-950',
    textAccentClass: 'text-cyan-300',
    ringClass: 'ring-cyan-400/50',
  },
  hindi_a: {
    subjectId: 'hindi_a',
    name: 'Hindi (Course A)',
    color: '#e11d48', // Deep Rose Red
    secondaryHex: '#be123c',
    accentBg: 'rgba(225, 29, 72, 0.12)',
    colorName: 'Ruby Rose',
    colorEmoji: '🌹',
    gradientClass: 'from-rose-500/25 via-red-500/15 to-pink-600/20',
    borderClass: 'border-rose-400/60',
    badgeBgClass: 'bg-rose-500 text-white',
    textAccentClass: 'text-rose-300',
    ringClass: 'ring-rose-400/50',
  },
  communicative_english: {
    subjectId: 'communicative_english',
    name: 'Communicative English',
    color: '#8b5cf6', // Violet Indigo
    secondaryHex: '#6d28d9',
    accentBg: 'rgba(139, 92, 246, 0.12)',
    colorName: 'Amethyst Violet',
    colorEmoji: '🎭',
    gradientClass: 'from-violet-500/25 via-purple-500/15 to-indigo-600/20',
    borderClass: 'border-violet-400/60',
    badgeBgClass: 'bg-violet-500 text-white',
    textAccentClass: 'text-violet-300',
    ringClass: 'ring-violet-400/50',
  },
  sanskrit: {
    subjectId: 'sanskrit',
    name: 'Sanskrit',
    color: '#d97706', // Saffron Amber
    secondaryHex: '#b45309',
    accentBg: 'rgba(217, 119, 6, 0.14)',
    colorName: 'Saffron Amber',
    colorEmoji: '🕉️',
    gradientClass: 'from-amber-600/25 via-orange-500/15 to-yellow-600/20',
    borderClass: 'border-amber-500/60',
    badgeBgClass: 'bg-amber-500 text-slate-950',
    textAccentClass: 'text-amber-300',
    ringClass: 'ring-amber-500/50',
  },
  ai_417: {
    subjectId: 'ai_417',
    name: 'Artificial Intelligence',
    color: '#6366f1', // Electric Indigo
    secondaryHex: '#4f46e5',
    accentBg: 'rgba(99, 102, 241, 0.14)',
    colorName: 'Electric Indigo',
    colorEmoji: '🤖',
    gradientClass: 'from-indigo-500/25 via-purple-500/15 to-blue-600/20',
    borderClass: 'border-indigo-400/60',
    badgeBgClass: 'bg-indigo-500 text-white',
    textAccentClass: 'text-indigo-300',
    ringClass: 'ring-indigo-400/50',
  },
  comp_app_165: {
    subjectId: 'comp_app_165',
    name: 'Computer Applications',
    color: '#0284c7', // Ocean Cobalt Blue
    secondaryHex: '#0369a1',
    accentBg: 'rgba(2, 132, 199, 0.12)',
    colorName: 'Cobalt Blue',
    colorEmoji: '🌐',
    gradientClass: 'from-sky-600/25 via-blue-600/15 to-teal-600/20',
    borderClass: 'border-sky-500/60',
    badgeBgClass: 'bg-sky-600 text-white',
    textAccentClass: 'text-sky-300',
    ringClass: 'ring-sky-500/50',
  },
  home_science_064: {
    subjectId: 'home_science_064',
    name: 'Home Science',
    color: '#f43f5e', // Coral Rose
    secondaryHex: '#e11d48',
    accentBg: 'rgba(244, 63, 94, 0.12)',
    colorName: 'Coral Rose',
    colorEmoji: '🏡',
    gradientClass: 'from-rose-500/25 via-pink-500/15 to-red-500/20',
    borderClass: 'border-rose-400/60',
    badgeBgClass: 'bg-rose-500 text-white',
    textAccentClass: 'text-rose-300',
    ringClass: 'ring-rose-400/50',
  },
  painting_049: {
    subjectId: 'painting_049',
    name: 'Painting (Fine Arts)',
    color: '#f59e0b', // Warm Gold
    secondaryHex: '#d97706',
    accentBg: 'rgba(245, 158, 11, 0.14)',
    colorName: 'Canvas Gold',
    colorEmoji: '🎨',
    gradientClass: 'from-amber-400/25 via-yellow-500/15 to-orange-500/20',
    borderClass: 'border-amber-400/60',
    badgeBgClass: 'bg-amber-400 text-slate-950',
    textAccentClass: 'text-amber-200',
    ringClass: 'ring-amber-400/50',
  },
  french_018: {
    subjectId: 'french_018',
    name: 'French',
    color: '#2563eb', // French Tricolour Blue
    secondaryHex: '#1d4ed8',
    accentBg: 'rgba(37, 99, 235, 0.12)',
    colorName: 'French Royal Blue',
    colorEmoji: '🇫🇷',
    gradientClass: 'from-blue-600/25 via-indigo-600/15 to-sky-600/20',
    borderClass: 'border-blue-400/60',
    badgeBgClass: 'bg-blue-600 text-white',
    textAccentClass: 'text-blue-300',
    ringClass: 'ring-blue-400/50',
  },
  german_020: {
    subjectId: 'german_020',
    name: 'German',
    color: '#eab308', // Bright German Yellow
    secondaryHex: '#ca8a04',
    accentBg: 'rgba(234, 179, 8, 0.14)',
    colorName: 'Imperial Yellow',
    colorEmoji: '🇩🇪',
    gradientClass: 'from-yellow-500/25 via-amber-500/15 to-orange-500/20',
    borderClass: 'border-yellow-400/60',
    badgeBgClass: 'bg-yellow-500 text-slate-950',
    textAccentClass: 'text-yellow-300',
    ringClass: 'ring-yellow-400/50',
  },
  urdu_003: {
    subjectId: 'urdu_003',
    name: 'Urdu',
    color: '#0d9488', // Emerald Teal
    secondaryHex: '#0f766e',
    accentBg: 'rgba(13, 148, 136, 0.14)',
    colorName: 'Emerald Teal',
    colorEmoji: '🌙',
    gradientClass: 'from-teal-600/25 via-emerald-600/15 to-cyan-600/20',
    borderClass: 'border-teal-400/60',
    badgeBgClass: 'bg-teal-600 text-white',
    textAccentClass: 'text-teal-300',
    ringClass: 'ring-teal-400/50',
  },
  punjabi_004: {
    subjectId: 'punjabi_004',
    name: 'Punjabi',
    color: '#c2410c', // Rust Terracotta
    secondaryHex: '#9a3412',
    accentBg: 'rgba(194, 65, 12, 0.14)',
    colorName: 'Harvest Terracotta',
    colorEmoji: '🌾',
    gradientClass: 'from-orange-700/25 via-amber-600/15 to-red-600/20',
    borderClass: 'border-orange-500/60',
    badgeBgClass: 'bg-orange-700 text-white',
    textAccentClass: 'text-orange-300',
    ringClass: 'ring-orange-500/50',
  },
  bengali_005: {
    subjectId: 'bengali_005',
    name: 'Bengali',
    color: '#dc2626', // Scarlet Red
    secondaryHex: '#b91c1c',
    accentBg: 'rgba(220, 38, 38, 0.14)',
    colorName: 'Scarlet Bengal',
    colorEmoji: '🌺',
    gradientClass: 'from-red-600/25 via-rose-600/15 to-pink-700/20',
    borderClass: 'border-red-500/60',
    badgeBgClass: 'bg-red-600 text-white',
    textAccentClass: 'text-red-300',
    ringClass: 'ring-red-500/50',
  },
  tamil_006: {
    subjectId: 'tamil_006',
    name: 'Tamil',
    color: '#c026d3', // Fuchsia Orchid
    secondaryHex: '#a21caf',
    accentBg: 'rgba(192, 38, 211, 0.14)',
    colorName: 'Fuchsia Orchid',
    colorEmoji: '🏛️',
    gradientClass: 'from-fuchsia-600/25 via-purple-600/15 to-pink-600/20',
    borderClass: 'border-fuchsia-400/60',
    badgeBgClass: 'bg-fuchsia-600 text-white',
    textAccentClass: 'text-fuchsia-300',
    ringClass: 'ring-fuchsia-400/50',
  },
  telugu_007: {
    subjectId: 'telugu_007',
    name: 'Telugu',
    color: '#0369a1', // Sapphire Blue
    secondaryHex: '#075985',
    accentBg: 'rgba(3, 105, 161, 0.14)',
    colorName: 'Sapphire Blue',
    colorEmoji: '🌊',
    gradientClass: 'from-sky-700/25 via-blue-700/15 to-indigo-800/20',
    borderClass: 'border-sky-400/60',
    badgeBgClass: 'bg-sky-700 text-white',
    textAccentClass: 'text-sky-300',
    ringClass: 'ring-sky-400/50',
  },
  gujarati_010: {
    subjectId: 'gujarati_010',
    name: 'Gujarati',
    color: '#059669', // Jade Forest
    secondaryHex: '#047857',
    accentBg: 'rgba(5, 150, 105, 0.14)',
    colorName: 'Jade Mint',
    colorEmoji: '🌿',
    gradientClass: 'from-emerald-600/25 via-teal-600/15 to-green-700/20',
    borderClass: 'border-emerald-400/60',
    badgeBgClass: 'bg-emerald-600 text-white',
    textAccentClass: 'text-emerald-300',
    ringClass: 'ring-emerald-400/50',
  },
  data_science_419: {
    subjectId: 'data_science_419',
    name: 'Data Science',
    color: '#7c3aed',
    secondaryHex: '#6d28d9',
    accentBg: 'rgba(124, 58, 237, 0.14)',
    colorName: 'Matrix Violet',
    colorEmoji: '📊',
    gradientClass: 'from-violet-600/25 via-purple-600/15 to-indigo-700/20',
    borderClass: 'border-violet-400/60',
    badgeBgClass: 'bg-violet-600 text-white',
    textAccentClass: 'text-violet-300',
    ringClass: 'ring-violet-400/50',
  },
  fmm_405: {
    subjectId: 'fmm_405',
    name: 'Financial Markets',
    color: '#16a34a',
    secondaryHex: '#15803d',
    accentBg: 'rgba(22, 163, 74, 0.14)',
    colorName: 'Bull Market Green',
    colorEmoji: '📈',
    gradientClass: 'from-green-600/25 via-emerald-600/15 to-teal-700/20',
    borderClass: 'border-green-400/60',
    badgeBgClass: 'bg-green-600 text-white',
    textAccentClass: 'text-green-300',
    ringClass: 'ring-green-400/50',
  },
  elements_business_154: {
    subjectId: 'elements_business_154',
    name: 'Elements of Business',
    color: '#0891b2',
    secondaryHex: '#0e7490',
    accentBg: 'rgba(8, 145, 178, 0.14)',
    colorName: 'Commerce Cyan',
    colorEmoji: '💼',
    gradientClass: 'from-cyan-600/25 via-sky-600/15 to-blue-700/20',
    borderClass: 'border-cyan-400/60',
    badgeBgClass: 'bg-cyan-600 text-white',
    textAccentClass: 'text-cyan-300',
    ringClass: 'ring-cyan-400/50',
  },
  book_keeping_254: {
    subjectId: 'book_keeping_254',
    name: 'Elements of Book Keeping',
    color: '#ca8a04',
    secondaryHex: '#a16207',
    accentBg: 'rgba(202, 138, 4, 0.14)',
    colorName: 'Ledger Gold',
    colorEmoji: '📒',
    gradientClass: 'from-yellow-600/25 via-amber-600/15 to-orange-600/20',
    borderClass: 'border-yellow-500/60',
    badgeBgClass: 'bg-yellow-500 text-slate-950',
    textAccentClass: 'text-yellow-300',
    ringClass: 'ring-yellow-500/50',
  },
  hindustani_music_034: {
    subjectId: 'hindustani_music_034',
    name: 'Music',
    color: '#db2777',
    secondaryHex: '#be185d',
    accentBg: 'rgba(219, 39, 119, 0.14)',
    colorName: 'Raga Magenta',
    colorEmoji: '🎵',
    gradientClass: 'from-pink-600/25 via-fuchsia-600/15 to-rose-700/20',
    borderClass: 'border-pink-400/60',
    badgeBgClass: 'bg-pink-600 text-white',
    textAccentClass: 'text-pink-300',
    ringClass: 'ring-pink-400/50',
  },
  ncc_076: {
    subjectId: 'ncc_076',
    name: 'NCC (076)',
    color: '#65a30d',
    secondaryHex: '#4d7c0f',
    accentBg: 'rgba(101, 163, 13, 0.14)',
    colorName: 'Cadet Olive',
    colorEmoji: '🎖️',
    gradientClass: 'from-lime-600/25 via-green-600/15 to-emerald-700/20',
    borderClass: 'border-lime-400/60',
    badgeBgClass: 'bg-lime-600 text-slate-950',
    textAccentClass: 'text-lime-300',
    ringClass: 'ring-lime-400/50',
  },
};

const FALLBACK_THEME_PALETTE: Omit<SubjectColorTheme, 'subjectId' | 'name'>[] = [
  {
    color: '#38bdf8',
    secondaryHex: '#0284c7',
    accentBg: 'rgba(56, 189, 248, 0.14)',
    colorName: 'Azure',
    colorEmoji: '📘',
    gradientClass: 'from-sky-500/25 via-blue-500/15 to-indigo-600/20',
    borderClass: 'border-sky-400/60',
    badgeBgClass: 'bg-sky-500 text-slate-950',
    textAccentClass: 'text-sky-300',
    ringClass: 'ring-sky-400/50',
  },
  {
    color: '#10b981',
    secondaryHex: '#059669',
    accentBg: 'rgba(16, 185, 129, 0.14)',
    colorName: 'Emerald',
    colorEmoji: '📗',
    gradientClass: 'from-emerald-500/25 via-teal-500/15 to-green-600/20',
    borderClass: 'border-emerald-400/60',
    badgeBgClass: 'bg-emerald-500 text-slate-950',
    textAccentClass: 'text-emerald-300',
    ringClass: 'ring-emerald-400/50',
  },
  {
    color: '#f59e0b',
    secondaryHex: '#d97706',
    accentBg: 'rgba(245, 158, 11, 0.14)',
    colorName: 'Amber',
    colorEmoji: '📙',
    gradientClass: 'from-amber-500/25 via-orange-500/15 to-yellow-600/20',
    borderClass: 'border-amber-400/60',
    badgeBgClass: 'bg-amber-500 text-slate-950',
    textAccentClass: 'text-amber-300',
    ringClass: 'ring-amber-400/50',
  },
  {
    color: '#a855f7',
    secondaryHex: '#7c3aed',
    accentBg: 'rgba(168, 85, 247, 0.14)',
    colorName: 'Violet',
    colorEmoji: '📕',
    gradientClass: 'from-purple-500/25 via-violet-500/15 to-indigo-600/20',
    borderClass: 'border-purple-400/60',
    badgeBgClass: 'bg-purple-500 text-white',
    textAccentClass: 'text-purple-300',
    ringClass: 'ring-purple-400/50',
  },
  {
    color: '#f43f5e',
    secondaryHex: '#e11d48',
    accentBg: 'rgba(244, 63, 94, 0.14)',
    colorName: 'Rose',
    colorEmoji: '🎯',
    gradientClass: 'from-rose-500/25 via-pink-500/15 to-red-600/20',
    borderClass: 'border-rose-400/60',
    badgeBgClass: 'bg-rose-500 text-white',
    textAccentClass: 'text-rose-300',
    ringClass: 'ring-rose-400/50',
  },
  {
    color: '#14b8a6',
    secondaryHex: '#0d9488',
    accentBg: 'rgba(20, 184, 166, 0.14)',
    colorName: 'Teal',
    colorEmoji: '🛠️',
    gradientClass: 'from-teal-500/25 via-cyan-500/15 to-emerald-600/20',
    borderClass: 'border-teal-400/60',
    badgeBgClass: 'bg-teal-500 text-slate-950',
    textAccentClass: 'text-teal-300',
    ringClass: 'ring-teal-400/50',
  },
];

/**
 * Normalizes subject ID matching (handles prefixes/aliases)
 */
export function getSubjectColorTheme(subjectId: string): SubjectColorTheme {
  if (SUBJECT_COLOR_REGISTRY[subjectId]) {
    return SUBJECT_COLOR_REGISTRY[subjectId];
  }

  // Handle prefix variations
  const clean = subjectId.toLowerCase();
  if (clean.includes('science') && !clean.includes('data') && !clean.includes('home') && !clean.includes('foundation')) return SUBJECT_COLOR_REGISTRY['science'];
  if (clean.includes('math')) return SUBJECT_COLOR_REGISTRY['maths'];
  if (clean.includes('sst') || clean.includes('social')) return SUBJECT_COLOR_REGISTRY['sst'];
  if (clean.includes('hindi') && clean.includes('b')) return SUBJECT_COLOR_REGISTRY['hindi_b'];
  if (clean.includes('hindi')) return SUBJECT_COLOR_REGISTRY['hindi_a'];
  if (clean.includes('comm') && clean.includes('eng')) return SUBJECT_COLOR_REGISTRY['communicative_english'];
  if (clean.includes('eng')) return SUBJECT_COLOR_REGISTRY['english'];
  if (clean.includes('marathi')) return SUBJECT_COLOR_REGISTRY['marathi'];
  if (clean.includes('sanskrit')) return SUBJECT_COLOR_REGISTRY['sanskrit'];
  if (clean.includes('ai_') || clean.includes('417')) return SUBJECT_COLOR_REGISTRY['ai_417'];
  if (clean.includes('it_') || clean.includes('402')) return SUBJECT_COLOR_REGISTRY['it_402'];
  if (clean.includes('comp') || clean.includes('165')) return SUBJECT_COLOR_REGISTRY['comp_app_165'];
  if (clean.includes('home') || clean.includes('064')) return SUBJECT_COLOR_REGISTRY['home_science_064'];
  if (clean.includes('paint') || clean.includes('049')) return SUBJECT_COLOR_REGISTRY['painting_049'];
  if (clean.includes('french') || clean.includes('018')) return SUBJECT_COLOR_REGISTRY['french_018'];
  if (clean.includes('german') || clean.includes('020')) return SUBJECT_COLOR_REGISTRY['german_020'];
  if (clean.includes('urdu') || clean.includes('003')) return SUBJECT_COLOR_REGISTRY['urdu_003'];
  if (clean.includes('punjabi') || clean.includes('004')) return SUBJECT_COLOR_REGISTRY['punjabi_004'];
  if (clean.includes('bengali') || clean.includes('005')) return SUBJECT_COLOR_REGISTRY['bengali_005'];
  if (clean.includes('tamil') || clean.includes('006')) return SUBJECT_COLOR_REGISTRY['tamil_006'];
  if (clean.includes('telugu') || clean.includes('007')) return SUBJECT_COLOR_REGISTRY['telugu_007'];
  if (clean.includes('gujarati') || clean.includes('010')) return SUBJECT_COLOR_REGISTRY['gujarati_010'];
  if (clean.includes('data') || clean.includes('419')) return SUBJECT_COLOR_REGISTRY['data_science_419'];
  if (clean.includes('fmm') || clean.includes('405') || clean.includes('finan')) return SUBJECT_COLOR_REGISTRY['fmm_405'];
  if (clean.includes('music')) return SUBJECT_COLOR_REGISTRY['hindustani_music_034'];
  if (clean.includes('business') || clean.includes('154')) return SUBJECT_COLOR_REGISTRY['elements_business_154'];
  if (clean.includes('book') || clean.includes('254')) return SUBJECT_COLOR_REGISTRY['book_keeping_254'];
  if (clean.includes('ncc') || clean.includes('076')) return SUBJECT_COLOR_REGISTRY['ncc_076'];

  // Deterministic palette fallback for all other languages & skill codes
  const hash = Math.abs(clean.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0));
  const picked = FALLBACK_THEME_PALETTE[hash % FALLBACK_THEME_PALETTE.length];
  return {
    ...picked,
    subjectId,
    name: subjectId,
  };
}
