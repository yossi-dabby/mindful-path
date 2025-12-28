import Chat from './pages/Chat';
import Coach from './pages/Coach';
import Exercises from './pages/Exercises';
import Goals from './pages/Goals';
import Home from './pages/Home';
import Journal from './pages/Journal';
import Progress from './pages/Progress';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Chat": Chat,
    "Coach": Coach,
    "Exercises": Exercises,
    "Goals": Goals,
    "Home": Home,
    "Journal": Journal,
    "Progress": Progress,
    "Resources": Resources,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};