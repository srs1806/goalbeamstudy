export type SstSectionKey =
  | 'history'
  | 'geography'
  | 'civics'
  | 'economics'
  | 'map_work';

export interface SstSectionMeta {
  key: SstSectionKey;
  label: string;
  bookTitle: string;
  marksWeightage: string;
}

export const SST_SECTIONS_META: SstSectionMeta[] = [
  {
    key: 'history',
    label: 'History',
    bookTitle: 'India and the Contemporary World – II',
    marksWeightage: '20 Marks (18 + 2 Map)',
  },
  {
    key: 'geography',
    label: 'Geography',
    bookTitle: 'Contemporary India – II',
    marksWeightage: '20 Marks (17 + 3 Map)',
  },
  {
    key: 'civics',
    label: 'Civics',
    bookTitle: 'Democratic Politics – II',
    marksWeightage: '20 Marks',
  },
  {
    key: 'economics',
    label: 'Economics',
    bookTitle: 'Understanding Economic Development',
    marksWeightage: '20 Marks',
  },
  {
    key: 'map_work',
    label: 'Map Work',
    bookTitle: 'CBSE Class 10 Complete Map Syllabus',
    marksWeightage: '5 Marks (2 History + 3 Geo)',
  },
];

export interface SstStudySheet {
  id: string;
  section: SstSectionKey;
  chapterLabel: string;
  title: string;
  subtitle: string;
  readTimeMinutes: number;
  weightageLabel: string;
  oneShotPoints: Array<{
    heading: string;
    bullets: string[];
  }>;
  mindMapBranches: Array<{
    branchTitle: string;
    nodes: string[];
  }>;
  sureShotQuestions: Array<{
    marks: '1 Mark' | '2 Marks' | '3 Marks' | '5 Marks' | 'Case-Based';
    question: string;
    answerPoints: string[];
  }>;
  videoCompanion: {
    durationLabel: string;
    searchTitle: string;
    videoSearchUrl: string;
    segments: Array<{
      topic: string;
      focus: string;
    }>;
  };
  externalReferenceUrl: string;
  externalReferenceLabel: string;
}

export interface SstMapWorkItem {
  id: string;
  subject: 'history' | 'geography';
  chapter: string;
  label: string;
  stateOrHint: string;
  taskType: 'Locate & Label' | 'Identify' | 'Area / Region';
}

export const CBSE_SST_MAP_ITEMS: SstMapWorkItem[] = [
  // =========================================================================
  // HISTORY — NATIONALISM IN INDIA (2 MARKS)
  // =========================================================================
  {
    id: 'map_hist_calcutta_1920',
    subject: 'history',
    chapter: 'INC Sessions',
    label: 'Calcutta (September 1920)',
    stateOrHint: 'West Bengal — Special session approving Non-Cooperation proposal',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_hist_nagpur_1920',
    subject: 'history',
    chapter: 'INC Sessions',
    label: 'Nagpur (December 1920)',
    stateOrHint: 'Maharashtra — Non-Cooperation programme officially adopted',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_hist_madras_1927',
    subject: 'history',
    chapter: 'INC Sessions',
    label: 'Madras (1927)',
    stateOrHint: 'Tamil Nadu (Chennai) — Resolution against Simon Commission & Poorna Swaraj demand initiated',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_hist_champaran',
    subject: 'history',
    chapter: 'National Movement Centres',
    label: 'Champaran (1917)',
    stateOrHint: 'Bihar — Indigo planters’ Satyagraha led by Mahatma Gandhi',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_hist_kheda',
    subject: 'history',
    chapter: 'National Movement Centres',
    label: 'Kheda (1917)',
    stateOrHint: 'Gujarat — Peasant Satyagraha against revenue collection after crop failure',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_hist_ahmedabad',
    subject: 'history',
    chapter: 'National Movement Centres',
    label: 'Ahmedabad (1918)',
    stateOrHint: 'Gujarat — Cotton mill workers’ Satyagraha',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_hist_amritsar',
    subject: 'history',
    chapter: 'National Movement Centres',
    label: 'Amritsar (1919)',
    stateOrHint: 'Punjab — Jallianwala Bagh incident site',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_hist_chauri_chaura',
    subject: 'history',
    chapter: 'National Movement Centres',
    label: 'Chauri Chaura (1922)',
    stateOrHint: 'Uttar Pradesh (Gorakhpur region) — Incident prompting withdrawal of Non-Cooperation',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_hist_dandi',
    subject: 'history',
    chapter: 'National Movement Centres',
    label: 'Dandi (1930)',
    stateOrHint: 'Gujarat Coast — End point of Salt March & launch of Civil Disobedience',
    taskType: 'Locate & Label',
  },

  // =========================================================================
  // GEOGRAPHY — RESOURCES, DAMS & AGRICULTURE (3 MARKS)
  // =========================================================================
  {
    id: 'map_geo_soil_types',
    subject: 'geography',
    chapter: 'Ch 1: Resources & Development',
    label: 'Major Soil Types (Alluvial, Black, Red & Yellow, Laterite, Arid, Forest)',
    stateOrHint: 'Identify shaded regions: Alluvial (Northern Plains), Black (Deccan/Maharashtra-MP), Arid (Western Rajasthan)',
    taskType: 'Identify',
  },
  {
    id: 'map_geo_dam_salal',
    subject: 'geography',
    chapter: 'Ch 3: Water Resources (Dams)',
    label: 'Salal Dam',
    stateOrHint: 'Jammu & Kashmir — Chenab River',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_geo_dam_bhakra',
    subject: 'geography',
    chapter: 'Ch 3: Water Resources (Dams)',
    label: 'Bhakra Nangal Dam',
    stateOrHint: 'Himachal Pradesh / Punjab border — Sutlej River',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_geo_dam_tehri',
    subject: 'geography',
    chapter: 'Ch 3: Water Resources (Dams)',
    label: 'Tehri Dam',
    stateOrHint: 'Uttarakhand — Bhagirathi River',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_geo_dam_rana_pratap',
    subject: 'geography',
    chapter: 'Ch 3: Water Resources (Dams)',
    label: 'Rana Pratap Sagar Dam',
    stateOrHint: 'Rajasthan — Chambal River',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_geo_dam_sardar_sarovar',
    subject: 'geography',
    chapter: 'Ch 3: Water Resources (Dams)',
    label: 'Sardar Sarovar Dam',
    stateOrHint: 'Gujarat — Narmada River',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_geo_dam_hirakud',
    subject: 'geography',
    chapter: 'Ch 3: Water Resources (Dams)',
    label: 'Hirakud Dam',
    stateOrHint: 'Odisha — Mahanadi River',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_geo_dam_nagarjuna',
    subject: 'geography',
    chapter: 'Ch 3: Water Resources (Dams)',
    label: 'Nagarjuna Sagar Dam',
    stateOrHint: 'Telangana / Andhra Pradesh border — Krishna River',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_geo_dam_tungabhadra',
    subject: 'geography',
    chapter: 'Ch 3: Water Resources (Dams)',
    label: 'Tungabhadra Dam',
    stateOrHint: 'Karnataka — Tungabhadra River',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_geo_agri_rice_wheat',
    subject: 'geography',
    chapter: 'Ch 4: Agriculture',
    label: 'Major Areas of Rice & Wheat Cultivation',
    stateOrHint: 'Rice: West Bengal, UP, Punjab, Coastal belt · Wheat: Punjab, Haryana, Western UP, MP',
    taskType: 'Identify',
  },
  {
    id: 'map_geo_agri_cash_crops',
    subject: 'geography',
    chapter: 'Ch 4: Agriculture',
    label: 'Largest Producing States: Sugarcane, Tea, Coffee, Rubber, Cotton, Jute',
    stateOrHint: 'Sugarcane (UP) · Tea (Assam) · Coffee (Karnataka) · Rubber (Kerala) · Cotton (Gujarat/Maharashtra) · Jute (West Bengal)',
    taskType: 'Identify',
  },

  // =========================================================================
  // GEOGRAPHY — MINERALS & POWER PLANTS
  // =========================================================================
  {
    id: 'map_geo_iron_ores',
    subject: 'geography',
    chapter: 'Ch 5: Iron Ore Mines',
    label: 'Mayurbhanj, Durg, Bailadila, Bellary, Kudremukh',
    stateOrHint: 'Odisha (Mayurbhanj) · Chhattisgarh (Durg, Bailadila) · Karnataka (Bellary, Kudremukh)',
    taskType: 'Identify',
  },
  {
    id: 'map_geo_coal_mines',
    subject: 'geography',
    chapter: 'Ch 5: Coal Mines',
    label: 'Raniganj, Bokaro, Talcher, Neyveli',
    stateOrHint: 'West Bengal (Raniganj) · Jharkhand (Bokaro) · Odisha (Talcher) · Tamil Nadu (Neyveli)',
    taskType: 'Identify',
  },
  {
    id: 'map_geo_oil_fields',
    subject: 'geography',
    chapter: 'Ch 5: Oil Fields',
    label: 'Digboi, Naharkatia, Mumbai High, Bassien, Kalol, Ankaleshwar',
    stateOrHint: 'Assam (Digboi, Naharkatia) · Arabian Sea Offshore (Mumbai High, Bassien) · Gujarat (Kalol, Ankaleshwar)',
    taskType: 'Identify',
  },
  {
    id: 'map_geo_thermal_plants',
    subject: 'geography',
    chapter: 'Ch 5: Thermal Power Plants',
    label: 'Namrup, Singrauli, Ramagundam',
    stateOrHint: 'Assam (Namrup) · Madhya Pradesh (Singrauli) · Telangana (Ramagundam)',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_geo_nuclear_plants',
    subject: 'geography',
    chapter: 'Ch 5: Nuclear Power Plants',
    label: 'Narora, Kakrapara, Tarapur, Kalpakkam',
    stateOrHint: 'Uttar Pradesh (Narora) · Gujarat (Kakrapara) · Maharashtra (Tarapur) · Tamil Nadu (Kalpakkam)',
    taskType: 'Locate & Label',
  },

  // =========================================================================
  // GEOGRAPHY — MANUFACTURING INDUSTRIES & LIFELINES
  // =========================================================================
  {
    id: 'map_geo_cotton_textile',
    subject: 'geography',
    chapter: 'Ch 6: Cotton Textile Industries',
    label: 'Mumbai, Indore, Surat, Kanpur, Coimbatore',
    stateOrHint: 'Maharashtra (Mumbai) · MP (Indore) · Gujarat (Surat) · UP (Kanpur) · Tamil Nadu (Coimbatore)',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_geo_iron_steel',
    subject: 'geography',
    chapter: 'Ch 6: Iron & Steel Plants',
    label: 'Durgapur, Bokaro, Jamshedpur, Bhilai, Vijayanagar, Salem',
    stateOrHint: 'WB (Durgapur) · Jharkhand (Bokaro, Jamshedpur) · Chhattisgarh (Bhilai) · Karnataka (Vijayanagar) · TN (Salem)',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_geo_software_parks',
    subject: 'geography',
    chapter: 'Ch 6: Software Technology Parks',
    label: 'Noida, Gandhinagar, Mumbai, Pune, Hyderabad, Bengaluru, Chennai, Thiruvananthapuram',
    stateOrHint: 'NCR/UP (Noida) · Gujarat (Gandhinagar) · MH (Mumbai, Pune) · Telangana (Hyderabad) · KA (Bengaluru) · TN (Chennai) · KL (Thiruvananthapuram)',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_geo_sea_ports',
    subject: 'geography',
    chapter: 'Ch 7: Major Sea Ports',
    label: 'Kandla, Mumbai, Marmagao, New Mangalore, Kochi, Tuticorin, Chennai, Vishakhapatnam, Paradip, Haldia',
    stateOrHint: 'West Coast: Kandla (GJ), Mumbai (MH), Marmagao (GA), New Mangalore (KA), Kochi (KL) · East Coast: Tuticorin & Chennai (TN), Vizag (AP), Paradip (OD), Haldia (WB)',
    taskType: 'Locate & Label',
  },
  {
    id: 'map_geo_airports',
    subject: 'geography',
    chapter: 'Ch 7: International Airports',
    label: 'Amritsar (Raja Sansi), Delhi (Indira Gandhi), Mumbai (Chhatrapati Shivaji), Chennai (Meenambakkam), Kolkata (Netaji SC Bose), Hyderabad (Rajiv Gandhi)',
    stateOrHint: 'Major Metro Hubs: Amritsar · New Delhi · Mumbai · Chennai · Kolkata · Hyderabad',
    taskType: 'Locate & Label',
  },
];

