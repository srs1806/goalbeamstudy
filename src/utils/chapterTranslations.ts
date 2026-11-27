import { LanguageMode } from '../types/tracker';

/**
 * Study Medium Localization for CBSE Class 10 Textbooks
 * - The website UI itself is compulsorily in English.
 * - Changing the Study Medium (e.g. Urdu Medium, Hindi Medium, Tamil Medium, Marathi Medium, etc.)
 *   changes the Subject Names into that medium's language, and changes Chapter Names ONLY for
 *   the specific medium-printed subjects (Science, Mathematics, Social Science, Home Science, Painting,
 *   and the native language subject of that medium).
 * - Non-medium subjects (such as English, Communicative English, IT 402, AI 417, Computer Applications, etc.)
 *   always keep their chapters in English.
 */

const SUBJECT_NAMES: Partial<Record<LanguageMode, Record<string, string>>> = {
  en: {},
  or: { science: 'ବିଜ୍ଞାନ (Science)', maths: 'ଗଣିତ (Mathematics)', sst: 'ସାମାଜିକ ବିଜ୍ଞାନ (Social Science)', odia_013: 'ଓଡ଼ିଆ (Odia)' },
  as: { science: 'বিজ্ঞান (Science)', maths: 'গণিত (Mathematics)', sst: 'সমাজ বিজ্ঞান (Social Science)', assamese_014: 'অসমীয়া (Assamese)' },
  ne: { science: 'विज्ञान (Science)', maths: 'गणित (Mathematics)', sst: 'सामाजिक विज्ञान (Social Science)', nepali_024: 'नेपाली (Nepali)' },
  es: { science: 'Ciencias (Science)', maths: 'Matemáticas (Mathematics)', spanish_096: 'Español (Spanish)' },
  ar: { science: 'العلوم (Science)', maths: 'الرياضيات (Mathematics)', arabic_016: 'العربية (Arabic)' },
  ur: {
    science: 'سائنس (Science)',
    maths: 'ریاضی (Mathematics)',
    sst: 'سماجی علوم (Social Science)',
    urdu_003: 'اردو کورس اے اور بی (Urdu Course A & B)',
    home_science_064: 'ہوم سائنس (Home Science)',
    painting_049: 'مصوری / پینٹنگ (Painting)',
    english: 'انگریزی زبان و ادب (English)',
    communicative_english: 'کمیونیکیٹو انگلش (Communicative English)',
    hindi_a: 'ہندی کورس اے (Hindi Course A)',
    hindi_b: 'ہندی کورس بی (Hindi Course B)',
    sanskrit: 'سنسکرت (Sanskrit)',
    marathi: 'مراٹھی (Marathi)',
    it_402: 'انفارمیشن ٹیکنالوجی (IT 402)',
    ai_417: 'مصنوعی ذہانت (AI 417)',
    comp_app_165: 'کمپیوٹر ایپلی کیشنز (Computer Applications)',
    data_science_419: 'ڈیٹا سائنس (Data Science)',
    fmm_405: 'فنانشل مارکیٹس مینجمنٹ (FMM 405)',
  },
  hi: {
    science: 'विज्ञान (Science)',
    maths: 'गणित (Mathematics)',
    sst: 'सामाजिक विज्ञान (Social Science)',
    hindi_a: 'हिंदी कोर्स-अ (क्षितिज और कृतिका)',
    hindi_b: 'हिंदी कोर्स-ब (स्पर्श और संचयन)',
    home_science_064: 'गृह विज्ञान (Home Science)',
    painting_049: 'चित्रकला (Painting)',
    sanskrit: 'संस्कृतम् (शेमुषी भाग-2)',
    english: 'अंग्रेज़ी (English Language & Lit)',
    communicative_english: 'कम्युनिकेटिव इंग्लिश (Communicative English)',
    ai_417: 'आर्टिफिशियल इंटेलिजेंस (AI 417)',
    it_402: 'सूचना प्रौद्योगिकी (IT 402)',
    comp_app_165: 'कंप्यूटर अनुप्रयोग (Computer Applications)',
    data_science_419: 'डेटा साइंस (Data Science 419)',
    fmm_405: 'वित्तीय बाज़ार प्रबंधन (FMM 405)',
  },
  ta: {
    science: 'அறிவியல் (Science)',
    maths: 'கணிதம் (Mathematics)',
    sst: 'சமூக அறிவியல் (Social Science)',
    tamil_006: 'தமிழ் (Tamil)',
    home_science_064: 'மனையியல் (Home Science)',
    painting_049: 'ஓவியக்கலை (Painting)',
    english: 'ஆங்கிலம் (English)',
    ai_417: 'செயற்கை நுண்ணறிவு (AI 417)',
    it_402: 'தகவல் தொழில்நுட்பம் (IT 402)',
  },
  mr: {
    science: 'विज्ञान (Science)',
    maths: 'गणित (Mathematics)',
    sst: 'सामाजिक शास्त्र (Social Science)',
    marathi: 'मराठी (अक्षरभारती)',
    home_science_064: 'गृहविज्ञान (Home Science)',
    painting_049: 'चित्रकला (Painting)',
    english: 'इंग्रजी (English)',
    hindi_a: 'हिंदी कोर्स-अ (Hindi A)',
    hindi_b: 'हिंदी कोर्स-ब (Hindi B)',
    sanskrit: 'संस्कृतम् (शेमुषी भाग-२)',
    ai_417: 'कृत्रिम बुद्धिमत्ता (AI 417)',
    it_402: 'माहिती तंत्रज्ञान (IT 402)',
  },
  te: {
    science: 'సైన్స్ / విజ్ఞాన శాస్త్రం (Science)',
    maths: 'గణితం (Mathematics)',
    sst: 'సాంఘిక శాస్త్రం (Social Science)',
    telugu_007: 'తెలుగు (Telugu)',
    home_science_064: 'హోమ్ సైన్స్ (Home Science)',
    painting_049: 'చిత్రలేఖనం (Painting)',
    english: 'ఆంగ్లం (English)',
    ai_417: 'ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ (AI 417)',
    it_402: 'ఇన్ఫర్మేషన్ టెక్నాలజీ (IT 402)',
  },
  bn: {
    science: 'বিজ্ঞান (Science)',
    maths: 'গণিত (Mathematics)',
    sst: 'সামাজিক বিজ্ঞান (Social Science)',
    bengali_005: 'বাংলা সাহিত্য সঞ্চয়ন (Bengali)',
    home_science_064: 'গৃহবিজ্ঞান (Home Science)',
    painting_049: 'চিত্রকলা (Painting)',
    english: 'ইংরেজি (English)',
    ai_417: 'কৃত্রিম বুদ্ধিমত্তা (AI 417)',
    it_402: 'তথ্য প্রযুক্তি (IT 402)',
  },
  gu: {
    science: 'વિજ્ઞાન (Science)',
    maths: 'ગણિત (Mathematics)',
    sst: 'સામાજિક વિજ્ઞાન (Social Science)',
    gujarati_010: 'ગુજરાતી (Gujarati)',
    home_science_064: 'ગૃહ વિજ્ઞાન (Home Science)',
    painting_049: 'ચિત્રકલા (Painting)',
    english: 'અંગ્રેજી (English)',
    ai_417: 'આર્ટિફિશિયલ ઇન્ટેલિજન્સ (AI 417)',
    it_402: 'ઇન્ફર્મેશન ટેકનોલોજી (IT 402)',
  },
  pa: {
    science: 'ਵਿਗਿਆਨ (Science)',
    maths: 'ਗਣਿਤ (Mathematics)',
    sst: 'ਸਮਾਜਿਕ ਵਿਗਿਆਨ (Social Science)',
    punjabi_004: 'ਪੰਜਾਬੀ (ਸਾਹਿਤ ਮਾਲਾ ਅਤੇ ਵੰਨਗੀ)',
    home_science_064: 'ਗ੍ਰਹਿ ਵਿਗਿਆਨ (Home Science)',
    painting_049: 'ਚਿੱਤਰਕਲਾ (Painting)',
    english: 'ਅੰਗਰੇਜ਼ੀ (English)',
    ai_417: 'ਆਰਟੀਫੀਸ਼ੀਅਲ ਇੰਟੈਲੀਜੈਂਸ (AI 417)',
    it_402: 'ਸੂਚਨਾ ਤਕਨਾਲੋਜੀ (IT 402)',
  },
  sa: {
    science: 'विज्ञानम् (Science)',
    maths: 'गणितम् (Mathematics)',
    sst: 'सामाजिकविज्ञानम् (Social Science)',
    sanskrit: 'संस्कृतम् (शेमुषी द्वितीयो भागः)',
    english: 'आङ्ग्लभाषा (English)',
  },
  ml: {
    science: 'ശാസ്ത്രം (Science)',
    maths: 'ഗണിതം (Mathematics)',
    sst: 'സാമൂഹ്യശാസ്ത്രം (Social Science)',
    english: 'ഇംഗ്ലീഷ് (English)',
  },
  kn: {
    science: 'ವಿಜ್ಞಾನ (Science)',
    maths: 'ಗಣಿತ (Mathematics)',
    sst: 'ಸಮಾಜ ವಿಜ್ಞಾನ (Social Science)',
    english: 'ಇಂಗ್ಲಿಷ್ (English)',
  },
  fr: {
    science: 'Sciences (Science)',
    maths: 'Mathématiques (Mathematics)',
    sst: 'Sciences Sociales (Social Science)',
    french_018: 'Français (Entre Jeunes Classe 10)',
  },
  de: {
    science: 'Naturwissenschaften (Science)',
    maths: 'Mathematik (Mathematics)',
    sst: 'Sozialwissenschaften (Social Science)',
    german_020: 'Deutsch (Beste Freunde B1.1)',
  },
};

/**
 * Chapter translations ONLY for the specific subjects printed in the respective CBSE study mediums:
 * - Science (sci_*)
 * - Mathematics (math_*)
 * - Social Science (sst_*)
 * - Home Science (hs_*)
 * - Painting (pt_*)
 * - Urdu (ur_* when Urdu medium is selected)
 * - Tamil (tm_* when Tamil medium is selected)
 * - Telugu (te_* when Telugu medium is selected)
 * - Bengali (bn_* when Bengali medium is selected)
 * - Gujarati (gj_* when Gujarati medium is selected)
 * - Punjabi (pb_* when Punjabi medium is selected)
 *
 * Non-medium subjects (English, Communicative English, IT 402, AI 417, Computer Applications, etc.)
 * are intentionally NOT in this map so their chapters always remain in English.
 */
