import { CLASS_10_SUBJECTS } from '../data/chaptersData';
import { OFFICIAL_RESOURCES, type ResourceItem } from '../data/resourcesData';
import { generateCuratedFallbackQuiz } from '../data/mcqFallbackBank';

interface TopicFactSheet {
  keywords: string[];
  title: string;
  subject: string;
  formula: string;
  keyPoints: string[];
  examTip: string;
}

const CORE_CLASS_10_FACTS: TopicFactSheet[] = [
  {
    keywords: ['ohm', 'electricity', 'circuit', 'resistance', 'current', 'voltage', 'power', 'joule'],
    title: "Ohm's Law & Electric Circuits",
    subject: 'Science (Physics)',
    formula: 'V = I × R  |  R = ρ(l / A)  |  H = I²Rt  |  P = V·I',
    keyPoints: [
      'At constant temperature, potential difference (V) across a metallic conductor is directly proportional to current (I).',
      'Series combination: Rs = R₁ + R₂ + R₃ (same current flows through each resistor).',
      'Parallel combination: 1/Rp = 1/R₁ + 1/R₂ + 1/R₃ (same voltage across each branch).',
    ],
    examTip: 'Always state "at constant temperature" when defining Ohm’s Law and include Ω, A, and V units.',
  },
  {
    keywords: ['quadratic', 'discriminant', 'roots', 'polynomial', 'equation', 'alpha', 'beta'],
    title: 'Quadratic Equations & Polynomials',
    subject: 'Mathematics',
    formula: 'x = (-b ± √(b² - 4ac)) / 2a  |  D = b² - 4ac',
    keyPoints: [
      'D > 0: Two distinct real roots; D = 0: Two equal real roots; D < 0: No real roots.',
      'For ax² + bx + c = 0, Sum of roots (α + β) = -b/a and Product (αβ) = c/a.',
      'Always verify rejected roots in word problems (speed, age, or length cannot be negative).',
    ],
    examTip: 'Show discriminant calculation explicitly before applying the quadratic formula for full step marks.',
  },
  {
    keywords: ['trigonometry', 'sin', 'cos', 'tan', 'height', 'distance', 'angle'],
    title: 'Trigonometry Identities & Heights',
    subject: 'Mathematics',
    formula: 'sin²θ + cos²θ = 1  |  1 + tan²θ = sec²θ  |  1 + cot²θ = cosec²θ',
    keyPoints: [
      'Standard exact angles: sin 30° = 1/2, sin 45° = 1/√2, sin 60° = √3/2, tan 45° = 1.',
      'Convert all sec, cosec, tan, cot expressions to sin θ and cos θ when proving identities.',
      'Draw a clear labeled right-triangle diagram for elevation/depression problems.',
    ],
    examTip: 'Keep √3 ≈ 1.732 substitution until the final simplification step unless asked otherwise.',
  },
  {
    keywords: ['light', 'lens', 'mirror', 'refraction', 'prism', 'dispersion', 'focal', 'snell', 'eye'],
    title: 'Light Reflection, Refraction & Prism Dispersion',
    subject: 'Science (Physics)',
    formula: '1/f = 1/v + 1/u (Mirror)  |  1/f = 1/v - 1/u (Lens)  |  n = sin i / sin r  |  P = 1/f (m)',
    keyPoints: [
      'New Cartesian sign convention: object distance u is always negative; concave focal length f < 0, convex f > 0.',
      'White light splits into VIBGYOR through a glass prism because violet bends most (shortest λ) and red bends least.',
      'Myopia is corrected with concave lens; hypermetropia with convex lens.',
    ],
    examTip: 'Always draw arrowheads on incident, refracted, and reflected rays in CBSE ray diagrams.',
  },
  {
    keywords: ['carbon', 'covalent', 'alkane', 'alkene', 'ester', 'soap', 'micelle', 'ethanol', 'ethanoic'],
    title: 'Carbon & Its Compounds',
    subject: 'Science (Chemistry)',
    formula: 'Alkane: CₙH₂ₙ₊₂  |  Alkene: CₙH₂ₙ  |  Alkyne: CₙH₂ₙ₋₂',
    keyPoints: [
      'Carbon forms covalent bonds due to tetravalency and catenation (self-linking into chains/rings).',
      'Esterification: Ethanoic acid + Ethanol (conc. H₂SO₄) → Sweet-smelling Ester + Water.',
      'Soaps form spherical micelles with hydrophobic tails inward (oil) and hydrophilic ionic heads outward (water).',
    ],
    examTip: 'Draw clear shared electron pairs (cross-and-dot diagrams) for CH₄, CO₂, N₂, and C₂H₄.',
  },
  {
    keywords: ['acid', 'base', 'salt', 'ph', 'reaction', 'chemical', 'metal', 'redox', 'corrosion'],
    title: 'Chemical Reactions, Acids, Bases & Metals',
    subject: 'Science (Chemistry)',
    formula: 'NaCl + H₂O (Electrolysis) → NaOH + Cl₂ + H₂  |  pH < 7 Acidic, pH > 7 Basic',
    keyPoints: [
      'Plaster of Paris: CaSO₄·½H₂O + 1½H₂O → CaSO₄·2H₂O (Gypsum, hard solid mass).',
      'Baking soda (NaHCO₃) decomposes on heating into Na₂CO₃, H₂O, and CO₂ gas.',
      'Reactivity series: K > Na > Ca > Mg > Al > Zn > Fe > Pb > H > Cu > Ag > Au.',
    ],
    examTip: 'Balance every chemical equation and indicate physical states (s), (l), (g), (aq) for board precision.',
  },
  {
    keywords: ['heart', 'life', 'respiration', 'photosynthesis', 'nephron', 'reflex', 'neuron', 'heredity', 'mendel'],
    title: 'Life Processes, Control & Heredity',
    subject: 'Science (Biology)',
    formula: '6CO₂ + 12H₂O (Sunlight/Chlorophyll) → C₆H₁₂O₆ + 6O₂ + 6H₂O',
    keyPoints: [
      'Human heart has 4 chambers to prevent mixing of oxygenated and deoxygenated blood (double circulation).',
      'Nephron performs glomerular filtration, selective tubular reabsorption, and urine formation.',
      'Mendel’s monohybrid F2 phenotypic ratio is 3:1 (genotypic 1:2:1); dihybrid phenotypic ratio is 9:3:3:1.',
    ],
    examTip: 'Label chambers, valves, aorta, vena cava, and pulmonary vessels clearly on biology schematics.',
  },
  {
    keywords: ['nationalism', 'gandhi', 'europe', 'history', 'sst', 'federalism', 'democracy', 'economics', 'geography', 'soil', 'crop'],
    title: 'Social Science (History, Civics, Geography & Economics)',
    subject: 'Social Science',
    formula: 'CBSE 5-Point Structured Answer Format: Context · Cause · Event · Impact · Map/Example',
    keyPoints: [
      'Nationalism in India: Non-Cooperation (1920), Dandi Salt March & Civil Disobedience (1930), Poona Pact (1932).',
      'Federalism divides power across Union, State, and Concurrent Lists with independent Judiciary.',
      'Primary, Secondary, and Tertiary sectors track GDP contribution vs disguised unemployment in agriculture.',
    ],
    examTip: 'Present SST 3-mark and 5-mark answers as numbered bullet points with bold keywords & underlined dates.',
  },
  {
    keywords: ['atom', 'bohr', 'shell', 'electron', 'proton', 'nucleus', 'periodic'],
    title: 'Atomic Structure & Electron Shells',
    subject: 'Science Foundation',
    formula: 'Max electrons in shell n = 2n²  (K=2, L=8, M=18, N=32)',
    keyPoints: [
      'Electrons revolve in discrete quantized circular orbits (K, L, M, N) without radiating energy.',
      'Valence shell electrons govern chemical bonding (ionic transfer vs covalent sharing).',
      'Atomic number Z equals number of protons (and electrons in a neutral atom).',
    ],
    examTip: 'Always check octet stability (2 for K shell, 8 for outer shells) before drawing dot structures.',
  },
];

