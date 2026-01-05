import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, BookOpen, Target, Dumbbell, Play, Sparkles, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const actions = [
  {
    title: 'Talk to Therapist',
    description: 'Start a session',
    icon: MessageCircle,
    page: 'Chat',
    color: '#26A69A',
    bgColor: 'rgba(38, 166, 154, 0.15)'
  },
  {
    title: 'Thought Journal',
    description: 'Work through thoughts',
    icon: BookOpen,
    page: 'Journal',
    color: '#9F7AEA',
    bgColor: 'rgba(159, 122, 234, 0.15)'
  },
  {
    title: 'Set a Goal',
    description: 'Track progress',
    icon: Target,
    page: 'Goals',
    color: '#F6AD55',
    bgColor: 'rgba(246, 173, 85, 0.15)'
  },
  {
    title: 'Try an Exercise',
    description: 'Practice techniques',
    icon: Dumbbell,
    page: 'Exercises',
    color: '#4299E1',
    bgColor: 'rgba(66, 153, 225, 0.15)'
  },
  {
    title: 'CBT Video Library',
    description: 'Watch guided videos',
    icon: Play,
    page: 'Videos',
    color: '#ED8936',
    bgColor: 'rgba(237, 137, 54, 0.15)'
  },
  {
    title: 'Starter Path',
    description: '7-day beginner guide',
    icon: MapPin,
    page: 'StarterPath',
    color: '#38B2AC',
    bgColor: 'rgba(56, 178, 172, 0.15)'
  }
];

export default function QuickActions() {
  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <h2 className="text-lg font-semibold mb-3 truncate" style={{ color: '#2D3748' }}>Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={createPageUrl(action.page)}>
                <Card className="border-0 hover:shadow-lg transition-all cursor-pointer group h-full" style={{
                  borderRadius: '18px',
                  backgroundColor: action.bgColor,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)'
                }}>
                  <CardContent className="p-4">
                    <motion.div 
                      className="w-12 h-12 flex items-center justify-center mb-3"
                      style={{ 
                        borderRadius: '16px',
                        backgroundColor: action.color
                      }}
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </motion.div>
                    <h3 className="font-semibold text-sm mb-1 truncate" style={{ color: '#2D3748' }}>{action.title}</h3>
                    <p className="text-xs line-clamp-1" style={{ color: '#718096' }}>{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}