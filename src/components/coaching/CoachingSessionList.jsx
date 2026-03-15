import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Calendar, ChevronRight, CheckCircle2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const focusAreaColors = {
  mood_improvement: 'bg-blue-100 text-blue-700',
  stress_management: 'bg-purple-100 text-purple-700',
  goal_achievement: 'bg-green-100 text-green-700',
  behavior_change: 'bg-orange-100 text-orange-700',
  relationship: 'bg-pink-100 text-pink-700',
  self_esteem: 'bg-yellow-100 text-yellow-700',
  general: 'bg-gray-100 text-gray-700'
};

const stageLabels = {
  discovery: 'Discovery',
  planning: 'Planning',
  action: 'Taking Action',
  review: 'Review',
  completed: 'Completed'
};

export default function CoachingSessionList({ sessions, onSelectSession, onDeleteSession }) {
  if (sessions.length === 0) {
    return (
      <Card className="bg-teal-100 text-card-foreground rounded-[var(--radius-card)] backdrop-blur-[10px] border border-border/80 shadow-[var(--shadow-md)]">
        <CardContent className="p-12 text-center">
          <Target className="text-teal-600 mb-3 mx-auto lucide lucide-target w-12 h-12" />
          <p className="text-teal-600 font-medium">No sessions yet</p>
        </CardContent>
      </Card>);

  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sessions.map((session, index) => {
        const completedActions = session.action_plan?.filter((a) => a.completed).length || 0;
        const totalActions = session.action_plan?.length || 0;

        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}>

            <Card className="bg-teal-100 text-card-foreground rounded-[var(--radius-card)] backdrop-blur-[10px] border border-border/80 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all group">


              <CardContent className="p-6 cursor-pointer" onClick={() => onSelectSession(session)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-teal-100 rounded-[var(--radius-control)] w-12 h-12 flex items-center justify-center flex-shrink-0 shadow-[var(--shadow-sm)]">
                      <Target className="text-teal-600 lucide lucide-target w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-teal-600 mb-1 font-semibold group-hover:text-primary transition-colors">
                        {session.title}
                      </h3>
                      <Badge variant="secondary" className="bg-secondary/86 text-teal-600 px-2.5 py-1 font-medium capitalize tracking-[0.01em] leading-4 rounded-[var(--radius-chip)] inline-flex items-center border transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 border-border/60">
                        {session.focus_area.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="text-teal-600 lucide lucide-calendar w-4 h-4" />
                    <span className="text-teal-600 font-medium">Started {format(new Date(session.created_date), 'MMM dd, yyyy')}</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-teal-600 font-medium">Stage:</span>
                      <span className="text-teal-600 font-medium">{stageLabels[session.stage]}</span>
                    </div>
                  </div>

                  {totalActions > 0 &&
                  <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium text-foreground">{completedActions}/{totalActions} actions</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${totalActions > 0 ? completedActions / totalActions * 100 : 0}%` }} />

                      </div>
                    </div>
                  }

                  {session.status === 'completed' &&
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium pt-2 border-t">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed</span>
                    </div>
                  }
                </div>
              </CardContent>
              <div className="px-6 pb-4 flex justify-end border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}>

                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </Card>
          </motion.div>);

      })}
    </div>);

}