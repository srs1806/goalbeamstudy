import { LanguageMode } from '../types/tracker';

export interface LanguageOption {
  code: LanguageMode;
  name: string;
  nativeName: string;
  flag: string;
  badge: string;
}

/**
 * Study Medium Options (CBSE Textbook Mediums)
 * Note: The website UI remains compulsorily in English.
 * Selecting a Study Medium only changes the Subject Name and Chapter Names
 * of medium-specific subjects into that medium's language.
 */
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English Medium', nativeName: 'English Medium', flag: '🇬🇧', badge: 'English Medium' },
  { code: 'hi', name: 'Hindi Medium', nativeName: 'हिंदी माध्यम', flag: '🇮🇳', badge: 'Hindi Medium' },
  { code: 'ur', name: 'Urdu Medium', nativeName: 'اردو میڈیم', flag: '✍️', badge: 'Urdu Medium' },
  { code: 'mr', name: 'Marathi Medium', nativeName: 'मराठी माध्यम', flag: '🚩', badge: 'Marathi Medium' },
  { code: 'ta', name: 'Tamil Medium', nativeName: 'தமிழ் வழி', flag: '🇮🇳', badge: 'Tamil Medium' },
  { code: 'te', name: 'Telugu Medium', nativeName: 'తెలుగు మీడియం', flag: '🇮🇳', badge: 'Telugu Medium' },
  { code: 'bn', name: 'Bengali Medium', nativeName: 'বাংলা মাধ্যম', flag: '🇮🇳', badge: 'Bengali Medium' },
  { code: 'gu', name: 'Gujarati Medium', nativeName: 'ગુજરાતી માધ્યમ', flag: '🇮🇳', badge: 'Gujarati Medium' },
  { code: 'pa', name: 'Punjabi Medium', nativeName: 'ਪੰਜਾਬੀ ਮਾਧਿਅਮ', flag: '🇮🇳', badge: 'Punjabi Medium' },
  { code: 'sa', name: 'Sanskrit Medium', nativeName: 'संस्कृत माध्यमम्', flag: '🕉️', badge: 'Sanskrit Medium' },
  { code: 'ml', name: 'Malayalam Medium', nativeName: 'മലയാളം മീഡിയം', flag: '🇮🇳', badge: 'Malayalam Medium' },
  { code: 'kn', name: 'Kannada Medium', nativeName: 'ಕನ್ನಡ ಮಾಧ್ಯಮ', flag: '🇮🇳', badge: 'Kannada Medium' },
  { code: 'or', name: 'Odia Medium', nativeName: 'ଓଡ଼ିଆ ମାଧ୍ୟମ', flag: '🇮🇳', badge: 'Odia Medium' },
  { code: 'as', name: 'Assamese Medium', nativeName: 'অসমীয়া মাধ্যম', flag: '🇮🇳', badge: 'Assamese Medium' },
  { code: 'ne', name: 'Nepali Medium', nativeName: 'नेपाली माध्यम', flag: '🏔️', badge: 'Nepali Medium' },
  { code: 'ks', name: 'Kashmiri Medium', nativeName: 'کٲشُر / कॉशुर', flag: '🇮🇳', badge: 'Kashmiri Medium' },
  { code: 'sd', name: 'Sindhi Medium', nativeName: 'सिन्धी / سنڌي', flag: '🇮🇳', badge: 'Sindhi Medium' },
  { code: 'kok', name: 'Konkani Medium', nativeName: 'कोंकणी माध्यम', flag: '🇮🇳', badge: 'Konkani Medium' },
  { code: 'mni', name: 'Manipuri Medium', nativeName: 'মৈতৈলোন্ / মণিপুরী', flag: '🇮🇳', badge: 'Manipuri Medium' },
  { code: 'brx', name: 'Bodo Medium', nativeName: 'बर\' / बोडो', flag: '🇮🇳', badge: 'Bodo Medium' },
  { code: 'mai', name: 'Maithili Medium', nativeName: 'मैथिली माध्यम', flag: '🇮🇳', badge: 'Maithili Medium' },
  { code: 'fr', name: 'French Medium', nativeName: 'Français', flag: '🇫🇷', badge: 'French' },
  { code: 'de', name: 'German Medium', nativeName: 'Deutsch', flag: '🇩🇪', badge: 'German' },
  { code: 'es', name: 'Spanish Medium', nativeName: 'Español', flag: '🇪🇸', badge: 'Spanish' },
  { code: 'ar', name: 'Arabic Medium', nativeName: 'العربية', flag: '🇦🇪', badge: 'Arabic' },
];

