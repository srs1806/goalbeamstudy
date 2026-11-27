import { FlashcardItem, TimetableSlot } from '../types/tracker';

/**
 * High-yield curated CBSE Class 10 flashcards for quick formula, reaction, date, and theorem recall.
 */
export const CLASS_10_FLASHCARDS: FlashcardItem[] = [
  // Mathematics
  {
    id: 'fc-maths-quad-formula',
    subjectId: 'maths',
    chapterName: 'Quadratic Equations',
    front: 'What is the Quadratic Formula and Discriminant D for ax² + bx + c = 0 (a ≠ 0)?',
    back: 'x = (-b ± √(b² - 4ac)) / 2a, where Discriminant D = b² - 4ac. D > 0 gives two distinct real roots; D = 0 gives equal real roots; D < 0 gives no real roots.',
    hint: 'Always check whether D ≥ 0 before solving for real roots.',
  },
  {
    id: 'fc-maths-ap-sum',
    subjectId: 'maths',
    chapterName: 'Arithmetic Progressions',
    front: 'State the nth term (aₙ) and sum of first n terms (Sₙ) formulas of an AP.',
    back: 'aₙ = a + (n - 1)d. Sum formulas: Sₙ = (n/2)[2a + (n - 1)d] OR Sₙ = (n/2)(a + l), where l is the last term.',
    hint: 'Use Sₙ = (n/2)(a + l) when first and last terms are given directly.',
  },
  {
    id: 'fc-maths-trig-identities',
    subjectId: 'maths',
    chapterName: 'Introduction to Trigonometry',
    front: 'Write the three fundamental Pythagorean Trigonometric Identities.',
    back: '1) sin²θ + cos²θ = 1\n2) 1 + tan²θ = sec²θ (0° ≤ θ < 90°)\n3) 1 + cot²θ = cosec²θ (0° < θ ≤ 90°)',
    hint: 'Convert everything to sin θ and cos θ when proving identities.',
  },
  {
    id: 'fc-maths-section-formula',
    subjectId: 'maths',
    chapterName: 'Coordinate Geometry',
    front: 'State the Section Formula dividing line segment AB in ratio m₁ : m₂.',
    back: 'P(x, y) = ((m₁x₂ + m₂x₁)/(m₁ + m₂), (m₁y₂ + m₂y₁)/(m₁ + m₂)). For Midpoint (1:1): ((x₁ + x₂)/2, (y₁ + y₂)/2).',
    hint: 'Multiply m₁ with coordinates of point B (x₂, y₂), and m₂ with point A (x₁, y₁).',
  },
  {
    id: 'fc-maths-frustum-cone',
    subjectId: 'maths',
    chapterName: 'Surface Areas and Volumes',
    front: 'Give the Volume & Total Surface Area formulas of a Right Circular Cone and Hemisphere.',
    back: 'Cone: V = (1/3)πr²h, CSA = πrl (l = √(r² + h²)). Hemisphere: V = (2/3)πr³, CSA = 2πr², TSA = 3πr².',
    hint: 'Remember hemisphere TSA includes the flat circular base (2πr² + πr² = 3πr²).',
  },
  {
    id: 'fc-maths-stats-empirical',
    subjectId: 'maths',
    chapterName: 'Statistics',
    front: 'What is the empirical relationship between Mean, Median, and Mode?',
    back: '3 Median = Mode + 2 Mean (or Mode = 3 Median - 2 Mean).',
    hint: 'Frequent 1-mark MCQ in CBSE Board Section A!',
  },

  // Science
  {
    id: 'fc-sci-ohm-joule',
    subjectId: 'science',
    chapterName: 'Electricity',
    front: 'State Ohm’s Law, Electrical Power formulas, and Joule’s Law of Heating.',
    back: 'V = IR (at constant temperature). Power P = VI = I²R = V²/R (Watt). Heat H = I²Rt (Joule). 1 kWh = 3.6 × 10⁶ J.',
    hint: 'Use I²R for series (constant I) and V²/R for parallel (constant V).',
  },
  {
    id: 'fc-sci-lens-mirror',
    subjectId: 'science',
    chapterName: 'Light — Reflection & Refraction',
    front: 'Compare Mirror Formula, Lens Formula, and Power of a Lens.',
    back: 'Mirror: 1/f = 1/v + 1/u, m = -v/u. Lens: 1/f = 1/v - 1/u, m = v/u. Power P = 1/f (f in metres), unit Dioptre (D).',
    hint: 'Object distance u is always negative in standard New Cartesian sign convention.',
  },
  {
    id: 'fc-sci-ph-scale',
    subjectId: 'science',
    chapterName: 'Acids, Bases and Salts',
    front: 'What is the chemical formula and two uses of Bleaching Powder & Plaster of Paris?',
    back: 'Bleaching Powder: CaOCl₂ (disinfectant, oxidizing agent). Plaster of Paris: CaSO₄·½H₂O (fractured bone casts, toys/decoration). Gypsum = CaSO₄·2H₂O.',
    hint: 'Heating Gypsum at 373 K yields Plaster of Paris.',
  },
  {
    id: 'fc-sci-esterification',
    subjectId: 'science',
    chapterName: 'Carbon and Its Compounds',
    front: 'Distinguish between Esterification and Saponification reactions.',
    back: 'Esterification: CH₃COOH + C₂H₅OH → CH₃COOC₂H₅ + H₂O (sweet-smelling ester with conc. H₂SO₄). Saponification: Ester + NaOH → Soap (sodium salt) + Alcohol.',
    hint: 'Saponification is literally used to manufacture soap.',
  },
  {
    id: 'fc-sci-respiration',
    subjectId: 'science',
    chapterName: 'Life Processes',
    front: 'List the three pathways of glucose breakdown in cellular respiration.',
    back: '1) Aerobic (Mitochondria, O₂ present): CO₂ + H₂O + 38 ATP\n2) Lack of O₂ (Muscle cells): Lactic acid + 2 ATP\n3) Anaerobic (Yeast): Ethanol + CO₂ + 2 ATP.',
    hint: 'Glycolysis (Glucose → Pyruvate) happens in the cytoplasm for all three.',
  },
  {
    id: 'fc-sci-mendel-ratios',
    subjectId: 'science',
    chapterName: 'Heredity',
    front: 'State Mendel’s F₂ Phenotypic & Genotypic ratios for Monohybrid and Dihybrid crosses.',
    back: 'Monohybrid F₂: Phenotypic 3:1, Genotypic 1:2:1. Dihybrid F₂: Phenotypic 9:3:3:1.',
    hint: '9:3:3:1 proves the Law of Independent Assortment.',
  },

  // Social Science
  {
    id: 'fc-sst-nationalism-europe',
    subjectId: 'sst',
    chapterName: 'The Rise of Nationalism in Europe',
    front: 'What were the key outcomes of the Treaty of Vienna (1815) hosted by Duke Metternich?',
    back: 'Restored Bourbon dynasty in France, stripped Napoleon’s conquests, set up buffer states around France (Netherlands + Belgium, Genoa + Piedmont), and aimed to preserve conservative monarchies.',
    hint: 'Think "1815 Waterloo → Conservatives restore old monarchies".',
  },
  {
    id: 'fc-sst-non-coop',
    subjectId: 'sst',
    chapterName: 'Nationalism in India',
    front: 'State key dates: Rowlatt Act, Jallianwala Bagh, Chauri Chaura & Dandi March.',
    back: 'Rowlatt Act: March 1919 | Jallianwala Bagh: 13 April 1919 | Non-Cooperation adopted: Dec 1920 (Nagpur) | Chauri Chaura call-off: Feb 1922 | Dandi March: 12 March – 6 April 1930.',
    hint: 'Always verify the exact month + year for timeline & map questions.',
  },
  {
    id: 'fc-sst-federalism',
    subjectId: 'sst',
    chapterName: 'Federalism',
    front: 'Distinguish between Union List, State List, and Concurrent List in India.',
    back: 'Union List (Defence, Foreign Affairs, Banking — Centre). State List (Police, Agriculture, Trade — States). Concurrent List (Education, Forests, Marriage — Both; Centre prevails on conflict). Residuary powers (IT/Cyber) belong to Centre.',
    hint: 'Note that Education and Forests were shifted to the Concurrent List.',
  },
  {
    id: 'fc-sst-sectors',
    subjectId: 'sst',
    chapterName: 'Sectors of the Indian Economy',
    front: 'Compare Disguised Unemployment and MGNREGA (2005) objectives.',
    back: 'Disguised Unemployment: More workers engaged than needed (especially agriculture), marginal productivity of extra workers is zero. MGNREGA 2005 guarantees 100 days of wage employment per year in rural India (Right to Work).',
    hint: 'Failure to provide work within 15 days entitles workers to unemployment allowance.',
  },

  // English & IT
  {
    id: 'fc-eng-lencho',
    subjectId: 'english',
    chapterName: 'A Letter to God',
    front: 'What is the central irony at the end of G.L. Fuentes’ story "A Letter to God"?',
    back: 'The postmaster and staff generously donated 70 pesos to keep Lencho’s faith alive, yet Lencho suspects them of stealing the missing 30 pesos and calls them "a bunch of crooks".',
    hint: 'Quote the phrase "bunch of crooks" in character analysis answers.',
  },
  {
    id: 'fc-it-styles-writer',
    subjectId: 'it_402',
    chapterName: 'Digital Documentation (Advanced)',
    front: 'Name the 6 style categories available in LibreOffice Writer.',
    back: 'Page Styles, Paragraph Styles, Character Styles, Frame Styles, List Styles, and Table Styles (accessible via F11 / Styles deck).',
    hint: 'Shortcut key to open Styles & Formatting deck in Writer is F11.',
  },
];