function matchFactSheet(query: string): TopicFactSheet | null {
  const lower = query.toLowerCase();
  let best: TopicFactSheet | null = null;
  let bestScore = 0;

  for (const sheet of CORE_CLASS_10_FACTS) {
    let score = 0;
    for (const kw of sheet.keywords) {
      if (lower.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = sheet;
    }
  }
  return best;
}

function findMatchingChapters(query: string) {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3);

  const matches: Array<{ subjectName: string; chapterNo: number; chapterName: string; groupName: string }> = [];

  for (const sub of CLASS_10_SUBJECTS) {
    const subMatch = tokens.some((t) => sub.name.toLowerCase().includes(t));
    for (const grp of sub.groups) {
      for (const ch of grp.chapters) {
        const chText = `${ch.name} ${grp.name || ''}`.toLowerCase();
        const hitCount = tokens.filter((t) => chText.includes(t)).length;
        if (hitCount > 0 || (subMatch && matches.length < 4)) {
          matches.push({
            subjectName: sub.name,
            chapterNo: ch.no,
            chapterName: ch.name,
            groupName: grp.name || sub.name,
          });
        }
      }
    }
  }
  return matches.slice(0, 5);
}

export function generateOfflineTutorReply(question: string): string {
  const clean = question.trim();
  const fact = matchFactSheet(clean);
  const chapters = findMatchingChapters(clean);
  const sampleQuiz = generateCuratedFallbackQuiz({
    board: 'CBSE',
    subjectName: fact?.subject || chapters[0]?.subjectName || 'Science',
    chapterName: clean,
    mode: 'chapter',
    enrolledSubjectNames: ['Science', 'Mathematics', 'Social Science'],
    seedToken: String(Date.now()),
  });
  const topQ = sampleQuiz.questions[0];

  const lines: string[] = [];
  lines.push(`### Offline Study Solution — ${fact ? fact.title : clean.slice(0, 56)}`);
  lines.push('*Running locally inside your installed offline study vault (zero internet required).*');
  lines.push('');

  if (fact) {
    lines.push(`**Subject:** ${fact.subject}`);
    lines.push(`**Core Formula / Rule:** \`${fact.formula}\``);
    lines.push('');
    lines.push('**Step-by-Step Key Concepts:**');
    fact.keyPoints.forEach((pt, idx) => {
      lines.push(`${idx + 1}. ${pt}`);
    });
    lines.push('');
    lines.push(`**Board Exam Tip:** ${fact.examTip}`);
  } else if (chapters.length > 0) {
    lines.push('**Matched CBSE Class 10 Syllabus Chapters:**');
    chapters.forEach((ch) => {
      lines.push(`- **${ch.subjectName}** (${ch.groupName}) — Chapter ${ch.chapterNo}: **${ch.chapterName}**`);
    });
    lines.push('');
    lines.push('**Recommended 5-Mark Board Revision Checklist:**');
    lines.push('1. Write exact NCERT definitions, standard conditions, and balanced equations/theorems first.');
    lines.push('2. Include a neat pencil-labeled schematic diagram or step derivation.');
    lines.push('3. Highlight final answers with exact SI units and verify edge/boundary cases.');
  } else {
    lines.push(`**Concept Breakdown for "${clean}":**`);
    lines.push('1. Break the topic into **Definition → Formula/Law → Solved Example → Board Exception**.');
    lines.push('2. Practice all NCERT in-text examples and back-exercise questions first.');
    lines.push('3. Solve past 5-year CBSE PYQs in **Practice & Quizzes** (works 100% offline).');
  }

  if (topQ) {
    lines.push('');
    lines.push('**Quick Offline Recall Check:**');
    lines.push(`> *${topQ.question}*`);
    lines.push(`> **Answer:** ${topQ.options[topQ.correctIndex]} — ${topQ.explanation}`);
  }

  return lines.join('\n');
}

