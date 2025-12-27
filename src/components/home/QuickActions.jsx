import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, BookOpen, Target, Dumbbell } from 'lucide-react';

const actions = [
  {
    title: 'Talk to Therapist',
    description: 'Start a session',
    icon: MessageCircle,
    page: 'Chat',
    gradient: 'from-green-400 to-green-600'
  },
  {
    title: 'Thought Journal',
    description: 'Work through thoughts',
    icon: BookOpen,
    page: 'Journal',
    gradient: 'from-purple-400 to-purple-600'
  },
  {
    title: 'Set a Goal',
    description: 'Track progress',
    icon: Target,
    page: 'Goals',
    gradient: 'from-coral-400 to-coral-600'
  },
  {
    title: 'Try an Exercise',
    description: 'Practice techniques',
    icon: Dumbbell,
    page: 'Exercises',
    gradient: 'from-blue-400 to-blue-600'
  }
];

export default function QuickActions() {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} to={createPageUrl(action.page)}>
              <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{action.title}</h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}