import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getScrollContainer } from '@/lib/scrollContainer';

const TabNavigationContext = createContext();

export function useTabNavigation() {
  return useContext(TabNavigationContext);
}

// Define root pages for each tab
const TAB_ROOTS = {
  Home: 'Home',
  Chat: 'Chat',
  Coach: 'Coach',
  Journal: 'Journal',
  MoodTracker: 'MoodTracker',
  Exercises: 'Exercises',
  Progress: 'Progress'
};

// Determine which tab a page belongs to based on naming convention
function getTabForPage(pageName) {
  if (!pageName) return null;
  
  // Direct tab roots
  if (TAB_ROOTS[pageName]) return pageName;
  
  // Pages that belong to specific tabs based on prefix or context
  const tabMapping = {
    // Home tab pages
    'StarterPath': 'Home',
    'Videos': 'Home',
    'VideoPlayer': 'Home',
    'Playlists': 'Home',
    'PlaylistDetail': 'Home',
    'Journeys': 'Home',
    'ExperientialGames': 'Home',
    
    // Chat tab pages (AI therapy)
    'ThoughtCoach': 'Chat',
    
    // Coach tab pages
    'GoalCoach': 'Coach',
    
    // Exercises tab pages
    'ExerciseView': 'Exercises',
    
    // Progress tab pages
    'Goals': 'Progress',
    'Community': 'Progress',
    'PersonalizedFeed': 'Progress',
    'AdvancedAnalytics': 'Progress',
    
    // Settings and account (not in tabs, global)
    'Settings': null,
    'Resources': null
  };
  
  return tabMapping[pageName] || null;
}

export function TabNavigationProvider({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabStacks, setTabStacks] = useState({
    Home: [{ path: '/Home', pageName: 'Home' }],
    Chat: [{ path: '/Chat', pageName: 'Chat' }],
    Coach: [{ path: '/Coach', pageName: 'Coach' }],
    Journal: [{ path: '/Journal', pageName: 'Journal' }],
    MoodTracker: [{ path: '/MoodTracker', pageName: 'MoodTracker' }],
    Exercises: [{ path: '/Exercises', pageName: 'Exercises' }],
    Progress: [{ path: '/Progress', pageName: 'Progress' }]
  });
  const [activeTab, setActiveTab] = useState('Home');
  const isNavigatingRef = useRef(false);

  // Determine current tab from page name
  useEffect(() => {
    const currentTab = getTabForPage(currentPageName);
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [currentPageName, activeTab]);

  // Track navigation within tabs
  useEffect(() => {
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }

    const currentTab = getTabForPage(currentPageName);
    if (!currentTab) return; // Not a tab page

    setTabStacks(prev => {
      const newStacks = { ...prev };
      const currentStack = [...newStacks[currentTab]];
      const currentPath = location.pathname + location.search;
      
      // Check if this page is already at the top of the stack
      const topOfStack = currentStack[currentStack.length - 1];
      if (topOfStack?.path === currentPath) {
        return prev; // No change needed
      }

      // Check if this matches the previous entry — browser back was used
      if (currentStack.length > 1) {
        const prevEntry = currentStack[currentStack.length - 2];
        if (prevEntry?.path === currentPath) {
          newStacks[currentTab] = currentStack.slice(0, -1);
          return newStacks;
        }
      }

      // Add to stack (push navigation)
      currentStack.push({ path: currentPath, pageName: currentPageName });
      newStacks[currentTab] = currentStack;
      
      return newStacks;
    });
  }, [location.pathname, location.search, currentPageName]);

  // Handle tab switching
  const switchToTab = (tabName) => {
    const currentPath = location.pathname + location.search;

    if (tabName === activeTab) {
      // Switching to already active tab - reset to root
      const rootPage = TAB_ROOTS[tabName];
      if (!rootPage) return;
      const rootPath = `/${rootPage}`;

      // Clear stack and navigate to root
      setTabStacks(prev => ({
        ...prev,
        [tabName]: [{ path: rootPath, pageName: rootPage }]
      }));

      // Avoid a no-op navigation warning when already at the root.
      if (currentPath !== rootPath) {
        isNavigatingRef.current = true;
        navigate(rootPath, { replace: true });
      }

      // Scroll to top
      getScrollContainer().scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Switching to different tab - restore its last state
      const targetStack = tabStacks[tabName];
      let targetPath;
      if (!targetStack || targetStack.length === 0) {
        // Fallback: navigate to root for this tab
        const rootPage = TAB_ROOTS[tabName] || tabName;
        targetPath = `/${rootPage}`;
      } else {
        targetPath = targetStack[targetStack.length - 1].path;
      }

      // Avoid a no-op navigation warning when already at the target path.
      if (currentPath !== targetPath) {
        isNavigatingRef.current = true;
        navigate(targetPath, { replace: true });
      }
    }

    setActiveTab(tabName);
  };

  // Handle back navigation within a tab
  const goBackInTab = () => {
    const currentStack = tabStacks[activeTab];
    if (currentStack.length > 1) {
      // Pop current page and navigate to previous
      const newStack = currentStack.slice(0, -1);
      const previousPage = newStack[newStack.length - 1];
      
      setTabStacks(prev => ({
        ...prev,
        [activeTab]: newStack
      }));
      
      isNavigatingRef.current = true;
      // Always navigate explicitly using the JS tab stack.
      // Tab switches use replace:true so browser history is NOT a reliable
      // representation of the in-tab stack — navigate(-1) can pop to a
      // different tab's page instead of the correct previous page.
      navigate(previousPage.path, { replace: true });
      return true;
    }
    return false; // Already at root
  };

  // Check if we can go back in current tab
  const canGoBack = () => {
    const currentStack = tabStacks[activeTab];
    return currentStack.length > 1;
  };

  const value = {
    activeTab,
    tabStacks,
    switchToTab,
    goBackInTab,
    canGoBack,
    currentPageName
  };

  return (
    <TabNavigationContext.Provider value={value}>
      {children}
    </TabNavigationContext.Provider>
  );
}