export function searchOfflineResources(query: string, subjectId?: string) {
  const q = query.trim().toLowerCase();
  const tokens = q.split(/[^a-z0-9]+/).filter((t) => t.length >= 2);

  const matchedResources: ResourceItem[] = OFFICIAL_RESOURCES.filter((item: ResourceItem) => {
    if (subjectId && subjectId !== 'all' && item.subjectId !== subjectId) return false;
    if (tokens.length === 0) return true;
    const hay = `${item.title} ${item.description} ${item.category} ${item.subjectId}`.toLowerCase();
    return tokens.some((t) => hay.includes(t));
  }).slice(0, 6);

  const chapters = findMatchingChapters(query);
  const fact = matchFactSheet(query);

  const summaryParts: string[] = [];
  summaryParts.push(`Offline Study Vault Search for "${query.trim()}"`);
  if (fact) {
    summaryParts.push(`\n${fact.title} (${fact.subject})\nCore Rule: ${fact.formula}`);
    fact.keyPoints.forEach((p, idx) => summaryParts.push(`${idx + 1}. ${p}`));
    summaryParts.push(`Board Tip: ${fact.examTip}`);
  }
  if (chapters.length > 0) {
    summaryParts.push(
      '\nMatched Syllabus Chapters:\n' +
        chapters.map((c) => `• ${c.subjectName} — Ch. ${c.chapterNo}: ${c.chapterName}`).join('\n')
    );
  }
  if (matchedResources.length > 0) {
    summaryParts.push(
      '\nSaved Vault Resources:\n' +
        matchedResources.map((r: ResourceItem) => `• ${r.title} (${r.category.toUpperCase()}): ${r.description}`).join('\n')
    );
  } else if (!fact && chapters.length === 0) {
    summaryParts.push(
      '\nAll 54 CBSE Class 10 subjects, 10-MCQ sprint bank, Focus Garden, and Planner are available offline. Visit Resources or Chapters to inspect full topic checklists.'
    );
  }

  return {
    text: summaryParts.join('\n'),
    groundingChunks: matchedResources.map((r: ResourceItem) => ({
      title: `${r.title} (Cached Study Vault)`,
      uri: r.officialPortalUrl || r.url,
    })),
    pdfLinks: matchedResources.map((r: ResourceItem) => ({
      label: r.title,
      url: r.url,
    })),
  };
}

