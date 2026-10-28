import React, { useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// Full-screen practice dialogs live above app chrome, lock background scrolling,
// contain keyboard focus and restore it to the opening control on dismissal.
export default function PremiumDialog({ children, onClose, label, className, style, ...props }) {
  const { i18n } = useTranslation();
  const returnFocus = useRef(document.activeElement);

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          aria-describedby={undefined}
          {...props}
          aria-label={label}
          aria-modal="true"
          dir={i18n.dir()}
          className={cn('premium-overlay outline-none', className)}
          style={{ ...style, zIndex: 10000 }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (returnFocus.current?.isConnected) returnFocus.current.focus?.({ preventScroll: true });
          }}
        >
          <DialogPrimitive.Title asChild><span className="sr-only">{label}</span></DialogPrimitive.Title>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
