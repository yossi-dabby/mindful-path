import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function DatePickerMobile({ value, onChange, placeholder = 'Pick a date', minDate }) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : undefined);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onChange(format(selectedDate, 'yyyy-MM-dd'));
    }
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    onChange('');
    setOpen(false);
  };

  // Desktop: use native date input
  if (!isMobile) {
    return (
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        min={minDate}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
    );
  }

  // Mobile: use bottom sheet with Calendar component
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full justify-start text-left font-normal"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(new Date(value), 'PPP') : <span className="text-muted-foreground">{placeholder}</span>}
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Select Date</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => minDate && date < new Date(minDate)}
              initialFocus
            />
          </div>
          <DrawerFooter className="flex flex-row gap-2">
            <Button variant="outline" onClick={handleClear} className="flex-1">
              Clear
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </DrawerClose>
            <Button onClick={handleConfirm} className="flex-1">
              Confirm
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}