export function buildOfflineStoryboard(prompt: string) {
  const clean = prompt.trim() || 'CBSE Class 10 Concept';
  const fact = matchFactSheet(clean);
  const accentColors = ['#22d3ee', '#fbbf24', '#34d399', '#a78bfa'];
  const accentHex = accentColors[clean.length % accentColors.length];

  if (fact) {
    return {
      title: fact.title,
      accentHex,
      scenes: [
        {
          heading: 'Scene 1 • Core NCERT Concept',
          caption: fact.keyPoints[0],
          keyFormula: fact.formula.split('|')[0]?.trim(),
        },
        {
          heading: 'Scene 2 • Key Rule & Structure',
          caption: fact.keyPoints[1] || fact.keyPoints[0],
          keyFormula: fact.formula.split('|')[1]?.trim() || fact.formula,
        },
        {
          heading: 'Scene 3 • Application & Analysis',
          caption: fact.keyPoints[2] || fact.examTip,
          keyFormula: fact.formula,
        },
        {
          heading: 'Scene 4 • Board Exam Check',
          caption: fact.examTip,
          keyFormula: 'Full 5-Mark Precision',
        },
      ],
    };
  }

  return {
    title: clean.slice(0, 48),
    accentHex,
    scenes: [
      {
        heading: 'Scene 1 • Concept Foundation',
        caption: `Identify the exact NCERT definition, law, and standard conditions for ${clean}.`,
        keyFormula: 'Definition + Boundary Rules',
      },
      {
        heading: 'Scene 2 • Visual & Symbolic Model',
        caption: `Sketch a neat labeled schematic showing cause, quantities, and directional arrows.`,
        keyFormula: 'Labeled Diagram = +1 Mark',
      },
      {
        heading: 'Scene 3 • Step-by-Step Derivation',
        caption: `Show every intermediate step clearly with SI units and balanced equations.`,
        keyFormula: 'Step Marking Protocol',
      },
      {
        heading: 'Scene 4 • High-Yield Revision',
        caption: `Double-check signs, units, and NCERT Exemplar variations before final review.`,
        keyFormula: 'Target: 100 / 100',
      },
    ],
  };
}

