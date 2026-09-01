import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CommunityDialogShell({ title, closeLabel, onClose, children, testId }) {
  const titleId = useId();
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Card
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-testid={testId}
        className="max-h-[92dvh] w-full overflow-hidden rounded-b-none border-0 shadow-2xl sm:max-w-2xl sm:rounded-[var(--radius-card)]"
      >
        <CardHeader className="sticky top-0 z-10 border-b border-border/70 bg-[hsl(var(--card)/0.98)] px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <CardTitle id={titleId} className="text-xl font-semibold text-teal-800 sm:text-2xl">
              {title}
            </CardTitle>
            <Button type="button" variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" onClick={onClose} aria-label={closeLabel}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-[calc(92dvh-76px)] overflow-y-auto bg-[hsl(var(--card)/0.97)] p-4 sm:p-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