const CHAPTER_TRANSLATIONS: Record<string, Partial<Record<LanguageMode, string>>> = {
  // ============================================================================
  // 1. SCIENCE (086) - Printed in CBSE Mediums
  // ============================================================================
  sci_1: {
    ur: 'کیمیائی تعاملات اور مساواتیں (Chemical Reactions and Equations)',
    hi: 'रासायनिक अभिक्रियाएँ एवं समीकरण (Chemical Reactions and Equations)',
    ta: 'வேதி வினைகள் மற்றும் சமன்பாடுகள் (Chemical Reactions and Equations)',
    mr: 'रासायनिक अभिक्रिया आणि समीकरणे (Chemical Reactions and Equations)',
    te: 'రసాయన చర్యలు మరియు సమీకరణాలు (Chemical Reactions and Equations)',
    bn: 'রাসায়নিক বিক্রিয়া ও সমীকরণ (Chemical Reactions and Equations)',
    gu: 'રાસાયણિક પ્રક્રિયાઓ અને સમીકરણો (Chemical Reactions and Equations)',
    pa: 'ਰਸਾਇਣਕ ਕਿਰਿਆਵਾਂ ਅਤੇ ਸਮੀਕਰਨਾਂ (Chemical Reactions and Equations)',
    ml: 'രാസപ്രവർത്തനങ്ങളും സമവാക്യങ്ങളും (Chemical Reactions and Equations)',
    kn: 'ರಾಸಾಯನಿಕ ಕ್ರಿಯೆಗಳು ಮತ್ತು ಸಮೀಕರಣಗಳು (Chemical Reactions and Equations)',
  },
  sci_2: {
    ur: 'تیزاب، اساس اور نمکیات (Acids, Bases and Salts)',
    hi: 'अम्ल, क्षारक एवं लवण (Acids, Bases and Salts)',
    ta: 'அமிலங்கள், காரங்கள் மற்றும் உப்புகள் (Acids, Bases and Salts)',
    mr: 'आम्ल, आम्लारी आणि क्षार (Acids, Bases and Salts)',
    te: 'ఆమ్లాలు, క్షారాలు మరియు లవణాలు (Acids, Bases and Salts)',
    bn: 'অম্ল, ক্ষারক ও লবণ (Acids, Bases and Salts)',
    gu: 'એસિડ, બેઇઝ અને ક્ષાર (Acids, Bases and Salts)',
    pa: 'ਤੇਜ਼ਾਬ, ਖਾਰ ਅਤੇ ਲੂਣ (Acids, Bases and Salts)',
    ml: 'ആസിഡുകൾ, ബേസുകൾ, ലവണങ്ങൾ (Acids, Bases and Salts)',
    kn: 'ಆಮ್ಲಗಳು, ಪ್ರತ್ಯಾಮ್ಲಗಳು ಮತ್ತು ಲವಣಗಳು (Acids, Bases and Salts)',
  },
  sci_3: {
    ur: 'دھاتیں اور ادھاتیں (Metals and Non-metals)',
    hi: 'धातु एवं अधातु (Metals and Non-metals)',
    ta: 'உலோகங்கள் மற்றும் அலோகங்கள் (Metals and Non-metals)',
    mr: 'धातू आणि अधातू (Metals and Non-metals)',
    te: 'లోహాలు మరియు అలోహాలు (Metals and Non-metals)',
    bn: 'ধাতু ও অধাতু (Metals and Non-metals)',
    gu: 'ધાતુઓ અને અધાતુઓ (Metals and Non-metals)',
    pa: 'ਧਾਤਾਂ ਅਤੇ ਅਧਾਤਾਂ (Metals and Non-metals)',
    ml: 'ലോഹങ്ങളും അലോഹങ്ങളും (Metals and Non-metals)',
    kn: 'ಲೋಹಗಳು ಮತ್ತು ಅಲೋಹಗಳು (Metals and Non-metals)',
  },
  sci_4: {
    ur: 'کاربن اور اس کے مرکبات (Carbon and its Compounds)',
    hi: 'कार्बन एवं उसके यौगिक (Carbon and its Compounds)',
    ta: 'கார்பன் மற்றும் அதன் சேர்மங்கள் (Carbon and its Compounds)',
    mr: 'कार्बन आणि त्याची संयुगे (Carbon and its Compounds)',
    te: 'కార్బన్ మరియు దాని సమ్మేళనాలు (Carbon and its Compounds)',
    bn: 'কার্বন ও তার যৌগ (Carbon and its Compounds)',
    gu: 'કાર્બન અને તેનાં સંયોજનો (Carbon and its Compounds)',
    pa: 'ਕਾਰਬਨ ਅਤੇ ਉਸਦੇ ਯੋਗਿਕ (Carbon and its Compounds)',
    ml: 'കാർബണും അതിന്റെ സംയുക്തങ്ങളും (Carbon and its Compounds)',
    kn: 'കಾರ್ಬನ್ ಮತ್ತು ಅದರ ಸಂಯುಕ್ತಗಳು (Carbon and its Compounds)',
  },
  sci_5: {
    ur: 'حیاتیاتی عمل (Life Processes)',
    hi: 'जैव प्रक्रम (Life Processes)',
    ta: 'உயிர்ச் செயல்முறைகள் (Life Processes)',
    mr: 'जीवनप्रक्रिया (Life Processes)',
    te: 'జీవ క్రియలు (Life Processes)',
    bn: 'জীবন প্রক্রিয়া (Life Processes)',
    gu: 'જૈવિક ક્રિયાઓ (Life Processes)',
    pa: 'ਜੈਵਿਕ ਪ੍ਰਕਿਰਿਆਵਾਂ (Life Processes)',
    ml: 'ജീവൽപ്രക്രിയകൾ (Life Processes)',
    kn: 'ಜೀವ ಕ್ರಿಯೆಗಳು (Life Processes)',
  },
  sci_6: {
    ur: 'قابو اور ہم آہنگی (Control and Coordination)',
    hi: 'नियंत्रण एवं समन्वय (Control and Coordination)',
    ta: 'கட்டுப்பாடு மற்றும் ஒருங்கிணைப்பு (Control and Coordination)',
    mr: 'नियंत्रण आणि समन्वय (Control and Coordination)',
    te: 'నియంత్రణ మరియు సమన్వయం (Control and Coordination)',
    bn: 'নিয়ন্ত্রণ ও সমন্বয় (Control and Coordination)',
    gu: 'નિયંત્રણ અને સંકલન (Control and Coordination)',
    pa: 'ਨਿਯੰਤਰਣ ਅਤੇ ਤਾਲਮੇਲ (Control and Coordination)',
    ml: 'നിയന്ത്രണവും ഏകോപനവും (Control and Coordination)',
    kn: 'ನಿಯಂತ್ರಣ ಮತ್ತು ಸಹಭಾಗಿತ್ವ (Control and Coordination)',
  },
  sci_7: {
    ur: 'جاندار تولید کیسے کرتے ہیں؟ (How do Organisms Reproduce?)',
    hi: 'जीव जनन कैसे करते हैं? (How do Organisms Reproduce?)',
    ta: 'உயிரினங்கள் எவ்வாறு இனப்பெருக்கம் செய்கின்றன? (Reproduction)',
    mr: 'सजीव प्रजनन कसे करतात? (How do Organisms Reproduce?)',
    te: 'జీవులు ఎలా ప్రత్యుత్పత్తి జరుపుతాయి? (How do Organisms Reproduce?)',
    bn: 'জীব কীভাবে বংশবিস্তার করে? (How do Organisms Reproduce?)',
    gu: 'સજીવો કેવી રીતે પ્રજનન કરે છે? (How do Organisms Reproduce?)',
    pa: 'ਜੀਵ ਪ੍ਰਜਨਨ ਕਿਵੇਂ ਕਰਦੇ ਹਨ? (How do Organisms Reproduce?)',
    ml: 'ജീവികൾ എങ്ങനെ പ്രത്യുൽപ്പാദനം നടത്തുന്നു? (Reproduction)',
    kn: 'ಜೀವಿಗಳು ಹೇಗೆ ಸಂತಾನೋತ್ಪತ್ತಿ ನಡೆಸುತ್ತವೆ? (Reproduction)',
  },
  sci_8: {
    ur: 'توارث (Heredity)',
    hi: 'आनुवंशिकता (Heredity)',
    ta: 'மரபியல் (Heredity)',
    mr: 'आनुवंशिकता (Heredity)',
    te: 'అనువంశికత (Heredity)',
    bn: 'বংশগতি (Heredity)',
    gu: 'આનુવંશિકતા (Heredity)',
    pa: 'ਅਨੁਵੰਸ਼ਿਕਤਾ (Heredity)',
    ml: 'ജനിതകശാസ്ത്രം (Heredity)',
    kn: 'ಆನುವಂಶೀಯತೆ (Heredity)',
  },
  sci_9: {
    ur: 'روشنی – انعکاس اور انعطاف (Light – Reflection and Refraction)',
    hi: 'प्रकाश – परावर्तन तथा अपवर्तन (Light – Reflection and Refraction)',
    ta: 'ஒளி – எதிரொளிப்பு மற்றும் ஒளிவிலகல் (Light – Reflection and Refraction)',
    mr: 'प्रकाश – परावर्तन आणि अपवर्तन (Light – Reflection and Refraction)',
    te: 'కాంతి – పరావర్తనం మరియు వక్రీభవనం (Light – Reflection and Refraction)',
    bn: 'আলো – প্রতিফলন ও প্রতিসরণ (Light – Reflection and Refraction)',
    gu: 'પ્રકાશ – પરાવર્તન અને વક્રીભવન (Light – Reflection and Refraction)',
    pa: 'ਪ੍ਰਕਾਸ਼ – ਪਰਾਵਰਤਨ ਅਤੇ ਅਪਵਰਤਨ (Light – Reflection and Refraction)',
    ml: 'പ്രകാശം – പ്രതിഫലനവും അപവർത്തനവും (Light)',
    kn: 'ಬೆಳಕು – ಪ್ರತಿಫಲನ ಮತ್ತು ವಕ್ರೀಭವನ (Light)',
  },
  sci_10: {
    ur: 'انسانی آنکھ اور رنگ برنگی دنیا (The Human Eye and the Colourful World)',
    hi: 'मानव नेत्र तथा रंगबिरंगा संसार (The Human Eye and the Colourful World)',
    ta: 'மனிதக் கண் மற்றும் வண்ணமயமான உலகம் (The Human Eye)',
    mr: 'मानवी डोळा आणि रंगीबेरंगी जग (The Human Eye and the Colourful World)',
    te: 'మానవ కన్ను మరియు రంగుల ప్రపంచం (The Human Eye)',
    bn: 'মানুষের চোখ ও রঙিন বিশ্ব (The Human Eye and the Colourful World)',
    gu: 'માનવ આંખ અને રંગબેરંગી દુનિયા (The Human Eye)',
    pa: 'ਮਨੁੱਖੀ ਅੱਖ ਅਤੇ ਰੰਗ-ਬਿਰੰਗਾ ਸੰਸਾਰ (The Human Eye)',
    ml: 'മനുഷ്യനേത്രവും വർണ്ണാഭമായ ലോകവും (The Human Eye)',
    kn: 'ಮಾನವನ ಕಣ್ಣು ಮತ್ತು ವರ್ಣಮಯ ಜಗತ್ತು (The Human Eye)',
  },
  sci_11: {
    ur: 'برق (Electricity)',
    hi: 'विद्युत (Electricity)',
    ta: 'மின்சாரம் (Electricity)',
    mr: 'विद्युतधारा (Electricity)',
    te: 'విద్యుత్ (Electricity)',
    bn: 'তড়িৎ (Electricity)',
    gu: 'વિદ્યુત (Electricity)',
    pa: 'ਬਿਜਲੀ (Electricity)',
    ml: 'വൈദ്യുതി (Electricity)',
    kn: 'ವಿದ್ಯುಚ್ಛಕ್ತಿ (Electricity)',
  },
  sci_12: {
    ur: 'برقی رو کے مقناطیسی اثرات (Magnetic Effects of Electric Current)',
    hi: 'विद्युत धारा के चुंबकीय प्रभाव (Magnetic Effects of Electric Current)',
    ta: 'மின்னோட்டத்தின் காந்த விளைவுகள் (Magnetic Effects of Electric Current)',
    mr: 'विद्युतधारेचे चुंबकीय परिणाम (Magnetic Effects of Electric Current)',
    te: 'విద్యుత్ ప్రవాహం యొక్క అయస్కాంత ప్రభావాలు (Magnetic Effects)',
    bn: 'তড়িৎ প্রবাহের চৌম্বকীয় প্রভাব (Magnetic Effects of Electric Current)',
    gu: 'વિદ્યુતપ્રવાહની ચુંબકીય અસરો (Magnetic Effects of Electric Current)',
    pa: 'ਬਿਜਲੀ ਧਾਰਾ ਦੇ ਚੁੰਬਕੀ ਪ੍ਰਭਾਵ (Magnetic Effects of Electric Current)',
    ml: 'വൈദ്യുതപ്രവാഹത്തിന്റെ കാന്തിക ഫലങ്ങൾ (Magnetic Effects)',
    kn: 'ವಿದ್ಯುತ್ ಪ್ರವಾಹದ ಕಾಂತೀಯ ಪರಿಣಾಮಗಳು (Magnetic Effects)',
  },
  sci_13: {
    ur: 'ہمارا ماحول (Our Environment)',
    hi: 'हमारा पर्यावरण (Our Environment)',
    ta: 'நமது சுற்றுச்சூழல் (Our Environment)',
    mr: 'आपले पर्यावरण (Our Environment)',
    te: 'మన పర్యావరణం (Our Environment)',
    bn: 'আমাদের পরিবেশ (Our Environment)',
    gu: 'આપણું પર્યાવરણ (Our Environment)',
    pa: 'ਸਾਡਾ ਵਾਤਾਵਰਣ (Our Environment)',
    ml: 'നമ്മുടെ പരിസ്ഥിതി (Our Environment)',
    kn: 'ನಮ್ಮ ಪರಿಸರ (Our Environment)',
  },

  // ============================================================================
  // 2. MATHEMATICS (041 / 241) - Printed in CBSE Mediums
  // ============================================================================
  math_1: {
    ur: 'حقیقی اعداد (Real Numbers)',
    hi: 'वास्तविक संख्याएँ (Real Numbers)',
    ta: 'மெய்யெண்கள் (Real Numbers)',
    mr: 'वास्तव संख्या (Real Numbers)',
    te: 'వాస్తవ సంఖ్యలు (Real Numbers)',
    bn: 'বাস্তব সংখ্যা (Real Numbers)',
    gu: 'વાસ્તવિક સંખ્યાઓ (Real Numbers)',
    pa: 'ਵਾਸਤਵਿਕ ਸੰਖਿਆਵਾਂ (Real Numbers)',
    ml: 'യഥാർത്ഥ സംഖ്യകൾ (Real Numbers)',
    kn: 'ವಾಸ್ತವ ಸಂಖ್ಯೆಗಳು (Real Numbers)',
  },
  math_2: {
    ur: 'کثیر رقمی (Polynomials)',
    hi: 'बहुपद (Polynomials)',
    ta: 'பல்லுறுப்புக் கோவைகள் (Polynomials)',
    mr: 'बहुपदी (Polynomials)',
    te: 'బహుపదులు (Polynomials)',
    bn: 'বহুপদী সংখ্যামালা (Polynomials)',
    gu: 'બહુપદીઓ (Polynomials)',
    pa: 'ਬਹੁਪਦ (Polynomials)',
    ml: 'ബഹുപദങ്ങൾ (Polynomials)',
    kn: 'ಬಹುಪದೋಕ್ತಿಗಳು (Polynomials)',
  },
  math_3: {
    ur: 'دو متغیرات والی خطی مساواتوں کا جوڑا (Linear Equations in Two Variables)',
    hi: 'दो चर वाले रैखिक समीकरण युग्म (Pair of Linear Equations in Two Variables)',
    ta: 'இரு மாறிகளில் அமைந்த நேரியச் சமன்பாடுகளின் தொகுப்பு (Linear Equations)',
    mr: 'दोन चलांतील रेषीय समीकरणे (Pair of Linear Equations in Two Variables)',
    te: 'రెండు చరరాశులలో రేఖీయ సమీకరణాల జత (Linear Equations)',
    bn: 'দুই চলবিশিষ্ট রৈখিক সমীকরণ যুগল (Linear Equations in Two Variables)',
    gu: 'દ્વિચલ સુરેખ સમીકરણ યુગ્મ (Pair of Linear Equations)',
    pa: 'ਦੋ ਚਲਾਂ ਵਾਲੇ ਰੇਖੀ ਸਮੀਕਰਨਾਂ ਦੇ ਜੋੜੇ (Pair of Linear Equations)',
    ml: 'രണ്ട് ചരങ്ങളിലുള്ള രേഖീയ സമവാക്യ ജോഡികൾ (Linear Equations)',
    kn: 'ಎರಡು ಚರಾಕ್ಷರಗಳಿರುವ ರೇಖಾತ್ಮಕ ಸಮೀಕರಣಗಳ ಜೋಡಿ (Linear Equations)',
  },
  math_4: {
    ur: 'دو درجی مساواتیں (Quadratic Equations)',
    hi: 'द्विघात समीकरण (Quadratic Equations)',
    ta: 'இருபடிச் சமன்பாடுகள் (Quadratic Equations)',
    mr: 'वर्गसमीकरणे (Quadratic Equations)',
    te: 'వర్గ సమీకరణాలు (Quadratic Equations)',
    bn: 'দ্বিঘাত সমীকরণ (Quadratic Equations)',
    gu: 'દ્વિઘાત સમીકરણ (Quadratic Equations)',
    pa: 'ਦੋ-ਘਾਤੀ ਸਮੀਕਰਨਾਂ (Quadratic Equations)',
    ml: 'ദ്വിമാന സമവാക്യങ്ങൾ (Quadratic Equations)',
    kn: 'ವರ್ಗ ಸಮೀಕರಣಗಳು (Quadratic Equations)',
  },
  math_5: {
    ur: 'حسابی تصاعد (Arithmetic Progressions)',
    hi: 'समांतर श्रेढ़ियाँ (Arithmetic Progressions)',
    ta: 'கூட்டுத் தொடர்வரிசை (Arithmetic Progressions)',
    mr: 'अंकगणिती श्रेढी (Arithmetic Progressions)',
    te: 'శ్రేఢులు (Arithmetic Progressions)',
    bn: 'সমান্তর প্রগতি (Arithmetic Progressions)',
    gu: 'સમાંતર શ્રેણી (Arithmetic Progressions)',
    pa: 'ਅੰਕਗਣਿਤਕ ਲੜੀਆਂ (Arithmetic Progressions)',
    ml: 'സമാന്തര ശ്രേണികൾ (Arithmetic Progressions)',
    kn: 'ಸಮಾಂತರ ಶ್ರೇಢಿಗಳು (Arithmetic Progressions)',
  },
  math_6: {
    ur: 'مثلثات (Triangles)',
    hi: 'त्रिभुज (Triangles)',
    ta: 'முக்கோணங்கள் (Triangles)',
    mr: 'त्रिकोण (Triangles)',
    te: 'త్రిభుజాలు (Triangles)',
    bn: 'ত্রিভুজ (Triangles)',
    gu: 'ત્રિકોણ (Triangles)',
    pa: 'ਤ੍ਰਿਭੁਜ (Triangles)',
    ml: 'ത്രികോണങ്ങൾ (Triangles)',
    kn: 'ತ್ರಿಭುಜಗಳು (Triangles)',
  },
  math_7: {
    ur: 'محددی ہندسہ (Coordinate Geometry)',
    hi: 'निर्देशांक ज्यामिति (Coordinate Geometry)',
    ta: 'ஆயத்தொலை வடிவியல் (Coordinate Geometry)',
    mr: 'निर्देशक भूमिती (Coordinate Geometry)',
    te: 'నిరూపక రేఖాగణితం (Coordinate Geometry)',
    bn: 'স্থানাঙ্ক জ্যামিতি (Coordinate Geometry)',
    gu: 'યામ ભૂમિતિ (Coordinate Geometry)',
    pa: 'ਨਿਰਦੇਸ਼ਾਂਕ ਜਿਆਮਿਤੀ (Coordinate Geometry)',
    ml: 'സൂചകസംഖ്യാ ജ്യാമിതി (Coordinate Geometry)',
    kn: 'ನಿರ್ದೇಶಾಂಕ ರೇಖಾಗಣಿತ (Coordinate Geometry)',
  },
  math_8: {
    ur: 'علم مثلث کا تعارف (Introduction to Trigonometry)',
    hi: 'त्रिकोणमिति का परिचय (Introduction to Trigonometry)',
    ta: 'முக்கோணவியலின் அறிமுகம் (Introduction to Trigonometry)',
    mr: 'त्रिकोणमितीची ओळख (Introduction to Trigonometry)',
    te: 'త్రికోణమితి పరిచయం (Introduction to Trigonometry)',
    bn: 'ত্রিকোণমিতির ভূমিকা (Introduction to Trigonometry)',
    gu: 'ત્રિકોણમિતિનો પરિચય (Introduction to Trigonometry)',
    pa: 'ਤ੍ਰਿਕੋਣਮਿਤੀ ਨਾਲ ਜਾਣ-ਪਛਾਣ (Introduction to Trigonometry)',
    ml: 'ത്രികോണമിതിക്ക് ഒരു ആമുഖം (Introduction to Trigonometry)',
    kn: 'ತ್ರಿಕೋನಮಿತಿಯ ಪ್ರಸ್ತಾವನೆ (Introduction to Trigonometry)',
  },
  math_9: {
    ur: 'علم مثلث کے کچھ اطلاقات (Applications of Trigonometry)',
    hi: 'त्रिकोणमिति के कुछ अनुप्रयोग (Some Applications of Trigonometry)',
    ta: 'முக்கோணவியலின் சில பயன்பாடுகள் (Applications of Trigonometry)',
    mr: 'त्रिकोणमितीचे उपयोजन (Some Applications of Trigonometry)',
    te: 'త్రికోణమితి యొక్క కొన్ని అనువర్తనాలు (Applications of Trigonometry)',
    bn: 'ত্রিকোণমিতির কিছু প্রয়োগ (Applications of Trigonometry)',
    gu: 'ત્રિકોણમિતિના કેટલાક ઉપયોગો (Applications of Trigonometry)',
    pa: 'ਤ੍ਰਿਕੋਣਮਿਤੀ ਦੇ ਕੁਝ ਉਪਯੋਗ (Applications of Trigonometry)',
    ml: 'ത്രികോണമിതിയുടെ ചില പ്രയോഗങ്ങൾ (Applications of Trigonometry)',
    kn: 'ತ್ರಿಕೋನಮಿತಿಯ ಕೆಲವು ಅನ್ವಯಗಳು (Applications of Trigonometry)',
  },
  math_10: {
    ur: 'دائرے (Circles)',
    hi: 'वृत्त (Circles)',
    ta: 'வட்டங்கள் (Circles)',
    mr: 'वर्तुळ (Circles)',
    te: 'వృత్తాలు (Circles)',
    bn: 'বৃত্ত (Circles)',
    gu: 'વર્તુળ (Circles)',
    pa: 'ਚੱਕਰ (Circles)',
    ml: 'വൃത്തങ്ങൾ (Circles)',
    kn: 'ವೃತ್ತಗಳು (Circles)',
  },
  math_11: {
    ur: 'دائروں سے متعلق رقبے (Areas Related to Circles)',
    hi: 'वृत्तों से संबंधित क्षेत्रफल (Areas Related to Circles)',
    ta: 'வட்டங்கள் தொடர்பான பரப்பளவுகள் (Areas Related to Circles)',
    mr: 'वर्तुळाशी संबंधित क्षेत्रफळे (Areas Related to Circles)',
    te: 'వృత్తాలకు సంబంధించిన వైశాల్యాలు (Areas Related to Circles)',
    bn: 'বৃত্ত সম্পর্কিত ক্ষেত্রফল (Areas Related to Circles)',
    gu: 'વર્તુળ સંબંધિત ક્ષેત્રફળ (Areas Related to Circles)',
    pa: 'ਚੱਕਰਾਂ ਨਾਲ ਸਬੰਧਤ ਖੇਤਰਫਲ (Areas Related to Circles)',
    ml: 'വൃത്തങ്ങളുമായി ബന്ധപ്പെട്ട പരപ്പളവുകൾ (Areas Related to Circles)',
    kn: 'ವೃತ್ತಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ವಿಸ್ತೀರ್ಣಗಳು (Areas Related to Circles)',
  },
  math_12: {
    ur: 'سطحی رقبے اور حجم (Surface Areas and Volumes)',
    hi: 'पृष्ठीय क्षेत्रफल और आयतन (Surface Areas and Volumes)',
    ta: 'புறப்பரப்பளவுகள் மற்றும் கனஅளவுகள் (Surface Areas and Volumes)',
    mr: 'पृष्ठफळ आणि घनफळ (Surface Areas and Volumes)',
    te: 'ఉపరితల వైశాల్యాలు మరియు ఘనపరిమాణాలు (Surface Areas and Volumes)',
    bn: 'পৃষ্ঠতলের ক্ষেত্রফল ও আয়তন (Surface Areas and Volumes)',
    gu: 'પૃષ્ઠફળ અને ઘનફળ (Surface Areas and Volumes)',
    pa: 'ਸਤਾਹ ਦਾ ਖੇਤਰਫਲ ਅਤੇ ਆਇਤਨ (Surface Areas and Volumes)',
    ml: 'ഉപരിതല വിസ്തീർണ്ണവും വ്യാപ്തവും (Surface Areas and Volumes)',
    kn: 'ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣಗಳು ಮತ್ತು ಘನಫಲಗಳು (Surface Areas and Volumes)',
  },
  math_13: {
    ur: 'شماریات (Statistics)',
    hi: 'सांख्यिकी (Statistics)',
    ta: 'புள்ளியியல் (Statistics)',
    mr: 'सांख्यिकी (Statistics)',
    te: 'సాంఖ్యక శాస్త్రం (Statistics)',
    bn: 'রাশিবিজ্ঞান (Statistics)',
    gu: 'આંકડાશાસ્ત્ર (Statistics)',
    pa: 'ਅੰਕੜਾ ਵਿਗਿਆਨ (Statistics)',
    ml: 'സ്ഥിതിവിവരക്കണക്ക് (Statistics)',
    kn: 'ಸಂಖ್ಯಾಶಾಸ್ತ್ರ (Statistics)',
  },
  math_14: {
    ur: 'احتمال (Probability)',
    hi: 'प्रायिकता (Probability)',
    ta: 'நிகழ்தகவு (Probability)',
    mr: 'संभाव्यता (Probability)',
    te: 'సంభావ్యత (Probability)',
    bn: 'সম্ভাবনা (Probability)',
    gu: 'સંભાવના (Probability)',
    pa: 'ਸੰਭਾਵਨਾ (Probability)',
    ml: 'സാധ്യതാ സിദ്ധാന്തം (Probability)',
    kn: 'ಸಂಭವನೀಯತೆ (Probability)',
  },

  // ============================================================================
  // 3. SOCIAL SCIENCE (087) - Printed in CBSE Mediums
  // ============================================================================
  sst_h1: {
    ur: 'یورپ میں قوم پرستی کا عروج (The Rise of Nationalism in Europe)',
    hi: 'यूरोप में राष्ट्रवाद का उदय (The Rise of Nationalism in Europe)',
    ta: 'ஐரோப்பாவில் தேசியத்தின் எழுச்சி (The Rise of Nationalism in Europe)',
    mr: 'युरोपातील राष्ट्रवादाचा उदय (The Rise of Nationalism in Europe)',
    te: 'యూరప్‌లో జాతీయవాద ఆవిర్భావం (The Rise of Nationalism in Europe)',
    bn: 'ইউরোপে জাতীয়তাবাদের উত্থান (The Rise of Nationalism in Europe)',
    gu: 'યુરોપમાં રાષ્ટ્રવાદનો ઉદય (The Rise of Nationalism in Europe)',
    pa: 'ਯੂਰਪ ਵਿੱਚ ਰਾਸ਼ਟਰਵਾਦ ਦਾ ਉਭਾਰ (The Rise of Nationalism in Europe)',
  },
  sst_h2: {
    ur: 'ہندوستان میں قوم پرستی (Nationalism in India)',
    hi: 'भारत में राष्ट्रवाद (Nationalism in India)',
    ta: 'இந்தியாவில் தேசியம் (Nationalism in India)',
    mr: 'भारतातील राष्ट्रवाद (Nationalism in India)',
    te: 'భారతదేశంలో జాతీయవాదం (Nationalism in India)',
    bn: 'ভারতে জাতীয়তাবাদ (Nationalism in India)',
    gu: 'ભારતમાં રાષ્ટ્રવાદ (Nationalism in India)',
    pa: 'ਭਾਰਤ ਵਿੱਚ ਰਾਸ਼ਟਰਵਾਦ (Nationalism in India)',
  },
  sst_h3: {
    ur: 'عالمی دنیا کی تشکیل (The Making of a Global World)',
    hi: 'भूमंडलीकृत विश्व का बनना (The Making of a Global World)',
    ta: 'உலகளாவிய உலகின் உருவாக்கம் (The Making of a Global World)',
    mr: 'जागतिकीकृत जगाची निर्मिती (The Making of a Global World)',
    te: 'భౌగోళిక ప్రపంచ నిర్మాణం (The Making of a Global World)',
    bn: 'বিশ্বায়িত বিশ্বের নির্মাণ (The Making of a Global World)',
    gu: 'વૈશ્વિક વિશ્વનું નિર્માણ (The Making of a Global World)',
    pa: 'ਵিশਵ-ਵਿਆਪੀ ਦੁਨੀਆ ਦਾ ਬਣਨਾ (The Making of a Global World)',
  },
  sst_h4: {
    ur: 'صنعت کاری کا دور (The Age of Industrialisation)',
    hi: 'औद्योगीकरण का युग (The Age of Industrialisation)',
    ta: 'தொழில்மயமாக்கலின் காலம் (The Age of Industrialisation)',
    mr: 'औद्योगिकीकरणाचे युग (The Age of Industrialisation)',
    te: 'పారిశ్రామికీకరణ యుగం (The Age of Industrialisation)',
    bn: 'শিল্পায়নের যুগ (The Age of Industrialisation)',
    gu: 'ઔદ્યોગિકીકરણનો યુગ (The Age of Industrialisation)',
    pa: 'ਉਦਯੋਗੀਕਰਨ ਦਾ ਯੁੱਗ (The Age of Industrialisation)',
  },
  sst_h5: {
    ur: 'پرنٹ کلچر اور جدید دنیا (Print Culture and the Modern World)',
    hi: 'मुद्रण संस्कृति और आधुनिक दुनिया (Print Culture and the Modern World)',
    ta: 'அச்சுப் பண்பாடும் நவீன உலகமும் (Print Culture and the Modern World)',
    mr: 'मुद्रण संस्कृती आणि आधुनिक जग (Print Culture and the Modern World)',
    te: 'ముద్రణ సంస్కృతి మరియు ఆధునిక ప్రపంచం (Print Culture and the Modern World)',
    bn: 'মুদ্রণ সংস্কৃতি ও আধুনিক বিশ্ব (Print Culture and the Modern World)',
    gu: 'મુદ્રણ સંસ્કૃતિ અને આધુનિક વિશ્વ (Print Culture and the Modern World)',
    pa: 'ਛਪਾਈ ਸੱਭਿਆਚਾਰ ਅਤੇ ਆਧੁਨਿਕ ਦੁਨੀਆ (Print Culture and the Modern World)',
  },
  sst_g1: {
    ur: 'وسائل اور ترقی (Resources and Development)',
    hi: 'संसाधन एवं विकास (Resources and Development)',
    ta: 'வளங்கள் மற்றும் மேம்பாடு (Resources and Development)',
    mr: 'संसाधने आणि विकास (Resources and Development)',
    te: 'వనరులు మరియు అభివృద్ధి (Resources and Development)',
    bn: 'সম্পদ ও উন্নয়ন (Resources and Development)',
    gu: 'સંસાધનો અને વિકાસ (Resources and Development)',
    pa: 'ਸਰੋਤ ਅਤੇ ਵਿਕਾਸ (Resources and Development)',
  },
  sst_g2: {
    ur: 'جنگلات اور جنگلی حیات کے وسائل (Forest and Wildlife Resources)',
    hi: 'वन एवं वन्य जीव संसाधन (Forest and Wildlife Resources)',
    ta: 'காடுகள் மற்றும் வனவிலங்கு வளங்கள் (Forest and Wildlife Resources)',
    mr: 'वन आणि वन्यजीव संसाधने (Forest and Wildlife Resources)',
    te: 'అటవీ మరియు వన్యప్రాణుల వనరులు (Forest and Wildlife Resources)',
    bn: 'বন ও বন্যপ্রাণী সম্পদ (Forest and Wildlife Resources)',
    gu: 'વન અને વન્યજીવ સંસાધનો (Forest and Wildlife Resources)',
    pa: 'ਜੰਗਲ ਅਤੇ ਜੰਗਲੀ ਜੀਵ ਸਰੋਤ (Forest and Wildlife Resources)',
  },
  sst_g3: {
    ur: 'آبی وسائل (Water Resources)',
    hi: 'जल संसाधन (Water Resources)',
    ta: 'நீர் வளங்கள் (Water Resources)',
    mr: 'जलसंपत्ती (Water Resources)',
    te: 'నీటి వనరులు (Water Resources)',
    bn: 'জলসম্পদ (Water Resources)',
    gu: 'જળ સંસાધનો (Water Resources)',
    pa: 'ਜਲ ਸਰੋਤ (Water Resources)',
  },
  sst_g4: {
    ur: 'زراعت (Agriculture)',
    hi: 'कृषि (Agriculture)',
    ta: 'வேளாண்மை (Agriculture)',
    mr: 'शेती / कृषी (Agriculture)',
    te: 'వ్యవసాయం (Agriculture)',
    bn: 'কৃষি (Agriculture)',
    gu: 'કૃષિ (Agriculture)',
    pa: 'ਖੇਤੀਬਾੜੀ (Agriculture)',
  },
  sst_g5: {
    ur: 'معدنیات اور توانائی کے وسائل (Minerals and Energy Resources)',
    hi: 'खनिज तथा ऊर्जा संसाधन (Minerals and Energy Resources)',
    ta: 'கனிமங்கள் மற்றும் ஆற்றல் வளங்கள் (Minerals and Energy Resources)',
    mr: 'खनिजे आणि ऊर्जा संसाधने (Minerals and Energy Resources)',
    te: 'ఖనిజాలు మరియు శక్తి వనరులు (Minerals and Energy Resources)',
    bn: 'খনিজ ও শক্তি সম্পদ (Minerals and Energy Resources)',
    gu: 'ખનિજો અને ઊર્જા સંસાધનો (Minerals and Energy Resources)',
    pa: 'ਖਣਿਜ ਅਤੇ ਊਰਜਾ ਸਰੋਤ (Minerals and Energy Resources)',
  },
  sst_g6: {
    ur: 'مینوفیکچرنگ صنعتیں (Manufacturing Industries)',
    hi: 'विनिर्माण उद्योग (Manufacturing Industries)',
    ta: 'உற்பத்தித் தொழில்கள் (Manufacturing Industries)',
    mr: 'उत्पादन उद्योग (Manufacturing Industries)',
    te: 'ఉత్పాదక పరిశ్రమలు (Manufacturing Industries)',
    bn: 'উৎপাদন শিল্প (Manufacturing Industries)',
    gu: 'ઉત્પાદન ઉદ્યોગો (Manufacturing Industries)',
    pa: 'ਨਿਰਮਾਣ ਉਦਯੋਗ (Manufacturing Industries)',
  },
  sst_g7: {
    ur: 'قومی معیشت کی شہ رگیں (Lifelines of National Economy)',
    hi: 'राष्ट्रीय अर्थव्यवस्था की जीवन रेखाएँ (Lifelines of National Economy)',
    ta: 'தேசியப் பொருளாதாரத்தின் உயிர்நாடிகள் (Lifelines of National Economy)',
    mr: 'राष्ट्रीय अर्थव्यवस्थेच्या जीवनरेषा (Lifelines of National Economy)',
    te: 'జాతీయ ఆర్థిక వ్యవస్థ జీవనాడులు (Lifelines of National Economy)',
    bn: 'জাতীয় অর্থনীতির জীবনরেখা (Lifelines of National Economy)',
    gu: 'રાષ્ટ્રીય અર્થતંત્રની જીવાદોરી (Lifelines of National Economy)',
    pa: 'ਰਾਸ਼ਟਰੀ ਅਰਥਵਿਵਸਥਾ ਦੀਆਂ ਜੀਵਨ ਰੇਖਾਵਾਂ (Lifelines of National Economy)',
  },
  sst_c1: {
    ur: 'اقتدار کی شراکت (Power Sharing)',
    hi: 'सत्ता की साझेदारी (Power Sharing)',
    ta: 'அதிகாரப் பகிர்வு (Power Sharing)',
    mr: 'सत्तेची भागीदारी (Power Sharing)',
    te: 'అధికార భాగస్వామ్యం (Power Sharing)',
    bn: 'ক্ষমতার ভাগাভাগি (Power Sharing)',
    gu: 'સત્તાની ભાગીદારી (Power Sharing)',
    pa: 'ਸੱਤਾ ਦੀ ਭਾਈਵਾਲੀ (Power Sharing)',
  },
  sst_c2: {
    ur: 'وفاقیت (Federalism)',
    hi: 'संघवाद (Federalism)',
    ta: 'கூட்டாட்சி (Federalism)',
    mr: 'संघराज्य पद्धती (Federalism)',
    te: 'సమాఖ్య విధానం (Federalism)',
    bn: 'যুক্তরাষ্ট্রীয় ব্যবস্থা (Federalism)',
    gu: 'સંઘવાદ (Federalism)',
    pa: 'ਸੰਘਵਾਦ (Federalism)',
  },
  sst_c3: {
    ur: 'صنف، مذہب اور ذات (Gender, Religion and Caste)',
    hi: 'जाति, धर्म और लैंगिक मसले (Gender, Religion and Caste)',
    ta: 'பாலினம், மதம் மற்றும் சாதி (Gender, Religion and Caste)',
    mr: 'लिंगभाव, धर्म आणि जात (Gender, Religion and Caste)',
    te: 'లింగం, మతం మరియు కులం (Gender, Religion and Caste)',
    bn: 'লিঙ্গ, ধর্ম এবং জাতি (Gender, Religion and Caste)',
    gu: 'જાતિ, ધર્મ અને લૈંગિક મુદ્દાઓ (Gender, Religion and Caste)',
    pa: 'ਲਿੰਗ, ਧਰਮ ਅਤੇ ਜਾਤੀ (Gender, Religion and Caste)',
  },
  sst_c4: {
    ur: 'سیاسی جماعتیں (Political Parties)',
    hi: 'राजनीतिक दल (Political Parties)',
    ta: 'அரசியல் கட்சிகள் (Political Parties)',
    mr: 'राजकीय पक्ष (Political Parties)',
    te: 'రాజకీయ పార్టీలు (Political Parties)',
    bn: 'রাজনৈতিক দল (Political Parties)',
    gu: 'રાજકીય પક્ષો (Political Parties)',
    pa: 'ਰਾਜਨੀਤਿਕ ਪਾਰਟੀਆਂ (Political Parties)',
  },
  sst_c5: {
    ur: 'جمہوریت کے نتائج (Outcomes of Democracy)',
    hi: 'लोकतंत्र के परिणाम (Outcomes of Democracy)',
    ta: 'மக்களாட்சியின் விளைவுகள் (Outcomes of Democracy)',
    mr: 'लोकशाहीचे परिणाम (Outcomes of Democracy)',
    te: 'ప్రజాస్వామ్య ఫలితాలు (Outcomes of Democracy)',
    bn: 'গণতন্ত্রের ফলাফল (Outcomes of Democracy)',
    gu: 'લોકશાહીના પરિણામો (Outcomes of Democracy)',
    pa: 'ਲੋਕਤੰਤਰ ਦੇ ਨਤੀਜੇ (Outcomes of Democracy)',
  },
  sst_e1: {
    ur: 'ترقی (Development)',
    hi: 'विकास (Development)',
    ta: 'மேம்பாடு (Development)',
    mr: 'विकास (Development)',
    te: 'అభివృద్ధి (Development)',
    bn: 'উন্নয়ন (Development)',
    gu: 'વિકાસ (Development)',
    pa: 'ਵਿਕਾਸ (Development)',
  },
  sst_e2: {
    ur: 'ہندوستانی معیشت کے شعبے (Sectors of the Indian Economy)',
    hi: 'भारतीय अर्थव्यवस्था के क्षेत्रक (Sectors of the Indian Economy)',
    ta: 'இந்தியப் பொருளாதாரத்தின் துறைகள் (Sectors of the Indian Economy)',
    mr: 'भारतीय अर्थव्यवस्थेची क्षेत्रे (Sectors of the Indian Economy)',
    te: 'భారత ఆర్థిక వ్యవస్థ రంగాలు (Sectors of the Indian Economy)',
    bn: 'ভারতীয় অর্থনীতির ক্ষেত্রসমূহ (Sectors of the Indian Economy)',
    gu: 'ભારતીય અર્થતંત્રના ક્ષેત્રો (Sectors of the Indian Economy)',
    pa: 'ਭਾਰਤੀ ਅਰਥਵਿਵਸਥਾ ਦੇ ਖੇਤਰ (Sectors of the Indian Economy)',
  },
  sst_e3: {
    ur: 'زر اور قرض (Money and Credit)',
    hi: 'मुद्रा और साख (Money and Credit)',
    ta: 'பணம் மற்றும் கடன் (Money and Credit)',
    mr: 'पैसा आणि पत (Money and Credit)',
    te: 'ద్రవ్యం మరియు పరపతి (Money and Credit)',
    bn: 'অর্থ ও ঋণ (Money and Credit)',
    gu: 'નાણું અને શાખ (Money and Credit)',
    pa: 'ਮੁਦਰਾ ਅਤੇ ਸਾਖ (Money and Credit)',
  },
  sst_e4: {
    ur: 'عالمگیریت اور ہندوستانی معیشت (Globalisation and the Indian Economy)',
    hi: 'वैश्वीकरण और भारतीय अर्थव्यवस्था (Globalisation and the Indian Economy)',
    ta: 'உலகமயமாக்கல் மற்றும் இந்தியப் பொருளாதாரம் (Globalisation and the Indian Economy)',
    mr: 'जागतिकीकरण आणि भारतीय अर्थव्यवस्था (Globalisation and the Indian Economy)',
    te: 'ప్రపంచీకరణ మరియు భారత ఆర్థిక వ్యవస్థ (Globalisation and the Indian Economy)',
    bn: 'বিশ্বায়ন ও ভারতীয় অর্থনীতি (Globalisation and the Indian Economy)',
    gu: 'વૈશ્વિકીકરણ અને ભારતીય અર્થતંત્ર (Globalisation and the Indian Economy)',
    pa: 'ਵੈਸ਼ਵੀਕਰਨ ਅਤੇ ਭਾਰਤੀ ਅਰਥਵਿਵਸਥਾ (Globalisation and the Indian Economy)',
  },

  // ============================================================================
  // 4. HOME SCIENCE (064) & PAINTING (049) - Printed in CBSE Mediums
  // ============================================================================
  hs_ch1: {
    ur: 'اکائی اول: انسانی نشوونما اور ترقی – II (Human Growth & Development – II)',
    hi: 'इकाई I: मानव वृद्धि एवं विकास – II (Human Growth & Development – II)',
    ta: 'அலகு I: மனித வளர்ச்சி மற்றும் மேம்பாடு – II (Human Growth & Development)',
    mr: 'घटक I: मानवी वाढ आणि विकास – II (Human Growth & Development – II)',
  },
  hs_ch2: {
    ur: 'اکائی دوم: وسائل کا انتظام – وقت، توانائی اور پیسہ (Management of Resources)',
    hi: 'इकाई II: संसाधनों का प्रबंधन – समय, ऊर्जा एवं धन (Management of Resources)',
    ta: 'அலகு II: வள மேலாண்மை – நேரம், ஆற்றல் மற்றும் பணம் (Management of Resources)',
    mr: 'घटक II: संसाधनांचे व्यवस्थापन – वेळ, ऊर्जा आणि पैसा (Management of Resources)',
  },
  hs_ch3: {
    ur: 'اکائی سوم: خوراک اور ذاتی حفظانِ صحت (Food and Personal Hygiene)',
    hi: 'इकाई III: खाद्य एवं व्यक्तिगत स्वच्छता (Food and Personal Hygiene)',
    ta: 'அலகு III: உணவு மற்றும் தன் சுத்தம் (Food and Personal Hygiene)',
    mr: 'घटक III: अन्न आणि वैयक्तिक स्वच्छता (Food and Personal Hygiene)',
  },
  hs_ch4: {
    ur: 'اکائی چہارم: خوراک کی منصوبہ بندی اور متوازن غذا (Meal Planning)',
    hi: 'इकाई IV: आहार आयोजन एवं संतुलित आहार (Meal Planning)',
    ta: 'அலகு IV: உணவுத் திட்டமிடல் மற்றும் சரிவிகித உணவு (Meal Planning)',
    mr: 'घटक IV: आहार नियोजन आणि संतुलित आहार (Meal Planning)',
  },
  hs_ch5: {
    ur: 'اکائی پنجم: غذائی تحفظ اور صارفین کی تعلیم (Food Safety & Consumer Education)',
    hi: 'इकाई V: खाद्य सुरक्षा और उपभोक्ता शिक्षा (Food Safety & Consumer Education)',
    ta: 'அலகு V: உணவுப் பாதுகாப்பு மற்றும் நுகர்வோர் கல்வி (Food Safety)',
    mr: 'घटक V: अन्न सुरक्षा आणि ग्राहक शिक्षण (Food Safety & Consumer Education)',
  },
  hs_ch6: {
    ur: 'اکائی ششم: کپڑوں اور لباس کی دیکھ بھال اور رکھ رکھاؤ (Care of Fabrics & Apparel)',
    hi: 'इकाई VI: वस्त्रों एवं परिधानों की देखभाल और रखरखाव (Care of Fabrics & Apparel)',
    ta: 'அலகு VI: துணிகள் மற்றும் ஆடைகளின் பராமரிப்பு (Care of Fabrics & Apparel)',
    mr: 'घटक VI: वस्त्र आणि परिधानांची काळजी व देखभाल (Care of Fabrics & Apparel)',
  },
  pt_ch1: {
    ur: 'ہندوستانی مصوری کے چھ اصول (شادنگا) اور بصری فن کے عناصر (Elements of Visual Arts)',
    hi: 'भारतीय चित्रकला के षडंग एवं दृश्य कला के तत्व (Six Limbs & Elements of Visual Arts)',
    ta: 'இந்திய ஓவியத்தின் ஆறு அங்கங்கள் மற்றும் காட்சிக் கலையின் கூறுகள் (Elements of Visual Arts)',
    mr: 'भारतीय चित्रकलेचे षडंग आणि दृश्यकलेचे घटक (Elements of Visual Arts)',
  },
  pt_ch2: {
    ur: 'تشکیل کے اصول: وحدت، ہم آہنگی، توازن اور تناسب (Principles of Composition)',
    hi: 'संयोजन के सिद्धांत: एकता, सामंजस्य, संतुलन, लय और अनुपात (Principles of Composition)',
    ta: 'ஓவிய அமைப்பின் கோட்பாடுகள்: ஒற்றுமை, சமநிலை மற்றும் விகிதம் (Principles of Composition)',
    mr: 'संयोजनाची तत्त्वे: एकता, सुसंवाद, समतोल आणि प्रमाण (Principles of Composition)',
  },
  pt_ch3: {
    ur: 'مصوری کے اوزار اور مواد: آبی رنگ، پوسٹر کلر، پنسل اور برش (Tools & Materials)',
    hi: 'चित्रकला के उपकरण एवं सामग्री: जलरंग, पोस्टर कलर, पेंसिल व ब्रश (Tools & Materials)',
    ta: 'ஓவியக் கருவிகள் மற்றும் материалы: நீர் வண்ணம், பென்சில் மற்றும் தூரிகைகள் (Tools & Materials)',
    mr: 'चित्रकलेची साधने आणि साहित्य: जलरंग, पोस्टर कलर्स, पेन्सिल व ब्रश (Tools & Materials)',
  },
  pt_ch4: {
    ur: 'ہندوستانی فن کی قدردانی: بودھی ستوا پدمپانی – اجنتا (Bodhisattva Padmapani)',
    hi: 'भारतीय कला की सराहना: बोधिसत्व पद्मपाणि – अजंता (Bodhisattva Padmapani)',
    ta: 'இந்தியக் கலை நயப்பு: போதிசத்வ பத்மபாணி – அஜந்தா (Bodhisattva Padmapani)',
    mr: 'भारतीय कलेचे रसग्रहण: बोधिसत्व पद्मपाणी – अजिंठा (Bodhisattva Padmapani)',
  },
  pt_ch5: {
    ur: 'مجسمہ سازی اور فن تعمیر: اشوک کا شیر سرمایۂ سارناتھ اور کیلاش مندر ایلورا',
    hi: 'मूर्तिकला एवं वास्तुकला: अशोक सिंह स्तंभ (सारनाथ) एवं कैलाशनाथ मंदिर (एलोरा)',
    ta: 'சிற்பம் மற்றும் கட்டிடக்கலை: சாரநாத் சிங்கத் தூண் மற்றும் எல்லோரா கைலாசநாதர் கோவில்',
    mr: 'शिल्पकला आणि स्थापत्यकला: अशोक सिंहस्तंभ (सारनाथ) आणि कैलास मंदिर (वेरूळ)',
  },
  pt_ch6: {
    ur: 'ہندوستانی لوک فن کی روایات: مدھوبنی اور وارلی آرٹ (Madhubani & Warli Art)',
    hi: 'भारतीय लोक कला परंपराएँ: मधुबनी एवं वारली चित्रकला (Madhubani & Warli Art)',
    ta: 'இந்திய நாட்டுப்புறக் கலை மரபுகள்: மதுபானி மற்றும் வார்லி கலை (Madhubani & Warli Art)',
    mr: 'भारतीय लोककला परंपरा: मधुबनी आणि वारली चित्रकला (Madhubani & Warli Art)',
  },

  // ============================================================================
  // 5. MEDIUM-SPECIFIC NATIVE LANGUAGE CHAPTERS (Urdu, Tamil, Telugu, etc.)
  // ============================================================================
  ur_ch1: {
    ur: 'حمد، نعت، غزل اور نظم (میر تقی میر، غالب، اقبال، چکبست)',
  },
  ur_ch2: {
    ur: 'افسانہ، مضمون، خاکہ اور ڈراما (پریم چند، سرسید، پطرس بخاری)',
  },
  ur_ch3: {
    ur: 'معاون درسی کتاب: سب رنگ / گلزارِ اردو کہانیاں (Sab Rang / Gulzar-e-Urdu)',
  },
  ur_g1: {
    ur: 'قواعد: اسم، ضمیر، صفت، فعل، متضاد، مترادف اور محاورے (Urdu Grammar)',
  },
  ur_g2: {
    ur: 'تحریری مہارت: خط نگاری، مضمون نگاری اور درخواست نویسی (Letters & Essays)',
  },
  tm_ch1: {
    ta: 'இயல் 1 & 2: அமுத ஊற்று & உயிரின் ஓசை (மொழி, இயற்கை, திருக்குறள்)',
  },
  tm_ch2: {
    ta: 'இயல் 3 & 4: கூட்டாஞ்சோறு & நான்காம் தமிழ் (பண்பாடு, அறிவியல் & தொழில்நுட்பம்)',
  },
  tm_ch3: {
    ta: 'இயல் 5 & 6: மணற்கேணி & நிலமெல்லாம் (கல்வி, கலை, அழகியல் & திருக்குறள்)',
  },
  tm_g1: {
    ta: 'இலக்கணம்: எழுத்து, சொல், தொகைநிலை/தொகாநிலைத் தொடர்கள், பொருள் இலக்கணம்',
  },
  tm_g2: {
    ta: 'கடித இலக்கியம், கட்டுரை மற்றும் படம் பார்த்து கருத்து எழுதுதல்',
  },
};

