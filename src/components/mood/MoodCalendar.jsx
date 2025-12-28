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
    return entries.find(e => e.date === dateStr);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Mood Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-semibold text-lg px-4">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          {Object.entries(moodEmojis).map(([mood, emoji]) => (
            <Badge key={mood} variant="outline" className="gap-2">
              <span>{emoji}</span>
              <span className="capitalize">{mood.replace('_', ' ')}</span>
            </Badge>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
              {day}
            </div>
          ))}
          
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          
          {calendarDays.map(day => {
            const entry = getEntryForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <button
                key={day.toString()}
                onClick={() => entry && onEditEntry(entry)}
                className={cn(
                  'aspect-square rounded-xl border-2 transition-all p-2 flex flex-col items-center justify-center gap-1',
                  entry 
                    ? 'border-purple-300 hover:border-purple-500 hover:shadow-lg cursor-pointer'
                    : 'border-gray-200 hover:border-gray-300',
                  isToday && 'ring-2 ring-purple-400'
                )}
              >
                <span className={cn('text-sm font-medium', !isSameMonth(day, currentMonth) && 'text-gray-300')}>
                  {format(day, 'd')}
                </span>
                {entry && (
                  <>
                    <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                    <div className={cn('w-2 h-2 rounded-full', moodColors[entry.mood])} />
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-700">{entries.length}</p>
            <p className="text-xs text-gray-500">Total Entries</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-700">
              {entries.filter(e => ['excellent', 'good'].includes(e.mood)).length}
            </p>
            <p className="text-xs text-gray-500">Good Days</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-700">
              {entries.filter(e => e.mood === 'okay').length}
            </p>
            <p className="text-xs text-gray-500">Okay Days</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-700">
              {entries.filter(e => ['low', 'very_low'].includes(e.mood)).length}
            </p>
            <p className="text-xs text-gray-500">Difficult Days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}