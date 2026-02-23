import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { createPageUrl } from '../../utils';

// Define root routes for each tab
const ROOT_ROUTES = {
  '/Home': true,
  '/Chat': true,
  '/Coach': true,
  '/Journal': true,
  '/MoodTracker': true,
  '/Exercises': true,
  '/Goals': true,
  '/Progress': true,
  '/Settings': true,
  '/Community': true,
  '/PersonalizedFeed': true
};

export default function MobileHeader({ currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine if we're on a root route
  const isRootRoute = ROOT_ROUTES[currentPath];

  // Get page title based on current page
  const getPageTitle = () => {
    const titles = {
      'Home': 'Mindful Path',
      'Chat': 'AI Therapy',
      'Coach': 'Coach',
      'Journal': 'Journal',
      'MoodTracker': 'Mood Tracker',
      'Exercises': 'Exercises',
      'Goals': 'Goals',
      'Progress': 'Progress',
      'Settings': 'Settings',
      'Community': 'Community',
      'PersonalizedFeed': 'Feed',
      'ThoughtCoach': 'Thought Coach',
      'ExerciseView': 'Exercise',
      'GoalCoach': 'Goal Coach'
    };
    return titles[currentPageName] || 'Mindful Path';
  };

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // If no history, go to home
      navigate(createPageUrl('Home'));
    }
  };

  return (
    <header 
      className="md:hidden fixed top-0 left-0 right-0 backdrop-blur-xl border-b z-40"
      style={{
        height: '60px',
        background: 'linear-gradient(to bottom, rgba(212, 237, 232, 0.95) 0%, rgba(200, 230, 225, 0.92) 100%)',
        borderColor: 'rgba(38, 166, 154, 0.15)',
        paddingTop: 'env(safe-area-inset-top)'
      }}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Back button on child routes, empty on root */}
        <div className="w-12">
          {!isRootRoute && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-full"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" style={{ color: '#26A69A' }} />
            </Button>
          )}
        </div>

        {/* Center: Page title */}
        <h1 
          className="text-lg font-semibold truncate" 
          style={{ color: '#1A3A34' }}
        >
          {getPageTitle()}
        </h1>

        {/* Right: Empty space for symmetry */}
        <div className="w-12"></div>
      </div>
    </header>
  );
}