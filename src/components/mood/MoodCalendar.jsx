import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';

const moodColors = {
  excellent: 'bg-green-500',
  good: 'bg-blue-500',
  okay: 'bg-yellow-500',
  low: 'bg-orange-500',
  very_low: 'bg-red-500'
};

const moodEmojis = {
  excellent: '😄',
  good: '🙂',
  okay: '😐',
  low: '😟',
  very_low: '😢'
};

export default function MoodCalendar({ entries, onEditEntry }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startingDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startingDayOfWeek).fill(null);

  const getEntryForDay = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return entries.find((e) => e.date === dateStr);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-teal-100 p-6 flex flex-col space-y-1.5 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-teal-600 font-semibold tracking-[-0.012em] leading-[1.3] flex items-center gap-2">
            <Calendar className="text-teal-600 lucide lucide-calendar w-5 h-5" />
            Mood Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              aria-label="Previous month" className="bg-[hsl(var(--card)/0.88)] text-teal-600 font-semibold tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0">

              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-teal-600 px-4 text-lg font-bold">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              aria-label="Next month" className="bg-[hsl(var(--card)/0.88)] text-teal-600 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0">

              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="bg-teal-100 p-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          {Object.entries(moodEmojis).map(([mood, emoji]) =>
          <Badge key={mood} variant="outline" className="bg-teal-600 text-slate-50 px-2.5 py-1 font-medium tracking-[0.01em] leading-4 rounded-3xl inline-flex items-center border transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 border-border/70 gap-2">
              <span className="text-xl font-medium">{emoji}</span>
              <span className="capitalize">{mood.replace('_', ' ')}</span>
            </Badge>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) =>
          <div key={day} className="text-center font-semibold text-xs sm:text-sm text-gray-600 py-1 sm:py-2">
              {day}
            </div>
          )}
          
          {emptyDays.map((_, index) =>
          <div key={`empty-${index}`} className="aspect-square" />
          )}
          
          {calendarDays.map((day) => {
            const entry = getEntryForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toString()}
                onClick={() => entry && onEditEntry(entry)} className="bg-teal-400 text-slate-50 p-0.5 text-base font-medium rounded-lg aspect-square sm:rounded-xl border-2 transition-all sm:p-2 flex flex-col items-center justify-center gap-0 sm:gap-1 border-purple-300 hover:border-purple-500 hover:shadow-lg cursor-pointer">








                <span className="text-sm font-semibold sm:text-sm">
                  {format(day, 'd')}
                </span>
                {entry &&
                <>
                    <span className="text-sm sm:text-2xl leading-none">{moodEmojis[entry.mood]}</span>
                    <div className={cn('hidden sm:block w-2 h-2 rounded-full', moodColors[entry.mood])} />
                  </>
                }
              </button>);

          })}
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-700">{entries.length}</p>
            <p className="text-purple-700 text-xs font-medium">Total Entries</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-700">
              {entries.filter((e) => ['excellent', 'good'].includes(e.mood)).length}
            </p>
            <p className="text-green-700 text-xs font-medium">Good Days</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-700">
              {entries.filter((e) => e.mood === 'okay').length}
            </p>
            <p className="text-yellow-700 text-xs font-medium">Okay Days</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-700">
              {entries.filter((e) => ['low', 'very_low'].includes(e.mood)).length}
            </p>
            <p className="text-red-700 text-xs font-medium">Difficult Days</p>
          </div>
        </div>
      </CardContent>
    </Card>);

}