import type { QuizQuestion, QuizSourceLink } from '../types/tracker';

interface CuratedQuestion extends QuizQuestion {
  subjectKey: 'science' | 'maths' | 'sst' | 'english' | 'hindi' | 'skill';
  chapterKeywords: string[];
}

const CURATED_CLASS_10_BANK: CuratedQuestion[] = [
  // ================= SCIENCE (086) =================
  {
    id: 'fb-sci-1',
    subjectKey: 'science',
    chapterKeywords: ['chemical', 'reaction', 'equation', 'redox'],
    question: 'When ferrous sulphate crystals (FeSO4·7H2O) are heated strongly in a dry boiling tube, what colour change and smell are observed?',
    options: [
      'Green crystals turn reddish-brown (Fe2O3) with a smell of burning sulphur',
      'Blue crystals turn white with pungent ammonia smell',
      'Green crystals melt into a colourless liquid with sweet smell',
      'White powder turns black with rotten egg smell',
    ],
    correctIndex: 0,
    explanation: 'Thermal decomposition of green FeSO4·7H2O produces reddish-brown ferric oxide (Fe2O3) along with SO2 and SO3 gases that smell like burning sulphur.',
    topicTag: 'Thermal Decomposition',
    difficulty: 'Medium',
  },
  {
    id: 'fb-sci-2',
    subjectKey: 'science',
    chapterKeywords: ['acid', 'base', 'salt', 'ph', 'plaster'],
    question: 'Which compound is used in hospitals to set fractured bones and has the formula CaSO4·½H2O?',
    options: [
      'Bleaching Powder',
      'Baking Soda',
      'Plaster of Paris',
      'Washing Soda',
    ],
    correctIndex: 2,
    explanation: 'Plaster of Paris is calcium sulphate hemihydrate (CaSO4·½H2O), which reacts with water to form hard gypsum (CaSO4·2H2O).',
    topicTag: 'Salts & Plaster of Paris',
    difficulty: 'Easy',
  },
  {
    id: 'fb-sci-3',
    subjectKey: 'science',
    chapterKeywords: ['metal', 'non-metal', 'reactivity', 'thermit', 'alloy'],
    question: 'Which metal is stored under kerosene oil to prevent vigorous reaction with oxygen and moisture at room temperature?',
    options: [
      'Magnesium',
      'Sodium',
      'Zinc',
      'Aluminium',
    ],
    correctIndex: 1,
    explanation: 'Sodium and potassium are highly reactive alkali metals that catch fire when exposed to air or water, so they are stored immersed in kerosene.',
    topicTag: 'Reactivity of Metals',
    difficulty: 'Easy',
  },
  {
    id: 'fb-sci-4',
    subjectKey: 'science',
    chapterKeywords: ['carbon', 'compound', 'ester', 'ethanol', 'soap', 'homologous'],
    question: 'What is the functional group present in ethanoic acid (CH3COOH), and how many covalent bonds exist in ethane (C2H6)?',
    options: [
      'Aldehyde (-CHO); 6 covalent bonds',
      'Carboxylic acid (-COOH); 7 covalent bonds',
      'Ketone (>C=O); 7 covalent bonds',
      'Alcohol (-OH); 8 covalent bonds',
    ],
    correctIndex: 1,
    explanation: 'Ethanoic acid contains the carboxylic acid (-COOH) functional group. Ethane (C2H6) has 1 C–C bond and 6 C–H bonds, making 7 single covalent bonds in total.',
    topicTag: 'Covalent Bonding & Functional Groups',
    difficulty: 'Medium',
  },
  {
    id: 'fb-sci-5',
    subjectKey: 'science',
    chapterKeywords: ['life process', 'nutrition', 'respiration', 'heart', 'kidney', 'nephron'],
    question: 'During cellular respiration in human muscle cells under lack of oxygen, pyruvate is converted into:',
    options: [
      'Ethanol and Carbon dioxide',
      'Lactic acid and Energy',
      'Carbon dioxide and Water only',
      'Glucose and Oxygen',
    ],
    correctIndex: 1,
    explanation: 'In oxygen-deficient skeletal muscles during vigorous exercise, pyruvate (3-carbon) breaks down anaerobically into lactic acid (3-carbon) causing muscle cramps.',
    topicTag: 'Anaerobic Respiration',
    difficulty: 'Medium',
  },
  {
    id: 'fb-sci-6',
    subjectKey: 'science',
    chapterKeywords: ['control', 'coordination', 'brain', 'hormone', 'auxin', 'reflex'],
    question: 'Which part of the human brain is responsible for maintaining posture, balance, and precision of voluntary actions?',
    options: [
      'Medulla oblongata',
      'Cerebellum',
      'Pons',
      'Hypothalamus',
    ],
    correctIndex: 1,
    explanation: 'The cerebellum in the hindbrain coordinates voluntary movements like walking in a straight line or riding a bicycle and maintains body posture and equilibrium.',
    topicTag: 'Human Brain Structure',
    difficulty: 'Easy',
  },
  {
    id: 'fb-sci-7',
    subjectKey: 'science',
    chapterKeywords: ['reproduce', 'reproduction', 'flower', 'pollination', 'budding', 'dna'],
    question: 'Which organism reproduces by multiple fission inside a protective cyst during unfavourable conditions?',
    options: [
      'Amoeba',
      'Leishmania',
      'Plasmodium',
      'Spirogyra',
    ],
    correctIndex: 2,
    explanation: 'Plasmodium (the malarial parasite) divides into many daughter cells simultaneously by multiple fission.',
    topicTag: 'Asexual Reproduction',
    difficulty: 'Easy',
  },
  {
    id: 'fb-sci-8',
    subjectKey: 'science',
    chapterKeywords: ['heredity', 'mendel', 'trait', 'gene', 'chromosome', 'sex'],
    question: 'In a Mendelian dihybrid cross (RRYY × rryy), what is the expected phenotypic ratio in the F2 generation?',
    options: [
      '3 : 1',
      '1 : 2 : 1',
      '9 : 3 : 3 : 1',
      '9 : 7',
    ],
    correctIndex: 2,
    explanation: 'Mendel’s dihybrid cross demonstrates independent assortment of two traits, yielding a 9 : 3 : 3 : 1 phenotypic ratio in the F2 generation.',
    topicTag: 'Mendelian Genetics',
    difficulty: 'Easy',
  },
  {
    id: 'fb-sci-9',
    subjectKey: 'science',
    chapterKeywords: ['light', 'reflection', 'refraction', 'mirror', 'lens', 'magnification'],
    question: 'A concave mirror produces a real, inverted image of the exact same size as the object. Where is the object placed?',
    options: [
      'At the principal focus (F)',
      'Between pole (P) and focus (F)',
      'At the centre of curvature (C)',
      'Beyond the centre of curvature (C)',
    ],
    correctIndex: 2,
    explanation: 'When an object is placed at the centre of curvature (C) of a concave mirror, a real, inverted image of magnification m = -1 (same size) forms at C.',
    topicTag: 'Spherical Mirrors',
    difficulty: 'Medium',
  },
  {
    id: 'fb-sci-10',
    subjectKey: 'science',
    chapterKeywords: ['human eye', 'colourful', 'myopia', 'hypermetropia', 'prism', 'scattering'],
    question: 'Which defect of vision occurs when a person can see nearby objects clearly but cannot see distant objects distinctly, and how is it corrected?',
    options: [
      'Hypermetropia; corrected using a convex lens',
      'Myopia; corrected using a concave lens',
      'Presbyopia; corrected using a cylindrical lens',
      'Myopia; corrected using a convex lens',
    ],
    correctIndex: 1,
    explanation: 'In myopia (near-sightedness), the image forms in front of the retina. A diverging (concave) lens of suitable power shifts the image back onto the retina.',
    topicTag: 'Defects of Vision',
    difficulty: 'Easy',
  },
  {
    id: 'fb-sci-11',
    subjectKey: 'science',
    chapterKeywords: ['electricity', 'ohm', 'resistance', 'circuit', 'power', 'joule'],
    question: 'Two resistors of 4 Ω and 12 Ω are connected in parallel across a 6 V battery. What is the equivalent resistance and total current?',
    options: [
      '3 Ω and 2 A',
      '16 Ω and 0.375 A',
      '3 Ω and 18 A',
      '6 Ω and 1 A',
    ],
    correctIndex: 0,
    explanation: '1/Rp = 1/4 + 1/12 = 4/12 = 1/3, so Rp = 3 Ω. By Ohm’s law, I = V / Rp = 6 / 3 = 2 A.',
    topicTag: 'Resistors in Parallel',
    difficulty: 'Hard',
  },
  {
    id: 'fb-sci-12',
    subjectKey: 'science',
    chapterKeywords: ['magnetic', 'solenoid', 'fleming', 'fuse', 'current', 'environment', 'ozone'],
    question: 'In a domestic electric circuit, what is the colour code of the insulation on the live, neutral, and earth wires respectively (older/standard NCERT)?',
    options: [
      'Red (live), Black (neutral), Green (earth)',
      'Green (live), Red (neutral), Black (earth)',
      'Black (live), Green (neutral), Red (earth)',
      'Blue (live), Red (neutral), Yellow (earth)',
    ],
    correctIndex: 0,
    explanation: 'Standard NCERT convention identifies Red insulation as the live wire, Black as the neutral wire, and Green as the safety earth wire.',
    topicTag: 'Domestic Electric Circuits',
    difficulty: 'Medium',
  },

  // ================= MATHEMATICS (041 / 241) =================
  {
    id: 'fb-math-1',
    subjectKey: 'maths',
    chapterKeywords: ['real number', 'hcf', 'lcm', 'euclid', 'irrational', 'prime'],
    question: 'If HCF(26, 169) = 13, then what is LCM(26, 169)?',
    options: [
      '169',
      '338',
      '260',
      '195',
    ],
    correctIndex: 1,
    explanation: 'Using HCF × LCM = a × b: LCM = (26 × 169) / 13 = 2 × 169 = 338.',
    topicTag: 'HCF & LCM Relation',
    difficulty: 'Easy',
  },
  {
    id: 'fb-math-2',
    subjectKey: 'maths',
    chapterKeywords: ['polynomial', 'zero', 'quadratic', 'alpha', 'beta'],
    question: 'If α and β are the zeroes of the quadratic polynomial p(x) = 3x^2 - 7x + 4, find the value of (1/α) + (1/β).',
    options: [
      '7/4',
      '4/7',
      '-7/4',
      '3/4',
    ],
    correctIndex: 0,
    explanation: 'α + β = 7/3 and αβ = 4/3. Therefore (1/α) + (1/β) = (α + β) / (αβ) = (7/3) / (4/3) = 7/4.',
    topicTag: 'Zeroes & Coefficients',
    difficulty: 'Medium',
  },
  {
    id: 'fb-math-3',
    subjectKey: 'maths',
    chapterKeywords: ['linear equation', 'pair', 'consistent', 'parallel', 'coincident'],
    question: 'For what value of k will the system 3x + y = 1 and (2k - 1)x + (k - 1)y = 2k + 1 have NO solution?',
    options: [
      'k = 2',
      'k = 1',
      'k = -2',
      'k = 3',
    ],
    correctIndex: 0,
    explanation: 'For no solution (parallel lines), a1/a2 = b1/b2 ≠ c1/c2. Thus 3/(2k - 1) = 1/(k - 1) ⇒ 3k - 3 = 2k - 1 ⇒ k = 2 (and c1/c2 = 1/5 ≠ 1).',
    topicTag: 'Consistency of Linear Systems',
    difficulty: 'Hard',
  },
  {
    id: 'fb-math-4',
    subjectKey: 'maths',
    chapterKeywords: ['quadratic equation', 'discriminant', 'roots', 'nature'],
    question: 'If the quadratic equation kx(x - 2) + 6 = 0 has two equal real roots, what is the non-zero value of k?',
    options: [
      'k = 3',
      'k = 6',
      'k = 2',
      'k = -6',
    ],
    correctIndex: 1,
    explanation: 'Expanding gives kx^2 - 2kx + 6 = 0. For equal roots, D = b^2 - 4ac = (-2k)^2 - 4(k)(6) = 4k^2 - 24k = 0. Since k ≠ 0, k = 6.',
    topicTag: 'Discriminant & Equal Roots',
    difficulty: 'Medium',
  },
  {
    id: 'fb-math-5',
    subjectKey: 'maths',
    chapterKeywords: ['arithmetic progression', 'ap', 'nth term', 'sum', 'common difference'],
    question: 'What is the 11th term of the Arithmetic Progression: -3, -1/2, 2, ...?',
    options: [
      '28',
      '22',
      '-38',
      '19',
    ],
    correctIndex: 1,
    explanation: 'Here a = -3 and d = -1/2 - (-3) = 5/2. Thus a11 = a + 10d = -3 + 10(5/2) = -3 + 25 = 22.',
    topicTag: 'nth Term of an AP',
    difficulty: 'Easy',
  },
  {
    id: 'fb-math-6',
    subjectKey: 'maths',
    chapterKeywords: ['triangle', 'similar', 'bpt', 'thales', 'ratio'],
    question: 'In ΔABC, D and E are points on AB and AC respectively such that DE || BC. If AD = 2 cm, DB = 3 cm, and AE = 4 cm, find EC.',
    options: [
      '5 cm',
      '6 cm',
      '8 cm',
      '4.5 cm',
    ],
    correctIndex: 1,
    explanation: 'By Basic Proportionality Theorem (Thales Theorem), AD / DB = AE / EC ⇒ 2 / 3 = 4 / EC ⇒ EC = (4 × 3) / 2 = 6 cm.',
    topicTag: 'Basic Proportionality Theorem',
    difficulty: 'Easy',
  },
  {
    id: 'fb-math-7',
    subjectKey: 'maths',
    chapterKeywords: ['coordinate', 'distance', 'section', 'midpoint', 'collinear'],
    question: 'Find the ratio in which the y-axis divides the line segment joining P(-4, 5) and Q(8, -3).',
    options: [
      '1 : 2',
      '2 : 1',
      '1 : 3',
      '3 : 1',
    ],
    correctIndex: 0,
    explanation: 'Every point on the y-axis has x = 0. Using section formula (k:1), 0 = (8k - 4)/(k + 1) ⇒ 8k = 4 ⇒ k = 1/2, so the ratio is 1 : 2.',
    topicTag: 'Section Formula',
    difficulty: 'Medium',
  },
  {
    id: 'fb-math-8',
    subjectKey: 'maths',
    chapterKeywords: ['trigonometry', 'sin', 'cos', 'tan', 'height', 'distance', 'elevation'],
    question: 'If sin A + sin^2 A = 1, then what is the value of cos^2 A + cos^4 A?',
    options: [
      '0',
      '1',
      '2',
      '1/2',
    ],
    correctIndex: 1,
    explanation: 'Given sin A = 1 - sin^2 A = cos^2 A. Substituting cos^2 A = sin A gives cos^2 A + cos^4 A = sin A + sin^2 A = 1.',
    topicTag: 'Trigonometric Identities',
    difficulty: 'Hard',
  },
  {
    id: 'fb-math-9',
    subjectKey: 'maths',
    chapterKeywords: ['circle', 'tangent', 'secant', 'sector', 'arc'],
    question: 'From a point Q, the length of the tangent to a circle is 24 cm and its distance from the centre is 25 cm. What is the radius of the circle?',
    options: [
      '7 cm',
      '12 cm',
      '15 cm',
      '24.5 cm',
    ],
    correctIndex: 0,
    explanation: 'Since radius is perpendicular to tangent at point of contact, r = √(25^2 - 24^2) = √(625 - 576) = √49 = 7 cm.',
    topicTag: 'Tangent Properties',
    difficulty: 'Easy',
  },
  {
    id: 'fb-math-10',
    subjectKey: 'maths',
    chapterKeywords: ['surface area', 'volume', 'cone', 'cylinder', 'sphere', 'hemisphere'],
    question: 'A solid sphere of radius r is melted and recast into the shape of a solid cone of height r. What is the radius of the base of the cone?',
    options: [
      'r',
      '2r',
      '3r',
      '4r',
    ],
    correctIndex: 1,
    explanation: 'Volume of sphere = (4/3)πr^3 = Volume of cone = (1/3)πR^2(r) ⇒ 4r^2 = R^2 ⇒ R = 2r.',
    topicTag: 'Conversion of Solids',
    difficulty: 'Medium',
  },
  {
    id: 'fb-math-11',
    subjectKey: 'maths',
    chapterKeywords: ['statistic', 'mean', 'median', 'mode', 'empirical'],
    question: 'If the mean and median of a frequency distribution are 24 and 26 respectively, find the mode using the empirical relationship.',
    options: [
      '28',
      '30',
      '25',
      '32',
    ],
    correctIndex: 1,
    explanation: 'Using Mode = 3 Median - 2 Mean: Mode = 3(26) - 2(24) = 78 - 48 = 30.',
    topicTag: 'Empirical Formula',
    difficulty: 'Easy',
  },
  {
    id: 'fb-math-12',
    subjectKey: 'maths',
    chapterKeywords: ['probability', 'dice', 'card', 'coin', 'event'],
    question: 'Two unbiased dice are thrown simultaneously. What is the probability of getting a sum of 9?',
    options: [
      '1/9',
      '1/6',
      '5/36',
      '1/12',
    ],
    correctIndex: 0,
    explanation: 'Favourable pairs summing to 9 are (3,6), (4,5), (5,4), and (6,3) — 4 outcomes out of 36 total. P = 4/36 = 1/9.',
    topicTag: 'Compound Events Probability',
    difficulty: 'Medium',
  },

  // ================= SOCIAL SCIENCE / SST (087) =================
  {
    id: 'fb-sst-1',
    subjectKey: 'sst',
    chapterKeywords: ['europe', 'nationalism', 'mazzini', 'cavour', 'garibaldi', 'frankfurt'],
    question: 'Who among the following formed the secret society "Young Italy" in Marseilles to achieve Italian unification?',
    options: [
      'Count Camillo de Cavour',
      'Giuseppe Mazzini',
      'Otto von Bismarck',
      'Duke Metternich',
    ],
    correctIndex: 1,
    explanation: 'Giuseppe Mazzini founded Young Italy in Marseilles (1831) and Young Europe in Berne (1833) to champion unitary republics.',
    topicTag: 'Unification of Italy',
    difficulty: 'Easy',
  },
  {
    id: 'fb-sst-2',
    subjectKey: 'sst',
    chapterKeywords: ['india', 'nationalism', 'gandhi', 'non-cooperation', 'civil disobedience', 'dandi'],
    question: 'In which Congress session was the historic resolution of "Purna Swaraj" (Complete Independence) formalised in December 1929?',
    options: [
      'Calcutta Session',
      'Nagpur Session',
      'Lahore Session',
      'Madras Session',
    ],
    correctIndex: 2,
    explanation: 'Under the presidency of Jawaharlal Nehru at the Lahore Congress Session (Dec 1929), Purna Swaraj was declared and 26 January 1930 was celebrated as Independence Day.',
    topicTag: 'Civil Disobedience Movement',
    difficulty: 'Easy',
  },
  {
    id: 'fb-sst-3',
    subjectKey: 'sst',
    chapterKeywords: ['global', 'world', 'print', 'gutenberg', 'silk', 'martin luther'],
    question: 'Which religious reformer wrote the Ninety-Five Theses in 1517 criticising practices of the Roman Catholic Church, sparking the Protestant Reformation?',
    options: [
      'Erasmus',
      'Martin Luther',
      'Johann Gutenberg',
      'Menocchio',
    ],
    correctIndex: 1,
    explanation: 'Martin Luther’s Ninety-Five Theses (1517) spread rapidly across Europe thanks to the printing press, leading to the Protestant Reformation.',
    topicTag: 'Print Culture & Reformation',
    difficulty: 'Easy',
  },
  {
    id: 'fb-sst-4',
    subjectKey: 'sst',
    chapterKeywords: ['resource', 'soil', 'alluvial', 'black', 'laterite', 'conservation'],
    question: 'Which soil type is known as "Regur Soil", develops deep cracks during hot weather, and is ideal for growing cotton in the Deccan plateau?',
    options: [
      'Alluvial Soil',
      'Laterite Soil',
      'Black Soil',
      'Arid Soil',
    ],
    correctIndex: 2,
    explanation: 'Black (Regur) soil has high clay content and moisture-retention capacity, making it ideal for cotton cultivation across Maharashtra, Saurashtra, and Malwa.',
    topicTag: 'Classification of Soils',
    difficulty: 'Easy',
  },
  {
    id: 'fb-sst-5',
    subjectKey: 'sst',
    chapterKeywords: ['forest', 'wildlife', 'water', 'dam', 'bhakra', 'hirakud', 'agriculture'],
    question: 'Which farming practice is known as "Milpa" in Mexico and Central America and "Jhumming" in North-Eastern India?',
    options: [
      'Intensive Subsistence Farming',
      'Primitive Subsistence (Slash-and-Burn) Agriculture',
      'Commercial Plantation Farming',
      'Mixed Cropping',
    ],
    correctIndex: 1,
    explanation: 'Slash-and-burn agriculture is locally called Jhumming in North-East India, Milpa in Mexico, Roca in Brazil, and Ladang in Indonesia.',
    topicTag: 'Types of Farming',
    difficulty: 'Medium',
  },
  {
    id: 'fb-sst-6',
    subjectKey: 'sst',
    chapterKeywords: ['mineral', 'energy', 'manufacturing', 'steel', 'industry', 'map'],
    question: 'Which port on the eastern coast of India is the deepest landlocked and well-protected port, famous for handling iron ore exports?',
    options: [
      'Haldia',
      'Paradwip',
      'Vishakhapatnam',
      'Tuticorin',
    ],
    correctIndex: 2,
    explanation: 'Vishakhapatnam (Andhra Pradesh) is India’s deepest landlocked and well-protected seaport, a high-frequency CBSE Class 10 Map Work item.',
    topicTag: 'Major Seaports (Map Work)',
    difficulty: 'Medium',
  },
  {
    id: 'fb-sst-7',
    subjectKey: 'sst',
    chapterKeywords: ['power sharing', 'belgium', 'sri lanka', 'majoritarian', 'prudential'],
    question: 'Why is the "Community Government" in Belgium considered an innovative form of power sharing?',
    options: [
      'It gives veto power only to the military',
      'It is elected by people belonging to one language community (Dutch, French, or German) regardless of where they live',
      'It abolishes regional state governments completely',
      'It concentrates all cultural decisions in Brussels only',
    ],
    correctIndex: 1,
    explanation: 'Belgium’s third tier of government — Community Government — handles cultural, educational, and language issues for each linguistic group.',
    topicTag: 'Belgian Power-Sharing Model',
    difficulty: 'Medium',
  },
  {
    id: 'fb-sst-8',
    subjectKey: 'sst',
    chapterKeywords: ['federalism', 'concurrent', 'union list', 'state list', 'panchayat'],
    question: 'Subjects like Education, Forests, Trade Unions, and Marriage fall under which list of the Indian Constitution?',
    options: [
      'Union List',
      'State List',
      'Concurrent List',
      'Residuary Subjects',
    ],
    correctIndex: 2,
    explanation: 'Both Union and State governments can legislate on Concurrent List subjects (like Education and Forests); in case of conflict, Union law prevails.',
    topicTag: 'Constitutional Lists',
    difficulty: 'Easy',
  },
  {
    id: 'fb-sst-9',
    subjectKey: 'sst',
    chapterKeywords: ['political party', 'party', 'gender', 'religion', 'caste', 'democracy'],
    question: 'Which constitutional amendment in 1992 mandated at least one-third reservation of seats for women in local rural and urban bodies?',
    options: [
      '42nd Constitutional Amendment',
      '73rd & 74th Constitutional Amendments',
      '86th Constitutional Amendment',
      '101st Constitutional Amendment',
    ],
    correctIndex: 1,
    explanation: 'The 73rd (Panchayati Raj) and 74th (Municipalities) Amendments reserved one-third of all seats for women in local self-government.',
    topicTag: 'Decentralisation & Representation',
    difficulty: 'Medium',
  },
  {
    id: 'fb-sst-10',
    subjectKey: 'sst',
    chapterKeywords: ['development', 'hdi', 'per capita', 'bmi', 'sustainability'],
    question: 'Which indicator published by the UNDP compares countries based on educational levels, health status, and per capita income?',
    options: [
      'Gross Domestic Product (GDP)',
      'Human Development Index (HDI)',
      'Consumer Price Index (CPI)',
      'Net Attendance Ratio',
    ],
    correctIndex: 1,
    explanation: 'UNDP’s Human Development Report ranks countries using HDI, combining Per Capita Income (GNI), Life Expectancy, and Mean/Expected Years of Schooling.',
    topicTag: 'Human Development Index',
    difficulty: 'Easy',
  },
  {
    id: 'fb-sst-11',
    subjectKey: 'sst',
    chapterKeywords: ['sector', 'primary', 'secondary', 'tertiary', 'mgnrega', 'disguised'],
    question: 'Under MGNREGA 2005, how many days of guaranteed wage employment in a financial year are assured to rural households?',
    options: [
      '50 days',
      '100 days',
      '150 days',
      '200 days',
    ],
    correctIndex: 1,
    explanation: 'The Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA 2005) guarantees 100 days of wage employment per year in rural areas.',
    topicTag: 'Employment Creation (MGNREGA)',
    difficulty: 'Easy',
  },
  {
    id: 'fb-sst-12',
    subjectKey: 'sst',
    chapterKeywords: ['money', 'credit', 'rbi', 'shg', 'globalisation', 'wto', 'mnc'],
    question: 'Which institution supervises the functioning of formal sources of credit in India and mandates banks to maintain a minimum cash balance?',
    options: [
      'NITI Aayog',
      'SEBI',
      'Reserve Bank of India (RBI)',
      'World Trade Organisation (WTO)',
    ],
    correctIndex: 2,
    explanation: 'The RBI monitors banks’ Cash Reserve Ratio (CRR) and ensures formal loans extend not only to large businesses but also to small farmers and SHGs.',
    topicTag: 'Formal Credit & RBI',
    difficulty: 'Easy',
  },

  // ================= ENGLISH (184) =================
  {
    id: 'fb-eng-1',
    subjectKey: 'english',
    chapterKeywords: ['letter to god', 'lencho', 'postmaster', 'hailstorm'],
    question: 'In "A Letter to God", why did Lencho call the post office employees a "bunch of crooks"?',
    options: [
      'They refused to stamp his letter',
      'He received 70 pesos instead of 100 and suspected they stole the rest',
      'They laughed loudly at his handwriting',
      'They returned his letter unopened',
    ],
    correctIndex: 1,
    explanation: 'Lencho’s absolute faith in God made him believe God could never make a mistake, so he mistakenly accused the generous post office staff of stealing 30 pesos.',
    topicTag: 'Irony in A Letter to God',
    difficulty: 'Easy',
  },
  {
    id: 'fb-eng-2',
    subjectKey: 'english',
    chapterKeywords: ['mandela', 'freedom', 'apartheid', 'courage'],
    question: 'According to Nelson Mandela in "Long Walk to Freedom", what does courage truly mean?',
    options: [
      'The complete absence of fear',
      'The triumph over fear',
      'Physical strength over oppressors',
      'Avoidance of conflict at all costs',
    ],
    correctIndex: 1,
    explanation: 'Mandela learnt that courage is not the absence of fear, but the triumph over it; the brave man is not he who does not feel afraid, but he who conquers that fear.',
    topicTag: 'Nelson Mandela — Themes',
    difficulty: 'Easy',
  },
  {
    id: 'fb-eng-3',
    subjectKey: 'english',
    chapterKeywords: ['grammar', 'tense', 'modal', 'subject-verb', 'reported', 'determiner'],
    question: 'Choose the correct option to complete the sentence: "Neither the teacher nor the students ____ present in the laboratory yesterday."',
    options: [
      'was',
      'were',
      'is',
      'has been',
    ],
    correctIndex: 1,
    explanation: 'With "Neither ... nor", the verb agrees with the nearer subject ("the students", plural) and "yesterday" requires the past tense "were".',
    topicTag: 'Subject-Verb Concord',
    difficulty: 'Medium',
  },
  {
    id: 'fb-eng-4',
    subjectKey: 'english',
    chapterKeywords: ['anne frank', 'diary', 'mr keesing', 'chatterbox'],
    question: 'Why did Anne Frank say "Paper has more patience than people"?',
    options: [
      'She disliked talking to friends at school',
      'She felt she could confide her deepest feelings to her diary "Kitty" without judgment',
      'She wanted to become a famous journalist',
      'Her father forbade her from speaking at home',
    ],
    correctIndex: 1,
    explanation: 'Despite having loving family and acquaintances, Anne lacked a true confidante and found her diary Kitty to be a patient, non-judgmental listener.',
    topicTag: 'From the Diary of Anne Frank',
    difficulty: 'Easy',
  },
  {
    id: 'fb-eng-5',
    subjectKey: 'english',
    chapterKeywords: ['dust of snow', 'fire and ice', 'frost', 'tiger', 'poem'],
    question: 'In Robert Frost’s poem "Fire and Ice", what human emotions do "fire" and "ice" symbolically represent?',
    options: [
      'Courage and wisdom',
      'Uncontrolled desire and cold hatred',
      'Summer warmth and winter peace',
      'Anger and forgiveness',
    ],
    correctIndex: 1,
    explanation: 'Frost equates "fire" with passionate greed/desire and "ice" with indifference/hatred, showing both can destroy the world.',
    topicTag: 'Poetic Symbolism',
    difficulty: 'Easy',
  },
  {
    id: 'fb-eng-6',
    subjectKey: 'english',
    chapterKeywords: ['grammar', 'reported speech', 'narration', 'modal'],
    question: 'Convert to reported speech: Riya said to Aman, "Please lend me your science notes today."',
    options: [
      'Riya ordered Aman to lend her his science notes today.',
      'Riya requested Aman to lend her his science notes that day.',
      'Riya asked Aman that he should lend his science notes yesterday.',
      'Riya told Aman to please lend me your science notes that day.',
    ],
    correctIndex: 1,
    explanation: 'Requests with "Please" use reporting verb "requested + to-infinitive", pronouns change appropriately ("her", "his"), and "today" changes to "that day".',
    topicTag: 'Reported Speech',
    difficulty: 'Medium',
  },
  {
    id: 'fb-eng-7',
    subjectKey: 'english',
    chapterKeywords: ['valli', 'bus', 'buddha', 'benares', 'kisa gotami'],
    question: 'What universal truth did Kisa Gotami realise after failing to find a house where no one had ever died?',
    options: [
      'Doctors cannot cure fever',
      'Death is inevitable and common to all mortals',
      'Wealth brings peace of mind',
      'Mustard seeds are rare in Benares',
    ],
    correctIndex: 1,
    explanation: 'Watching city lights flicker out taught Kisa Gotami that human life is brief and death is universal, helping her overcome selfish grief.',
    topicTag: 'The Sermon at Benares',
    difficulty: 'Easy',
  },
  {
    id: 'fb-eng-8',
    subjectKey: 'english',
    chapterKeywords: ['tricki', 'hari singh', 'griffin', 'ebright', 'bholi'],
    question: 'What transformed Hari Singh from a thief into an honest young boy in "The Thief’s Story"?',
    options: [
      'Fear of police arrest at the railway station',
      'Anil’s unspoken trust, kindness, and promise to teach him to read and write',
      'Loss of the stolen money in the rain',
      'Advice from a stranger on the train',
    ],
    correctIndex: 1,
    explanation: 'Anil’s unconditional trust and offer of education awoke Hari Singh’s conscience, making him return the damp notes.',
    topicTag: 'Character Transformation',
    difficulty: 'Easy',
  },

  // ================= HINDI & SKILL SUBJECTS (002 / 085 / 402 / 165) =================
  {
    id: 'fb-hin-1',
    subjectKey: 'hindi',
    chapterKeywords: ['pad', 'surdas', 'tulsidas', 'netaji', 'balgobin', 'vyakaran', 'vakya'],
    question: 'रचना के आधार पर वाक्य भेद पहचानिए: "जब वर्षा हुई, तब मोर नाचने लगे।"',
    options: [
      'सरल वाक्य',
      'संयुक्त वाक्य',
      'मिश्र वाक्य',
      'आज्ञावाचक वाक्य',
    ],
    correctIndex: 2,
    explanation: 'यहाँ एक प्रधान उपवाक्य ("मोर नाचने लगे") और एक आश्रित उपवाक्य ("जब वर्षा हुई") "जब-तब" से जुड़े हैं, अतः यह मिश्र वाक्य है।',
    topicTag: 'रचना के आधार पर वाक्य भेद',
    difficulty: 'Easy',
  },
  {
    id: 'fb-hin-2',
    subjectKey: 'hindi',
    chapterKeywords: ['samas', 'alankar', 'vachya', 'pad parichay', 'hindi'],
    question: '"कमलनयन" शब्द में कौन-सा समास है? (कमल के समान नयन)',
    options: [
      'द्वंद्व समास',
      'कर्मधारय समास',
      'द्विगु समास',
      'अव्ययीभाव समास',
    ],
    correctIndex: 1,
    explanation: '"कमलनयन" में उपमान-उपमेय (विशेषण-विशेष्य) का संबंध होने के कारण कर्मधारय समास है।',
    topicTag: 'समास परिचय',
    difficulty: 'Medium',
  },
  {
    id: 'fb-skill-1',
    subjectKey: 'skill',
    chapterKeywords: ['it', '402', 'sql', 'dbms', 'spreadsheet', 'html', 'computer', 'network'],
    question: 'In a Relational Database Management System (RDBMS), which SQL constraint ensures each row in a table is uniquely identified and never NULL?',
    options: [
      'FOREIGN KEY',
      'DEFAULT',
      'PRIMARY KEY',
      'CHECK',
    ],
    correctIndex: 2,
    explanation: 'A PRIMARY KEY uniquely identifies every record in a database table and cannot contain duplicate or NULL values.',
    topicTag: 'DBMS & Primary Keys',
    difficulty: 'Easy',
  },
  {
    id: 'fb-skill-2',
    subjectKey: 'skill',
    chapterKeywords: ['html', 'css', 'internet', 'protocol', 'computer', 'ai', 'spreadsheet'],
    question: 'In LibreOffice Calc / Spreadsheet, which feature lets you test different input values backward to reach a desired target output?',
    options: [
      'Data Consolidation',
      'Goal Seek',
      'Conditional Formatting',
      'Mail Merge',
    ],
    correctIndex: 1,
    explanation: 'Goal Seek (Tools → Goal Seek) automatically calculates the required input cell value to achieve a specific formula result.',
    topicTag: 'Electronic Spreadsheet (IT 402)',
    difficulty: 'Medium',
  },
];

