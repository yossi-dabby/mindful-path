import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, BookOpen, Target, Dumbbell, Play, Sparkles, MapPin, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// THERAPEUTIC ACTIONS - Route to AI Chat with Intent
const therapeuticActions = [
  {
    title: 'AI Therapist',
    description: 'Talk to your therapist',
    icon: MessageCircle,
    intent: null,
    page: 'Chat',
    color: '#26A69A',
    bgColor: 'rgba(38, 166, 154, 0.15)',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%202.mp4?alt=media&token=15202381-d3a7-44f4-ade9-cc118256e8c1'
  },
  {
    title: 'Journal a Thought',
    description: 'Challenge thinking',
    icon: BookOpen,
    intent: null,
    page: 'ThoughtCoach',
    color: '#9F7AEA',
    bgColor: 'rgba(159, 122, 234, 0.15)',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%206.mp4?alt=media&token=78391ab6-7f22-4288-a22f-2efa53ad0aac'
  },
  {
    title: 'Set a Goal',
    description: 'Define objectives',
    icon: Target,
    intent: 'goal_work',
    color: '#F6AD55',
    bgColor: 'rgba(246, 173, 85, 0.15)',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%204.mp4?alt=media&token=389888db-76eb-42e4-ba04-6b62335217cb'
  },
  {
    title: 'Grounding Exercise',
    description: 'Calm anxiety',
    icon: Sparkles,
    intent: 'grounding',
    color: '#4299E1',
    bgColor: 'rgba(66, 153, 225, 0.15)',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%205.mp4?alt=media&token=905b8eb3-09ba-4f02-ba8e-930b44dd5070'
  }
];

// NON-THERAPEUTIC ACTIONS - Direct Navigation
const selfDirectedActions = [
  {
    title: 'Exercises Library',
    description: 'Browse techniques',
    icon: Dumbbell,
    page: 'Exercises',
    color: '#38B2AC',
    bgColor: 'rgba(56, 178, 172, 0.15)',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%205.mp4?alt=media&token=905b8eb3-09ba-4f02-ba8e-930b44dd5070'
  },
  {
    title: 'Video Library',
    description: 'Watch & learn',
    icon: Play,
    page: 'Videos',
    color: '#ED8936',
    bgColor: 'rgba(237, 137, 54, 0.15)',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%207.mp4?alt=media&token=3cfbbe9d-39eb-4f87-805e-53b4a36395dd'
  }
];

const actions = [...therapeuticActions, ...selfDirectedActions];

export default function QuickActions() {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <h2 className="text-lg font-semibold mb-4 truncate" style={{ color: '#1A3A34' }}>Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full overflow-x-hidden">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.04, y: -6 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={action.intent ? createPageUrl('Chat', `intent=${action.intent}`) : createPageUrl(action.page)}>
                  <Card className="border-0 hover:shadow-xl transition-all cursor-pointer group h-full" style={{
                    borderRadius: '28px',
                    background: `linear-gradient(145deg, ${action.bgColor} 0%, rgba(255, 255, 255, 0.7) 100%)`,
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.6)'
                  }}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div 
                          className="w-14 h-14 flex items-center justify-center"
                          style={{ 
                            borderRadius: '20px',
                            backgroundColor: action.color,
                            boxShadow: `0 6px 16px ${action.color}40`
                          }}
                          whileHover={{ rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </motion.div>
                        
                        {/* Angel Button - next to icon */}
                        <motion.button
                          animate={{ 
                            scale: [1, 1.05, 1],
                            boxShadow: [
                              `0 4px 12px ${action.color}40`,
                              `0 6px 16px ${action.color}60`,
                              `0 4px 12px ${action.color}40`
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: [0.2, 0.8, 0.2, 1] }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveVideo(action.videoUrl);
                          }}
                          className="flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                          style={{ 
                            width: '56px',
                            height: '56px',
                            borderRadius: '20px',
                            backgroundColor: action.bgColor,
                            border: 'none',
                            outline: 'none'
                          }}
                          aria-label="Guided introduction video"
                          title="Guided introduction video"
                        >
                          <User className="w-6 h-6 icon-default" style={{ color: action.color }} strokeWidth={2} />
                        </motion.button>
                      </div>
                      <h3 className="font-semibold text-sm mb-1 truncate" style={{ color: '#1A3A34' }}>{action.title}</h3>
                      <p className="text-xs line-clamp-1" style={{ color: '#5A7A72' }}>{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
              style={{ 
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
              }}
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                style={{
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  cursor: 'pointer'
                }}
                aria-label="Close video"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <video
                autoPlay
                controls
                className="w-full"
                style={{ maxHeight: '80vh', backgroundColor: '#000' }}
              >
                <source src={activeVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}