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
      <Card className="border-0 shadow-xl">
        <CardContent className="p-12 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No sessions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sessions.map((session, index) => {
        const completedActions = session.action_plan?.filter(a => a.completed).length || 0;
        const totalActions = session.action_plan?.length || 0;

        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="border-0 shadow-xl hover:shadow-2xl transition-all group"
            >
              <CardContent className="p-6 cursor-pointer" onClick={() => onSelectSession(session)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="font-semibold text-gray-800 mb-1 group-hover:text-purple-700 transition-colors"
                        data-testid="session-title"
                      >
                        {session.title}
                      </h3>
                      <Badge className={focusAreaColors[session.focus_area]}>
                        {session.focus_area.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Started {format(new Date(session.created_date), 'MMM dd, yyyy')}</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Stage:</span>
                      <span className="font-medium text-purple-700">{stageLabels[session.stage]}</span>
                    </div>
                  </div>

                  {totalActions > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium text-gray-800">{completedActions}/{totalActions} actions</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                          style={{ width: `${totalActions > 0 ? (completedActions / totalActions) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {session.status === 'completed' && (
                    <div className="flex items-center gap-2 text-green-700 text-sm font-medium pt-2 border-t">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <div className="px-6 pb-4 flex justify-end border-t pt-3 relative z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  data-testid="delete-session-button"
                  aria-label={`Delete session: ${session.title}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}