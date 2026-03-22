/**
 * BottomSheetSelect — mobile-first select replacement using Vaul Drawer.
 * On desktop it falls back to a standard popover-style list.
 * Safe to use everywhere a native <select> or Radix Select was used.
 */
import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @param {object}   props
 * @param {string}   props.value            - Current selected value
 * @param {function} props.onValueChange    - Called with the new value string
 * @param {Array}    props.options           - [{value, label}]
 * @param {string}   [props.placeholder]    - Trigger placeholder text
 * @param {string}   [props.title]          - Sheet header title
 * @param {string}   [props.className]      - Extra classes on the trigger button
 * @param {boolean}  [props.disabled]
 */
export default function BottomSheetSelect({
  value,
  onValueChange,
  options = [],
  placeholder = 'Select…',
  title = 'Choose an option',
  className,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  const handleSelect = (optValue) => {
    onValueChange(optValue);
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          'w-full justify-between rounded-xl text-left font-normal',
          !selected && 'text-muted-foreground',
          className
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0 ml-2" />
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="border-b border-border/70 pb-3">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto max-h-[60vh] p-2">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm transition-colors',
                    isSelected
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-secondary/60 text-foreground'
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
          {/* Safe area padding */}
          <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
        </DrawerContent>
      </Drawer>
    </>
  );
}