const GROUP_TRANSLATIONS: Record<string, Partial<Record<LanguageMode, string>>> = {
  Chemistry: {
    ur: 'کیمیا (Chemistry)',
    hi: 'रसायन विज्ञान (Chemistry)',
    ta: 'வேதியியல் (Chemistry)',
    mr: 'रसायनशास्त्र (Chemistry)',
    te: 'రసాయన శాస్త్రం (Chemistry)',
    bn: 'রসায়ন (Chemistry)',
    gu: 'રસાયણ વિજ્ઞાન (Chemistry)',
    pa: 'ਰਸਾਇਣ ਵਿਗਿਆਨ (Chemistry)',
  },
  Biology: {
    ur: 'حیاتیات (Biology)',
    hi: 'जीव विज्ञान (Biology)',
    ta: 'உயிரியல் (Biology)',
    mr: 'जीवशास्त्र (Biology)',
    te: 'జీవ శాస్త్రం (Biology)',
    bn: 'জীববিজ্ঞান (Biology)',
    gu: 'જીવ વિજ્ઞાન (Biology)',
    pa: 'ਜੀਵ ਵਿਗਿਆਨ (Biology)',
  },
  'Physics & Environment': {
    ur: 'طبیعیات اور ماحول (Physics & Environment)',
    hi: 'भौतिकी एवं पर्यावरण (Physics & Environment)',
    ta: 'இயற்பியல் மற்றும் சுற்றுச்சூழல் (Physics & Environment)',
    mr: 'भौतिकशास्त्र आणि पर्यावरण (Physics & Environment)',
    te: 'భౌతిక శాస్త్రం & పర్యావరణం (Physics & Environment)',
    bn: 'পদার্থবিজ্ঞান ও পরিবেশ (Physics & Environment)',
    gu: 'ભૌતિક વિજ્ઞાન અને પર્યાવરણ (Physics & Environment)',
    pa: 'ਭੌਤਿਕ ਵਿਗਿਆਨ ਅਤੇ ਵਾਤਾਵਰਣ (Physics & Environment)',
  },
  'History (India and the Contemporary World - II)': {
    ur: 'تاریخ (ہندوستان اور معاصر دنیا - II)',
    hi: 'इतिहास (भारत और समकालीन विश्व - II)',
    ta: 'வரலாறு (இந்தியாவும் சமகால உலகமும் - II)',
    mr: 'इतिहास (भारत आणि समकालीन जग - II)',
    te: 'చరిత్ర (భారతదేశం మరియు సమకాలీన ప్రపంచం - II)',
    bn: 'ইতিহাস (ভারত ও সমসাময়িক বিশ্ব - II)',
    gu: 'ઇતિહાસ (ભારત અને સમકાલીન વિશ્વ - II)',
    pa: 'ਇਤਿਹਾਸ (ਭਾਰਤ ਅਤੇ ਸਮਕਾਲੀ ਸੰਸਾਰ - II)',
  },
  'Geography (Contemporary India - II)': {
    ur: 'جغرافیہ (معاصر ہندوستان - II)',
    hi: 'भूगोल (समकालीन भारत - II)',
    ta: 'புவியியல் (சமகால இந்தியா - II)',
    mr: 'भूगोल (समकालीन भारत - II)',
    te: 'భూగోళ శాస్త్రం (సమకాలీన భారతదేశం - II)',
    bn: 'ভূগোল (সমসাময়িক ভারত - II)',
    gu: 'ભૂગોળ (સમકાલીન ભારત - II)',
    pa: 'ਭੂਗੋਲ (ਸਮਕਾਲੀ ਭਾਰਤ - II)',
  },
  'Political Science (Democratic Politics - II)': {
    ur: 'سیاسیات (جمہوری سیاست - II)',
    hi: 'राजनीति विज्ञान (लोकतांत्रिक राजनीति - II)',
    ta: 'அரசியல் அறிவியல் (மக்களாட்சி அரசியல் - II)',
    mr: 'राज्यशास्त्र (लोकशाही राजकारण - II)',
    te: 'రాజనీతి శాస్త్రం (ప్రజాస్వామ్య రాజకీయాలు - II)',
    bn: 'রাষ্ট্রবিজ্ঞান (গণতান্ত্রিক রাজনীতি - II)',
    gu: 'રાજ્યશાસ્ત્ર (લોકશાહી રાજકારણ - II)',
    pa: 'ਰਾਜਨੀਤੀ ਸ਼ਾਸਤਰ (ਲੋਕਤੰਤਰੀ ਰਾਜਨੀਤੀ - II)',
  },
  'Economics (Understanding Economic Development)': {
    ur: 'معاشیات (معاشی ترقی کی تفہیم)',
    hi: 'अर्थशास्त्र (आर्थिक विकास की समझ)',
    ta: 'பொருளியல் (பொருளாதார மேம்பாட்டைப் புரிந்துகொள்ளுதல்)',
    mr: 'अर्थशास्त्र (आर्थिक विकासाची समज)',
    te: 'అర్థశాస్త్రం (ఆర్థిక అభివృద్ధి అవగాహన)',
    bn: 'অর্থনীতি (অর্থনৈতিক উন্নয়নের ধারণা)',
    gu: 'અર્થશાસ્ત્ર (આર્થિક વિકાસની સમજ)',
    pa: 'ਅਰਥ ਸ਼ਾਸਤਰ (ਆਰਥਿਕ ਵਿਕਾਸ ਦੀ ਸਮਝ)',
  },
  // Exact Class 10 Subject Group Names from chaptersData.ts
  'Chemical Substances - Nature & Behaviour': {
    ur: 'کیمیائی مادے – نوعیت اور رویہ (Chemical Substances)',
    hi: 'रासायनिक पदार्थ – प्रकृति एवं व्यवहार (Chemical Substances)',
    ta: 'வேதிப் பொருட்கள் – தன்மை மற்றும் நடத்தை',
    mr: 'रासायनिक पदार्थ – स्वरूप आणि गुणधर्म (Chemical Substances)',
    te: 'రసాయన పదార్థాలు – స్వభావం మరియు ప్రవర్తన',
    bn: 'রাসায়নিক পদার্থ – প্রকৃতি ও আচরণ',
    gu: 'રાસાયણિક પદાર્થો – પ્રકૃતિ અને વર્તણૂક',
    pa: 'ਰਸਾਇਣਕ ਪਦਾਰਥ – ਸੁਭਾਅ ਅਤੇ ਵਿਵਹਾਰ',
  },
  'World of Living': {
    ur: 'حیاتیاتی دنیا (World of Living - Biology)',
    hi: 'सजीव जगत (World of Living - Biology)',
    ta: 'உயிரின உலகம் (World of Living)',
    mr: 'सजीव सृष्टी (World of Living - Biology)',
    te: 'జీవ ప్రపంచం (World of Living)',
    bn: 'জীবজগৎ (World of Living)',
    gu: 'સજીવ વિશ્વ (World of Living)',
    pa: 'ਜੀਵ ਸੰਸਾਰ (World of Living)',
  },
  'Natural Phenomena & Effects of Current': {
    ur: 'قدرتی مظاہر اور برقی اثرات (Physics)',
    hi: 'प्राकृतिक घटनाएँ एवं विद्युत के प्रभाव (Physics)',
    ta: 'இயற்கை நிகழ்வுகள் மற்றும் மின்னோட்டத்தின் விளைவுகள்',
    mr: 'नैसर्गिक घटना आणि विद्युतधारेचे परिणाम (Physics)',
    te: 'సహజ దృగ్విషయాలు & విద్యుత్ ప్రభావాలు',
    bn: 'প্রাকৃতিক ঘটনা ও তড়িৎ প্রবাহের প্রভাব',
    gu: 'કુદરતી ઘટનાઓ અને વિદ્યુતની અસરો',
    pa: 'ਕੁਦਰਤੀ ਘਟਨਾਵਾਂ ਅਤੇ ਬਿਜਲੀ ਦੇ ਪ੍ਰਭਾਵ',
  },
  'Number Systems & Algebra': {
    ur: 'عددی نظام اور الجبرا (Number Systems & Algebra)',
    hi: 'संख्या पद्धति एवं बीजगणित (Number Systems & Algebra)',
    ta: 'எண் முறைகள் மற்றும் இயற்கணிதம்',
    mr: 'संख्या पद्धती आणि बीजगणित (Number Systems & Algebra)',
    te: 'సంఖ్యా వ్యవస్థలు మరియు బీజగణితం',
    bn: 'সংখ্যা পদ্ধতি ও বীজগণিত',
    gu: 'સંખ્યા પદ્ધતિ અને બીજગણિત',
    pa: 'ਸੰਖਿਆ ਪ੍ਰਣਾਲੀ ਅਤੇ ਬੀਜਗਣਿਤ',
  },
  'Geometry & Trigonometry': {
    ur: 'ہندسہ اور علم المثلث (Geometry & Trigonometry)',
    hi: 'ज्यामिति एवं त्रिकोणमिति (Geometry & Trigonometry)',
    ta: 'வடிவியல் மற்றும் முக்கோணவியல்',
    mr: 'भूमिती आणि त्रिकोणमिती (Geometry & Trigonometry)',
    te: 'రేఖాగణితం మరియు త్రికోణమితి',
    bn: 'জ্যামিতি ও ত্রিকোণমিতি',
    gu: 'ભૂમિતિ અને ત્રિકોણમિતિ',
    pa: 'ਰੇਖਾਗਣਿਤ ਅਤੇ ਤਿਕੋਣਮਿਤੀ',
  },
  'Mensuration, Statistics & Probability': {
    ur: 'پیمائش، شماریات اور احتمال (Mensuration & Statistics)',
    hi: 'क्षेत्रमिति, सांख्यिकी एवं प्रायिकता (Mensuration & Statistics)',
    ta: 'அளவியல், புள்ளியியல் மற்றும் நிகழ்தகவு',
    mr: 'महत्त्वमापन, सांख्यिकी आणि संभाव्यता (Mensuration & Statistics)',
    te: 'క్షేత్రమితి, సాంఖ్యకశాస్త్రం మరియు సంభావ్యత',
    bn: 'পরিমিতি, রাশিবিজ্ঞান ও সম্ভাবনা',
    gu: 'ક્ષેત્રમિતિ, આંકડાશાસ્ત્ર અને સંભાવના',
    pa: 'ਖੇਤਰਮਿਤੀ, ਅੰਕੜਾ ਵਿਗਿਆਨ ਅਤੇ ਸੰਭਾਵਨਾ',
  },
  'India & the Contemporary World - II (History)': {
    ur: 'تاریخ (ہندوستان اور معاصر دنیا - II)',
    hi: 'इतिहास (भारत और समकालीन विश्व - II)',
    ta: 'வரலாறு (இந்தியாவும் சமகால உலகமும் - II)',
    mr: 'इतिहास (भारत आणि समकालीन जग - II)',
    te: 'చరిత్ర (భారతదేశం మరియు సమకాలీన ప్రపంచం - II)',
    bn: 'ইতিহাস (ভারত ও সমসাময়িক বিশ্ব - II)',
    gu: 'ઇતિહાસ (ભારત અને સમકાલીન વિશ્વ - II)',
    pa: 'ਇਤਿਹਾਸ (ਭਾਰਤ ਅਤੇ ਸਮਕਾਲੀ ਸੰਸਾਰ - II)',
  },
  'Contemporary India - II (Geography)': {
    ur: 'جغرافیہ (معاصر ہندوستان - II)',
    hi: 'भूगोल (समकालीन भारत - II)',
    ta: 'புவியியல் (சமகால இந்தியா - II)',
    mr: 'भूगोल (समकालीन भारत - II)',
    te: 'భూగోళ శాస్త్రం (సమకాలీన భారతదేశం - II)',
    bn: 'ভূগোল (সমসাময়িক ভারত - II)',
    gu: 'ભૂગોળ (સમકાલીન ભારત - II)',
    pa: 'ਭੂਗੋਲ (ਸਮਕਾਲੀ ਭਾਰਤ - II)',
  },
  'Democratic Politics - II (Civics)': {
    ur: 'سیاسیات (جمہوری سیاست - II)',
    hi: 'लोकतांत्रिक राजनीति - II (नागरिक शास्त्र)',
    ta: 'அரசியல் அறிவியல் (மக்களாட்சி அரசியல் - II)',
    mr: 'राज्यशास्त्र (लोकशाही राजकारण - II)',
    te: 'రాజనీతి శాస్త్రం (ప్రజాస్వామ్య రాజకీయాలు - II)',
    bn: 'রাষ্ট্রবিজ্ঞান (গণতান্ত্রিক রাজনীতি - II)',
    gu: 'રાજ્યશાસ્ત્ર (લોકશાહી રાજકારણ - II)',
    pa: 'ਰਾਜਨੀਤੀ ਸ਼ਾਸਤਰ (ਲੋਕਤੰਤਰੀ ਰਾਜਨੀਤੀ - II)',
  },
  'Understanding Economic Development (Economics)': {
    ur: 'معاشیات (معاشی ترقی کی تفہیم)',
    hi: 'अर्थशास्त्र (आर्थिक विकास की समझ)',
    ta: 'பொருளியல் (பொருளாதார மேம்பாட்டைப் புரிந்துகொள்ளுதல்)',
    mr: 'अर्थशास्त्र (आर्थिक विकासाची समज)',
    te: 'అర్థశాస్త్రం (ఆర్థిక అభివృద్ధి అవగాహన)',
    bn: 'অর্থনীতি (অর্থনৈতিক উন্নয়নের ধারণা)',
    gu: 'અર્થશાસ્ત્ર (આર્થિક વિકાસની સમજ)',
    pa: 'ਅਰਥ ਸ਼ਾਸਤਰ (ਆਰਥਿਕ ਵਿਕਾਸ ਦੀ ਸਮਝ)',
  },
};