function createSeededRng(seedStr: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(items: T[], seedStr: string): T[] {
  const rng = createSeededRng(seedStr);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function resolveSubjectKey(subjectName: string): CuratedQuestion['subjectKey'] {
  const s = subjectName.toLowerCase();
  if (s.includes('math')) return 'maths';
  if (s.includes('social') || s.includes('sst') || s.includes('history') || s.includes('geo') || s.includes('civics') || s.includes('econ')) {
    return 'sst';
  }
  if (s.includes('english')) return 'english';
  if (s.includes('hindi') || s.includes('sanskrit')) return 'hindi';
  if (s.includes('information') || s.includes('computer') || s.includes('ai') || s.includes('artificial')) {
    return 'skill';
  }
  return 'science';
}

export function generateCuratedFallbackQuiz(params: {
  board: string;
  subjectName: string;
  chapterName: string;
  mode: 'chapter' | 'random';
  enrolledSubjectNames: string[];
  seedToken: string;
}): {
  quizTitle: string;
  questions: QuizQuestion[];
  sources: QuizSourceLink[];
} {
  const { board, subjectName, chapterName, mode, enrolledSubjectNames, seedToken } = params;
  const chapterTokens = chapterName
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3);

  let pool: CuratedQuestion[] = [];

  if (mode === 'random') {
    const allowedKeys = new Set(
      (enrolledSubjectNames.length > 0 ? enrolledSubjectNames : ['Science', 'Mathematics', 'Social Science', 'English'])
        .map(resolveSubjectKey)
    );
    const matching = CURATED_CLASS_10_BANK.filter((q) => allowedKeys.has(q.subjectKey));
    const shuffledPrimary = shuffleWithSeed(matching, seedToken);
    const remaining = shuffleWithSeed(
      CURATED_CLASS_10_BANK.filter((q) => !allowedKeys.has(q.subjectKey)),
      seedToken + '-rest'
    );
    pool = [...shuffledPrimary, ...remaining];
  } else {
    const targetKey = resolveSubjectKey(subjectName);
    const subjectItems = CURATED_CLASS_10_BANK.filter((q) => q.subjectKey === targetKey);
    const chapterMatches = subjectItems.filter((q) =>
      q.chapterKeywords.some((kw) => chapterTokens.some((tok) => kw.includes(tok) || tok.includes(kw)))
    );
    const otherSubjectItems = subjectItems.filter((q) => !chapterMatches.includes(q));
    const crossSubject = CURATED_CLASS_10_BANK.filter((q) => q.subjectKey !== targetKey);

    pool = [
      ...shuffleWithSeed(chapterMatches, seedToken + '-ch'),
      ...shuffleWithSeed(otherSubjectItems, seedToken + '-sub'),
      ...shuffleWithSeed(crossSubject, seedToken + '-all'),
    ];
  }

  const chosen = pool.slice(0, 10).map((item, idx) => ({
    id: `mcq-curated-${Date.now()}-${idx + 1}`,
    question: item.question,
    options: item.options,
    correctIndex: item.correctIndex,
    explanation: item.explanation,
    topicTag: item.topicTag,
    difficulty: item.difficulty,
  }));

  const subjectKey = resolveSubjectKey(subjectName);
  const sources: QuizSourceLink[] = [
    {
      title: 'NCERT Official Class 10 Textbooks & Exemplar',
      uri: 'https://ncert.nic.in/textbook.php',
    },
    {
      title: 'CBSE Official Sample Question Papers (Class X)',
      uri: 'https://cbseacademic.nic.in/SQP_CLASSX_2026-27.html',
    },
    ...(subjectKey === 'sst' || mode === 'random'
      ? [
          {
            title: 'Digraj Singh Rajput — Class 10 SST Study Materials',
            uri: 'https://digrajsinghrajput.com/study-materials',
          },
        ]
      : []),
    {
      title: 'CBSE Official Question Bank (Class 10)',
      uri: 'https://cbseacademic.nic.in/qbclass10.html',
    },
  ];

  return {
    quizTitle:
      mode === 'random'
        ? `Random Class 10 ${board} 10-MCQ Sprint`
        : `${chapterName} — 10-MCQ Board Sprint`,
    questions: chosen,
    sources,
  };
}
