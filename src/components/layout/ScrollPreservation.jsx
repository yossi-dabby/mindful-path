import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Store scroll positions for each page
const scrollPositions = new Map();

export default function ScrollPreservation() {
  const location = useLocation();

  useEffect(() => {
    // Save current scroll position before navigating away
    return () => {
      const currentPath = location.pathname;
      const scrollY = window.scrollY;
      scrollPositions.set(currentPath, scrollY);
    };
  }, [location.pathname]);

  useEffect(() => {
    // Restore scroll position for this page
    const currentPath = location.pathname;
    const savedScrollY = scrollPositions.get(currentPath);

    if (savedScrollY !== undefined) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, savedScrollY);
      });
    } else {
      // New page, scroll to top
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return null;
}