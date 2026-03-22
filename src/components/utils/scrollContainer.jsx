/**
 * Returns the single app-level scroll container element.
 * Falls back to document.documentElement if the element isn't in the DOM yet.
 */
export function getScrollContainer() {
  return document.getElementById('app-scroll-container') || document.documentElement;
}