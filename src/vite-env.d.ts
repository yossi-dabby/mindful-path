/// <reference types="vite/client" />

// ---------------------------------------------------------------------------
// Window augmentation for test-automation globals injected by Playwright /
// Cypress. Keeps DraggableAiCompanion.jsx and any other file that reads
// window.Cypress / window.playwright type-safe.
// ---------------------------------------------------------------------------
interface Window {
  Cypress?: unknown;
  playwright?: unknown;
}

// ---------------------------------------------------------------------------
// React ExoticComponent children overload.
//
// shadcn/ui wraps components with React.forwardRef, which returns an
// ExoticComponent.  React's built-in types for ExoticComponent do not include
// a `children` prop, causing TS2559 errors on every shadcn/ui usage site.
// The augmentation below adds a narrow overload that accepts children without
// widening any other prop types.
//
// This is module-scoped (import at the top anchors the declaration to the
// module system) so it augments rather than replaces the React namespace.
// ---------------------------------------------------------------------------
import type React from 'react';

declare module 'react' {
  // Augment ExoticComponent so forwardRef-wrapped components accept children.
  // The overload is narrow: it only adds `children?: React.ReactNode` and
  // does not alter the component's own prop type P.
  interface ExoticComponent<P = Record<string, unknown>> {
    (props: P & { children?: React.ReactNode }): React.ReactElement | null;
  }
}