export function getLocalizedSubjectName(subjectId: string, fallbackName: string, lang: LanguageMode = 'en'): string {
  if (!lang || lang === 'en') return fallbackName;
  return SUBJECT_NAMES[lang]?.[subjectId] || fallbackName;
}

export function getLocalizedGroupName(
  groupNameOrId: string | null | undefined,
  nameOrLang?: string | LanguageMode,
  lang?: LanguageMode,
  _subjectId?: string
): string {
  if (!groupNameOrId) return '';

  let actualName = groupNameOrId;
  let targetLang: LanguageMode = 'en';

  if (typeof nameOrLang === 'string' && ['en', 'ur', 'hi', 'ta', 'te', 'mr', 'bn', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'sa'].includes(nameOrLang)) {
    targetLang = nameOrLang as LanguageMode;
  } else if (typeof nameOrLang === 'string') {
    actualName = nameOrLang;
    if (lang) targetLang = lang;
  } else if (lang) {
    targetLang = lang;
  }

  if (!actualName) return '';
  if (!targetLang || targetLang === 'en') return actualName;

  // Direct lookup
  if (GROUP_TRANSLATIONS[actualName]?.[targetLang]) {
    return GROUP_TRANSLATIONS[actualName]![targetLang]!;
  }

  // Fuzzy match on key phrases
  const lower = actualName.toLowerCase();
  for (const [key, trans] of Object.entries(GROUP_TRANSLATIONS)) {
    const keyLower = key.toLowerCase();
    if (lower.includes(keyLower) || keyLower.includes(lower)) {
      if (trans[targetLang]) return trans[targetLang]!;
    }
  }

  return actualName;
}

