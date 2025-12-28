import Chat from './pages/Chat';
import Coach from './pages/Coach';
import CoachingAnalytics from './pages/CoachingAnalytics';
import Exercises from './pages/Exercises';
import Goals from './pages/Goals';
import Home from './pages/Home';
import Journal from './pages/Journal';
import MoodTracker from './pages/MoodTracker';
import Progress from './pages/Progress';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import Community from './pages/Community';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Chat": Chat,
    "Coach": Coach,
    "CoachingAnalytics": CoachingAnalytics,
    "Exercises": Exercises,
    "Goals": Goals,
    "Home": Home,
    "Journal": Journal,
    "MoodTracker": MoodTracker,
    "Progress": Progress,
    "Resources": Resources,
    "Settings": Settings,
    "Community": Community,
}

export const pagesConfig = {
    mainPage: "Chat",
    Pages: PAGES,
    Layout: __Layout,
};