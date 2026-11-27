import React from 'react';
import { getDynamicAcademicYear } from '../utils/academicYear';
import { SCREEN_SEO_MAP } from '../utils/seoMetadata';
import { ActiveScreen } from '../types/tracker';

interface SEOContentProps {
  onNavigate?: (screen: ActiveScreen) => void;
}

/**
 * Clean semantic landmark for screen readers and crawlers without hidden keyword-stuffing blocks.
 */
export const SEOContent: React.FC<SEOContentProps> = ({ onNavigate }) => {
  const academicYear = getDynamicAcademicYear();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, screen: ActiveScreen) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(screen);
    }
  };

  return (
    <nav className="sr-only" aria-label="Goalbeam Primary Sections">
      <p>
        Goalbeam — Free CBSE Class 10 Course &amp; Syllabus Tracker, Notes PDF, PYQs, Sample Papers,
        and Live Syllabus Leaderboard for {academicYear}.
      </p>
      <ul>
        {(
          [
            ['dashboard', 'Home Dashboard'],
            ['chapters', 'Class 10 Chapters & Syllabus'],
            ['practice', '10-MCQ Quizzes & Flashcards'],
            ['planner', 'Study Timetable & Exam Date-Sheet'],
            ['resources', 'Notes, PYQs & Sample Papers'],
            ['aura-ai', 'Goalbeam AI Study Studio'],
            ['focus', 'Pomodoro Focus Timer'],
            ['insights', 'Study Progress Analytics'],
            ['leaderboard', 'Live Leaderboard of Syllabus'],
            ['settings', 'Edit Profile & Settings'],
            ['onboarding', 'CBSE Class 10 Setup'],
          ] as Array<[ActiveScreen, string]>
        ).map(([screen, label]) => (
          <li key={screen}>
            <a
              href={SCREEN_SEO_MAP[screen]?.path || '/'}
              onClick={(e) => handleLinkClick(e, screen)}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
