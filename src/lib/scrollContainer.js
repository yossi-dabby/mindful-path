/** Returns the app's primary scroll container (the inner <main> element). */
export function getScrollContainer() {
  return document.getElementById('app-scroll-container') ?? document.documentElement;
}