export function getLocalizedChapterName(
  chapterId: string,
  fallbackName: string,
  lang: LanguageMode = 'en',
  _subjectId?: string
): string {
  if (!lang || lang === 'en') return fallbackName;

  // 1. Direct match with current ID
  if (CHAPTER_TRANSLATIONS[chapterId]?.[lang]) {
    return CHAPTER_TRANSLATIONS[chapterId]![lang]!;
  }

  // 2. Normalized aliases: sci_ch1 -> sci_1, math_ch1 -> math_1, sst_hist_1 -> sst_h1, etc.
  const aliasMap: Record<string, string> = {
    sci_ch1: 'sci_1', sci_ch2: 'sci_2', sci_ch3: 'sci_3', sci_ch4: 'sci_4',
    sci_ch5: 'sci_5', sci_ch6: 'sci_6', sci_ch7: 'sci_7', sci_ch8: 'sci_8',
    sci_ch9: 'sci_9', sci_ch10: 'sci_10', sci_ch11: 'sci_11', sci_ch12: 'sci_12', sci_ch13: 'sci_13',
    math_ch1: 'math_1', math_ch2: 'math_2', math_ch3: 'math_3', math_ch4: 'math_4',
    math_ch5: 'math_5', math_ch6: 'math_6', math_ch7: 'math_7', math_ch8: 'math_8',
    math_ch9: 'math_9', math_ch10: 'math_10', math_ch11: 'math_11', math_ch12: 'math_12',
    math_ch13: 'math_13', math_ch14: 'math_14',
    sst_hist_1: 'sst_h1', sst_hist_2: 'sst_h2', sst_hist_3: 'sst_h3', sst_hist_4: 'sst_h4', sst_hist_5: 'sst_h5',
    sst_geo_1: 'sst_g1', sst_geo_2: 'sst_g2', sst_geo_3: 'sst_g3', sst_geo_4: 'sst_g4',
    sst_geo_5: 'sst_g5', sst_geo_6: 'sst_g6', sst_geo_7: 'sst_g7',
    sst_pol_1: 'sst_p1', sst_pol_2: 'sst_p2', sst_pol_3: 'sst_p3', sst_pol_4: 'sst_p4', sst_pol_5: 'sst_p5',
    sst_eco_1: 'sst_e1', sst_eco_2: 'sst_e2', sst_eco_3: 'sst_e3', sst_eco_4: 'sst_e4', sst_eco_5: 'sst_e5',
  };

  const mappedKey = aliasMap[chapterId];
  if (mappedKey && CHAPTER_TRANSLATIONS[mappedKey]?.[lang]) {
    return CHAPTER_TRANSLATIONS[mappedKey]![lang]!;
  }

  // 3. Reverse alias mapping (if chapterId is sci_1, check sci_ch1)
  for (const [chId, alias] of Object.entries(aliasMap)) {
    if (alias === chapterId && CHAPTER_TRANSLATIONS[chId]?.[lang]) {
      return CHAPTER_TRANSLATIONS[chId]![lang]!;
    }
  }

  return fallbackName;
}

/**
 * Website UI stays in English compulsorily, so chapter prefix is always 'Ch'
 */
export function getLocalizedChapterPrefix(_lang: LanguageMode = 'en'): string {
  return 'Ch';
}
