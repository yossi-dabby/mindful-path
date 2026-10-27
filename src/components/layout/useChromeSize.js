import { useLayoutEffect, useRef } from 'react';

// Text resizing can grow the fixed mobile bars. Keep content and support-link
// offsets synchronized with their rendered size, including safe-area padding.
export function useChromeSize(property) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const height = element.getBoundingClientRect().height;
      if (height > 0) document.documentElement.style.setProperty(property, `${height}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty(property); };
  }, [property]);
  return ref;
}
