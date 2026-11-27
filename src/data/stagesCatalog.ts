import { StageDefinition } from '../types/tracker';

/**
 * Built-in Standard 4 Default Stages
 */
export const DEFAULT_STAGES_CONFIG: StageDefinition[] = [
  {
    key: 'ncert',
    label: 'NCERT Textbook Exercises & Intext',
    shortLabel: 'NCERT',
    description: 'NCERT reading, back exercise problems, and intext questions solved',
    icon: 'BookOpen',
    emoji: '📖',
    isCompulsory: true,
  },
  {
    key: 'ref_book',
    label: 'Reference Book Study',
    shortLabel: 'Ref Book',
    description: 'Reference book deep study (RD Sharma / RS Aggarwal / Lakhmir Singh / All in One)',
    icon: 'BookMarked',
    emoji: '📚',
  },
  {
    key: 'pyq',
    label: 'Previous Year Questions (PYQs)',
    shortLabel: 'PYQ ⏳',
    description: 'Past 10-year CBSE board papers topic-wise practice',
    icon: 'History',
    emoji: '⏳',
  },
  {
    key: 'worksheet',
    label: 'Worksheet / DPP Practice',
    shortLabel: 'Worksheet',
    description: 'Topic-wise worksheet problem sets, daily practice problems & homework',
    icon: 'FileText',
    emoji: '📝',
  },
];

/**
 * Comprehensive Catalog of CBSE Class 10 Study References & Milestones
 */
export const CATALOG_STAGES_OPTIONS: StageDefinition[] = [
  {
    key: 'ncert',
    label: 'NCERT Textbook (Intext & Exercises)',
    shortLabel: 'NCERT',
    description: 'Official NCERT textbook concepts, intext questions & exercise solutions',
    icon: 'BookOpen',
    emoji: '📖',
    isCompulsory: true,
  },
  {
    key: 'pyq',
    label: 'Previous Year Questions (PYQs)',
    shortLabel: 'PYQ ⏳',
    description: 'Past 10-year CBSE board question papers & recurrent question patterns',
    icon: 'History',
    emoji: '⏳',
  },
  {
    key: 'cbq',
    label: 'Competency Based Questions (CBQ)',
    shortLabel: 'CBQ 🎯',
    description: '50% board weightage competency questions, case studies & assertion-reasoning',
    icon: 'Target',
    emoji: '🎯',
  },
  {
    key: 'exemplar',
    label: 'NCERT Exemplar Problems',
    shortLabel: 'Exemplar',
    description: 'Higher-Order Thinking Skills (HOTS) questions and exemplar depth',
    icon: 'BookMarked',
    emoji: '📘',
  },
  {
    key: 'ref_book',
    label: 'Reference Books (RD / RS / Lakhmir)',
    shortLabel: 'Ref Book',
    description: 'Concept depth from RD Sharma, RS Aggarwal, Lakhmir Singh, or S. Chand',
    icon: 'BookOpen',
    emoji: '📚',
  },
  {
    key: 'worksheet',
    label: 'Topic-Wise Worksheets & DPP',
    shortLabel: 'Worksheet',
    description: 'Practice problem sheets, extra questions, and chapter exercise sheets',
    icon: 'FileText',
    emoji: '📝',
  },
  {
    key: 'oneshot_lecture',
    label: 'One-Shot Video Lecture / Udaan Notes',
    shortLabel: 'One-Shot 💡',
    description: 'Full chapter one-shot revision video or teacher lecture recording',
    icon: 'Play',
    emoji: '💡',
  },
  {
    key: 'mindmap_formula',
    label: 'Formula Sheet & Mind Maps',
    shortLabel: 'Formula Sheet 🧠',
    description: 'Self-handwritten formula sheet, cheat sheet, and visual mind map',
    icon: 'Brain',
    emoji: '🧠',
  },
  {
    key: 'lab_practical',
    label: 'Lab Manual & Practicals',
    shortLabel: 'Lab Manual 🔬',
    description: 'Science experiments, lab manual viva questions & mathematical constructions',
    icon: 'FlaskConical',
    emoji: '🔬',
  },
  {
    key: 'cbse_sqp',
    label: 'Official CBSE Sample Papers (SQP & MS)',
    shortLabel: 'Sample Paper 📄',
    description: 'Current academic year CBSE sample paper and official marking schemes',
    icon: 'FileCheck2',
    emoji: '📄',
  },
  {
    key: 'mock_test',
    label: 'Chapter Mock Test / Weekly Unit Test',
    shortLabel: 'Mock Test 📋',
    description: 'Timed pen-paper test with self-marking and score recording',
    icon: 'CheckSquare',
    emoji: '📋',
  },
  {
    key: 'flashcards',
    label: 'Flashcards & Rapid Concept Recall',
    shortLabel: 'Flashcards ⚡',
    description: 'Active recall cards for formulas, dates, events, definitions & theorems',
    icon: 'Zap',
    emoji: '⚡',
  },
  {
    key: 'mistake_notebook',
    label: 'Error Notebook & Doubt Clearing',
    shortLabel: 'Error Notebook 🔍',
    description: 'Logging mistakes made during tests and clarifying doubts with mentors',
    icon: 'Search',
    emoji: '🔍',
  },
  {
    key: 'preboard_sets',
    label: 'Pre-Board Practice Exam Sets',
    shortLabel: 'Pre-Board ✍️',
    description: 'Solving top school pre-board question papers under exam conditions',
    icon: 'PenTool',
    emoji: '✍️',
  },
  {
    key: 'topper_answers',
    label: 'CBSE Toppers Model Answer Sheets',
    shortLabel: 'Toppers Vault 🏆',
    description: 'Studying presentation techniques, step marking, and diagrams from 100% scorers',
    icon: 'Award',
    emoji: '🏆',
  },
  {
    key: 'oswaal_arihant',
    label: 'Question Bank (Oswaal / Arihant / Educart)',
    shortLabel: 'Question Bank 💎',
    description: 'Chapter-wise question bank with solutions and self-evaluation papers',
    icon: 'Layers',
    emoji: '💎',
  },
];

/**
 * Curated emoji options for student custom references
 */
export const STAGE_EMOJI_OPTIONS = [
  '📖', '📚', '⏳', '🎯', '📘', '📝', '💡', '🧠', 
  '🔬', '📄', '📋', '⚡', '🔍', '✍️', '🏆', '💎', 
  '🚀', '🌟', '🎨', '🧪', '📐', '💻', '🎒', '🎓', 
  '🔔', '🥇', '👑', '🔥', '✨', '🪐', '🏅', '📌'
];

/**
 * Returns active stages for a profile (falling back to DEFAULT_STAGES_CONFIG if empty)
 */
export function getProfileStages(profile?: { selectedStages?: StageDefinition[] } | null): StageDefinition[] {
  if (profile && Array.isArray(profile.selectedStages) && profile.selectedStages.length >= 4) {
    // Ensure NCERT is always present and compulsory
    const hasNcert = profile.selectedStages.some((s) => s.key === 'ncert');
    if (!hasNcert) {
      return [DEFAULT_STAGES_CONFIG[0], ...profile.selectedStages];
    }
    return profile.selectedStages;
  }
  return DEFAULT_STAGES_CONFIG;
}
