import AdvancedAnalytics from './pages/AdvancedAnalytics';
import Chat from './pages/Chat';
import Coach from './pages/Coach';
import CoachingAnalytics from './pages/CoachingAnalytics';
import Community from './pages/Community';
import Exercises from './pages/Exercises';
import Goals from './pages/Goals';
import Home from './pages/Home';
import Journal from './pages/Journal';
import MoodTracker from './pages/MoodTracker';
import PlaylistDetail from './pages/PlaylistDetail';
import Playlists from './pages/Playlists';
import Progress from './pages/Progress';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import StarterPath from './pages/StarterPath';
import TestSetupGuide from './pages/TestSetupGuide';
import VideoPlayer from './pages/VideoPlayer';
import Videos from './pages/Videos';
import PersonalizedFeed from './pages/PersonalizedFeed';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdvancedAnalytics": AdvancedAnalytics,
    "Chat": Chat,
    "Coach": Coach,
    "CoachingAnalytics": CoachingAnalytics,
    "Community": Community,
    "Exercises": Exercises,
    "Goals": Goals,
    "Home": Home,
    "Journal": Journal,
    "MoodTracker": MoodTracker,
    "PlaylistDetail": PlaylistDetail,
    "Playlists": Playlists,
    "Progress": Progress,
    "Resources": Resources,
    "Settings": Settings,
    "StarterPath": StarterPath,
    "TestSetupGuide": TestSetupGuide,
    "VideoPlayer": VideoPlayer,
    "Videos": Videos,
    "PersonalizedFeed": PersonalizedFeed,
}

export const pagesConfig = {
    mainPage: "Chat",
    Pages: PAGES,
    Layout: __Layout,
};