export const SST_STUDY_SHEETS: Record<string, SstStudySheet> = {
  // =========================================================================
  // HISTORY SHEETS
  // =========================================================================
  sst_hist_europe_oneshot: {
    id: 'sst_hist_europe_oneshot',
    section: 'history',
    chapterLabel: 'History Ch 1',
    title: 'The Rise of Nationalism in Europe — One-Shot Notes & Mind Map',
    subtitle: 'Complete timeline from 1789 French Revolution to German/Italian Unification & Imperialism',
    readTimeMinutes: 12,
    weightageLabel: 'High-Yield (5–6 Marks)',
    oneShotPoints: [
      {
        heading: '1. French Revolution & The Idea of the Nation (1789)',
        bullets: [
          'Collective identity built via La Patrie (fatherland) and Le Citoyen (the citizen), new tricolour flag, Estate General renamed National Assembly, uniform weights & measures.',
          'Napoleon’s Civil Code of 1804 abolished feudal privileges, established equality before law, and secured the right to property.',
        ],
      },
      {
        heading: '2. Liberalism, Conservatism (1815) & Revolutionaries',
        bullets: [
          'Treaty of Vienna (1815) hosted by Duke Metternich restored the Bourbon dynasty and redrew boundaries to contain France.',
          'Giuseppe Mazzini founded Young Italy (Marseilles) and Young Europe (Berne); Metternich called him the most dangerous enemy of social order.',
        ],
      },
      {
        heading: '3. Age of Revolutions (1830–1848) & Romanticism',
        bullets: [
          'Romanticism emphasized culture, folk songs (Das Volk by Herder), and vernacular language (Polish resistance).',
          '1848 Frankfurt Parliament: 831 elected representatives offered the crown to Friedrich Wilhelm IV of Prussia, who rejected it.',
        ],
      },
      {
        heading: '4. Unification of Germany, Italy & Strange Case of Britain',
        bullets: [
          'Germany (1866–1871): Otto von Bismarck fought three wars over seven years (Austria, Denmark, France); Kaiser William I proclaimed Emperor at Versailles (Jan 1871).',
          'Italy (1861): Count Cavour (diplomacy + France alliance), Garibaldi (Red Shirts in Two Sicilies), and Victor Emmanuel II proclaimed King.',
          'Britain: Formed via slow parliamentary process; Act of Union (1707) united England & Scotland; Ireland incorporated (1801).',
        ],
      },
    ],
    mindMapBranches: [
      {
        branchTitle: 'Core Ideologies',
        nodes: ['Frederic Sorrieu (1848 Utopian Print)', 'Napoleonic Code (1804)', 'Zollverein (1834 Customs Union)', 'Treaty of Vienna (1815 Conservatism)'],
      },
      {
        branchTitle: 'Unification Architects',
        nodes: ['Bismarck -> Germany (Blood & Iron)', 'Cavour + Mazzini + Garibaldi -> Italy', 'Act of Union 1707 -> United Kingdom'],
      },
      {
        branchTitle: 'Visualizing & Conflict',
        nodes: ['Allegories: Marianne (France), Germania (Germany)', 'Balkans Tension (1871+ Powder Keg)', 'Imperialism -> Triggered WWI (1914)'],
      },
    ],
    sureShotQuestions: [
      {
        marks: '5 Marks',
        question: 'Explain the measures and practices introduced by French revolutionaries to create a sense of collective identity.',
        answerPoints: [
          'La Patrie and Le Citoyen emphasized a united community enjoying equal rights.',
          'Replaced the royal standard with a new tricolour French flag.',
          'Elected Estates General by active citizens and renamed it the National Assembly.',
          'Composed new hymns, took oaths, and commemorated martyrs in the name of the nation.',
          'Abolished internal customs duties and adopted a uniform system of weights and measures.',
        ],
      },
      {
        marks: '5 Marks',
        question: 'Briefly trace the process of German unification.',
        answerPoints: [
          '1848 liberal middle-class initiative at Frankfurt Parliament was repressed by monarchy, military, and Junkers.',
          'Prussia took leadership under Chief Minister Otto von Bismarck.',
          'Three wars over 7 years with Austria, Denmark, and France ended in Prussian victory.',
          'January 1871: Prussian King William I proclaimed German Emperor at the Hall of Mirrors, Versailles.',
          'Modernized currency, banking, legal, and judicial systems across Germany.',
        ],
      },
      {
        marks: '3 Marks',
        question: 'Why did nationalist tensions emerge in the Balkans?',
        answerPoints: [
          'Ethnic & geographical diversity under the declining Ottoman Empire (Slavs).',
          'Romantic nationalism ideals spread across Balkan nationalities claiming historical independence.',
          'Intense rivalry among European Big Powers (Russia, Germany, England, Austro-Hungary) over Balkan trade and control led to WWI.',
        ],
      },
    ],
    videoCompanion: {
      durationLabel: '45 Min One-Shot Companion',
      searchTitle: 'Class 10 History Ch 1 Rise of Nationalism in Europe One Shot CBSE Revision',
      videoSearchUrl: 'https://www.youtube.com/results?search_query=Class+10+History+Chapter+1+Rise+of+Nationalism+in+Europe+One+Shot+CBSE',
      segments: [
        { topic: 'Sorrieu Vision & Napoleonic Code', focus: 'Focus on 1804 administrative reforms & mixed reactions in conquered territories' },
        { topic: '1815 Conservatism & Secret Societies', focus: 'Metternich’s Vienna Congress & Mazzini’s role' },
        { topic: '1830–1848 & Silesian Weavers', focus: 'Greek War of Independence (1832 Treaty of Constantinople) & 1848 Hunger & Hardship' },
        { topic: 'Germany, Italy, Britain & Balkans', focus: 'Compare unification steps & Marianne vs Germania symbols' },
      ],
    },
    externalReferenceUrl: 'https://digrajsinghrajput.com/study-materials',
    externalReferenceLabel: 'digrajsinghrajput.com Study Materials',
  },

  sst_hist_india_oneshot: {
    id: 'sst_hist_india_oneshot',
    section: 'history',
    chapterLabel: 'History Ch 2',
    title: 'Nationalism in India — One-Shot Notes, Timeline & Map Links',
    subtitle: 'WWI Impact, Non-Cooperation (1921), Civil Disobedience (1930) & Collective Belonging',
    readTimeMinutes: 14,
    weightageLabel: '8 Marks (6 Theory + 2 Map)',
    oneShotPoints: [
      {
        heading: '1. Satyagraha & Rowlatt Act Agitation (1915–1919)',
        bullets: [
          'Three early Satyagrahas: Champaran (1917, indigo peasants), Kheda (1917, crop failure), Ahmedabad (1918, cotton mill workers).',
          'Rowlatt Act (1919) allowed 2-year detention without trial; triggered Jallianwala Bagh Massacre (13 April 1919) by General Dyer.',
          'Khilafat issue merged Hindu-Muslim unity into the Non-Cooperation Movement (adopted at Nagpur Session, Dec 1920).',
        ],
      },
      {
        heading: '2. Differing Strands within Non-Cooperation (1921–1922)',
        bullets: [
          'Towns: Boycott of schools, courts, council elections (except Justice Party Madras), and foreign cloth; Khadi was costlier.',
          'Awadh Peasants (Baba Ramchandra) & Gudem Hills Tribals (Alluri Sitaram Raju) fought oppressive landlords/forest laws.',
          'Assam Plantation Workers defied the Inland Emigration Act (1859). Withdrawn after Chauri Chaura (Feb 1922).',
        ],
      },
      {
        heading: '3. Civil Disobedience Movement (1930–1934)',
        bullets: [
          'Simon Commission (1928) boycotted ("Go Back Simon"); Lahore Congress (Dec 1929) demanded Poorna Swaraj (26 Jan 1930).',
          'Dandi Salt March: 78 volunteers, 240 miles from Sabarmati to Dandi (6 April 1930).',
          'Participation: Rich peasants (Patidars/Jats), Industrialists (FICCI, Purshottamdas Thakurdas), Women; Limitations: Dalit reservations (Poona Pact 1932) and Muslim alienation.',
        ],
      },
    ],
    mindMapBranches: [
      {
        branchTitle: 'NCM (1921–22)',
        nodes: ['Non-Cooperation + Khilafat', 'Towns Boycott -> Slowdown due to Khadi cost', 'Awadh (Oudh Kisan Sabha)', 'Gudem Hills (Raju guerrilla struggle)', 'Chauri Chaura -> Withdrawn'],
      },
      {
        branchTitle: 'CDM (1930–34)',
        nodes: ['11 Demands + Salt March (240 mi)', 'Break Colonial Laws (Not just refuse cooperation)', 'Gandhi-Irwin Pact (1931)', 'Poona Pact (1932) Separate Electorates vs Reserved Seats'],
      },
      {
        branchTitle: 'Collective Belonging',
        nodes: ['Bharat Mata Image (Abanindranath Tagore)', 'Vande Mataram (Bankim Chandra)', 'Folklore Revival (Tagore & Natesa Sastri)', 'Swaraj Flag (Red, Green, White + Spinning Wheel)'],
      },
    ],
    sureShotQuestions: [
      {
        marks: '5 Marks',
        question: 'Compare the Non-Cooperation Movement and the Civil Disobedience Movement.',
        answerPoints: [
          'Non-Cooperation (1921): Objective was Swaraj through refusal to cooperate with British institutions; Civil Disobedience (1930): Objective was Poorna Swaraj by actively breaking colonial laws (Salt Law).',
          'Muslim participation was high during NCM due to Khilafat alliance, whereas it declined during CDM due to growing communal divide.',
          'Large-scale participation of women took place during Civil Disobedience.',
        ],
      },
      {
        marks: '3 Marks',
        question: 'Explain the significance of the Salt March as an effective symbol of resistance against colonialism.',
        answerPoints: [
          'Salt was consumed equally by rich and poor alike, making it an essential item of food.',
          'British monopoly and tax on salt exposed the most oppressive face of colonial rule.',
          'Gandhiji sent 11 demands to Viceroy Irwin; salt unified all classes and regions into mass Civil Disobedience.',
        ],
      },
      {
        marks: '5 Marks',
        question: 'How did cultural processes help create a sense of collective belonging among Indians?',
        answerPoints: [
          'Allegory of Bharat Mata painted by Abanindranath Tagore as a calm, divine, ascetic figure.',
          'Revival of Indian folklore by Rabindranath Tagore (Bengal) and Natesa Sastri (Madras: The Folklore of Southern India).',
          'Icons and Flags: Swadeshi tri-colour (red, green, yellow) and Swaraj flag (1921) with spinning wheel.',
          'Reinterpretation of ancient Indian history highlighting achievements in art, science, and trade.',
        ],
      },
    ],
    videoCompanion: {
      durationLabel: '50 Min One-Shot Companion',
      searchTitle: 'Nationalism in India Class 10 History Full Chapter One Shot CBSE Revision',
      videoSearchUrl: 'https://www.youtube.com/results?search_query=Nationalism+in+India+Class+10+History+One+Shot+CBSE',
      segments: [
        { topic: 'WWI, Rowlatt Act & Jallianwala Bagh', focus: 'Exact years 1917–1919 + Khilafat merger' },
        { topic: 'Three Strands of NCM', focus: 'Towns vs Awadh vs Gudem Hills vs Assam' },
        { topic: 'Simon Commission to Salt March', focus: 'Lahore 1929 Poorna Swaraj & 11 Demands' },
        { topic: 'Poona Pact & Cultural Nationalism', focus: 'Poona Pact Sept 1932 + All 9 CBSE Map Points' },
      ],
    },
    externalReferenceUrl: 'https://digrajsinghrajput.com/study-materials',
    externalReferenceLabel: 'digrajsinghrajput.com Study Materials',
  },

  sst_hist_print_global_oneshot: {
    id: 'sst_hist_print_global_oneshot',
    section: 'history',
    chapterLabel: 'History Ch 3 & Ch 5',
    title: 'Making of Global World (Subtopic 1–1.3) & Print Culture — Rapid Notes',
    subtitle: 'Silk Routes, Food Travels, Gutenberg Press, Religious Debate & Print in India',
    readTimeMinutes: 11,
    weightageLabel: '5–6 Marks',
    oneShotPoints: [
      {
        heading: '1. Making of a Global World (Pre-Modern World — Board Scope)',
        bullets: [
          'Silk Routes connected Asia with Europe and Northern Africa long before the Christian era (silk, pottery, spices, Buddhism).',
          'Food Travels: Spaghetti/noodles, potatoes, soya, groundnuts, maize, tomatoes introduced via Americas after Columbus.',
          'Conquest, Disease & Trade: Spanish conquest of America aided hugely by Smallpox germs against which indigenous inhabitants had zero immunity.',
        ],
      },
      {
        heading: '2. Print Culture: East Asia to Europe (Gutenberg Press)',
        bullets: [
          'Earliest hand-printing originated in China, Japan (Buddhist Diamond Sutra 868 CE, Ukiyo art), and Korea.',
          'Marco Polo brought woodblock printing from China to Italy (1295); Johann Gutenberg invented the movable metal printing press in Strasbourg (1430s, first book: Bible).',
          'Print Revolution enabled Martin Luther’s 95 Theses (1517, Protestant Reformation) and Fear of Print (Index of Prohibited Books 1558).',
        ],
      },
      {
        heading: '3. Print Comes to India & Social Reform',
        bullets: [
          'First printing press came to Goa with Portuguese missionaries (1556). First Tamil book printed at Cochin (1579).',
          'James Augustus Hickey edited Bengal Gazette (1780). Rammohun Roy published Sambad Kaumudi (1821); orthodox response: Samachar Chandrika.',
          'Women & Print: Rashsundari Debi wrote Amar Jiban (1876, first full autobiography in Bengali); Jyotiba Phule wrote Gulamgiri (1871). Vernacular Press Act (1878) censored nationalist newspapers.',
        ],
      },
    ],
    mindMapBranches: [
      {
        branchTitle: 'Pre-Modern Global World',
        nodes: ['Silk Routes (Trade + Faith)', 'New Crops (Potato -> Europe)', 'Columbian Exchange & Smallpox', 'Shift of Trade Centre from Asia to Europe'],
      },
      {
        branchTitle: 'Print Revolution Europe',
        nodes: ['Woodblock (China -> Europe)', 'Gutenberg 1430s (Olive press model)', 'Luther 95 Theses (Reformation)', 'Penny Chapbooks & Bibliotheque Bleue'],
      },
      {
        branchTitle: 'India & Print Censorship',
        nodes: ['Bengal Gazette (1780)', 'Social Reformers (Rammohun, Phule, Ambedkar)', 'Women Writers (Rashsundari, Pandita Ramabai, Kailashbashini)', 'Vernacular Press Act (1878)'],
      },
    ],
    sureShotQuestions: [
      {
        marks: '3 Marks',
        question: 'How did the Vernacular Press Act of 1878 restrict Indian newspapers?',
        answerPoints: [
          'Modeled on Irish Press Laws; gave British government extensive rights to censor reports and editorials.',
          'Regular track kept on vernacular papers; warning issued if a report was judged seditious.',
          'If ignored, press could be seized and printing machinery confiscated.',
        ],
      },
      {
        marks: '3 Marks',
        question: 'Explain how smallpox proved to be a powerful weapon for European conquerors in America.',
        answerPoints: [
          'Europeans carried smallpox germs unknowingly to the Americas.',
          'Because of long isolation, native Americans lacked natural immunity.',
          'The disease spread rapidly ahead of Spanish troops, decimating whole communities without armed combat.',
        ],
      },
      {
        marks: '5 Marks',
        question: 'Why did some religious authorities and monarchs fear the spread of print culture?',
        answerPoints: [
          'Wide circulation allowed rebellious, irreligious thoughts to spread if uncontrolled.',
          'Scholars & monarchs feared the authority of valuable literature and established church dogma would collapse.',
          'Example: Manocchio in Italy reinterpreted the Bible and was executed; Catholic Church maintained the Index of Prohibited Books (1558).',
        ],
      },
    ],
    videoCompanion: {
      durationLabel: '35 Min Rapid Revision',
      searchTitle: 'Print Culture and Modern World Class 10 History One Shot CBSE Revision',
      videoSearchUrl: 'https://www.youtube.com/results?search_query=Print+Culture+and+the+Modern+World+Class+10+One+Shot+CBSE',
      segments: [
        { topic: 'Silk Routes & Smallpox (Ch 3 Scope)', focus: 'Strictly board syllabus sections 1–1.3' },
        { topic: 'Gutenberg & Print Revolution', focus: 'Oral culture to reading public + Luther & Erasmus' },
        { topic: 'India: Reformers, Women & Censorship', focus: 'Author–Book table (Amar Jiban, Gulamgiri, Kesari)' },
      ],
    },
    externalReferenceUrl: 'https://digrajsinghrajput.com/study-materials',
    externalReferenceLabel: 'digrajsinghrajput.com Study Materials',
  },

  // =========================================================================
  // GEOGRAPHY SHEETS
  // =========================================================================
  sst_geo_resources_water_oneshot: {
    id: 'sst_geo_resources_water_oneshot',
    section: 'geography',
    chapterLabel: 'Geo Ch 1, 2 & 3',
    title: 'Resources, Forest & Wildlife, and Water Resources — One-Shot Notes',
    subtitle: 'Soil Classification, Conservation Movements (Chipko, JFM) & Multi-Purpose Dams',
    readTimeMinutes: 13,
    weightageLabel: '7–8 Marks (incl. Soil & Dam Map)',
    oneShotPoints: [
      {
        heading: '1. Resources & Soil Classification (Ch 1)',
        bullets: [
          'Resource Planning: Identification & Inventory -> Planning structure -> Matching with National Development Plans. Rio Earth Summit 1992 (Agenda 21).',
          'Alluvial Soil (Khadar new fertile / Bangar old kankar), Black Regur Soil (cotton, self-ploughing cracks, Deccan), Red & Yellow, Laterite (leaching, tea/coffee), Arid (sandy/saline), Forest.',
          'Soil Conservation: Contour ploughing, Terrace farming, Strip cropping, Shelter belts.',
        ],
      },
      {
        heading: '2. Forest & Wildlife Conservation (Ch 2)',
        bullets: [
          'Indian Wildlife Protection Act (1972); Project Tiger launched in 1973.',
          'Forest Categories: Reserved Forests (>50%), Protected Forests (nearly 1/3rd), Unclassed Forests (NE states & Gujarat communities).',
          'Community Conservation: Sariska villagers against mining, Bhairodev Dakav Sonchuri (Alwar), Chipko Movement, Beej Bachao Andolan, Joint Forest Management (JFM 1988, Odisha).',
        ],
      },
      {
        heading: '3. Water Resources & Rainwater Harvesting (Ch 3)',
        bullets: [
          'Jawaharlal Nehru called multi-purpose dams the "Temples of Modern India".',
          'Criticism of large dams: Submergence of forests, displacement of locals, river fragmentation, inter-state disputes, induced earthquakes/salinization.',
          'Traditional Harvesting: Guls/Kuls (W. Himalayas), Rooftop harvesting & Tankas (Bikaner/Phalodi/Barmer), Khadins (Jaisalmer), Johads, Bamboo Drip Irrigation (Meghalaya), Tamil Nadu compulsory rooftop harvesting.',
        ],
      },
    ],
    mindMapBranches: [
      {
        branchTitle: '6 Major Soils of India',
        nodes: ['Alluvial (Indo-Gangetic, Khadar/Bangar)', 'Black/Regur (Deccan Lava, Moisture retentive)', 'Red & Yellow (Iron diffusion)', 'Laterite (Heavy rain leaching)', 'Arid & Forest'],
      },
      {
        branchTitle: 'Forest Conservation',
        nodes: ['Wildlife Act 1972 + Project Tiger 1973', 'Reserved > Protected > Unclassed', 'Chipko & Beej Bachao Andolan', 'JFM (Odisha 1988)'],
      },
      {
        branchTitle: 'Water & Dams',
        nodes: ['Causes: Over-exploitation, unequal access, pollution', '8 CBSE Dams (Salal to Tungabhadra)', 'Tankas (Rajasthan) & Bamboo Drip (Meghalaya)'],
      },
    ],
    sureShotQuestions: [
      {
        marks: '5 Marks',
        question: 'Distinguish between Khadar and Bangar alluvial soils and explain any three ways to check soil erosion.',
        answerPoints: [
          'Khadar is new alluvium deposited by floods with fine particles and high fertility; Bangar is older alluvium above floodplains with higher kankar nodules.',
          'Conservation methods: (1) Contour ploughing along slope lines, (2) Terrace cultivation on Himalayan/western slopes, (3) Strip cropping & Shelter belts in arid regions.',
        ],
      },
      {
        marks: '3 Marks',
        question: 'Why are multi-purpose river valley projects facing opposition in recent years?',
        answerPoints: [
          'Regulating and damming affects natural river flow causing excessive sedimentation at reservoirs and poorer aquatic habitats.',
          'Large-scale displacement of local communities without adequate rehabilitation.',
          'Triggered floods due to sedimentation and shifted cropping patterns toward water-intensive crops causing soil salinisation.',
        ],
      },
    ],
    videoCompanion: {
      durationLabel: '40 Min Geo Revision',
      searchTitle: 'Resources and Development Water Resources Class 10 Geography One Shot CBSE',
      videoSearchUrl: 'https://www.youtube.com/results?search_query=Class+10+Geography+Resources+Forest+Water+Resources+One+Shot+CBSE',
      segments: [
        { topic: 'Agenda 21 & Land Degradation', focus: 'Mining/Over-irrigation states table' },
        { topic: 'All 6 Soils & Conservation', focus: 'Exact crops and regions per soil' },
        { topic: 'Water Scarcity & 8 CBSE Map Dams', focus: 'Tankas in Rajasthan vs Bamboo Drip' },
      ],
    },
    externalReferenceUrl: 'https://digrajsinghrajput.com/study-materials',
    externalReferenceLabel: 'digrajsinghrajput.com Study Materials',
  },

  sst_geo_agri_minerals_mfg_oneshot: {
    id: 'sst_geo_agri_minerals_mfg_oneshot',
    section: 'geography',
    chapterLabel: 'Geo Ch 4, 5 & 6',
    title: 'Agriculture, Minerals & Energy, and Manufacturing Industries — One-Shot Pack',
    subtitle: 'Cropping Seasons, Crop Conditions, Minerals Classification, Conventional vs Non-Conventional & Industrial Pollution',
    readTimeMinutes: 15,
    weightageLabel: '12 Marks (incl. Map Work)',
    oneShotPoints: [
      {
        heading: '1. Agriculture: Farming Types & Cropping Seasons (Ch 4)',
        bullets: [
          'Subsistence (Primitive Jhumming vs Intensive) vs Commercial Farming (Plantation: tea, coffee, rubber).',
          'Rabi (Oct–Dec sown, Apr–Jun harvested: Wheat, Barley, Peas, Gram, Mustard), Kharif (Monsoon–Sept/Oct: Paddy, Maize, Jowar, Bajra, Tur, Cotton, Jute), Zaid (Summer: Watermelon, Muskmelon, Cucumber).',
          'Reforms: KCC, PAIS, MSP, Crop Insurance, Bhoodan–Gramdan (Vinoba Bhave).',
        ],
      },
      {
        heading: '2. Minerals & Energy Resources (Ch 5)',
        bullets: [
          'Minerals occur in Veins/Lodes (igneous/metamorphic), Beds/Layers (sedimentary coal), Residual mass (bauxite), Alluvial placer deposits (gold/tin).',
          'Ferrous (Iron ore: Magnetite 70% magnetic, Hematite industrial; Manganese for steel), Non-Ferrous (Copper, Bauxite/Alumina), Non-Metallic (Mica, Limestone).',
          'Energy: Coal (Peat < Lignite < Bituminous < Anthracite), Petroleum (Mumbai High 63%, Gujarat 18%, Assam 16%), Solar, Wind, Biogas, Tidal, Geothermal (Manikaran, Puga Valley).',
        ],
      },
      {
        heading: '3. Manufacturing Industries & Pollution Control (Ch 6)',
        bullets: [
          'Agro-based (Cotton Textile, Jute Hugli belt, Sugar shifting to South/West India due to higher sucrose & cooperatives) vs Mineral-based (Chotanagpur Iron & Steel, Aluminium smelting, Fertilizers, IT/Electronics Bengaluru).',
          'Control Pollution: Particulate filters (ESP), reusing/recycling process water in 2+ stages, rainwater harvesting, acoustic silencers/generators.',
        ],
      },
    ],
    mindMapBranches: [
      {
        branchTitle: 'Rabi · Kharif · Zaid',
        nodes: ['Rabi -> Wheat, Mustard, Gram', 'Kharif -> Rice, Cotton, Jute, Maize', 'Zaid -> Watermelon, Cucumber'],
      },
      {
        branchTitle: 'Minerals & Coal Grades',
        nodes: ['Hematite vs Magnetite Iron Ore', 'Coal: Peat < Lignite (Neyveli) < Bituminous < Anthracite', 'Non-Conventional: Solar, Wind, Geothermal'],
      },
      {
        branchTitle: 'Industry Shifts & Solutions',
        nodes: ['Sugar Mills shifting South/Maharashtra', 'Jute concentrated on Hugli river', 'NTPC EMS ISO 14001 proactive green approach'],
      },
    ],
    sureShotQuestions: [
      {
        marks: '5 Marks',
        question: 'Explain any five institutional and technological reforms introduced in Indian agriculture after Independence.',
        answerPoints: [
          'Collectivisation, consolidation of land holdings, and abolition of Zamindari in First Five Year Plan.',
          'Green Revolution and White Revolution (Operation Flood) boosted production using HYV seeds and irrigation.',
          'Comprehensive Land Development Programme (1980s–90s): Crop insurance against drought, flood, fire.',
          'Grameen Banks and cooperative societies for low-interest loans.',
          'Kisan Credit Card (KCC), Personal Accident Insurance Scheme (PAIS), Minimum Support Price (MSP).',
        ],
      },
      {
        marks: '3 Marks',
        question: 'Why is the sugar industry shifting towards southern and western states like Maharashtra?',
        answerPoints: [
          'Cane produced in southern/western states has higher sucrose content.',
          'Cooler coastal climate ensures a longer crushing season.',
          'Cooperative sugar mills are more successful in these states.',
        ],
      },
      {
        marks: '3 Marks',
        question: 'How can industrial pollution of fresh water be reduced?',
        answerPoints: [
          'Minimizing water use by reusing and recycling in two or more successive stages.',
          'Harvesting rainwater to meet industrial water requirements.',
          'Treating hot water and effluents in three phases (primary mechanical, secondary biological, tertiary chemical/physical) before releasing into rivers.',
        ],
      },
    ],
    videoCompanion: {
      durationLabel: '55 Min Geo Marathon',
      searchTitle: 'Agriculture Minerals Manufacturing Industries Class 10 Geography One Shot CBSE',
      videoSearchUrl: 'https://www.youtube.com/results?search_query=Agriculture+Minerals+Manufacturing+Industries+Class+10+One+Shot+CBSE',
      segments: [
        { topic: 'Crops Temperature & Rainfall Matrix', focus: 'Rice 25C/100cm+, Wheat 50-75cm, Cotton 210 frost-free days' },
        { topic: 'Modes of Occurrence & Coal/Iron Belts', focus: 'Odisha-Jharkhand & Durg-Bastar-Chandrapur belts' },
        { topic: 'NTPC Pro-Active Approach & Ch 7 Scope', focus: 'Zero liquid waste + Ch 7 map-only ports & airports' },
      ],
    },
    externalReferenceUrl: 'https://digrajsinghrajput.com/study-materials',
    externalReferenceLabel: 'digrajsinghrajput.com Study Materials',
  },

  // =========================================================================
  // CIVICS SHEETS
  // =========================================================================
  sst_civics_power_federalism_oneshot: {
    id: 'sst_civics_power_federalism_oneshot',
    section: 'civics',
    chapterLabel: 'Civics Ch 1 & Ch 2',
    title: 'Power Sharing & Federalism — One-Shot Notes, Mind Map & PYQs',
    subtitle: 'Belgium vs Sri Lanka, Prudential vs Moral Reasons, 3 Legislative Lists & 1992 Decentralisation',
    readTimeMinutes: 12,
    weightageLabel: '8–10 Marks',
    oneShotPoints: [
      {
        heading: '1. Belgium Accommodation vs Sri Lanka Majoritarianism (Ch 1)',
        bullets: [
          'Sri Lanka (1948 independence): 1956 Act made Sinhala only official language, favoured Sinhalas in university/govt jobs, protected Buddhism -> alienation of Tamils and civil war.',
          'Belgium (4 amendments 1970–93): Equal Dutch & French ministers at central level, state governments not subordinate to Centre, equal representation in Brussels, plus elected Community Government.',
          'Forms of Power Sharing: Horizontal (Legislature, Executive, Judiciary), Vertical (Union, State, Local), Social Groups (Reservation), Political Parties & Pressure Groups.',
        ],
      },
      {
        heading: '2. Federalism & Legislative Lists in India (Ch 2)',
        bullets: [
          'Coming Together (USA, Switzerland, Australia — equal states) vs Holding Together (India, Spain, Belgium — Centre more powerful).',
          'Union List (Defence, Foreign Affairs, Banking, Currency), State List (Police, Trade, Agriculture, Irrigation), Concurrent List (Education, Forests, Marriage, Adoption — Union prevails on conflict). Residuary subjects (IT/Cyber) with Union.',
          'Linguistic States, Language Policy (Hindi + 21 Scheduled Languages, English continued), Centre-State Relations post-1990 Coalition era.',
        ],
      },
      {
        heading: '3. Decentralisation in India (1992 Amendment)',
        bullets: [
          'Mandatory regular elections to local bodies; 1/3rd seats reserved for women + SC/ST/OBC reservation; Independent State Election Commission; State Governments share revenue.',
          'Rural: Gram Sabha -> Gram Panchayat (Sarpanch) -> Panchayat Samiti -> Zilla Parishad. Urban: Municipalities & Municipal Corporations (Mayor).',
        ],
      },
    ],
    mindMapBranches: [
      {
        branchTitle: 'Power Sharing Forms',
        nodes: ['Horizontal (Checks & Balances)', 'Vertical (Federal Tiers)', 'Social Groups (Reserved Constituencies)', 'Coalition Governments & Pressure Groups'],
      },
      {
        branchTitle: '3 Federal Lists',
        nodes: ['Union List (Defence, Currency)', 'State List (Police, Agriculture)', 'Concurrent List (Education, Forest)', 'Residuary (Software / New Subjects -> Union)'],
      },
      {
        branchTitle: '1992 Local Governance',
        nodes: ['Mandatory Elections every 5 yrs', '1/3rd Seats for Women', 'State Election Commission', 'Gram Sabha -> Panchayat -> Zilla Parishad'],
      },
    ],
    sureShotQuestions: [
      {
        marks: '5 Marks',
        question: 'Explain the major steps taken in 1992 to make the third tier of democracy more powerful and effective.',
        answerPoints: [
          'Constitutionally mandatory to hold regular elections to local government bodies.',
          'Seats reserved in elected bodies and executive heads for Scheduled Castes, Scheduled Tribes, and OBCs.',
          'At least one-third of all positions reserved for women.',
          'State Election Commission created in each state to conduct panchayat and municipal elections.',
          'State governments required to share powers and revenue with local government bodies.',
        ],
      },
      {
        marks: '3 Marks',
        question: 'Distinguish between Prudential and Moral reasons for power sharing.',
        answerPoints: [
          'Prudential reasons stress better outcomes: reduces conflict between social groups, prevents violence and political instability.',
          'Moral reasons stress that power sharing is the very spirit of democracy; people have a right to be consulted on how they are governed.',
        ],
      },
      {
        marks: '3 Marks',
        question: 'What makes India a federal country? Mention any three constitutional provisions.',
        answerPoints: [
          'Three-tier system of government (Union, State, Local Panchayats/Municipalities).',
          'Three-fold distribution of legislative powers: Union, State, and Concurrent Lists.',
          'Independent Judiciary (Supreme Court & High Courts) acts as umpire in disputes; rigid procedure to alter basic structure.',
        ],
      },
    ],
    videoCompanion: {
      durationLabel: '38 Min Civics Revision',
      searchTitle: 'Power Sharing and Federalism Class 10 Civics One Shot CBSE Revision',
      videoSearchUrl: 'https://www.youtube.com/results?search_query=Power+Sharing+and+Federalism+Class+10+Civics+One+Shot+CBSE',
      segments: [
        { topic: 'Belgium 4 Elements vs Sri Lanka 1956 Act', focus: 'Exact percentages (59% Flemish, 40% Wallonia)' },
        { topic: '4 Forms of Power Sharing', focus: 'Real Indian examples of each form' },
        { topic: 'Lists, Language Policy & 1992 Act', focus: 'Coming Together vs Holding Together comparison' },
      ],
    },
    externalReferenceUrl: 'https://digrajsinghrajput.com/study-materials',
    externalReferenceLabel: 'digrajsinghrajput.com Study Materials',
  },

  sst_civics_gender_parties_outcomes_oneshot: {
    id: 'sst_civics_gender_parties_outcomes_oneshot',
    section: 'civics',
    chapterLabel: 'Civics Ch 3, 4 & 5',
    title: 'Gender Religion Caste, Political Parties & Outcomes of Democracy — Pack',
    subtitle: 'Secularism, Party Functions & Reforms, and Democratic Accountability Checklist',
    readTimeMinutes: 14,
    weightageLabel: '10–12 Marks',
    oneShotPoints: [
      {
        heading: '1. Gender, Religion and Caste (Ch 3)',
        bullets: [
          'Feminist movements demand equal political/legal status; Equal Remuneration Act 1976; Nari Shakti Vandan Adhiniyam (33% Lok Sabha/State reservation).',
          'Secular State Features: No official religion in India, freedom to profess/practice/propagate any faith, prohibits religious discrimination, State can intervene to ensure equality within religion.',
          'Caste in Politics vs Politics in Caste: Parties select candidates by caste vote-bank, yet no single constituency has a clear majority of one caste.',
        ],
      },
      {
        heading: '2. Political Parties (Ch 4)',
        bullets: [
          'Functions: Contest elections, put forward policies/programmes, make laws, form/run governments, play opposition role, shape public opinion, provide access to machinery.',
          'Recognition Criteria: State Party (>=6% votes in Legislative Assembly + >=2 seats) vs National Party (>=6% votes in Lok Sabha/4 states Assembly + >=4 Lok Sabha seats).',
          'Challenges: Lack of internal democracy, Dynastic succession, Money & muscle power, Lack of meaningful choice. Reforms: Anti-Defection Law, Affidavit (property/criminal), IT returns.',
        ],
      },
      {
        heading: '3. Outcomes of Democracy (Ch 5)',
        bullets: [
          'Democracy is better because it promotes equality, enhances dignity of the individual, improves decision-making quality, provides conflict resolution, allows room to correct mistakes.',
          'Produces Accountable, Responsive, and Legitimate government (transparency via RTI).',
          'Economic record: Slightly slower growth than dictatorships, yet guarantees dignity, freedoms & peaceful accommodation of social diversity.',
        ],
      },
    ],
    mindMapBranches: [
      {
        branchTitle: 'Ch 3: India Secularism',
        nodes: ['No Official State Religion', 'Freedom of Religion (Art 25–28)', 'Ban on Untouchability & Caste Bias', 'Women Representation (33% Local & Nari Shakti Act)'],
      },
      {
        branchTitle: 'Ch 4: Political Parties',
        nodes: ['7 Key Functions', 'One / Two / Multi-Party Systems', '4 Challenges (Dynasty, Money, Internal, Choice)', 'Reforms: Anti-Defection + Affidavit'],
      },
      {
        branchTitle: 'Ch 5: Outcomes Matrix',
        nodes: ['Political: Accountable, Responsive, Legitimate', 'Economic: Growth vs Inequality Reduction', 'Social: Dignity & Accommodation of Diversity'],
      },
    ],
    sureShotQuestions: [
      {
        marks: '5 Marks',
        question: 'Describe the major functions of political parties in a modern democracy.',
        answerPoints: [
          'Contest elections by selecting candidates.',
          'Put forward diverse policies and programmes for voters to choose from.',
          'Play a decisive role in making laws for a country.',
          'Form and run governments after winning majority.',
          'Role of opposition: Voice different views, criticize failures, mobilize opposition; shape public opinion.',
        ],
      },
      {
        marks: '5 Marks',
        question: 'How does democracy produce an accountable, responsive and legitimate government?',
        answerPoints: [
          'Accountable: Citizens choose rulers via free/fair elections and hold right to examine decision-making processes (Transparency / RTI).',
          'Responsive: Attentive to needs and expectations of citizens and free from routine corruption through public debate.',
          'Legitimate: It is people’s own government enjoying overwhelming popular support worldwide.',
        ],
      },
      {
        marks: '3 Marks',
        question: 'Mention three constitutional provisions that make India a secular state.',
        answerPoints: [
          'No official religion for the Indian state (unlike Sri Lanka or Pakistan).',
          'Constitution provides all individuals and communities freedom to profess, practice, and propagate any religion.',
          'Prohibits discrimination on grounds of religion while allowing State intervention against religious inequalities (e.g., untouchability).',
        ],
      },
    ],
    videoCompanion: {
      durationLabel: '45 Min Civics One-Shot',
      searchTitle: 'Political Parties and Outcomes of Democracy Class 10 Civics One Shot CBSE',
      videoSearchUrl: 'https://www.youtube.com/results?search_query=Political+Parties+Outcomes+of+Democracy+Class+10+One+Shot+CBSE',
      segments: [
        { topic: 'Gender Division & India Secularism', focus: 'Exact distinction: Caste in Politics vs Politics in Caste' },
        { topic: 'National vs State Party Percentages', focus: '6% vote + seat rules + Anti-Defection reform' },
        { topic: '5-Mark Checklist for Outcomes', focus: 'Accountable, Responsive, Legitimate & Dignity' },
      ],
    },
    externalReferenceUrl: 'https://digrajsinghrajput.com/study-materials',
    externalReferenceLabel: 'digrajsinghrajput.com Study Materials',
  },

  // =========================================================================
  // ECONOMICS SHEETS
  // =========================================================================
  sst_eco_dev_sectors_oneshot: {
    id: 'sst_eco_dev_sectors_oneshot',
    section: 'economics',
    chapterLabel: 'Economics Ch 1 & Ch 2',
    title: 'Development & Sectors of the Indian Economy — One-Shot Notes',
    subtitle: 'Per Capita Income vs HDI, GDP Calculation, Organised vs Unorganised & MGNREGA 2005',
    readTimeMinutes: 12,
    weightageLabel: '10 Marks',
    oneShotPoints: [
      {
        heading: '1. Development Indicators & Sustainability (Ch 1)',
        bullets: [
          'Different persons can have different as well as conflicting developmental goals (e.g., dam builders vs displaced tribals).',
          'World Bank uses Per Capita Income (Total Income / Population); UNDP HDI ranks using Income + Health (Life Expectancy) + Education (Mean/Expected schooling).',
          'Public Facilities (schools, clean water, PDS) provide services cheaper collectively than money in pocket can buy individually. Sustainability prevents groundwater depletion.',
        ],
      },
      {
        heading: '2. Three Sectors & Disguised Unemployment (Ch 2)',
        bullets: [
          'Primary (Agriculture, dairy, mining), Secondary (Manufacturing/Industrial), Tertiary (Services: transport, banking, IT). Only Final Goods & Services counted in GDP to avoid double counting.',
          'Tertiary sector rose highest in India due to basic services, agriculture/industry demand, higher income demand (tourism/dining), and ICT services.',
          'Disguised Unemployment (Underemployment) common in agriculture: more people working than needed, zero drop in output if extra workers leave.',
        ],
      },
      {
        heading: '3. MGNREGA 2005 & Organised vs Unorganised',
        bullets: [
          'MGNREGA 2005 ("Right to Work"): Guarantees 100 days of wage employment per year in rural areas; unemployment allowance if work not provided within 15 days.',
          'Organised Sector: Registered, fixed hours, paid leave, PF/gratuity, job security vs Unorganised Sector: Low pay, no overtime/leave benefits, irregular employment.',
        ],
      },
    ],
    mindMapBranches: [
      {
        branchTitle: 'Ch 1: World Bank vs UNDP',
        nodes: ['World Bank: Per Capita Income only', 'UNDP HDI: Income + Literacy/Schooling + Life Expectancy', 'BMI = Weight(kg) / Height(m)^2', 'Sustainability of Groundwater & Crude Oil'],
      },
      {
        branchTitle: 'Ch 2: Sectors & GDP',
        nodes: ['Primary -> Secondary -> Tertiary', 'Count Final Goods Only (Wheat -> Flour -> Biscuit)', 'Disguised Unemployment in Farming'],
      },
      {
        branchTitle: 'Employment Creation',
        nodes: ['MGNREGA 2005 (100 Days Guaranteed)', 'Cheap Rural Credit + Cold Storage', 'Protect Unorganised Workers (Artisans, Casual Labour)'],
      },
    ],
    sureShotQuestions: [
      {
        marks: '5 Marks',
        question: 'Why is the tertiary sector becoming so important in India? Explain four reasons.',
        answerPoints: [
          'Basic services (hospitals, schools, post, courts, banks) are essential responsibilities of the government in a developing country.',
          'Development of agriculture and industry boosts demand for transport, trade, and storage.',
          'As income levels rise, people demand more eating out, tourism, shopping, private hospitals & schools.',
          'Rapid rise of Information and Communication Technology (ICT) based services.',
        ],
      },
      {
        marks: '3 Marks',
        question: 'Why does the World Bank criterion of Per Capita Income have limitations compared to UNDP’s HDI?',
        answerPoints: [
          'Average income hides wide disparities in income distribution (1 super-rich skews the average).',
          'Ignores essential non-material aspects like health (Infant Mortality Rate), education (Literacy Rate, Net Attendance Ratio), and pollution-free environment.',
        ],
      },
      {
        marks: '3 Marks',
        question: 'Explain the objectives of implementing MGNREGA 2005.',
        answerPoints: [
          'Guarantees 100 days of wage employment in a financial year to all able rural household adults needing work.',
          'If government fails to provide employment within 15 days, it pays unemployment allowance.',
          'Focuses on durable rural assets (water conservation, rural roads) raising future agricultural productivity.',
        ],
      },
    ],
    videoCompanion: {
      durationLabel: '38 Min Economics One-Shot',
      searchTitle: 'Development and Sectors of Indian Economy Class 10 Economics One Shot CBSE',
      videoSearchUrl: 'https://www.youtube.com/results?search_query=Development+Sectors+of+Indian+Economy+Class+10+Economics+One+Shot+CBSE',
      segments: [
        { topic: 'Kerala vs Haryana Development Comparison', focus: 'IMR, Literacy Rate & Net Attendance Ratio definitions' },
        { topic: 'Final Goods & Historical Shift of Sectors', focus: 'Why Primary employs most despite low GDP share' },
        { topic: 'Organised vs Unorganised & Public vs Private', focus: 'MGNREGA 2005 + protection steps' },
      ],
    },
    externalReferenceUrl: 'https://digrajsinghrajput.com/study-materials',
    externalReferenceLabel: 'digrajsinghrajput.com Study Materials',
  },

  sst_eco_money_global_oneshot: {
    id: 'sst_eco_money_global_oneshot',
    section: 'economics',
    chapterLabel: 'Economics Ch 3 & Ch 4',
    title: 'Money and Credit & Globalisation — One-Shot Notes & Case Studies',
    subtitle: 'Double Coincidence of Wants, RBI Supervision, SHGs & Globalisation Trade Barriers',
    readTimeMinutes: 12,
    weightageLabel: '10 Marks',
    oneShotPoints: [
      {
        heading: '1. Money, Banks & Terms of Credit (Ch 3)',
        bullets: [
          'Money eliminates "double coincidence of wants" by acting as medium of exchange. Modern forms: Currency (authorized by RBI on behalf of Central Govt) + Demand Deposits (cheques).',
          'Banks keep ~15% Cash Reserve for daily withdrawals and lend the majority; difference between interest charged to borrowers and paid to depositors is bank income.',
          'Terms of Credit = Interest rate + Collateral (asset pledged as security) + Documentation + Mode of repayment.',
        ],
      },
      {
        heading: '2. Formal vs Informal Credit & SHGs',
        bullets: [
          'Formal Sector (Banks, Cooperatives): Regulated by RBI (ensures lending to small farmers/small industries, not only rich), low interest rates vs Informal Sector (Moneylenders, traders): Unregulated, exorbitant interest -> Debt Trap.',
          'Self-Help Groups (SHGs): 15–20 women save regularly, provide collateral-free low-interest loans, empower women economically & socially (e.g., Grameen Bank Bangladesh).',
        ],
      },
      {
        heading: '3. Globalisation & the Indian Economy (Ch 4 — Board Scope)',
        bullets: [
          'Globalisation = Rapid integration or interconnection between countries via foreign trade and foreign investment by MNCs.',
          'Enabling Factors: (1) Improvement in Transportation (containers) & Information/Communication Technology (IT, Internet, satellites); (2) Liberalisation of foreign trade & investment policy (removing 1991 trade barriers like import taxes/quotas).',
        ],
      },
    ],
    mindMapBranches: [
      {
        branchTitle: 'Ch 3: RBI & Credit',
        nodes: ['Currency + Demand Deposits (Cheque)', 'Terms of Credit (Interest + Collateral + Docs)', 'Formal (RBI supervised) vs Informal (Debt trap)'],
      },
      {
        branchTitle: 'Self-Help Groups (SHGs)',
        nodes: ['15–20 Neighbourhood Members', 'No Collateral Required from Bank', 'Regular Meetings Discuss Nutrition, Health, Domestic Violence'],
      },
      {
        branchTitle: 'Ch 4: Globalisation Drivers',
        nodes: ['MNCs (Production across borders)', 'Technology (Containers + ICT/Internet)', '1991 Liberalisation (Removing Trade Barriers & Import Taxes)'],
      },
    ],
    sureShotQuestions: [
      {
        marks: '5 Marks',
        question: 'Explain the role of Self-Help Groups (SHGs) in empowering the rural poor.',
        answerPoints: [
          'Pool small savings of 15–20 neighbourhood members (mostly rural women) into a shared fund.',
          'Members take small loans from the group at reasonable interest rates without collateral.',
          'After 1–2 years of regular saving, the group becomes eligible for formal bank loans in the group’s name.',
          'Decisions on loan purpose, amount, interest, and repayment are taken democratically by members.',
          'Provides a social platform to discuss health, nutrition, and domestic issues.',
        ],
      },
      {
        marks: '5 Marks',
        question: 'In what ways does the Reserve Bank of India supervise the functioning of formal sector banks?',
        answerPoints: [
          'Monitors that banks actually maintain the minimum cash balance out of total deposits.',
          'Ensures banks give loans not only to profit-making businesses and traders, but also to small cultivators, small-scale industries, and small borrowers.',
          'Collects periodic information from banks regarding how much they are lending, to whom, and at what interest rates.',
        ],
      },
      {
        marks: '3 Marks',
        question: 'How have technology and liberalisation stimulated the globalisation process?',
        answerPoints: [
          'Rapid improvement in transport (containerisation) reduced delivery cost and time.',
          'IT, telecommunications, and Internet enabled instant cross-border coordination and outsourcing.',
          '1991 Liberalisation removed government restrictions/barriers on foreign trade and investment.',
        ],
      },
    ],
    videoCompanion: {
      durationLabel: '35 Min Economics One-Shot',
      searchTitle: 'Money and Credit Globalisation Class 10 Economics One Shot CBSE',
      videoSearchUrl: 'https://www.youtube.com/results?search_query=Money+and+Credit+Globalisation+Class+10+Economics+One+Shot+CBSE',
      segments: [
        { topic: 'Barter vs Modern Money & Cheque', focus: 'Why rupee cannot be refused in India' },
        { topic: 'Salim vs Swapna Credit Case Study', focus: 'Positive credit vs Debt Trap contrast' },
        { topic: 'Globalisation (Strictly Board Scope)', focus: 'What is Globalisation + Factors enabling Globalisation' },
      ],
    },
    externalReferenceUrl: 'https://digrajsinghrajput.com/study-materials',
    externalReferenceLabel: 'digrajsinghrajput.com Study Materials',
  },

  // =========================================================================
  // MAP WORK MASTER GUIDE SHEET
  // =========================================================================
  sst_map_work_master_guide: {
    id: 'sst_map_work_master_guide',
    section: 'map_work',
    chapterLabel: 'CBSE Map Mastery',
    title: 'Complete CBSE Class 10 SST Map Work Guide (5/5 Full Marks Strategy)',
    subtitle: 'All History (2 Marks) & Geography (3 Marks) Board Locations with Memory Associations',
    readTimeMinutes: 10,
    weightageLabel: '5 Guaranteed Board Marks',
    oneShotPoints: [
      {
        heading: '1. History Map Blueprint (2 Marks — Locate & Label)',
        bullets: [
          '3 Congress Sessions: Calcutta (Sep 1920 — WB), Nagpur (Dec 1920 — Central MH), Madras (1927 — Coastal Northern TN).',
          '6 National Movement Centres: Champaran (North Bihar), Kheda & Ahmedabad (Central Gujarat), Dandi (South Gujarat Coast), Amritsar (NW Punjab), Chauri Chaura (Eastern UP).',
        ],
      },
      {
        heading: '2. Geography Dams, Crops & Power Map Trick (3 Marks)',
        bullets: [
          'North-to-South 8 Dams: Salal (J&K) -> Bhakra Nangal (HP/PB border) -> Tehri (UK) -> Rana Pratap Sagar (RJ) -> Sardar Sarovar (GJ) -> Hirakud (OD) -> Nagarjuna Sagar (TG/AP) -> Tungabhadra (KA).',
          '4 Nuclear Plants (Watch Clockwise West-North-South): Tarapur (MH) -> Kakrapara (GJ) -> Narora (UP) -> Kalpakkam (TN).',
          '3 Thermal Plants: Namrup (NE Assam) -> Singrauli (Eastern MP/UP border) -> Ramagundam (Telangana).',
        ],
      },
      {
        heading: '3. Ports (West vs East Coast) & Steel / Software Hubs',
        bullets: [
          '5 West Coast Ports (North->South): Kandla -> Mumbai -> Marmagao -> New Mangalore -> Kochi.',
          '5 East Coast Ports (South->North): Tuticorin -> Chennai -> Vishakhapatnam -> Paradip -> Haldia.',
          '6 Iron & Steel Plants: Bokaro & Jamshedpur (Jharkhand), Durgapur (WB), Bhilai (Chhattisgarh), Vijayanagar (Karnataka), Salem (TN).',
        ],
      },
    ],
    mindMapBranches: [
      {
        branchTitle: 'History 9 Points (2 Marks)',
        nodes: ['Sessions: Calcutta 20, Nagpur 20, Madras 27', 'Satyagraha: Champaran, Kheda, Ahmedabad', 'Events: Amritsar, Chauri Chaura, Dandi'],
      },
      {
        branchTitle: 'Geo Physical & Power',
        nodes: ['6 Major Soils (Identify)', '8 River Valley Dams (Locate)', 'Iron, Coal, Oil Fields (Identify)', 'Thermal (3) & Nuclear (4) Power'],
      },
      {
        branchTitle: 'Geo Industries & Lifelines',
        nodes: ['Cotton (5) & Iron-Steel (6)', 'Software Parks (8)', 'Sea Ports (10: 5 West + 5 East)', 'International Airports (6 Metros)'],
      },
    ],
    sureShotQuestions: [
      {
        marks: '2 Marks',
        question: 'Board History Pattern: (A) Place where Gandhi broke the Salt Law; (B) Place where Jallianwala Bagh incident took place.',
        answerPoints: [
          '(A) Dandi — Coastal South Gujarat.',
          '(B) Amritsar — Northern Punjab.',
        ],
      },
      {
        marks: '3 Marks',
        question: 'Board Geography Pattern: Locate any 3 of: Sardar Sarovar Dam, Tarapur Nuclear Plant, Paradip Sea Port, Software Park Pune.',
        answerPoints: [
          'Sardar Sarovar: Narmada River, Gujarat.',
          'Tarapur: Coastal northern Maharashtra.',
          'Paradip: Coastal Odisha; Pune: Western Maharashtra.',
        ],
      },
    ],
    videoCompanion: {
      durationLabel: '25 Min Complete Map One-Shot',
      searchTitle: 'Complete Map Work Class 10 SST Board Exam One Shot Revision',
      videoSearchUrl: 'https://www.youtube.com/results?search_query=Complete+Map+Work+Class+10+SST+CBSE+One+Shot',
      segments: [
        { topic: 'History All 9 Locations Practice', focus: 'Do not confuse Calcutta vs Nagpur 1920' },
        { topic: '8 Dams + 7 Power Plants', focus: 'State boundaries & river lines' },
        { topic: '10 Sea Ports + 8 Software Parks', focus: 'Exact coastal dots & state capitals' },
      ],
    },
    externalReferenceUrl: 'https://digrajsinghrajput.com/blog',
    externalReferenceLabel: 'digrajsinghrajput.com Map & Strategy Blog',
  },
};