/**
 * Builds a practical editable CBSE Class 10 board exam date-sheet around the student's firstPaperDate (DD/MM/YYYY).
 */
export function buildSuggestedExamDateSheet(
  selectedSubjectIds: string[],
  firstPaperDate = '15/02/2027'
): Record<string, string> {
  const parts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((firstPaperDate || '').trim());
  const startDate = parts
    ? new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]))
    : new Date(2027, 1, 15);

  // Typical CBSE spacing gaps (in days after paper 1)
  const dayOffsetBySubject: Record<string, number> = {
    english: 0,
    english_comm: 0,
    hindi_b: 4,
    hindi_a: 4,
    sanskrit: 4,
    urdu_b: 4,
    science: 8,
    sst: 13,
    maths: 18,
    maths_basic: 18,
    it_402: 22,
    ai_417: 22,
    ca_165: 22,
  };

  const result: Record<string, string> = {};
  let fallbackOffset = 3;

  selectedSubjectIds.forEach((subId) => {
    const offset =
      subId in dayOffsetBySubject
        ? dayOffsetBySubject[subId]
        : (fallbackOffset += 3);
    const examDate = new Date(startDate.getTime() + offset * 24 * 60 * 60 * 1000);
    const yyyy = examDate.getFullYear();
    const mm = String(examDate.getMonth() + 1).padStart(2, '0');
    const dd = String(examDate.getDate()).padStart(2, '0');
    result[subId] = `${yyyy}-${mm}-${dd}`;
  });

  return result;
}

export function buildDefaultTimetableSlots(selectedSubjectIds: string[]): TimetableSlot[] {
  const s1 = selectedSubjectIds[0] || 'maths';
  const s2 = selectedSubjectIds[1] || 'science';
  const s3 = selectedSubjectIds[2] || 'sst';
  return [
    {
      id: 'slot-morning-focus',
      startTime: '05:00',
      endTime: '06:00',
      subjectId: s1,
      taskType: 'study',
      title: 'Sunrise Concept & NCERT Block',
    },
    {
      id: 'slot-afternoon-mcq',
      startTime: '16:30',
      endTime: '17:00',
      subjectId: s2,
      taskType: 'mcq',
      title: '10-Question Live MCQ Sprint',
    },
    {
      id: 'slot-evening-recall',
      startTime: '20:00',
      endTime: '20:45',
      subjectId: s3,
      taskType: 'flashcards',
      title: 'Flashcard Recall & Revision',
    },
  ];
}
