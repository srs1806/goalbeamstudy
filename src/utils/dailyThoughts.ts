/**
 * Daily Good Thoughts for Class 10 CBSE Scholars.
 * Deterministically and randomly rotates every 24 hours (aligned with daily study rollovers)
 * so students get a fresh, powerful boost of motivation whenever they enter the website.
 */

export interface DailyThought {
  id: number;
  text: string;
  category: 'focus' | 'consistency' | 'confidence' | 'ncert' | 'resilience';
}

export const CBSE_GOOD_THOUGHTS: DailyThought[] = [
  { id: 1, text: "Every 45 minutes of deep focus today is a board question solved with complete confidence.", category: 'focus' },
  { id: 2, text: "Consistency beats intensity. One NCERT concept mastered every day builds an unbeatable score.", category: 'consistency' },
  { id: 3, text: "Revision is the bridge between knowing a formula and writing it flawlessly in the exam hall.", category: 'confidence' },
  { id: 4, text: "Don't count the days until the board exam; make every single day count towards your dream percentage.", category: 'resilience' },
  { id: 5, text: "Small daily improvements over time lead to stunning board results. Keep solving, keep growing!", category: 'consistency' },
  { id: 6, text: "Your future self will thank you for the solved PYQs, NCERT exemplar problems, and focus put in today.", category: 'focus' },
  { id: 7, text: "Mistakes in sample papers are proof that you are learning before the final board paper.", category: 'resilience' },
  { id: 8, text: "Success in Class 10 isn't about being a genius; it's about showing up every day with steady discipline.", category: 'consistency' },
  { id: 9, text: "Master NCERT intext questions today; tomorrow's 100% topper is built on today's solved problems.", category: 'ncert' },
  { id: 10, text: "Stay calm, stay curious, and conquer one chapter stage at a time.", category: 'focus' },
  { id: 11, text: "Great results never come from comfort zones. Push through this study session with full energy!", category: 'resilience' },
  { id: 12, text: "A 95%+ marksheet is simply the sum of all your daily targets completed on time.", category: 'confidence' },
  { id: 13, text: "Believe in your preparation. The hard questions will become easy with repeated practice.", category: 'confidence' },
  { id: 14, text: "Focus on the process of deep understanding, and the board exam marks will take care of themselves.", category: 'focus' },
  { id: 15, text: "Wake up with determination, go to bed with the satisfaction of completed syllabus stages.", category: 'consistency' },
  { id: 16, text: "You don't have to be extreme, just consistent. Every tick mark brings you closer to your goal.", category: 'consistency' },
  { id: 17, text: "The secret to acing Science and Math is simple: understand the core, practice the exemplar.", category: 'ncert' },
  { id: 18, text: "Your board exam is not a hurdle; it is your stage to showcase your hard work and knowledge.", category: 'confidence' },
  { id: 19, text: "Push yourself, because no one else is going to do it for you. You've got this, Scholar!", category: 'resilience' },
  { id: 20, text: "A champion doesn't wait for motivation; they build study momentum one concept at a time.", category: 'focus' },
  { id: 21, text: "Every formula derived and every theorem proved makes your exam paper stronger than yesterday.", category: 'ncert' },
  { id: 22, text: "Today's preparation determines tomorrow's achievement. Give your 100% to this chapter.", category: 'resilience' },
  { id: 23, text: "Doubt kills more dreams than failure ever will. Trust your syllabus roadmap and study on.", category: 'confidence' },
  { id: 24, text: "Turn your distractions off, turn your focus on. Your Board results will speak for your discipline.", category: 'focus' },
  { id: 25, text: "Focus on progress, not perfection. Every stage marked done is real mastery achieved.", category: 'consistency' },
  { id: 26, text: "One page at a time, one diagram at a time, one step at a time — you are getting ready to shine.", category: 'confidence' },
  { id: 27, text: "Clear handwriting, structured answers, and thorough NCERT grasp turn good papers into 100s.", category: 'ncert' },
  { id: 28, text: "Today's hard work will be tomorrow's pride when you see your roll number on the topper list.", category: 'resilience' },
  { id: 29, text: "Do not fear the tough questions; they are the exact ones that separate toppers from the rest.", category: 'confidence' },
  { id: 30, text: "Start where you are, use what you have, and give every revision session your absolute best.", category: 'focus' },
  { id: 31, text: "The harder you work during your study hours, the easier the final board paper will feel.", category: 'resilience' },
  { id: 32, text: "Time spent solving case-based questions today guarantees full marks in your CBSE exam.", category: 'ncert' },
  { id: 33, text: "Celebrate every small milestone. A completed chapter is a victory worth being proud of.", category: 'consistency' },
  { id: 34, text: "Keep your eyes on your target score. Dedication and daily practice will take you there.", category: 'confidence' },
  { id: 35, text: "Every topper was once a student who refused to give up on a difficult concept. Keep learning!", category: 'resilience' },
];

const THOUGHT_STORAGE_KEY = 'zenith_daily_thought_data';

interface StoredThoughtData {
  thought: string;
  thoughtIndex: number;
  dateKey: string; // YYYY-MM-DD
  timestamp: number;
}

/**
 * Returns today's date key, rotating at 5:00 AM (in sync with daily streak & study rollover)
 */
export function getDailyRolloverDateKey(): string {
  const now = new Date();
  // If before 5:00 AM local time, count as previous day's study cycle
  const adjusted = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const year = adjusted.getFullYear();
  const month = String(adjusted.getMonth() + 1).padStart(2, '0');
  const day = String(adjusted.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retrieves the daily Good Thought.
 * Automatically changes every 24 hours when the student enters the website.
 */
export function getDailyGoodThought(): string {
  if (typeof window === 'undefined') {
    return CBSE_GOOD_THOUGHTS[0].text;
  }

  const currentDateKey = getDailyRolloverDateKey();

  try {
    const raw = localStorage.getItem(THOUGHT_STORAGE_KEY);
    if (raw) {
      const parsed: StoredThoughtData = JSON.parse(raw);
      // Check if this thought belongs to today's 24-hour cycle
      if (parsed && parsed.dateKey === currentDateKey && parsed.thought) {
        return parsed.thought;
      }
    }

    // A new 24-hour cycle has arrived! Pick a new random thought different from the previous one
    let prevIndex = -1;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        prevIndex = typeof parsed?.thoughtIndex === 'number' ? parsed.thoughtIndex : -1;
      } catch {}
    }

    // Deterministic seed based on date string so all tabs and renders share the exact same thought
    let dateHash = 0;
    for (let i = 0; i < currentDateKey.length; i++) {
      dateHash = (dateHash << 5) - dateHash + currentDateKey.charCodeAt(i);
      dateHash |= 0;
    }

    const availableIndices = CBSE_GOOD_THOUGHTS.map((_, idx) => idx).filter((idx) => idx !== prevIndex);
    const chosenIndex = availableIndices[Math.abs(dateHash) % availableIndices.length];
    const newThought = CBSE_GOOD_THOUGHTS[chosenIndex].text;

    const dataToStore: StoredThoughtData = {
      thought: newThought,
      thoughtIndex: chosenIndex,
      dateKey: currentDateKey,
      timestamp: Date.now(),
    };

    localStorage.setItem(THOUGHT_STORAGE_KEY, JSON.stringify(dataToStore));
    return newThought;
  } catch (err) {
    console.error('Error loading daily good thought', err);
    return CBSE_GOOD_THOUGHTS[0].text;
  }
}
