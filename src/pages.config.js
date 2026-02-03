/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import Chat from './pages/Chat';
import Coach from './pages/Coach';
import CoachingAnalytics from './pages/CoachingAnalytics';
import Community from './pages/Community';
import CrisisAlerts from './pages/CrisisAlerts';
import Exercises from './pages/Exercises';
import GoalCoach from './pages/GoalCoach';
import Goals from './pages/Goals';
import Home from './pages/Home';
import Journal from './pages/Journal';
import MoodTracker from './pages/MoodTracker';
import PersonalizedFeed from './pages/PersonalizedFeed';
import PlaylistDetail from './pages/PlaylistDetail';
import Playlists from './pages/Playlists';
import Progress from './pages/Progress';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import StarterPath from './pages/StarterPath';
import TestSetupGuide from './pages/TestSetupGuide';
import ThoughtCoach from './pages/ThoughtCoach';
import VideoPlayer from './pages/VideoPlayer';
import Videos from './pages/Videos';
import ExperientialGames from './pages/ExperientialGames';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdvancedAnalytics": AdvancedAnalytics,
    "Chat": Chat,
    "Coach": Coach,
    "CoachingAnalytics": CoachingAnalytics,
    "Community": Community,
    "CrisisAlerts": CrisisAlerts,
    "Exercises": Exercises,
    "GoalCoach": GoalCoach,
    "Goals": Goals,
    "Home": Home,
    "Journal": Journal,
    "MoodTracker": MoodTracker,
    "PersonalizedFeed": PersonalizedFeed,
    "PlaylistDetail": PlaylistDetail,
    "Playlists": Playlists,
    "Progress": Progress,
    "Resources": Resources,
    "Settings": Settings,
    "StarterPath": StarterPath,
    "TestSetupGuide": TestSetupGuide,
    "ThoughtCoach": ThoughtCoach,
    "VideoPlayer": VideoPlayer,
    "Videos": Videos,
    "ExperientialGames": ExperientialGames,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};