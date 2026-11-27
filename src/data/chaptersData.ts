import { Subject, StageDefinition } from '../types/tracker';
import { getSubjectColorTheme } from '../utils/subjectColors';
import { DEFAULT_STAGES_CONFIG, CATALOG_STAGES_OPTIONS, getProfileStages } from './stagesCatalog';

export { DEFAULT_STAGES_CONFIG, CATALOG_STAGES_OPTIONS, getProfileStages };
export const STAGES_CONFIG: StageDefinition[] = DEFAULT_STAGES_CONFIG;

const RAW_CLASS_10_SUBJECTS: Subject[] = [
  {
    id: 'science',
    name: 'Science',
    code: '086',
    description: 'Physics, Chemistry & Biology (CBSE NCERT Rationalized)',
    color: '#38bdf8',
    accentBg: 'rgba(56, 189, 248, 0.1)',
    groups: [
      {
        id: 'sci_chem',
        name: 'Chemical Substances - Nature & Behaviour',
        chapters: [
          { id: 'sci_ch1', no: 1, name: 'Chemical Reactions and Equations', pyqCount: 42, cbqCount: 28, highYield: true },
          { id: 'sci_ch2', no: 2, name: 'Acids, Bases and Salts', pyqCount: 48, cbqCount: 30, highYield: true },
          { id: 'sci_ch3', no: 3, name: 'Metals and Non-metals', pyqCount: 52, cbqCount: 34, highYield: true },
          { id: 'sci_ch4', no: 4, name: 'Carbon and its Compounds', pyqCount: 56, cbqCount: 38, highYield: true },
        ],
      },
      {
        id: 'sci_bio',
        name: 'World of Living',
        chapters: [
          { id: 'sci_ch5', no: 5, name: 'Life Processes', pyqCount: 65, cbqCount: 45, highYield: true },
          { id: 'sci_ch6', no: 6, name: 'Control and Coordination', pyqCount: 38, cbqCount: 26 },
          { id: 'sci_ch7', no: 7, name: 'How do Organisms Reproduce?', pyqCount: 45, cbqCount: 30, highYield: true },
          { id: 'sci_ch8', no: 8, name: 'Heredity and Evolution (Heredity)', pyqCount: 35, cbqCount: 25 },
        ],
      },
      {
        id: 'sci_phy',
        name: 'Natural Phenomena & Effects of Current',
        chapters: [
          { id: 'sci_ch9', no: 9, name: 'Light – Reflection and Refraction', pyqCount: 60, cbqCount: 40, highYield: true },
          { id: 'sci_ch10', no: 10, name: 'Human Eye and Colourful World', pyqCount: 36, cbqCount: 22 },
          { id: 'sci_ch11', no: 11, name: 'Electricity', pyqCount: 58, cbqCount: 42, highYield: true },
          { id: 'sci_ch12', no: 12, name: 'Magnetic Effects of Electric Current', pyqCount: 44, cbqCount: 30 },
          { id: 'sci_ch13', no: 13, name: 'Our Environment', pyqCount: 28, cbqCount: 18 },
        ],
      },
    ],
  },
  {
    id: 'maths',
    name: 'Mathematics',
    code: '041 / 241',
    description: 'Standard & Basic Mathematics (NCERT Rationalized)',
    color: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.1)',
    groups: [
      {
        id: 'maths_algebra',
        name: 'Number Systems & Algebra',
        chapters: [
          { id: 'math_ch1', no: 1, name: 'Real Numbers', pyqCount: 35, cbqCount: 20 },
          { id: 'math_ch2', no: 2, name: 'Polynomials', pyqCount: 38, cbqCount: 22 },
          { id: 'math_ch3', no: 3, name: 'Pair of Linear Equations in Two Variables', pyqCount: 45, cbqCount: 30, highYield: true },
          { id: 'math_ch4', no: 4, name: 'Quadratic Equations', pyqCount: 48, cbqCount: 32, highYield: true },
          { id: 'math_ch5', no: 5, name: 'Arithmetic Progressions (AP)', pyqCount: 46, cbqCount: 34, highYield: true },
        ],
      },
      {
        id: 'maths_geo_trig',
        name: 'Geometry & Trigonometry',
        chapters: [
          { id: 'math_ch6', no: 6, name: 'Triangles', pyqCount: 52, cbqCount: 36, highYield: true },
          { id: 'math_ch7', no: 7, name: 'Coordinate Geometry', pyqCount: 40, cbqCount: 28 },
          { id: 'math_ch8', no: 8, name: 'Introduction to Trigonometry', pyqCount: 54, cbqCount: 35, highYield: true },
          { id: 'math_ch9', no: 9, name: 'Some Applications of Trigonometry (Heights & Distances)', pyqCount: 44, cbqCount: 30, highYield: true },
          { id: 'math_ch10', no: 10, name: 'Circles', pyqCount: 42, cbqCount: 28 },
        ],
      },
      {
        id: 'maths_mens_stats',
        name: 'Mensuration, Statistics & Probability',
        chapters: [
          { id: 'math_ch11', no: 11, name: 'Areas Related to Circles', pyqCount: 36, cbqCount: 24 },
          { id: 'math_ch12', no: 12, name: 'Surface Areas and Volumes', pyqCount: 50, cbqCount: 32, highYield: true },
          { id: 'math_ch13', no: 13, name: 'Statistics', pyqCount: 46, cbqCount: 28, highYield: true },
          { id: 'math_ch14', no: 14, name: 'Probability', pyqCount: 32, cbqCount: 20 },
        ],
      },
    ],
  },
  {
    id: 'sst',
    name: 'Social Science (SST)',
    code: '087',
    description: 'History, Geography, Political Science (Civics) & Economics',
    color: '#f97316',
    accentBg: 'rgba(249, 115, 22, 0.12)',
    groups: [
      {
        id: 'sst_hist',
        name: 'India & the Contemporary World - II (History)',
        chapters: [
          { id: 'sst_hist_1', no: 1, name: 'The Rise of Nationalism in Europe', pyqCount: 45, cbqCount: 25, highYield: true },
          { id: 'sst_hist_2', no: 2, name: 'Nationalism in India', pyqCount: 55, cbqCount: 35, highYield: true },
          { id: 'sst_hist_3', no: 3, name: 'The Making of a Global World', pyqCount: 30, cbqCount: 18 },
          { id: 'sst_hist_4', no: 4, name: 'The Age of Industrialisation', pyqCount: 25, cbqCount: 15 },
          { id: 'sst_hist_5', no: 5, name: 'Print Culture and the Modern World', pyqCount: 38, cbqCount: 22, highYield: true },
        ],
      },
      {
        id: 'sst_geo',
        name: 'Contemporary India - II (Geography)',
        chapters: [
          { id: 'sst_geo_1', no: 1, name: 'Resources and Development', pyqCount: 34, cbqCount: 20 },
          { id: 'sst_geo_2', no: 2, name: 'Forest and Wildlife Resources', pyqCount: 26, cbqCount: 16 },
          { id: 'sst_geo_3', no: 3, name: 'Water Resources', pyqCount: 30, cbqCount: 18 },
          { id: 'sst_geo_4', no: 4, name: 'Agriculture', pyqCount: 42, cbqCount: 28, highYield: true },
          { id: 'sst_geo_5', no: 5, name: 'Minerals and Energy Resources', pyqCount: 40, cbqCount: 26, highYield: true },
          { id: 'sst_geo_6', no: 6, name: 'Manufacturing Industries', pyqCount: 38, cbqCount: 24 },
          { id: 'sst_geo_7', no: 7, name: 'Lifelines of National Economy (Map & Overview)', pyqCount: 28, cbqCount: 16 },
        ],
      },
      {
        id: 'sst_pol',
        name: 'Democratic Politics - II (Civics)',
        chapters: [
          { id: 'sst_pol_1', no: 1, name: 'Power Sharing', pyqCount: 38, cbqCount: 22, highYield: true },
          { id: 'sst_pol_2', no: 2, name: 'Federalism', pyqCount: 40, cbqCount: 25, highYield: true },
          { id: 'sst_pol_3', no: 3, name: 'Gender, Religion and Caste', pyqCount: 32, cbqCount: 20 },
          { id: 'sst_pol_4', no: 4, name: 'Political Parties', pyqCount: 44, cbqCount: 28, highYield: true },
          { id: 'sst_pol_5', no: 5, name: 'Outcomes of Democracy', pyqCount: 35, cbqCount: 20 },
        ],
      },
      {
        id: 'sst_eco',
        name: 'Understanding Economic Development (Economics)',
        chapters: [
          { id: 'sst_eco_1', no: 1, name: 'Development', pyqCount: 36, cbqCount: 24 },
          { id: 'sst_eco_2', no: 2, name: 'Sectors of the Indian Economy', pyqCount: 44, cbqCount: 30, highYield: true },
          { id: 'sst_eco_3', no: 3, name: 'Money and Credit', pyqCount: 42, cbqCount: 28, highYield: true },
          { id: 'sst_eco_4', no: 4, name: 'Globalisation and the Indian Economy', pyqCount: 35, cbqCount: 22 },
          { id: 'sst_eco_5', no: 5, name: 'Consumer Rights (Project Work & Key Concepts)', pyqCount: 20, cbqCount: 12 },
        ],
      },
    ],
  },
  {
    id: 'hindi_b',
    name: 'Hindi (Course B)',
    code: '085',
    description: 'स्पर्श भाग-२, संचयन भाग-२ एवं हिंदी व्याकरण व रचनात्मक लेखन',
    bookNames: ['स्पर्श (भाग-२)', 'संचयन (भाग-२)', 'हिंदी व्याकरण'],
    color: '#ec4899',
    accentBg: 'rgba(236, 72, 153, 0.1)',
    groups: [
      {
        id: 'hin_sparsh_gadya',
        name: 'स्पर्श भाग-२: गद्य खंड (Prose)',
        chapters: [
          { id: 'hin_g1', no: 1, name: 'बड़े भाई साहब', subTitle: 'प्रेमचंद', pyqCount: 32, cbqCount: 20, highYield: true },
          { id: 'hin_g2', no: 2, name: 'डायरी का एक पन्ना', subTitle: 'सीताराम सेकसरिया', pyqCount: 24, cbqCount: 16 },
          { id: 'hin_g3', no: 3, name: 'तताँरा-वामीरो कथा', subTitle: 'लीलाधर मंडलोई', pyqCount: 28, cbqCount: 18 },
          { id: 'hin_g4', no: 4, name: 'तीसरी कसम के शिल्पकार शैलेंद्र', subTitle: 'प्रहलाद अग्रवाल', pyqCount: 22, cbqCount: 14 },
          { id: 'hin_g5', no: 5, name: 'अब कहाँ दूसरे के दुख से दुखी होने वाले', subTitle: 'निदा फ़ाज़ली', pyqCount: 26, cbqCount: 18 },
          { id: 'hin_g6', no: 6, name: 'पतझर में टूटी पत्तियाँ (गिन्नी का सोना / झेन की देन)', subTitle: 'रवींद्र केलेकर', pyqCount: 30, cbqCount: 22, highYield: true },
          { id: 'hin_g7', no: 7, name: 'कारतूस', subTitle: 'हबीब तनवीर', pyqCount: 26, cbqCount: 18 },
        ],
      },
      {
        id: 'hin_sparsh_kavya',
        name: 'स्पर्श भाग-२: काव्य खंड (Poetry)',
        chapters: [
          { id: 'hin_k1', no: 8, name: 'साखी', subTitle: 'कबीरदास', pyqCount: 34, cbqCount: 22, highYield: true },
          { id: 'hin_k2', no: 9, name: 'पद', subTitle: 'मीराबाई', pyqCount: 28, cbqCount: 18 },
          { id: 'hin_k3', no: 10, name: 'मनुष्यता', subTitle: 'मैथिलीशरण गुप्त', pyqCount: 32, cbqCount: 20, highYield: true },
          { id: 'hin_k4', no: 11, name: 'पर्वत प्रदेश में पावस', subTitle: 'सुमित्रानंदन पंत', pyqCount: 30, cbqCount: 20 },
          { id: 'hin_k5', no: 12, name: 'तोप', subTitle: 'वीरेन डंगवाल', pyqCount: 26, cbqCount: 16 },
          { id: 'hin_k6', no: 13, name: 'कर चले हम फ़िदा', subTitle: 'कैफ़ी आज़मी', pyqCount: 28, cbqCount: 18 },
          { id: 'hin_k7', no: 14, name: 'आत्मत्राण', subTitle: 'रवींद्रनाथ ठाकुर', pyqCount: 24, cbqCount: 16 },
        ],
      },
      {
        id: 'hin_sanchayan',
        name: 'संचयन भाग-२ (पूरक पुस्तक Supplementary Reader)',
        chapters: [
          { id: 'hin_s1', no: 15, name: 'हरिहर काका', subTitle: 'मिथिलेश्वर (विस्तृत प्रश्न)', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'hin_s2', no: 16, name: 'सपनों के-से दिन', subTitle: 'गुरदयाल सिंह', pyqCount: 28, cbqCount: 18 },
          { id: 'hin_s3', no: 17, name: 'टोपी शुक्ला', subTitle: 'राही मासूम रज़ा', pyqCount: 30, cbqCount: 20, highYield: true },
        ],
      },
      {
        id: 'hin_vyakaran',
        name: 'हिंदी व्याकरण एवं व्यावहारिक लेखन (Grammar & Writing)',
        chapters: [
          { id: 'hin_v1', no: 18, name: 'पदबंध (संज्ञा, सर्वनाम, विशेषण, क्रिया, क्रियाविशेषण)', pyqCount: 40, cbqCount: 30, highYield: true },
          { id: 'hin_v2', no: 19, name: 'रचना के आधार पर वाक्य रूपांतरण (सरल, संयुक्त, मिश्र)', pyqCount: 42, cbqCount: 32, highYield: true },
          { id: 'hin_v3', no: 20, name: 'समास (तत्पुरुष, कर्मधारय, द्विगु, द्वंद्व, बहुव्रीहि, अव्ययीभाव)', pyqCount: 38, cbqCount: 28, highYield: true },
          { id: 'hin_v4', no: 21, name: 'मुहावरे (अर्थ एवं वाक्य प्रयोग)', pyqCount: 35, cbqCount: 25 },
          { id: 'hin_v5', no: 22, name: 'अनुच्छेद लेखन एवं औपचारिक पत्र लेखन', pyqCount: 25, cbqCount: 15 },
          { id: 'hin_v6', no: 23, name: 'सूचना लेखन एवं विज्ञापन लेखन', pyqCount: 22, cbqCount: 15 },
          { id: 'hin_v7', no: 24, name: 'लघुकथा लेखन अथवा ई-मेल लेखन', pyqCount: 20, cbqCount: 12 },
        ],
      },
    ],
  },
  {
    id: 'english',
    name: 'English (Lang & Lit)',
    code: '184',
    description: 'First Flight, Footprints without Feet & English Grammar/Writing',
    bookNames: ['First Flight', 'Footprints without Feet', 'Applied Grammar'],
    color: '#a855f7',
    accentBg: 'rgba(168, 85, 247, 0.1)',
    groups: [
      {
        id: 'eng_first_flight_prose',
        name: 'First Flight - Prose',
        chapters: [
          { id: 'eng_ff_p1', no: 1, name: 'A Letter to God', subTitle: 'G.L. Fuentes', pyqCount: 35, cbqCount: 22, highYield: true },
          { id: 'eng_ff_p2', no: 2, name: 'Nelson Mandela: Long Walk to Freedom', subTitle: 'Nelson Rolihlahla Mandela', pyqCount: 40, cbqCount: 28, highYield: true },
          { id: 'eng_ff_p3', no: 3, name: 'Two Stories About Flying (His First Flight & Black Aeroplane)', pyqCount: 34, cbqCount: 20 },
          { id: 'eng_ff_p4', no: 4, name: 'From the Diary of Anne Frank', subTitle: 'Anne Frank', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'eng_ff_p5', no: 5, name: 'Glimpses of India (Baker from Goa, Coorg, Tea from Assam)', pyqCount: 42, cbqCount: 28, highYield: true },
          { id: 'eng_ff_p6', no: 6, name: 'Mijbil the Otter', subTitle: 'Gavin Maxwell', pyqCount: 28, cbqCount: 18 },
          { id: 'eng_ff_p7', no: 7, name: 'Madam Rides the Bus', subTitle: 'Vallikkannan', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'eng_ff_p8', no: 8, name: 'The Sermon at Benares', subTitle: 'Betty Renshaw', pyqCount: 32, cbqCount: 22 },
          { id: 'eng_ff_p9', no: 9, name: 'The Proposal (Play)', subTitle: 'Anton Chekhov', pyqCount: 36, cbqCount: 25, highYield: true },
        ],
      },
      {
        id: 'eng_first_flight_poems',
        name: 'First Flight - Poetry',
        chapters: [
          { id: 'eng_poem_1', no: 10, name: 'Dust of Snow & Fire and Ice', subTitle: 'Robert Frost', pyqCount: 32, cbqCount: 20 },
          { id: 'eng_poem_2', no: 11, name: 'A Tiger in the Zoo', subTitle: 'Leslie Norris', pyqCount: 34, cbqCount: 22, highYield: true },
          { id: 'eng_poem_3', no: 12, name: 'How to Tell Wild Animals', subTitle: 'Carolyn Wells', pyqCount: 24, cbqCount: 16 },
          { id: 'eng_poem_4', no: 13, name: 'The Ball Poem', subTitle: 'John Berryman', pyqCount: 35, cbqCount: 24, highYield: true },
          { id: 'eng_poem_5', no: 14, name: 'Amanda!', subTitle: 'Robin Klein', pyqCount: 36, cbqCount: 25, highYield: true },
          { id: 'eng_poem_6', no: 15, name: 'The Trees', subTitle: 'Adrienne Rich', pyqCount: 28, cbqCount: 18 },
          { id: 'eng_poem_7', no: 16, name: 'Fog', subTitle: 'Carl Sandburg', pyqCount: 20, cbqCount: 14 },
          { id: 'eng_poem_8', no: 17, name: 'The Tale of Custard the Dragon', subTitle: 'Ogden Nash', pyqCount: 30, cbqCount: 20 },
          { id: 'eng_poem_9', no: 18, name: 'For Anne Gregory', subTitle: 'William Butler Yeats', pyqCount: 26, cbqCount: 16 },
        ],
      },
      {
        id: 'eng_footprints',
        name: 'Footprints Without Feet (Supplementary Reader)',
        chapters: [
          { id: 'eng_fp_1', no: 19, name: 'A Triumph of Surgery', subTitle: 'James Herriot', pyqCount: 32, cbqCount: 20 },
          { id: 'eng_fp_2', no: 20, name: 'The Thief’s Story', subTitle: 'Ruskin Bond', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'eng_fp_3', no: 21, name: 'The Midnight Visitor', subTitle: 'Robert Arthur', pyqCount: 28, cbqCount: 18 },
          { id: 'eng_fp_4', no: 22, name: 'A Question of Trust', subTitle: 'Victor Canning', pyqCount: 30, cbqCount: 20 },
          { id: 'eng_fp_5', no: 23, name: 'Footprints without Feet', subTitle: 'H.G. Wells', pyqCount: 34, cbqCount: 22 },
          { id: 'eng_fp_6', no: 24, name: 'The Making of a Scientist', subTitle: 'Robert W. Peterson', pyqCount: 36, cbqCount: 25, highYield: true },
          { id: 'eng_fp_7', no: 25, name: 'The Necklace', subTitle: 'Guy de Maupassant', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'eng_fp_9', no: 26, name: 'The Book that Saved the Earth', subTitle: 'Claire Boiko', pyqCount: 26, cbqCount: 16 },
        ],
      },
      {
        id: 'eng_grammar_writing',
        name: 'English Grammar & Creative Writing',
        chapters: [
          { id: 'eng_gw_1', no: 27, name: 'Tenses & Subject-Verb Concord', pyqCount: 45, cbqCount: 35, highYield: true },
          { id: 'eng_gw_2', no: 28, name: 'Modals & Determiners', pyqCount: 38, cbqCount: 28 },
          { id: 'eng_gw_3', no: 29, name: 'Reported Speech (Commands, Requests, Statements, Questions)', pyqCount: 46, cbqCount: 35, highYield: true },
          { id: 'eng_gw_4', no: 30, name: 'Formal Letter Writing (Letter to Editor, Complaint, Order)', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'eng_gw_5', no: 31, name: 'Analytical Paragraph Writing (Data, Graph & Chart based)', pyqCount: 32, cbqCount: 24, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'marathi',
    name: 'मराठी (Marathi)',
    code: '009',
    description: 'CBSE Class 10th Marathi (अक्षरभारती व स्थूलवाचन)',
    bookNames: ['अक्षरभारती (इयत्ता १० वी)'],
    color: '#ef4444',
    accentBg: 'rgba(239, 68, 68, 0.12)',
    groups: [
      {
        id: 'mar_gadya',
        name: 'गद्य विभाग',
        chapters: [
          { id: 'mar_g1', no: 1, name: 'शाल', subTitle: 'राग जाधव', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'mar_g2', no: 2, name: 'उपास', subTitle: 'पु. ल. देशपांडे', pyqCount: 32, cbqCount: 20, highYield: true },
          { id: 'mar_g3', no: 3, name: 'चुडीवाला', subTitle: 'जयश्री रुईकर', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'mar_g4', no: 4, name: 'फूटप्रिंट्स', subTitle: 'डॉ. प्रदीप आवटे', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'mar_g5', no: 5, name: 'ऊर्जा शक्तीचा जागर', subTitle: 'डॉ. रघुनाथ माशेलकर', pyqCount: 26, cbqCount: 16, highYield: true },
          { id: 'mar_g6', no: 6, name: 'रंग साहित्याचे', subTitle: 'साहित्य संवर्धन', pyqCount: 24, cbqCount: 15 },
          { id: 'mar_g7', no: 7, name: 'खरा नागरिक', subTitle: 'सुहास बारटक्के', pyqCount: 28, cbqCount: 18, highYield: true },
        ],
      },
      {
        id: 'mar_padya',
        name: 'पद्य विभाग',
        chapters: [
          { id: 'mar_p1', no: 8, name: 'संतवाणी: अंकिला मी दास तुझा', subTitle: 'संत नामदेव', pyqCount: 34, cbqCount: 22, highYield: true },
          { id: 'mar_p2', no: 9, name: 'दोन दिवस', subTitle: 'नारायण सुर्वे', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'mar_p3', no: 10, name: 'औक्षण', subTitle: 'इंदिरा संत', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'mar_p4', no: 11, name: 'स्वप्न करू साकार', subTitle: 'किशोर पाठक', pyqCount: 26, cbqCount: 16, highYield: true },
        ],
      },
      {
        id: 'mar_sthulvachan',
        name: 'स्थूलवाचन',
        chapters: [
          { id: 'mar_s1', no: 12, name: 'मोठे होत असलेल्या मुलांनो', subTitle: 'डॉ. अनिल काकोडकर', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'mar_s2', no: 13, name: 'व्युत्पत्ती कोश', subTitle: 'व्युत्पत्ती कोश कार्य व स्वरूप', pyqCount: 26, cbqCount: 16, highYield: true },
        ],
      },
      {
        id: 'mar_vyakaran',
        name: 'व्याकरण व भाषाभ्यास (Grammar & Composition)',
        chapters: [
          { id: 'mar_v1', no: 14, name: 'वाक्यप्रकार', subTitle: 'विधानार्थी, प्रश्नार्थक, आज्ञार्थी, उद्गारार्थी वाक्य', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'mar_v2', no: 15, name: 'वाक्यरूपांतर', subTitle: 'वाक्य परिवर्तन व रूपांतर नियम', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'mar_v3', no: 16, name: 'समास', subTitle: 'द्विगु, द्वंद्व, कर्मधारय व अव्ययीभाव समास', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'mar_v4', no: 17, name: 'वाक्प्रचार', subTitle: 'अर्थ सांगून वाक्यात उपयोग', pyqCount: 32, cbqCount: 22, highYield: true },
          { id: 'mar_v5', no: 18, name: 'शब्दसंपत्ती', subTitle: 'समानार्थी, विरुद्धार्थी, लिंग, वचन, शब्दांच्या जाती', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'mar_v6', no: 19, name: 'काळ व काळ परिवर्तन', subTitle: 'वर्तमानकाळ, भूतकाळ, भविष्यकाळ प्रकार व बदल', pyqCount: 24, cbqCount: 16 },
          { id: 'mar_v7', no: 20, name: 'लेखननियमांनुसार लेखन', subTitle: 'शुद्धलेखन नियम, विरामचिन्हे व भाषिक चुका दुरुस्ती', pyqCount: 26, cbqCount: 16, highYield: true },
          { id: 'mar_v8', no: 21, name: 'उपयोजित लेखन: पत्रलेखन', subTitle: 'औपचारिक व अनौपचारिक पत्रलेखन', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'mar_v9', no: 22, name: 'उपयोजित लेखन: सारांश लेखन', subTitle: 'अपठित गद्याचा १/३ सारांश लेखन', pyqCount: 24, cbqCount: 16 },
          { id: 'mar_v10', no: 23, name: 'उपयोजित लेखन: जाहिरात, बातमी व कथालेखन', subTitle: 'जाहिरात लेखन, बातमी लेखन आणि कथालेखन कौशल्य', pyqCount: 28, cbqCount: 18, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'it_402',
    name: 'Information Technology',
    code: '402',
    description: 'Employability Skills & Subject Specific Skills',
    bookNames: ['CBSE IT 402 Curriculum'],
    color: '#06b6d4',
    accentBg: 'rgba(6, 182, 212, 0.1)',
    groups: [
      {
        id: 'it_part_a',
        name: 'Part A: Employability Skills',
        chapters: [
          { id: 'it_pa_1', no: 1, name: 'Unit 1: Communication Skills - II', pyqCount: 22, cbqCount: 16 },
          { id: 'it_pa_2', no: 2, name: 'Unit 2: Self-Management Skills - II', pyqCount: 24, cbqCount: 18, highYield: true },
          { id: 'it_pa_3', no: 3, name: 'Unit 3: ICT Skills - II', pyqCount: 28, cbqCount: 20, highYield: true },
          { id: 'it_pa_4', no: 4, name: 'Unit 4: Entrepreneurial Skills - II', pyqCount: 20, cbqCount: 14 },
          { id: 'it_pa_5', no: 5, name: 'Unit 5: Green Skills - II', pyqCount: 18, cbqCount: 12 },
        ],
      },
      {
        id: 'it_part_b',
        name: 'Part B: Subject Specific Skills',
        chapters: [
          { id: 'it_pb_1', no: 6, name: 'Unit 1: Digital Documentation', pyqCount: 40, cbqCount: 28, highYield: true },
          { id: 'it_pb_2', no: 7, name: 'Unit 2: Electronic Spreadsheet', pyqCount: 44, cbqCount: 32, highYield: true },
          { id: 'it_pb_3', no: 8, name: 'Unit 3: Database Management System', pyqCount: 48, cbqCount: 35, highYield: true },
          { id: 'it_pb_4', no: 9, name: 'Unit 4: Web Applications and Security', pyqCount: 42, cbqCount: 30, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'hindi_a',
    name: 'Hindi (Course A)',
    code: '002',
    description: 'क्षितिज भाग-२, कृतिका भाग-२ एवं व्यावहारिक व्याकरण व लेखन',
    bookNames: ['क्षितिज भाग-२', 'कृतिका भाग-२', 'व्यावहारिक व्याकरण'],
    color: '#e11d48',
    accentBg: 'rgba(225, 29, 72, 0.1)',
    groups: [
      {
        id: 'hin_a_kshitij_gadya',
        name: 'क्षितिज भाग-२: गद्य खंड (Prose)',
        chapters: [
          { id: 'hin_a_g1', no: 1, name: 'नेताजी का चश्मा', subTitle: 'स्वयं प्रकाश', pyqCount: 34, cbqCount: 22, highYield: true },
          { id: 'hin_a_g2', no: 2, name: 'बालगोबिन भगत', subTitle: 'रामवृक्ष बेनीपुरी', pyqCount: 32, cbqCount: 20, highYield: true },
          { id: 'hin_a_g3', no: 3, name: 'लखनवी अंदाज़', subTitle: 'यशपाल', pyqCount: 30, cbqCount: 20 },
          { id: 'hin_a_g4', no: 4, name: 'एक कहानी यह भी', subTitle: 'मन्नू भंडारी', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'hin_a_g5', no: 5, name: 'नौबतखाने में इबादत', subTitle: 'यतीन्द्र मिश्र', pyqCount: 26, cbqCount: 16 },
          { id: 'hin_a_g6', no: 6, name: 'संस्कृति', subTitle: 'भदंत आनंद कौसल्यायन', pyqCount: 24, cbqCount: 16 },
        ],
      },
      {
        id: 'hin_a_kshitij_kavya',
        name: 'क्षितिज भाग-२: काव्य खंड (Poetry)',
        chapters: [
          { id: 'hin_a_k1', no: 7, name: 'पद (उधौ, तुम हौ अति बड़भागी)', subTitle: 'सूरदास', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'hin_a_k2', no: 8, name: 'राम-लक्ष्मण-परशुराम संवाद', subTitle: 'तुलसीदास', pyqCount: 42, cbqCount: 28, highYield: true },
          { id: 'hin_a_k3', no: 9, name: 'आत्मकथ्य', subTitle: 'जयशंकर प्रसाद', pyqCount: 28, cbqCount: 18 },
          { id: 'hin_a_k4', no: 10, name: 'उत्साह एवं अट नहीं रही है', subTitle: 'सूर्यकांत त्रिपाठी निराला', pyqCount: 32, cbqCount: 22, highYield: true },
          { id: 'hin_a_k5', no: 11, name: 'यह दंतुरित मुस्कान एवं फसल', subTitle: 'नागार्जुन', pyqCount: 30, cbqCount: 20 },
          { id: 'hin_a_k6', no: 12, name: 'संगतकार', subTitle: 'मंगलेश डबराल', pyqCount: 26, cbqCount: 16 },
        ],
      },
      {
        id: 'hin_a_kritika',
        name: 'कृतिका भाग-२: पूरक पाठ्यपुस्तक',
        chapters: [
          { id: 'hin_a_kr1', no: 13, name: 'माता का अँचल', subTitle: 'शिवपूजन सहाय', pyqCount: 34, cbqCount: 22, highYield: true },
          { id: 'hin_a_kr2', no: 14, name: 'साना-साना हाथ जोड़ि...', subTitle: 'मधु कांकरिया', pyqCount: 32, cbqCount: 20, highYield: true },
          { id: 'hin_a_kr3', no: 15, name: 'मैं क्यों लिखता हूँ?', subTitle: 'अज्ञेय', pyqCount: 26, cbqCount: 16 },
        ],
      },
      {
        id: 'hin_a_vyakaran',
        name: 'व्यावहारिक व्याकरण एवं रचनात्मक लेखन',
        chapters: [
          { id: 'hin_a_v1', no: 16, name: 'रचना के आधार पर वाक्य भेद (सरल, संयुक्त, मिश्र)', pyqCount: 40, cbqCount: 30, highYield: true },
          { id: 'hin_a_v2', no: 17, name: 'वाच्य (कर्तृवाच्य, कर्मवाच्य, भाववाच्य)', pyqCount: 38, cbqCount: 28, highYield: true },
          { id: 'hin_a_v3', no: 18, name: 'पद परिचय (संज्ञा, सर्वनाम, विशेषण, क्रिया, अव्यय)', pyqCount: 36, cbqCount: 26, highYield: true },
          { id: 'hin_a_v4', no: 19, name: 'अलंकार (श्लेष, उत्प्रेक्षा, अतिशयोक्ति, मानवीकरण)', pyqCount: 35, cbqCount: 25 },
          { id: 'hin_a_v5', no: 20, name: 'अनुच्छेद लेखन, पत्र लेखन व ई-मेल', pyqCount: 25, cbqCount: 15 },
          { id: 'hin_a_v6', no: 21, name: 'विज्ञापन लेखन व संदेश लेखन', pyqCount: 22, cbqCount: 15 },
        ],
      },
    ],
  },
  {
    id: 'communicative_english',
    name: 'Communicative English',
    code: '101',
    description: 'Interact in English: Literature Reader, Main Course Book & Workbook',
    bookNames: ['Interact in English Literature Reader', 'Main Course Book'],
    color: '#8b5cf6',
    accentBg: 'rgba(139, 92, 246, 0.1)',
    groups: [
      {
        id: 'comm_eng_lit_fiction',
        name: 'Literature Reader: Fiction & Drama',
        chapters: [
          { id: 'comm_f1', no: 1, name: 'Two Gentlemen of Verona', subTitle: 'A.J. Cronin', pyqCount: 32, cbqCount: 20, highYield: true },
          { id: 'comm_f2', no: 2, name: 'Mrs. Packletide’s Tiger', subTitle: 'Saki', pyqCount: 28, cbqCount: 18 },
          { id: 'comm_f3', no: 3, name: 'The Letter', subTitle: 'Dhumaketu', pyqCount: 35, cbqCount: 24, highYield: true },
          { id: 'comm_f4', no: 4, name: 'A Shady Plot', subTitle: 'Elsie Brown', pyqCount: 30, cbqCount: 20 },
          { id: 'comm_f5', no: 5, name: 'Patol Babu, Film Star', subTitle: 'Satyajit Ray', pyqCount: 34, cbqCount: 22, highYield: true },
          { id: 'comm_f6', no: 6, name: 'Virtually True', subTitle: 'Paul Stewart', pyqCount: 28, cbqCount: 18 },
          { id: 'comm_d1', no: 7, name: 'The Dear Departed (Drama)', subTitle: 'Stanley Houghton', pyqCount: 36, cbqCount: 25, highYield: true },
          { id: 'comm_d2', no: 8, name: 'Julius Caesar (Drama)', subTitle: 'William Shakespeare', pyqCount: 40, cbqCount: 28, highYield: true },
        ],
      },
      {
        id: 'comm_eng_lit_poetry',
        name: 'Literature Reader: Poetry',
        chapters: [
          { id: 'comm_p1', no: 9, name: 'The Frog and the Nightingale', subTitle: 'Vikram Seth', pyqCount: 34, cbqCount: 22, highYield: true },
          { id: 'comm_p2', no: 10, name: 'Mirror', subTitle: 'Sylvia Plath', pyqCount: 30, cbqCount: 20 },
          { id: 'comm_p3', no: 11, name: 'Not Marble nor the Gilded Monuments (Sonnet 55)', subTitle: 'William Shakespeare', pyqCount: 32, cbqCount: 20, highYield: true },
          { id: 'comm_p4', no: 12, name: 'Ozymandias', subTitle: 'Percy Bysshe Shelley', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'comm_p5', no: 13, name: 'The Rime of the Ancient Mariner', subTitle: 'Samuel Taylor Coleridge', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'comm_p6', no: 14, name: 'Snake', subTitle: 'D.H. Lawrence', pyqCount: 32, cbqCount: 22 },
        ],
      },
      {
        id: 'comm_eng_mcb_writing',
        name: 'Main Course Book Units & Writing Skills',
        chapters: [
          { id: 'comm_m1', no: 15, name: 'Unit 1 & 2: People, Adventure & Environment', pyqCount: 25, cbqCount: 18 },
          { id: 'comm_m2', no: 16, name: 'Unit 3 & 4: Science, Health and Medicine', pyqCount: 26, cbqCount: 18, highYield: true },
          { id: 'comm_m3', no: 17, name: 'Unit 5 & 6: Travel and Tourism, National Integration', pyqCount: 24, cbqCount: 16 },
          { id: 'comm_w1', no: 18, name: 'Formal Letter (Enquiry, Complaint, Placement of Order)', pyqCount: 35, cbqCount: 22, highYield: true },
          { id: 'comm_w2', no: 19, name: 'Article Writing & E-Mail Writing', pyqCount: 32, cbqCount: 22, highYield: true },
          { id: 'comm_w3', no: 20, name: 'Integrated Grammar (Gap filling, Editing, Sentence Reordering)', pyqCount: 44, cbqCount: 32, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'sanskrit',
    name: 'Sanskrit',
    code: '122',
    description: 'शेमुषी (भाग-२) / मणिका एवं संस्कृत व्याकरण व रचनात्मक कार्यम्',
    bookNames: ['शेमुषी भाग-२', 'संस्कृत व्याकरण'],
    color: '#ea580c',
    accentBg: 'rgba(234, 88, 12, 0.1)',
    groups: [
      {
        id: 'sk_shemushi',
        name: 'शेमुषी भाग-२: पाठाः',
        chapters: [
          { id: 'sk_ch1', no: 1, name: 'प्रथमः पाठः: शुचिपर्यावरणम्', subTitle: 'हरिदत्तशर्मा (लसलल्लतिका)', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'sk_ch2', no: 2, name: 'द्वितीयः पाठः: बुद्धिर्बलवती सदा', subTitle: 'शुकसप्ततिः', pyqCount: 32, cbqCount: 20, highYield: true },
          { id: 'sk_ch3', no: 3, name: 'तृतीयः पाठः: शिशुलालनम्', subTitle: 'कुन्दमाला (दिङ्नाग)', pyqCount: 28, cbqCount: 18 },
          { id: 'sk_ch4', no: 4, name: 'चतुर्थः पाठः: जननी तुल्यवत्सला', subTitle: 'महाभारतम्', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'sk_ch5', no: 5, name: 'पञ्चमः पाठः: सुभाषितानि', subTitle: 'सदाचार-श्लोकाः', pyqCount: 35, cbqCount: 24, highYield: true },
          { id: 'sk_ch6', no: 6, name: 'षष्ठः पाठः: सौहार्दं प्रकृतेः शोभा', subTitle: 'पर्यावरण-संवादः', pyqCount: 28, cbqCount: 18 },
          { id: 'sk_ch7', no: 7, name: 'सप्तमः पाठः: विचित्रः साक्षी', subTitle: 'ओमप्रकाशठाकुरः', pyqCount: 26, cbqCount: 16 },
          { id: 'sk_ch8', no: 8, name: 'अष्टमः पाठः: सूक्तयः', subTitle: 'तिरुक्कुरल्', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'sk_ch9', no: 9, name: 'नवमः पाठः: भूकम्पविभीषिका', subTitle: 'प्रकृतिप्रकोपः', pyqCount: 24, cbqCount: 16 },
          { id: 'sk_ch10', no: 10, name: 'दशमः पाठः: अन्योक्तयः', subTitle: 'भामिनीविलासः', pyqCount: 22, cbqCount: 14 },
        ],
      },
      {
        id: 'sk_vyakaran',
        name: 'संस्कृत व्याकरण एवं रचनात्मक कार्यम्',
        chapters: [
          { id: 'sk_v1', no: 11, name: 'सन्धि कार्यम् (व्यञ्जन व विसर्ग सन्धि)', pyqCount: 38, cbqCount: 25, highYield: true },
          { id: 'sk_v2', no: 12, name: 'समासः (तत्पुरुष, कर्मधारय, द्विगु, द्वन्द्व, अव्ययीभाव)', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'sk_v3', no: 13, name: 'प्रत्ययाः (मतुप्, तल्, त्व, टाप्, ङीप्)', pyqCount: 34, cbqCount: 22, highYield: true },
          { id: 'sk_v4', no: 14, name: 'वाच्य परिवर्तनम् (लट् लकारे - कर्तरि, कर्मणि, भावे)', pyqCount: 32, cbqCount: 20 },
          { id: 'sk_v5', no: 15, name: 'समय-लेखनम् एवं अव्ययपदानि', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'sk_v6', no: 16, name: 'अपठित-अवबोधनम्, पत्र-लेखनम् व चित्रवर्णनम्', pyqCount: 35, cbqCount: 22, highYield: true },
          { id: 'sk_v7', no: 17, name: 'संस्कृत अनुवादः व अशुद्धिसंशोधनम्', pyqCount: 28, cbqCount: 18 },
        ],
      },
    ],
  },
  {
    id: 'ai_417',
    name: 'Artificial Intelligence (AI)',
    code: '417',
    description: 'CBSE Skill Subject 417: AI Project Cycle, Python, Computer Vision, NLP & Ethics',
    bookNames: ['CBSE AI 417 Curriculum Handbook'],
    color: '#6366f1',
    accentBg: 'rgba(99, 102, 241, 0.1)',
    groups: [
      {
        id: 'ai_part_a',
        name: 'Part A: Employability Skills',
        chapters: [
          { id: 'ai_pa_1', no: 1, name: 'Unit 1: Communication Skills - II', pyqCount: 20, cbqCount: 14 },
          { id: 'ai_pa_2', no: 2, name: 'Unit 2: Self-Management Skills - II', pyqCount: 22, cbqCount: 16, highYield: true },
          { id: 'ai_pa_3', no: 3, name: 'Unit 3: ICT Skills - II', pyqCount: 24, cbqCount: 18, highYield: true },
          { id: 'ai_pa_4', no: 4, name: 'Unit 4: Entrepreneurial Skills - II', pyqCount: 20, cbqCount: 14 },
          { id: 'ai_pa_5', no: 5, name: 'Unit 5: Green Skills - II', pyqCount: 18, cbqCount: 12 },
        ],
      },
      {
        id: 'ai_part_b',
        name: 'Part B: Subject Specific Skills (AI Domains)',
        chapters: [
          { id: 'ai_pb_1', no: 6, name: 'Unit 1: Introduction to AI (Excite, Relate, Purpose, Possibilities, AI Ethics & Bias)', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'ai_pb_2', no: 7, name: 'Unit 2: AI Project Cycle (Problem Scoping, Data Acquisition, Exploration, Modelling, Evaluation)', pyqCount: 44, cbqCount: 32, highYield: true },
          { id: 'ai_pb_3', no: 8, name: 'Unit 3: Advance Python (Lists, Dictionaries, NumPy & Packages)', pyqCount: 36, cbqCount: 25, highYield: true },
          { id: 'ai_pb_4', no: 9, name: 'Unit 4: Data Science Domain (Concept, Applications, Data Visualisation)', pyqCount: 34, cbqCount: 24 },
          { id: 'ai_pb_5', no: 10, name: 'Unit 5: Computer Vision (CV Basics, Pixels, RGB, Image Processing Applications)', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'ai_pb_6', no: 11, name: 'Unit 6: Natural Language Processing (NLP, Text Normalisation, Bag of Words, TF-IDF)', pyqCount: 42, cbqCount: 30, highYield: true },
          { id: 'ai_pb_7', no: 12, name: 'Unit 7: Evaluation (Confusion Matrix, Accuracy, Precision, Recall, F1 Score)', pyqCount: 40, cbqCount: 28, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'comp_app_165',
    name: 'Computer Applications',
    code: '165',
    description: 'Networking, HTML & CSS Web Designing, Cyber Ethics (CBSE Code 165)',
    bookNames: ['CBSE Computer Applications 165 Curriculum'],
    color: '#06b6d4',
    accentBg: 'rgba(6, 182, 212, 0.1)',
    groups: [
      {
        id: 'ca_net_ethics',
        name: 'Unit 1 & 3: Networking & Cyber Ethics',
        chapters: [
          { id: 'ca_ch1', no: 1, name: 'Internet Basics, World Wide Web & Web Servers', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'ca_ch2', no: 2, name: 'Internet Protocols (TCP/IP, SMTP, POP3, HTTP, HTTPS, SSH, SFTP)', pyqCount: 42, cbqCount: 28, highYield: true },
          { id: 'ca_ch3', no: 3, name: 'Web Services (Chat, Email, Video Conferencing, e-Governance, e-Shopping)', pyqCount: 34, cbqCount: 22 },
          { id: 'ca_ch4', no: 4, name: 'Mobile Technologies (SMS, MMS, 3G, 4G, 5G)', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'ca_ch5', no: 5, name: 'Cyber Ethics: Netiquettes, Intellectual Property Rights & Plagiarism', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'ca_ch6', no: 6, name: 'Software Licenses (FOSS, GPL, Creative Commons) & Digital Divide', pyqCount: 32, cbqCount: 22 },
        ],
      },
      {
        id: 'ca_html_css',
        name: 'Unit 2: HTML & CSS Web Designing',
        chapters: [
          { id: 'ca_ch7', no: 7, name: 'Introduction to HTML5 Document Structure, Headings & Formatting Tags', pyqCount: 40, cbqCount: 26, highYield: true },
          { id: 'ca_ch8', no: 8, name: 'HTML Lists (Ordered, Unordered, Description & Nested Lists)', pyqCount: 44, cbqCount: 30, highYield: true },
          { id: 'ca_ch9', no: 9, name: 'Images, Hyperlinks (Internal & External), Audio & Video Embedding', pyqCount: 42, cbqCount: 28, highYield: true },
          { id: 'ca_ch10', no: 10, name: 'HTML Tables (tr, td, th, rowspan, colspan) & Web Forms', pyqCount: 48, cbqCount: 34, highYield: true },
          { id: 'ca_ch11', no: 11, name: 'Cascading Style Sheets (CSS: Inline, Internal, External, Font & Border Properties)', pyqCount: 40, cbqCount: 28, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'home_science_064',
    name: 'Home Science',
    code: '064',
    description: 'Human Growth, Nutrition, Meal Planning, Hygiene & Apparel Care (Code 064)',
    bookNames: ['NCERT Human Ecology & Family Sciences'],
    color: '#ec4899',
    accentBg: 'rgba(236, 72, 153, 0.1)',
    groups: [
      {
        id: 'hs_growth_resources',
        name: 'Unit I–III: Growth, Resources & Hygiene',
        chapters: [
          { id: 'hs_ch1', no: 1, name: 'Unit I: Human Growth & Development – II (Play, Childhood & Adolescence)', pyqCount: 34, cbqCount: 22, highYield: true },
          { id: 'hs_ch2', no: 2, name: 'Unit II: Management of Resources (Time, Energy & Money Management)', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'hs_ch3', no: 3, name: 'Unit III: Food and Personal Hygiene (Safe Food Handling & Sanitation)', pyqCount: 38, cbqCount: 26, highYield: true },
        ],
      },
      {
        id: 'hs_nutrition_apparel',
        name: 'Unit IV–VI: Meal Planning, Food Safety & Fabrics',
        chapters: [
          { id: 'hs_ch4', no: 4, name: 'Unit IV: Meal Planning (Balanced Diet, Food Groups & RDA Factors)', pyqCount: 42, cbqCount: 30, highYield: true },
          { id: 'hs_ch5', no: 5, name: 'Unit V: Food Safety and Consumer Education (Adulteration, FSSAI, ISI, Agmark)', pyqCount: 44, cbqCount: 32, highYield: true },
          { id: 'hs_ch6', no: 6, name: 'Unit VI: Care and Maintenance of Fabrics and Apparel (Stain Removal & Storage)', pyqCount: 38, cbqCount: 26, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'painting_049',
    name: 'Painting (Fine Arts)',
    code: '049',
    description: 'Fundamentals of Visual Arts, Painting Materials & Indian Art Heritage (Code 049)',
    bookNames: ['CBSE Painting 049 Theory & Art History'],
    color: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.1)',
    groups: [
      {
        id: 'paint_fundamentals',
        name: 'Unit I & II: Elements, Principles & Materials of Painting',
        chapters: [
          { id: 'pt_ch1', no: 1, name: 'Six Limbs of Indian Painting (Shadanga) & Elements of Visual Arts (Point, Line, Colour, Tone, Texture, Space)', pyqCount: 42, cbqCount: 28, highYield: true },
          { id: 'pt_ch2', no: 2, name: 'Principles of Composition (Unity, Harmony, Balance, Rhythm, Proportion)', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'pt_ch3', no: 3, name: 'Tools & Materials: Water Colours, Poster Colours, Pencil, Charcoal & Brushes', pyqCount: 36, cbqCount: 24, highYield: true },
        ],
      },
      {
        id: 'paint_indian_art',
        name: 'Unit III: Story of Indian Art, Sculpture & Folk Art',
        chapters: [
          { id: 'pt_ch4', no: 4, name: 'Appreciation of Indian Art: Bodhisattva Padmapani (Ajanta)', pyqCount: 44, cbqCount: 30, highYield: true },
          { id: 'pt_ch5', no: 5, name: 'Sculpture & Architecture: Ashoka Lion Capital (Sarnath) & Kailashnatha Temple (Ellora)', pyqCount: 42, cbqCount: 28, highYield: true },
          { id: 'pt_ch6', no: 6, name: 'Indian Folk Art Traditions: Madhubani & Warli Art', pyqCount: 40, cbqCount: 28, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'french_018',
    name: 'French',
    code: '018',
    description: 'Entre Jeunes Class 10, Grammaire, Culture & Civilisation (Code 018)',
    bookNames: ['Entre Jeunes -2 (CBSE)'],
    color: '#3b82f6',
    accentBg: 'rgba(59, 130, 246, 0.1)',
    groups: [
      {
        id: 'fr_lecons',
        name: 'Entre Jeunes: Leçons & Culture et Civilisation',
        chapters: [
          { id: 'fr_ch1', no: 1, name: 'Leçon 2: Après le bac (Education System in France & India)', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'fr_ch2', no: 2, name: 'Leçon 3: Chercher du travail (CV & Job Search)', pyqCount: 34, cbqCount: 22, highYield: true },
          { id: 'fr_ch3', no: 3, name: 'Leçon 4: Le plaisir de lire (Library & Reading Culture)', pyqCount: 32, cbqCount: 20 },
          { id: 'fr_ch4', no: 4, name: 'Leçon 5: Les médias (Press, TV, Radio & Cinema)', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'fr_ch5', no: 5, name: 'Leçon 6: Chacun ses goûts (Museums, Louvre & Arts)', pyqCount: 34, cbqCount: 22 },
          { id: 'fr_ch6', no: 6, name: 'Leçon 7: En pleine forme (Health & Social Security - Sécu)', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'fr_ch7', no: 7, name: 'Leçon 8: L’environnement (Ecology & Conservation)', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'fr_ch8', no: 8, name: 'Leçon 10: Vive la République! (French Political System)', pyqCount: 36, cbqCount: 24, highYield: true },
        ],
      },
      {
        id: 'fr_grammaire',
        name: 'Grammaire & Expression Écrite',
        chapters: [
          { id: 'fr_g1', no: 9, name: 'Les Temps Convenables (Présent, Passé Composé, Imparfait, Plus-que-parfait, Futur Antérieur, Subjonctif)', pyqCount: 46, cbqCount: 32, highYield: true },
          { id: 'fr_g2', no: 10, name: 'Pronoms Personnels (COD, COI, y, en) & Pronoms Relatifs Simples et Composés', pyqCount: 44, cbqCount: 30, highYield: true },
          { id: 'fr_g3', no: 11, name: 'Discours Rapporté, Négation, Adjectifs & Pronoms Démonstratifs/Possessifs', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'fr_g4', no: 12, name: 'Expression Écrite: Lettre informelle, Message, Invitation & Dialogue', pyqCount: 40, cbqCount: 28, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'german_020',
    name: 'German',
    code: '020',
    description: 'Beste Freunde B1.1, Lesen, Schreiben & Grammatik (Code 020)',
    bookNames: ['Beste Freunde B1.1'],
    color: '#eab308',
    accentBg: 'rgba(234, 179, 8, 0.1)',
    groups: [
      {
        id: 'ger_lektionen',
        name: 'Beste Freunde B1.1: Lektionen 6–9',
        chapters: [
          { id: 'ger_ch1', no: 1, name: 'Lektion 6: Magst du grüne Bohnen? (Food, Cooking & Nebensatz "ob")', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'ger_ch2', no: 2, name: 'Lektion 7: Die App, die den Dieb findet (Technology & Relativsätze)', pyqCount: 40, cbqCount: 28, highYield: true },
          { id: 'ger_ch3', no: 3, name: 'Lektion 8: Einfach Sprachen lernen (Language Learning & Konjunktion "obwohl")', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'ger_ch4', no: 4, name: 'Lektion 9: Deine Hilfe zählt! (Social Engagement & Plusquamperfekt)', pyqCount: 36, cbqCount: 24, highYield: true },
        ],
      },
      {
        id: 'ger_grammatik',
        name: 'Grammatik, Lesen & Schreiben (E-Mail / Dialog)',
        chapters: [
          { id: 'ger_g1', no: 5, name: 'Präteritum, Perfekt & Plusquamperfekt', pyqCount: 42, cbqCount: 28, highYield: true },
          { id: 'ger_g2', no: 6, name: 'Adjektivdeklination, Komparativ & Superlativ', pyqCount: 40, cbqCount: 26, highYield: true },
          { id: 'ger_g3', no: 7, name: 'Relativpronomen, Präpositionen & Konjunktionen (als, wenn,เช็ค, obwohl, weil)', pyqCount: 42, cbqCount: 28, highYield: true },
          { id: 'ger_g4', no: 8, name: 'Schreiben: E-Mail & Dialog schreiben + Leseverstehen', pyqCount: 38, cbqCount: 26, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'urdu_003',
    name: 'Urdu (Course A & B)',
    code: '003 / 303',
    description: 'Nawa-e-Urdu / Jaan Pehchan, Sab Rang, Qawaid & Insha (NCERT)',
    bookNames: ['Nawa-e-Urdu', 'Jaan Pehchan', 'Sab Rang'],
    color: '#14b8a6',
    accentBg: 'rgba(20, 184, 166, 0.1)',
    groups: [
      {
        id: 'ur_prose_poetry',
        name: 'Hissa Nasr & Hissa Nazm (Prose & Poetry)',
        chapters: [
          { id: 'ur_ch1', no: 1, name: 'Hamd, Naat, Ghazal & Nazm (Mir Taqi Mir, Ghalib, Iqbal, Chakbast)', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'ur_ch2', no: 2, name: 'Afsana, Mazmoon, Khaka & Drama (Premchand, Sir Syed, Patras Bokhari)', pyqCount: 40, cbqCount: 28, highYield: true },
          { id: 'ur_ch3', no: 3, name: 'Supplementary Reader: Sab Rang / Gulzar-e-Urdu Stories', pyqCount: 34, cbqCount: 22 },
        ],
      },
      {
        id: 'ur_qawaid',
        name: 'Qawaid (Grammar) & Tahriri Maharat (Writing)',
        chapters: [
          { id: 'ur_g1', no: 4, name: 'Ism, Zameer, Sifat, Fail,Mutazad, Mutaradif & Muhaware', pyqCount: 42, cbqCount: 28, highYield: true },
          { id: 'ur_g2', no: 5, name: 'Khat Nigari (Formal/Informal Letters), Mazmoon Nigari (Essay) & Darkhwast', pyqCount: 40, cbqCount: 26, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'punjabi_004',
    name: 'Punjabi',
    code: '004',
    description: 'Sahit Mala, Vangi, Punjabi Vyakaran & Rachna (CBSE Code 004)',
    bookNames: ['Sahit Mala-10', 'Vangi-10'],
    color: '#f97316',
    accentBg: 'rgba(249, 115, 22, 0.1)',
    groups: [
      {
        id: 'pb_sahit_vangi',
        name: 'Sahit Mala (Kavita & Vartak) & Vangi (Kahani & Ekangi)',
        chapters: [
          { id: 'pb_ch1', no: 1, name: 'Gurbani & Sufi Kav (Guru Nanak Dev Ji, Guru Arjan Dev Ji, Sheikh Farid, Bulleh Shah)', pyqCount: 40, cbqCount: 28, highYield: true },
          { id: 'pb_ch2', no: 2, name: 'Vartak Bhag (Rabab Mangon, Ghar Da Pyar, Boli, Prarthna)', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'pb_ch3', no: 3, name: 'Vangi: Kahaniyan (Kulfi, Ang Sang, Dharti Hethla Bauld) & Ekangi (Zafarnama, Dooja Viah)', pyqCount: 42, cbqCount: 28, highYield: true },
        ],
      },
      {
        id: 'pb_vyakaran',
        name: 'Punjabi Vyakaran & Likhti Rachna',
        chapters: [
          { id: 'pb_g1', no: 4, name: 'Samasi Shabad, Bahu-Arthak, Kiria Visheshan, Agittar-Pichhittar & Muhavare', pyqCount: 44, cbqCount: 30, highYield: true },
          { id: 'pb_g2', no: 5, name: 'Lekh Rachna, Pattar Rachna (Formal & Personal) & Chitr Varnan', pyqCount: 38, cbqCount: 26, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'bengali_005',
    name: 'Bengali',
    code: '005',
    description: 'Sahitya Sanchayan, Professor Shonku & Bangla Byakaran (Code 005)',
    bookNames: ['Sahitya Sanchayan', 'Professor Shonku'],
    color: '#ef4444',
    accentBg: 'rgba(239, 68, 68, 0.1)',
    groups: [
      {
        id: 'bn_sahitya',
        name: 'Sahitya Sanchayan (Gadya & Kobita) & Supplementary',
        chapters: [
          { id: 'bn_ch1', no: 1, name: 'Gadya: Gyanachakshu, Aalo Babu, Adab & Bahurupi', pyqCount: 40, cbqCount: 28, highYield: true },
          { id: 'bn_ch2', no: 2, name: 'Kobita: Tin Paharer Koley, Ay Aro Bendhe Bendhe Thaki, Ekakare & Astrer Biruddhe Gaan', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'bn_ch3', no: 3, name: 'Supplementary Reader: Professor Shonku (Byomjatrir Diary, Corvus, Swarnaparni)', pyqCount: 36, cbqCount: 24, highYield: true },
        ],
      },
      {
        id: 'bn_byakaran',
        name: 'Bangla Byakaran & Nirmiti (Grammar & Writing)',
        chapters: [
          { id: 'bn_g1', no: 4, name: 'Sandhi (Byanjan & Bisarga), Samas, Bakya Paribartan & Sadhu-Chalit Riti', pyqCount: 44, cbqCount: 30, highYield: true },
          { id: 'bn_g2', no: 5, name: 'Bodh Parikshan, Anucched Rachana & Sampadakiya Patra (Editorial Letter)', pyqCount: 38, cbqCount: 26, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'tamil_006',
    name: 'Tamil',
    code: '006',
    description: 'Tamil Textbook (Iyal 1–6 Rationalized), Ilakkanam & Composition (Code 006)',
    bookNames: ['Tamil Class 10 Textbook (TNSCERT / CBSE)'],
    color: '#d946ef',
    accentBg: 'rgba(217, 70, 239, 0.1)',
    groups: [
      {
        id: 'tm_literature',
        name: 'Seyyul, Urainadai &Thunaipadam (Iyal 1–6)',
        chapters: [
          { id: 'tm_ch1', no: 1, name: 'Iyal 1 & 2: Amudha Ootru & Uyirin Osai (mozhi, Iyarkai, Thirukkural)', pyqCount: 40, cbqCount: 28, highYield: true },
          { id: 'tm_ch2', no: 2, name: 'Iyal 3 & 4: Kootanchoru &Naangam Tamil (Panpadu, Ariviyal & Technology)', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'tm_ch3', no: 3, name: 'Iyal 5 & 6: Manarkeni & Nilamellam (Kalvi, Kalai, Azhagiyal & Thirukkural)', pyqCount: 40, cbqCount: 28, highYield: true },
        ],
      },
      {
        id: 'tm_grammar',
        name: 'Ilakkanam (Grammar) & Kaditham / Katturai',
        chapters: [
          { id: 'tm_g1', no: 4, name: 'Ezhuthu, Sol, Thogainilai/Thogaanilai Thodargal,Podhu Ilakkanam, Agapporul & Purapporul', pyqCount: 44, cbqCount: 30, highYield: true },
          { id: 'tm_g2', no: 5, name: 'Kaditha Ilakkiyam (Official & Informal Letters), Katturai & Padam Paarthu Karuthu Ezhuthal', pyqCount: 38, cbqCount: 26, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'telugu_007',
    name: 'Telugu',
    code: '007',
    description: 'Singidi (Telugu Vachakam), Ramayanam & Vyakaranam (Code 007)',
    bookNames: ['Singidi Class 10'],
    color: '#0ea5e9',
    accentBg: 'rgba(14, 165, 233, 0.1)',
    groups: [
      {
        id: 'te_padya_gadya',
        name: 'Padya Bhagam, Gadya Bhagam & Upavachakam',
        chapters: [
          { id: 'te_ch1', no: 1, name: 'Padya Bhagam: Dana Seelam, Veerabhimanyu, Sataka Madhurima & Jeevanshyam', pyqCount: 40, cbqCount: 28, highYield: true },
          { id: 'te_ch2', no: 2, name: 'Gadya Bhagam: Evari Bhasha Vallaku Vinashakaram, Janapada జాbu & Kotta Baata', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'te_ch3', no: 3, name: 'Upavachakam: Ramayanam (Bala, Ayodhya, Aranya, Kishkindha, Sundara, Yuddha Kandams)', pyqCount: 42, cbqCount: 28, highYield: true },
        ],
      },
      {
        id: 'te_vyakaranam',
        name: 'Vyakaranam (Sandhulu, Samasalu, Alankaralu, Chandassu) & Lekha',
        chapters: [
          { id: 'te_g1', no: 4, name: 'Sandhulu, Samasalu, Chandassu (Utpalamala, Champakamala, Mattebham, Shardulam) & Alankaralu', pyqCount: 46, cbqCount: 32, highYield: true },
          { id: 'te_g2', no: 5, name: 'Lekha Rachana,Vaartha Rachana & Karapatrika', pyqCount: 38, cbqCount: 26, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'gujarati_010',
    name: 'Gujarati',
    code: '010',
    description: 'Gujarati Sahitya (Gadya & Padya), Vyakaran & Lekhan Kaushalya (Code 010)',
    bookNames: ['Gujarati Second Language Class 10'],
    color: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.1)',
    groups: [
      {
        id: 'gj_sahitya',
        name: 'Gadya & Padya Vibhag (Prose & Poetry)',
        chapters: [
          { id: 'gj_ch1', no: 1, name: 'Padya: Morli, Jivama Jiv Aavyo,Dikri, Madhavne Ditho Chhe Kyanay &Shikari Ne', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'gj_ch2', no: 2, name: 'Gadya: शरणाईना सूर, Pariksha, Jhabak Jyot, Chhabuk Ane Chokri & Ghori', pyqCount: 40, cbqCount: 28, highYield: true },
        ],
      },
      {
        id: 'gj_vyakaran',
        name: 'Gujarati Vyakaran & Lekhan (Grammar & Writing)',
        chapters: [
          { id: 'gj_g1', no: 3, name: 'Samanarthi, Viruddharthi, Jodni, Rudhiprayog, Kehvato & Vakya Parivartan', pyqCount: 44, cbqCount: 30, highYield: true },
          { id: 'gj_g2', no: 4, name: 'Nibandh Lekhan, Patra Lekhan, Aheval Lekhan & Vichar Vistar', pyqCount: 40, cbqCount: 28, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'data_science_419',
    name: 'Data Science',
    code: '419',
    description: 'CBSE Skill Subject 419: Statistics, Distributions, Patterns, Data Merging & Ethics',
    bookNames: ['CBSE Data Science 419 Handbook'],
    color: '#8b5cf6',
    accentBg: 'rgba(139, 92, 246, 0.1)',
    groups: [
      {
        id: 'ds_employability',
        name: 'Part A: Employability Skills',
        chapters: [
          { id: 'ds_pa1', no: 1, name: 'Communication, Self-Management, ICT, Entrepreneurial & Green Skills - II', pyqCount: 28, cbqCount: 20, highYield: true },
        ],
      },
      {
        id: 'ds_core',
        name: 'Part B: Subject Specific Skills (Data Science)',
        chapters: [
          { id: 'ds_pb1', no: 2, name: 'Unit 1: Use of Statistics in Data Science (Subsets, Median, Mean, Absolute Deviation)', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'ds_pb2', no: 3, name: 'Unit 2: Distributions in Data Science (Probability & Normal Distribution)', pyqCount: 40, cbqCount: 28, highYield: true },
          { id: 'ds_pb3', no: 4, name: 'Unit 3: Identifying Patterns (Bias, Central Limit Theorem)', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'ds_pb4', no: 5, name: 'Unit 4: Merging Data (Z-Score, Joins, Standardizing Data) & Unit 5: Ethics in Data Science', pyqCount: 38, cbqCount: 26, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'fmm_405',
    name: 'Financial Markets Management',
    code: '405',
    description: 'CBSE Skill Subject 405: Investment, Primary/Secondary Market, Mutual Funds & Depository',
    bookNames: ['CBSE Financial Markets Management 405 Handbook'],
    color: '#22c55e',
    accentBg: 'rgba(34, 197, 94, 0.1)',
    groups: [
      {
        id: 'fmm_employability',
        name: 'Part A: Employability Skills',
        chapters: [
          { id: 'fmm_pa1', no: 1, name: 'Communication, Self-Management, ICT, Entrepreneurial & Green Skills - II', pyqCount: 26, cbqCount: 18 },
        ],
      },
      {
        id: 'fmm_core',
        name: 'Part B: Subject Specific Skills (Financial Markets)',
        chapters: [
          { id: 'fmm_pb1', no: 2, name: 'Unit 1–3: Investment Basics, Securities & Primary Market (IPO, Prospectus)', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'fmm_pb2', no: 3, name: 'Unit 4–6: Secondary Market (Stock Exchange, NEAT), Derivatives & Depository', pyqCount: 42, cbqCount: 30, highYield: true },
          { id: 'fmm_pb3', no: 4, name: 'Unit 7–10: Mutual Funds, Miscellaneous, Ratio Analysis & Practical Trading', pyqCount: 40, cbqCount: 28, highYield: true },
        ],
      },
    ],
  },
  // Additional CBSE Class 10 Regional & Foreign Languages (Group-L)
  {
    id: 'malayalam_012',
    name: 'Malayalam (മലയാളം)',
    code: '012',
    description: 'CBSE Class 10 Malayalam: Reading, Grammar, Prose & Poetry (Keralapadavali & Adisthanapadavali)',
    bookNames: ['CBSE Malayalam Class 10 Textbook'],
    color: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.1)',
    groups: [
      {
        id: 'mal_core',
        name: 'Section A–D: Prose, Poetry, Grammar & Writing',
        chapters: [
          { id: 'mal_1', no: 1, name: 'Reading Comprehension & Creative Writing (പാരായണം & രചന)', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'mal_2', no: 2, name: 'Malayalam Grammar & Usage (വ്യാകരണം)', pyqCount: 28, cbqCount: 18 },
          { id: 'mal_3', no: 3, name: 'Literature — Prose Lessons (ഗദ്യം)', pyqCount: 32, cbqCount: 22, highYield: true },
          { id: 'mal_4', no: 4, name: 'Literature — Poetry & Supplementary (പദ്യം)', pyqCount: 30, cbqCount: 20, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'odia_013',
    name: 'Odia (ଓଡ଼ିଆ)',
    code: '013',
    description: 'CBSE Class 10 Odia: Reading, Sahitya Sindhu Prose, Poetry & Grammar',
    bookNames: ['Sahitya Sindhu (Class 10)'],
    color: '#0ea5e9',
    accentBg: 'rgba(14, 165, 233, 0.1)',
    groups: [
      {
        id: 'odia_core',
        name: 'Odia Syllabus Modules',
        chapters: [
          { id: 'od_1', no: 1, name: 'Unseen Reading & Formal Writing (ଅପଠିତ ଓ ଲିଖନ)', pyqCount: 28, cbqCount: 18 },
          { id: 'od_2', no: 2, name: 'Odia Grammar (ବ୍ୟାକରଣ: ସମାସ, ସନ୍ଧି, କାରକ)', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'od_3', no: 3, name: 'Sahitya Sindhu: Prose & Poetry (ଗଦ୍ୟ ଓ ପଦ୍ୟ)', pyqCount: 34, cbqCount: 24, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'assamese_014',
    name: 'Assamese (অসমীয়া)',
    code: '014',
    description: 'CBSE Class 10 Assamese: Sahitya Chayan, Grammar & Composition',
    bookNames: ['Asamiya Sahitya Chayan'],
    color: '#14b8a6',
    accentBg: 'rgba(20, 184, 166, 0.1)',
    groups: [
      {
        id: 'as_core',
        name: 'Assamese Syllabus Modules',
        chapters: [
          { id: 'as_1', no: 1, name: 'Reading Comprehension & Composition (বোধ পৰীক্ষণ ও ৰচনা)', pyqCount: 26, cbqCount: 16 },
          { id: 'as_2', no: 2, name: 'Assamese Grammar (অসমীয়া ব্যাকৰণ)', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'as_3', no: 3, name: 'Prose, Poetry & Rapid Reader (গদ্য ও পদ্য)', pyqCount: 30, cbqCount: 20, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'kannada_015',
    name: 'Kannada (ಕನ್ನಡ)',
    code: '015',
    description: 'CBSE Class 10 Kannada: Reading, Grammar, Siri Kannada Prose & Poetry',
    bookNames: ['Siri Kannada / Sahitya Sanchaya'],
    color: '#ef4444',
    accentBg: 'rgba(239, 68, 68, 0.1)',
    groups: [
      {
        id: 'kn_core',
        name: 'Kannada Syllabus Modules',
        chapters: [
          { id: 'kn_1', no: 1, name: 'Comprehension & Letter/Essay Writing (ಗದ್ಯಗ್ರಹಣ ಮತ್ತು ಬರವಣಿಗೆ)', pyqCount: 28, cbqCount: 18 },
          { id: 'kn_2', no: 2, name: 'Kannada Grammar (ಕನ್ನಡ ವ್ಯಾಕರಣ)', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'kn_3', no: 3, name: 'Prose, Poetry & Supplementary (ಗದ್ಯ, ಪದ್ಯ ಮತ್ತು ಪೂರಕ ಪಾಠ)', pyqCount: 34, cbqCount: 22, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'arabic_016',
    name: 'Arabic (العربية)',
    code: '016',
    description: 'CBSE Class 10 Arabic: Minhaj al-Talim al-Thanavi, Grammar & Translation',
    bookNames: ['Minhaj al-Talim al-Thanavi Part II'],
    color: '#059669',
    accentBg: 'rgba(5, 150, 105, 0.1)',
    groups: [
      {
        id: 'ar_core',
        name: 'Arabic Language Modules',
        chapters: [
          { id: 'ar_1', no: 1, name: 'Reading Comprehension & Paragraph/Letter Writing', pyqCount: 28, cbqCount: 18 },
          { id: 'ar_2', no: 2, name: 'Applied Arabic Grammar (Al-Faa’il, Al-Maf’ool, Marfooaat & Mansoobaat)', pyqCount: 32, cbqCount: 22, highYield: true },
          { id: 'ar_3', no: 3, name: 'Prescribed Prose, Poetry & Arabic-English Translation', pyqCount: 34, cbqCount: 24, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'nepali_024',
    name: 'Nepali (नेपाली)',
    code: '024',
    description: 'CBSE Class 10 Nepali: Sahitya Sudha, Grammar & Composition',
    bookNames: ['CBSE Nepali Class 10 Sahitya'],
    color: '#6366f1',
    accentBg: 'rgba(99, 102, 241, 0.1)',
    groups: [
      {
        id: 'ne_core',
        name: 'Nepali Syllabus Modules',
        chapters: [
          { id: 'ne_1', no: 1, name: 'Reading & Writing Skills (अपठित गद्यांश र रचना)', pyqCount: 24, cbqCount: 16 },
          { id: 'ne_2', no: 2, name: 'Nepali Grammar (नेपाली व्याकरण)', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'ne_3', no: 3, name: 'Literature — Prose & Poetry (साहित्य गद्य र पद्य)', pyqCount: 30, cbqCount: 20, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'spanish_096',
    name: 'Spanish (Español)',
    code: '096',
    description: 'CBSE Class 10 Spanish: Unseen Comprehension, Applied Grammar, Literature & Culture',
    bookNames: ['Aula Internacional 2 / CBSE Spanish X'],
    color: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.1)',
    groups: [
      {
        id: 'es_core',
        name: 'Spanish Syllabus Sections',
        chapters: [
          { id: 'es_1', no: 1, name: 'Section A & B: Reading Comprehension, Emails & Dialogue Writing', pyqCount: 30, cbqCount: 22, highYield: true },
          { id: 'es_2', no: 2, name: 'Section C: Applied Grammar (Pretérito Indefinido, Imperfecto, Subjuntivo, Por/Para)', pyqCount: 34, cbqCount: 24, highYield: true },
          { id: 'es_3', no: 3, name: 'Section D: Hispanic Culture, Civilization & Authors', pyqCount: 26, cbqCount: 18 },
        ],
      },
    ],
  },
  {
    id: 'japanese_094',
    name: 'Japanese (日本語)',
    code: '094',
    description: 'CBSE Class 10 Japanese: Reading, Writing, Grammar (JLPT N5/N4 Bridge) & Kanji',
    bookNames: ['Minna no Nihongo / CBSE Japanese X'],
    color: '#ec4899',
    accentBg: 'rgba(236, 72, 153, 0.1)',
    groups: [
      {
        id: 'ja_core',
        name: 'Japanese Syllabus Modules',
        chapters: [
          { id: 'ja_1', no: 1, name: 'Kanji Script & Unseen Passage Comprehension', pyqCount: 28, cbqCount: 20, highYield: true },
          { id: 'ja_2', no: 2, name: 'Grammar & Sentence Structures (て-form, た-form, Particles)', pyqCount: 32, cbqCount: 22, highYield: true },
          { id: 'ja_3', no: 3, name: 'Guided Writing & Japanese Cultural Dialogues', pyqCount: 24, cbqCount: 16 },
        ],
      },
    ],
  },
  // Additional CBSE Class 10 Academic Electives (Group A2 / Electives)
  {
    id: 'elements_business_154',
    name: 'Elements of Business',
    code: '154',
    description: 'CBSE Academic Elective 154: Joint Stock Companies, Sources of Finance, Communication & Selling',
    bookNames: ['CBSE Elements of Business (Code 154)'],
    color: '#0891b2',
    accentBg: 'rgba(8, 145, 178, 0.1)',
    groups: [
      {
        id: 'eb_core',
        name: 'Theory Units (70 Marks + 30 Practical/Project)',
        chapters: [
          { id: 'eb_1', no: 1, name: 'Unit 1: Joint Stock Company (Private, Public, Incorporation)', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'eb_2', no: 2, name: 'Unit 2: Sources of Business Finance (Owned & Borrowed Funds)', pyqCount: 34, cbqCount: 22, highYield: true },
          { id: 'eb_3', no: 3, name: 'Unit 3: Communication in Business Organisations', pyqCount: 30, cbqCount: 20 },
          { id: 'eb_4', no: 4, name: 'Unit 4: Selling & Distribution (Wholesale, Retail, Advertising)', pyqCount: 38, cbqCount: 26, highYield: true },
          { id: 'eb_5', no: 5, name: 'Unit 5 & 6: Large Scale Retail & Selling Techniques', pyqCount: 32, cbqCount: 20 },
        ],
      },
    ],
  },
  {
    id: 'book_keeping_254',
    name: 'Elements of Book Keeping & Accountancy',
    code: '254',
    description: 'CBSE Academic Elective 254: Capital & Revenue, Depreciation, Bank Reconciliation & Final Accounts',
    bookNames: ['CBSE Elements of Book Keeping (Code 254)'],
    color: '#ca8a04',
    accentBg: 'rgba(202, 138, 4, 0.1)',
    groups: [
      {
        id: 'bk_core',
        name: 'Accounting Units (70 Marks Theory + 30 Project)',
        chapters: [
          { id: 'bk_1', no: 1, name: 'Unit 1: Capital and Revenue Expenditure/Receipts', pyqCount: 32, cbqCount: 20, highYield: true },
          { id: 'bk_2', no: 2, name: 'Unit 2: Depreciation (Straight Line & Written Down Value)', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'bk_3', no: 3, name: 'Unit 3: Bank Reconciliation Statement (BRS)', pyqCount: 34, cbqCount: 22, highYield: true },
          { id: 'bk_4', no: 4, name: 'Unit 4: Bills of Exchange & Promissory Notes', pyqCount: 30, cbqCount: 18 },
          { id: 'bk_5', no: 5, name: 'Unit 5 & 6: Final Accounts (Trading, P&L, Balance Sheet) & Single Entry', pyqCount: 40, cbqCount: 28, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'carnatic_music_031',
    name: 'Carnatic Music (Vocal / Instrumental)',
    code: '031',
    description: 'CBSE Class 10 Carnatic Music: Theory (30 Marks) + Practical Performance (70 Marks)',
    bookNames: ['CBSE Carnatic Music Curriculum'],
    color: '#a855f7',
    accentBg: 'rgba(168, 85, 247, 0.1)',
    groups: [
      {
        id: 'cm_core',
        name: 'Theory & Practical Modules',
        chapters: [
          { id: 'cm_1', no: 1, name: 'Unit 1: Lakshana of Ragas & Musical Terms (Gamaka, Manodharma)', pyqCount: 26, cbqCount: 16, highYield: true },
          { id: 'cm_2', no: 2, name: 'Unit 2: Biographies & Contributions of Composers (Trinity & Annamacharya)', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'cm_3', no: 3, name: 'Unit 3: Notation of Varnams, Kritis & Practical Raga Alapana', pyqCount: 30, cbqCount: 20 },
        ],
      },
    ],
  },
  {
    id: 'hindustani_music_034',
    name: 'Hindustani Music (Vocal / Percussion / Melodic)',
    code: '034',
    description: 'CBSE Class 10 Hindustani Music: Raga Theory, Tala Notation & Composers (30 Theory + 70 Practical)',
    bookNames: ['CBSE Hindustani Music Class 10 Manual'],
    color: '#db2777',
    accentBg: 'rgba(219, 39, 119, 0.1)',
    groups: [
      {
        id: 'hm_core',
        name: 'Theory & Practical Modules',
        chapters: [
          { id: 'hm_1', no: 1, name: 'Unit 1: Definitions (Alap, Tana, Meend, Kan) & Tala Forms (Dhrupad, Dhamar, Tarana)', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'hm_2', no: 2, name: 'Unit 2: Prescribed Ragas (Bhupali, Khamaj, Brindavani Sarang) & Talas (Tilwada, Chautala)', pyqCount: 34, cbqCount: 22, highYield: true },
          { id: 'hm_3', no: 3, name: 'Unit 3: Biographies of Tansen, Sadarang & Notation Writing', pyqCount: 28, cbqCount: 18 },
        ],
      },
    ],
  },
  {
    id: 'ncc_076',
    name: 'National Cadet Corps (NCC)',
    code: '076',
    description: 'CBSE Class 10 Elective 076: National Integration, Drill, Weapon Training, Leadership & Disaster Management',
    bookNames: ['CBSE NCC Class 10 Handbook'],
    color: '#65a30d',
    accentBg: 'rgba(101, 163, 13, 0.1)',
    groups: [
      {
        id: 'ncc_core',
        name: 'Common & Specialized NCC Syllabus',
        chapters: [
          { id: 'ncc_1', no: 1, name: 'Unit 1: NCC General, National Integration & Awareness', pyqCount: 26, cbqCount: 18, highYield: true },
          { id: 'ncc_2', no: 2, name: 'Unit 2: Drill, Personality Development & Leadership', pyqCount: 28, cbqCount: 20, highYield: true },
          { id: 'ncc_3', no: 3, name: 'Unit 3: Disaster Management, Social Service & Environment', pyqCount: 30, cbqCount: 22, highYield: true },
          { id: 'ncc_4', no: 4, name: 'Unit 4: Specialized Wing (Armed Forces, Map Reading, Field Craft)', pyqCount: 26, cbqCount: 18 },
        ],
      },
    ],
  },
  // Complete Remaining CBSE Class 10 Skill Subjects (401–422)
  {
    id: 'retail_401',
    name: 'Retail',
    code: '401',
    description: 'CBSE Skill Subject 401: Merchandising, Store Operations, Inventory & Customer Handling',
    bookNames: ['CBSE Retail Student Handbook (Code 401)'],
    color: '#0284c7',
    accentBg: 'rgba(2, 132, 199, 0.1)',
    groups: [
      {
        id: 'ret_pa',
        name: 'Part A: Employability Skills',
        chapters: [
          { id: 'ret_pa1', no: 1, name: 'Communication, Self-Management, ICT, Entrepreneurial & Green Skills - II', pyqCount: 26, cbqCount: 18, highYield: true },
        ],
      },
      {
        id: 'ret_pb',
        name: 'Part B: Subject Specific Skills (Retail)',
        chapters: [
          { id: 'ret_pb1', no: 2, name: 'Unit 1: Delivery of Goods & Retail Transportation', pyqCount: 28, cbqCount: 20 },
          { id: 'ret_pb2', no: 3, name: 'Unit 2: Retail Store Operations & Cash Point Management', pyqCount: 30, cbqCount: 22, highYield: true },
          { id: 'ret_pb3', no: 4, name: 'Unit 3 & 4: Merchandising Display, Security & Health Safety', pyqCount: 30, cbqCount: 20, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'security_403',
    name: 'Security',
    code: '403',
    description: 'CBSE Skill Subject 403: Private Security Regulations, Access Control, Fire Safety & Documentation',
    bookNames: ['CBSE Security Class 10 Handbook (Code 403)'],
    color: '#475569',
    accentBg: 'rgba(71, 85, 105, 0.1)',
    groups: [
      {
        id: 'sec_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'sec_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 24, cbqCount: 16 }],
      },
      {
        id: 'sec_pb',
        name: 'Part B: Subject Specific Skills (Security)',
        chapters: [
          { id: 'sec_pb1', no: 2, name: 'Unit 1 & 2: Private Security Agencies Act (PSARA) & Patrol Procedures', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'sec_pb2', no: 3, name: 'Unit 3 & 4: Industrial Fire Safety, Search & Crowd Control', pyqCount: 28, cbqCount: 20, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'automotive_404',
    name: 'Automotive',
    code: '404',
    description: 'CBSE Skill Subject 404: Automobile Chassis, Transmission, Suspension, Servicing Tools & Sales',
    bookNames: ['CBSE Automotive Class 10 Handbook (Code 404)'],
    color: '#ea580c',
    accentBg: 'rgba(234, 88, 12, 0.1)',
    groups: [
      {
        id: 'auto_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'auto_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 26, cbqCount: 18 }],
      },
      {
        id: 'auto_pb',
        name: 'Part B: Subject Specific Skills (Automotive)',
        chapters: [
          { id: 'auto_pb1', no: 2, name: 'Unit 1 & 2: Automobile Chassis, Body, Transmission & Gear Box', pyqCount: 34, cbqCount: 24, highYield: true },
          { id: 'auto_pb2', no: 3, name: 'Unit 3 & 4: Measuring Tools, Servicing Procedures & Innovation', pyqCount: 32, cbqCount: 22, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'tourism_406',
    name: 'Introduction to Tourism',
    code: '406',
    description: 'CBSE Skill Subject 406: Tourism Products of India, Hospitality, Travel Agencies & Soft Skills',
    bookNames: ['CBSE Introduction to Tourism (Code 406)'],
    color: '#06b6d4',
    accentBg: 'rgba(6, 182, 212, 0.1)',
    groups: [
      {
        id: 'tour_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'tour_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 24, cbqCount: 16 }],
      },
      {
        id: 'tour_pb',
        name: 'Part B: Subject Specific Skills (Tourism)',
        chapters: [
          { id: 'tour_pb1', no: 2, name: 'Unit 1 & 2: Soft Skills, Tourism Business & Travel Operations', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'tour_pb2', no: 3, name: 'Unit 3 & 4: Cultural Heritage, Eco-Tourism & Transport Modes', pyqCount: 32, cbqCount: 22, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'beauty_wellness_407',
    name: 'Beauty & Wellness',
    code: '407',
    description: 'CBSE Skill Subject 407: Skincare, Hair Care, Salon Hygiene, Basic Makeup & Client Etiquette',
    bookNames: ['CBSE Beauty & Wellness Class 10 (Code 407)'],
    color: '#ec4899',
    accentBg: 'rgba(236, 72, 153, 0.1)',
    groups: [
      {
        id: 'bw_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'bw_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 24, cbqCount: 16 }],
      },
      {
        id: 'bw_pb',
        name: 'Part B: Subject Specific Skills (Beauty & Wellness)',
        chapters: [
          { id: 'bw_pb1', no: 2, name: 'Unit 1 & 2: Basic Skin Care, Anatomy & Sterilization', pyqCount: 28, cbqCount: 20, highYield: true },
          { id: 'bw_pb2', no: 3, name: 'Unit 3 & 4: Hair Styling Basics, Makeup & Salon Ergonomics', pyqCount: 30, cbqCount: 20, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'agriculture_408',
    name: 'Agriculture',
    code: '408',
    description: 'CBSE Skill Subject 408: Agricultural Production, Soil Nutrient Management, Crops, Dairy & Beekeeping',
    bookNames: ['CBSE Agriculture Class 10 Handbook (Code 408)'],
    color: '#16a34a',
    accentBg: 'rgba(22, 163, 74, 0.1)',
    groups: [
      {
        id: 'agr_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'agr_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 26, cbqCount: 18 }],
      },
      {
        id: 'agr_pb',
        name: 'Part B: Subject Specific Skills (Agriculture)',
        chapters: [
          { id: 'agr_pb1', no: 2, name: 'Unit 1 & 2: Crop Cultivation, Irrigation & Weed/Pest Control', pyqCount: 32, cbqCount: 22, highYield: true },
          { id: 'agr_pb2', no: 3, name: 'Unit 3 & 4: Dairying, Food Processing, Beekeeping & Mushroom Culture', pyqCount: 30, cbqCount: 20, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'food_production_409',
    name: 'Food Production',
    code: '409',
    description: 'CBSE Skill Subject 409: Soups, Salads, Kitchen Operations, Food Commodities & Cooking Methods',
    bookNames: ['CBSE Food Production Class 10 (Code 409)'],
    color: '#f97316',
    accentBg: 'rgba(249, 115, 22, 0.1)',
    groups: [
      {
        id: 'fp_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'fp_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 24, cbqCount: 16 }],
      },
      {
        id: 'fp_pb',
        name: 'Part B: Subject Specific Skills (Food Production)',
        chapters: [
          { id: 'fp_pb1', no: 2, name: 'Unit 1–3: Methods of Cooking, Vegetables, Fruits & Culinary Stocks', pyqCount: 32, cbqCount: 22, highYield: true },
          { id: 'fp_pb2', no: 3, name: 'Unit 4–6: Soups, Salads, Sandwiches & Food Preservation', pyqCount: 30, cbqCount: 20, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'front_office_410',
    name: 'Front Office Operations',
    code: '410',
    description: 'CBSE Skill Subject 410: Hotel Classification, Reservation Lifecycle, Check-in & Guest Relations',
    bookNames: ['CBSE Front Office Operations (Code 410)'],
    color: '#0d9488',
    accentBg: 'rgba(13, 148, 136, 0.1)',
    groups: [
      {
        id: 'fo_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'fo_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 24, cbqCount: 16 }],
      },
      {
        id: 'fo_pb',
        name: 'Part B: Subject Specific Skills (Front Office)',
        chapters: [
          { id: 'fo_pb1', no: 2, name: 'Unit 1 & 2: Hotel Structure, Guest Cycle & Room Tariffs', pyqCount: 28, cbqCount: 20, highYield: true },
          { id: 'fo_pb2', no: 3, name: 'Unit 3 & 4: Reservation, Check-in, Communication & PMS', pyqCount: 30, cbqCount: 20, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'banking_insurance_411',
    name: 'Banking & Insurance',
    code: '411',
    description: 'CBSE Skill Subject 411: Utility Services of Banks, Negotiable Instruments, Loans & Life/General Insurance',
    bookNames: ['CBSE Banking & Insurance Class 10 (Code 411)'],
    color: '#2563eb',
    accentBg: 'rgba(37, 99, 235, 0.1)',
    groups: [
      {
        id: 'bi_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'bi_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 26, cbqCount: 18 }],
      },
      {
        id: 'bi_pb',
        name: 'Part B: Subject Specific Skills (Banking & Insurance)',
        chapters: [
          { id: 'bi_pb1', no: 2, name: 'Unit 1 & 2: Bank Accounts, Cheques, Demand Drafts & Digital Payments', pyqCount: 34, cbqCount: 24, highYield: true },
          { id: 'bi_pb2', no: 3, name: 'Unit 3 & 4: Lending Basics, Life Insurance & General Insurance Principles', pyqCount: 34, cbqCount: 22, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'marketing_sales_412',
    name: 'Marketing & Sales',
    code: '412',
    description: 'CBSE Skill Subject 412: Marketing Mix (4Ps), Segmentation, Sales Process & Customer Service',
    bookNames: ['CBSE Marketing & Sales Class 10 (Code 412)'],
    color: '#f43f5e',
    accentBg: 'rgba(244, 63, 94, 0.1)',
    groups: [
      {
        id: 'ms_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'ms_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 26, cbqCount: 18 }],
      },
      {
        id: 'ms_pb',
        name: 'Part B: Subject Specific Skills (Marketing & Sales)',
        chapters: [
          { id: 'ms_pb1', no: 2, name: 'Unit 1 & 2: Introduction to Marketing Mix (Product, Price, Place, Promotion)', pyqCount: 36, cbqCount: 24, highYield: true },
          { id: 'ms_pb2', no: 3, name: 'Unit 3 & 4: Sales Process, Negotiation & Salesperson Duties', pyqCount: 32, cbqCount: 22, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'health_care_413',
    name: 'Health Care',
    code: '413',
    description: 'CBSE Skill Subject 413: Hospital System, Role of GDA, Immunization, First Aid & Biomedical Waste',
    bookNames: ['CBSE Health Care Class 10 (Code 413)'],
    color: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.1)',
    groups: [
      {
        id: 'hc_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'hc_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 24, cbqCount: 16 }],
      },
      {
        id: 'hc_pb',
        name: 'Part B: Subject Specific Skills (Health Care)',
        chapters: [
          { id: 'hc_pb1', no: 2, name: 'Unit 1–3: Hospital Structure, General Duty Assistant & Patient Care', pyqCount: 34, cbqCount: 24, highYield: true },
          { id: 'hc_pb2', no: 3, name: 'Unit 4–6: First Aid, Immunization & Bio-Medical Waste Management', pyqCount: 34, cbqCount: 22, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'apparel_414',
    name: 'Apparel',
    code: '414',
    description: 'CBSE Skill Subject 414: Hand Embroidery, Sewing Techniques, Fabric Defect Checking & Finishing',
    bookNames: ['CBSE Apparel Class 10 (Code 414)'],
    color: '#d946ef',
    accentBg: 'rgba(217, 70, 239, 0.1)',
    groups: [
      {
        id: 'ap_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'ap_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 22, cbqCount: 14 }],
      },
      {
        id: 'ap_pb',
        name: 'Part B: Subject Specific Skills (Apparel)',
        chapters: [
          { id: 'ap_pb1', no: 2, name: 'Unit 1 & 2: Indian Traditional Embroidery & Decorative Stitches', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'ap_pb2', no: 3, name: 'Unit 3 & 4: Garment Construction, Quality Inspection & Ironing', pyqCount: 28, cbqCount: 18 },
        ],
      },
    ],
  },
  {
    id: 'multi_media_415',
    name: 'Multi Media',
    code: '415',
    description: 'CBSE Skill Subject 415: Digital 3D/2D Animation, Texturing, Lighting, Rigging & Rendering',
    bookNames: ['CBSE Multi Media Class 10 (Code 415)'],
    color: '#8b5cf6',
    accentBg: 'rgba(139, 92, 246, 0.1)',
    groups: [
      {
        id: 'mm_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'mm_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 24, cbqCount: 16 }],
      },
      {
        id: 'mm_pb',
        name: 'Part B: Subject Specific Skills (Multi Media)',
        chapters: [
          { id: 'mm_pb1', no: 2, name: 'Unit 1 & 2: Shading, Texturing Surfaces & Lighting Setup', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'mm_pb2', no: 3, name: 'Unit 3 & 4: Keyframe Animation, Camera Rigging & Final Rendering', pyqCount: 32, cbqCount: 22, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'multi_skill_416',
    name: 'Multi Skill Foundation Course',
    code: '416',
    description: 'CBSE Skill Subject 416: Workshop Engineering, Energy & Environment, Gardening & Food Processing',
    bookNames: ['CBSE Multi Skill Foundation (Code 416)'],
    color: '#0ea5e9',
    accentBg: 'rgba(14, 165, 233, 0.1)',
    groups: [
      {
        id: 'msf_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'msf_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 24, cbqCount: 16 }],
      },
      {
        id: 'msf_pb',
        name: 'Part B: Subject Specific Modules',
        chapters: [
          { id: 'msf_pb1', no: 2, name: 'Unit 1 & 2: Workshop Engineering & Energy/Environment Audits', pyqCount: 28, cbqCount: 18, highYield: true },
          { id: 'msf_pb2', no: 3, name: 'Unit 3 & 4: Nursery/Gardening & Home Food Health Care', pyqCount: 28, cbqCount: 18 },
        ],
      },
    ],
  },
  {
    id: 'pat_418',
    name: 'Physical Activity Trainer (PAT)',
    code: '418',
    description: 'CBSE Skill Subject 418: Roles of Early Years Trainer, Props & Equipment, Assessment & Play Safety',
    bookNames: ['CBSE Physical Activity Trainer (Code 418)'],
    color: '#22c55e',
    accentBg: 'rgba(34, 197, 94, 0.1)',
    groups: [
      {
        id: 'pat_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'pat_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 26, cbqCount: 18 }],
      },
      {
        id: 'pat_pb',
        name: 'Part B: Subject Specific Skills (PAT 418)',
        chapters: [
          { id: 'pat_pb1', no: 2, name: 'Unit 1 & 2: Roles of Physical Activity Facilitator & Assessment', pyqCount: 34, cbqCount: 24, highYield: true },
          { id: 'pat_pb2', no: 3, name: 'Unit 3 & 4: Free Play, Props Maintenance & Sports Hygiene', pyqCount: 32, cbqCount: 22, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'electronics_420',
    name: 'Electronics & Hardware',
    code: '420',
    description: 'CBSE Skill Subject 420: Field Technician Operations, Sensors, Measuring Instruments & Workplace Safety',
    bookNames: ['CBSE Electronics & Hardware (Code 420)'],
    color: '#06b6d4',
    accentBg: 'rgba(6, 182, 212, 0.1)',
    groups: [
      {
        id: 'eh_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'eh_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 24, cbqCount: 16 }],
      },
      {
        id: 'eh_pb',
        name: 'Part B: Subject Specific Skills (Electronics & Hardware)',
        chapters: [
          { id: 'eh_pb1', no: 2, name: 'Unit 1 & 2: Field Technician Troubleshooting & Electronic Components', pyqCount: 30, cbqCount: 20, highYield: true },
          { id: 'eh_pb2', no: 3, name: 'Unit 3 & 4: Multimeter, Soldering, Relays & ESD Safety', pyqCount: 30, cbqCount: 20, highYield: true },
        ],
      },
    ],
  },
  {
    id: 'design_thinking_422',
    name: 'Design Thinking & Innovation',
    code: '422',
    description: 'CBSE Skill Subject 422: Empathy Mapping, Ideation, Rapid Prototyping & Creative Problem Solving',
    bookNames: ['CBSE Design Thinking & Innovation (Code 422)'],
    color: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.1)',
    groups: [
      {
        id: 'dt_pa',
        name: 'Part A: Employability Skills',
        chapters: [{ id: 'dt_pa1', no: 1, name: 'Employability Skills - II (Units 1–5)', pyqCount: 22, cbqCount: 16 }],
      },
      {
        id: 'dt_pb',
        name: 'Part B: Subject Specific Skills (Design Thinking)',
        chapters: [
          { id: 'dt_pb1', no: 2, name: 'Unit 1 & 2: Human-Centric Observation, Empathy & Problem Framing', pyqCount: 28, cbqCount: 20, highYield: true },
          { id: 'dt_pb2', no: 3, name: 'Unit 3 & 4: Visual Thinking, Rapid Prototyping & User Testing', pyqCount: 28, cbqCount: 20, highYield: true },
        ],
      },
    ],
  },
];

export const CLASS_10_SUBJECTS: Subject[] = RAW_CLASS_10_SUBJECTS.map((sub) => {
  const theme = getSubjectColorTheme(sub.id);
  return {
    ...sub,
    color: theme.color,
    accentBg: theme.accentBg,
  };
});

