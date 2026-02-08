import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Target, Flag } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

const categoryColors = {
  behavioral: 'bg-blue-500',
  emotional: 'bg-purple-500',
  social: 'bg-green-500',
  cognitive: 'bg-orange-500',
  lifestyle: 'bg-pink-500'
};

export default function GoalCalendar({ goals }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get goals and milestones for each day
  const getEventsForDay = (day) => {
    const events = [];
    
    goals.forEach(goal => {
      // Check goal target date
      if (goal.target_date) {
        try {
          const targetDate = new Date(goal.target_date);
          if (!isNaN(targetDate.getTime()) && isSameDay(targetDate, day)) {
            events.push({
              type: 'goal',
              goal,
              label: goal.title
            });
          }
        } catch (e) {
          // Invalid date, skip
        }
      }
      
      // Check milestone dates
      goal.milestones?.forEach((milestone, idx) => {
        if (milestone.due_date) {
          try {
            const dueDate = new Date(milestone.due_date);
            if (!isNaN(dueDate.getTime()) && isSameDay(dueDate, day)) {
              events.push({
                type: 'milestone',
                goal,
                milestone,
                label: milestone.title
              });
            }
          } catch (e) {
            // Invalid date, skip
          }
        }
      });
    });
    
    return events;
  };

  // Get first day of week offset
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Goal Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[120px] text-center">
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
      <CardContent>
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for offset */}
          {emptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square" />
          ))}
          
          {/* Days */}
          {daysInMonth.map((day) => {
            const events = getEventsForDay(day);
            const hasEvents = events.length > 0;
            const isCurrentDay = isToday(day);
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  'aspect-square border rounded-lg p-1 relative transition-all',
                  isCurrentDay ? 'border-blue-500 border-2 bg-blue-50' : 'border-gray-200',
                  hasEvents && !isCurrentDay && 'bg-gradient-to-br from-purple-50 to-blue-50',
                  'hover:shadow-md'
                )}
              >
                <div className="text-xs font-medium text-gray-700 mb-1">
                  {format(day, 'd')}
                </div>
                
                {/* Event indicators */}
                <div className="space-y-0.5">
                  {events.slice(0, 2).map((event, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'text-[9px] leading-tight truncate rounded px-1 py-0.5 text-white',
                        event.type === 'goal' ? categoryColors[event.goal.category] : 'bg-gray-600'
                      )}
                      title={event.label}
                    >
                      {event.type === 'goal' ? <Target className="w-2 h-2 inline mr-0.5" /> : <Flag className="w-2 h-2 inline mr-0.5" />}
                      {event.label}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-[9px] text-gray-500 px-1">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs font-semibold text-gray-700 mb-2">Legend:</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1 text-xs">
              <Target className="w-3 h-3 text-gray-600" />
              <span className="text-gray-600">Goal Deadline</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Flag className="w-3 h-3 text-gray-600" />
              <span className="text-gray-600">Milestone</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} className="flex items-center gap-1 text-xs">
                <div className={cn('w-3 h-3 rounded', color)} />
                <span className="text-gray-600 capitalize">{category}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}