export const ENGLISH_UI_STRINGS: Record<string, string> = {
  // Nav
  'nav.home': 'Home',
  'nav.chapters': 'Chapters',
  'nav.resources': 'Resources',
  'nav.insights': 'Insights',
  'nav.settings': 'Profile',

  // Header
  'header.streak': 'Streak',
  'header.dayStreak': 'Day Streak',
  'header.guide': 'Guide',
  'header.theme': 'Theme',
  'header.profile': 'Profile',
  'header.addNewProfile': '+ Add New Profile',
  'header.resetTracker': 'Reset Tracker',

  // Dashboard
  'dash.welcome': 'Welcome back',
  'dash.target': 'Target',
  'dash.academicYear': 'CBSE Class 10',
  'dash.resourcesBtn': 'CBSE Resources',
  'dash.addShortcutBtn': 'Add to Home Screen',
  'dash.firstPaperDate': '1st Paper Target Date',
  'dash.daysLeft': 'Days Left',
  'dash.updatesAt5am': 'Updates 5:00 AM Daily',
  'dash.synced5am': '5 AM Synced',
  'dash.studyPace': 'Daily Chapter Milestone Pace',
  'dash.overallCompletion': 'Overall Syllabus Mastery',
  'dash.totalChapters': 'Total Chapters',
  'dash.stagesCompleted': 'Milestones Done',
  'dash.todaysFocus': "Today's High-Yield Focus",
  'dash.markDone': 'Mark Complete ✓',
  'dash.subjectMastery': 'Subject-Wise Syllabus Mastery',

  // Chapters View
  'chap.title': 'Chapters Mastery',
  'chap.allSubjects': 'All Subjects',
  'chap.selectSubject': 'Select Subject',
  'chap.addSubject': 'Add Subject',
  'chap.searchPlaceholderAll': 'Search chapter across All Subjects (e.g. Light, Trigonometry)...',
  'chap.searchPlaceholderSub': 'Search chapters in this subject...',
  'chap.highYield': 'High-Yield ⭐',
  'chap.markAllDone': 'Mark All Done',
  'chap.completed': 'Completed ✓',
  'chap.officialPortal': 'Official Portal',
  'chap.doing': 'Doing...',
  'chap.doneBadge': 'Done ✓',
  'chap.personalNotes': 'Personal Notes & Formulas',
  'chap.close': 'Close',

  // Add Subject Modal
  'modal.addSubjectTitle': 'Add Subject & Customize Syllabus',
  'modal.addSubjectSubtitle': 'Pick any CBSE subject to add, and toggle the chapters included in your exam syllabus.',
  'modal.step1': 'Step 1: Choose Subject to Add / Customize',
  'modal.step2': 'Step 2: Select Included Chapters for',
  'modal.selectAll': 'Select All',
  'modal.clearOthers': 'Clear Others',
  'modal.saveAdd': 'Save & Add to Tracker',
  'modal.cancel': 'Cancel',
  'modal.enrolled': 'Enrolled',

  // Add Shortcut Modal
  'shortcut.modalTitle': 'Add Shortcut to Home Screen',
  'shortcut.modalSubtitle': 'Create a fast 1-tap home screen shortcut on your phone or PC with 100% offline access — no app store download or storage needed!',
  'shortcut.fastAction': '⚡ Add Shortcut Instantly',
  'shortcut.androidTitle': 'Android (Chrome / Samsung Internet)',
  'shortcut.iosTitle': 'iPhone / iPad (Safari)',
  'shortcut.desktopTitle': 'Windows & Mac (Chrome / Edge)',
  'shortcut.androidStep1': 'Tap the 3 dots (⋮) in the top-right corner of Chrome.',
  'shortcut.androidStep2': 'Tap "Add to Home screen" or "Install app".',
  'shortcut.androidStep3': 'Tap "Add" — the GOALBEAM icon is now placed directly on your phone!',
  'shortcut.iosStep1': 'Tap the Share icon (⎋) at the bottom toolbar of Safari.',
  'shortcut.iosStep2': 'Scroll down and tap "Add to Home Screen" (⊞).',
  'shortcut.iosStep3': 'Tap "Add" at the top right — instant home screen app icon!',
  'shortcut.desktopStep1': 'In Chrome/Edge address bar, click the install/shortcut icon (⊕).',
  'shortcut.desktopStep2': 'Click "Install" to create a dedicated Desktop & Taskbar shortcut.',

  // Onboarding
  'onboard.welcome': 'Welcome to GOALBEAM ⚡',
  'onboard.subtitle': 'CBSE Class 10 Course & Focused Goal Study Matrix',
  'onboard.nameLabel': 'What is your Name?',
  'onboard.namePlaceholder': 'Enter your full name (e.g. Shahid Shaikh)',
  'onboard.targetLabel': 'Your Target Score in Class 10 Boards',
  'onboard.chooseLang': 'Select Your Study Medium (CBSE Textbook Medium)',
  'onboard.continue': 'Continue →',
  'onboard.back': '← Back',
  'onboard.startTracker': 'Start My Study Tracker 🚀',
};

/**
 * Website UI is compulsorily in English.
 * getT always returns the English interface text regardless of the selected Study Medium.
 */
export function getT(_lang: LanguageMode = 'en') {
  return (key: string, fallback?: string): string => {
    return ENGLISH_UI_STRINGS[key] || fallback || key;
  };
}
