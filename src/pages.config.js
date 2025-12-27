import Home from './pages/Home';
import Chat from './pages/Chat';
import Journal from './pages/Journal';
import Progress from './pages/Progress';
import Exercises from './pages/Exercises';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Chat": Chat,
    "Journal": Journal,
    "Progress": Progress,
    "Exercises": Exercises,
    "Goals": Goals,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};