export function generateOfflineDiagramDataUrl(prompt: string, aspectRatio: string = '16:9'): string {
  const width = aspectRatio === '3:4' ? 720 : aspectRatio === '1:1' ? 840 : 960;
  const height = aspectRatio === '3:4' ? 960 : aspectRatio === '1:1' ? 840 : 540;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const lower = prompt.toLowerCase();
  const cx = width / 2;
  const cy = height / 2 + 12;

  // Deep blueprint background grid
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#040914');
  bg.addColorStop(1, '#0b1526');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 24; x < width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 24; y < height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Header
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('GOALBEAM OFFLINE VISUAL STUDIO · CBSE CLASS 10 DIAGRAM', 36, 40);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 26px system-ui, sans-serif';
  const fact = matchFactSheet(prompt);
  ctx.fillText(fact ? fact.title : prompt.slice(0, 44), 36, 76);

  if (lower.includes('prism') || lower.includes('light') || lower.includes('refract') || lower.includes('dispersion')) {
    // Glass Prism Dispersion Diagram
    ctx.strokeStyle = '#7dd3fc';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 110);
    ctx.lineTo(cx - 120, cy + 95);
    ctx.lineTo(cx + 120, cy + 95);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Incident white light ray
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 290, cy + 45);
    ctx.lineTo(cx - 65, cy + 2);
    ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('Incident White Light', cx - 300, cy + 25);

    // Spectrum VIBGYOR rays
    const spectrum = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#6366f1', '#a855f7'];
    spectrum.forEach((col, i) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 65, cy + 2);
      ctx.lineTo(cx + 68 + i * 2, cy - 8 + i * 10);
      ctx.lineTo(cx + 285, cy - 28 + i * 22);
      ctx.stroke();
    });
    ctx.fillStyle = '#f87171';
    ctx.fillText('Red (Least Deviation)', cx + 150, cy - 38);
    ctx.fillStyle = '#c084fc';
    ctx.fillText('Violet (Max Deviation)', cx + 145, cy + 132);
  } else if (lower.includes('atom') || lower.includes('bohr') || lower.includes('electron') || lower.includes('carbon')) {
    // Bohr Atom / Carbon Shells Diagram
    const radii = [58, 108, 156];
    const shellNames = ['K (2e⁻)', 'L (8e⁻)', 'M (18e⁻)'];
    radii.forEach((r, idx) => {
      ctx.strokeStyle = idx === 0 ? '#38bdf8' : idx === 1 ? '#34d399' : '#a78bfa';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText(shellNames[idx], cx + r + 10, cy - 8 + idx * 14);

      const eCount = idx === 0 ? 2 : idx === 1 ? 4 : 6;
      for (let k = 0; k < eCount; k++) {
        const ang = (Math.PI * 2 * k) / eCount + idx * 0.4;
        const ex = cx + Math.cos(ang) * r;
        const ey = cy + Math.sin(ang) * r;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(ex, ey, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('p⁺ + n⁰', cx, cy + 4);
  } else if (lower.includes('ohm') || lower.includes('circuit') || lower.includes('resistor') || lower.includes('electric')) {
    // Ohm's Law Circuit Diagram
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 190, cy - 85, 380, 175);

    // Resistor zigzag on top wire
    ctx.fillStyle = '#071020';
    ctx.fillRect(cx - 75, cy - 102, 150, 34);
    ctx.strokeStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(cx - 75, cy - 85);
    for (let i = 0; i < 6; i++) {
      ctx.lineTo(cx - 62 + i * 25, i % 2 === 0 ? cy - 101 : cy - 69);
    }
    ctx.lineTo(cx + 75, cy - 85);
    ctx.stroke();
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Resistor (R)  ·  V = I × R', cx, cy - 116);

    // Voltmeter parallel branch
    ctx.strokeStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(cx, cy + 5, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#052e2b';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('V', cx, cy + 10);

    // Ammeter in series
    ctx.fillStyle = '#0c1b33';
    ctx.beginPath();
    ctx.arc(cx + 190, cy + 5, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.stroke();
    ctx.fillStyle = '#93c5fd';
    ctx.fillText('A', cx + 190, cy + 10);

    // Battery bottom
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('+  Battery (V)  −', cx, cy + 115);
  } else if (lower.includes('triangle') || lower.includes('trig') || lower.includes('parabola') || lower.includes('quadratic') || lower.includes('math')) {
    // Trigonometry / Coordinate Diagram
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 240, cy + 95);
    ctx.lineTo(cx + 240, cy + 95);
    ctx.moveTo(cx - 140, cy + 130);
    ctx.lineTo(cx - 140, cy - 120);
    ctx.stroke();

    // Right triangle
    ctx.strokeStyle = '#22d3ee';
    ctx.fillStyle = 'rgba(34, 211, 238, 0.12)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 140, cy + 95);
    ctx.lineTo(cx + 140, cy + 95);
    ctx.lineTo(cx + 140, cy - 85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText('Hypotenuse (h)', cx - 75, cy - 5);
    ctx.fillStyle = '#34d399';
    ctx.fillText('Perpendicular (p)', cx + 154, cy + 5);
    ctx.fillStyle = '#93c5fd';
    ctx.fillText('Base (b) · sin²θ + cos²θ = 1', cx - 60, cy + 125);
  } else {
    // Structured 4-Node Concept Architecture Visual Map
    const nodes = [
      { x: cx - 220, y: cy - 55, title: '1. Definition', sub: 'Core NCERT Concept', color: '#38bdf8' },
      { x: cx + 220, y: cy - 55, title: '2. Key Rule', sub: fact ? fact.formula.slice(0, 26) : 'Standard SI Formula', color: '#fbbf24' },
      { x: cx - 220, y: cy + 75, title: '3. Method', sub: 'Stepwise Derivation', color: '#34d399' },
      { x: cx + 220, y: cy + 75, title: '4. Board Tip', sub: 'Underline Keywords', color: '#c084fc' },
    ];

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.lineWidth = 2;
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + 10);
      ctx.lineTo(n.x, n.y);
      ctx.stroke();
    });

    nodes.forEach((n) => {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = n.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(n.x - 125, n.y - 36, 250, 72, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = n.color;
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.title, n.x, n.y - 6);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText(n.sub, n.x, n.y + 18);
    });

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(cx, cy + 10, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CORE', cx, cy + 6);
    ctx.fillText('TOPIC', cx, cy + 23);
  }

  // Footer note
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(
    fact ? `Formula: ${fact.formula}` : 'Generated offline in CanvasCraft Studio · Ready for filters & PNG export',
    36,
    height - 26
  );

  return canvas.toDataURL('image/png');
}
