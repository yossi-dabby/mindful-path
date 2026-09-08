import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AUTO_DIRECTION_SELECTOR =
  'input:not([dir]), textarea:not([dir]), [contenteditable]:not([dir]), [data-user-content]:not([dir])';

function applyAutomaticDirection(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return;

  if (typeof root.matches === 'function' && root.matches(AUTO_DIRECTION_SELECTOR)) {
    root.setAttribute('dir', 'auto');
  }

  root.querySelectorAll(AUTO_DIRECTION_SELECTOR).forEach((element) => {
    element.setAttribute('dir', 'auto');
  });
}

function getCurrentPageLabel() {
  const heading = document.querySelector(
    '#app-scroll-container h1, main h1, [role="main"] h1, h1'
  );
  return heading?.textContent?.trim() || document.title;
}

/**
 * Cross-cutting accessibility behaviour for Stage 13:
 * - announces client-side route changes to screen readers;
 * - moves keyboard/screen-reader focus to the main landmark after navigation;
 * - gives mixed-direction user input an automatic Unicode direction.
 */
export default function AccessibilityManager() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const [announcement, setAnnouncement] = React.useState('');

  React.useEffect(() => {
    let observer = null;
    let announcementFrame = null;
    let timeoutId = null;
    let disposed = false;

    const synchronizeRoute = () => {
      if (disposed) return false;

      const main = document.querySelector('#app-scroll-container, main, [role="main"]');
      if (!(main instanceof HTMLElement)) return false;

      const activeElement = document.activeElement;
      const isEditing =
        activeElement instanceof HTMLElement &&
        (activeElement.matches('input, textarea, select, [contenteditable="true"]') ||
          activeElement.closest('[role="dialog"]'));

      if (!isEditing) {
        main.focus({ preventScroll: true });
      }

      const pageLabel = getCurrentPageLabel();
      setAnnouncement('');
      announcementFrame = requestAnimationFrame(() => setAnnouncement(pageLabel));
      return true;
    };

    const firstFrame = requestAnimationFrame(() => {
      if (synchronizeRoute()) {
        // Route transitions can replace animated page content after the first paint.
        // Re-apply focus and announce the settled heading once the transition has mounted.
        timeoutId = setTimeout(synchronizeRoute, 250);
        return;
      }

      observer = new MutationObserver(() => {
        if (synchronizeRoute()) {
          observer?.disconnect();
          if (timeoutId !== null) clearTimeout(timeoutId);
          timeoutId = setTimeout(synchronizeRoute, 250);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      timeoutId = setTimeout(() => {
        synchronizeRoute();
        observer?.disconnect();
      }, 5000);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(firstFrame);
      if (announcementFrame !== null) cancelAnimationFrame(announcementFrame);
      if (timeoutId !== null) clearTimeout(timeoutId);
      observer?.disconnect();
    };
  }, [location.pathname, i18n.resolvedLanguage, i18n.language]);

  React.useEffect(() => {
    applyAutomaticDirection(document);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) applyAutomaticDirection(node);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-a11y-route-announcer
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {announcement}
    </div>
  );
}
