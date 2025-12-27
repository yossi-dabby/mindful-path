import Home from './pages/Home';
import Chat from './pages/Chat';
import Journal from './pages/Journal';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Chat": Chat,
    "Journal": Journal,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};