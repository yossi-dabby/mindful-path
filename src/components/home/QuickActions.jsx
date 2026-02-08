import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, BookOpen, Target, Dumbbell, Play, Sparkles, Puzzle, User, Compass, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AiPersonalizedFeed from './AiPersonalizedFeed';
import VideoModal from './VideoModal';
import { useTranslation } from 'react-i18next';

const DAY_THEMES = [
  { title: "Welcome & Breathing", description: "Learn foundational breathing techniques" },
  { title: "Understanding Thoughts", description: "Identify automatic thinking patterns" },
  { title: "Grounding Practice", description: "Stay present with grounding exercises" },
  { title: "Challenging Beliefs", description: "Question negative thought patterns" },
  { title: "Building Momentum", description: "Take small behavioral actions" },
  { title: "Mindful Awareness", description: "Cultivate present-moment awareness" },
  { title: "Integration & Next Steps", description: "Review and plan ahead" }
];

export default function QuickActions() {
  const { t } = useTranslation();
  const [activeVideo, setActiveVideo] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showStarterPathVideo, setShowStarterPathVideo] = useState(false);
  const queryClient = useQueryClient();

  // Get user's starter path progress
  const { data: starterPath, isLoading: pathLoading } = useQuery({
    queryKey: ['starterPath'],
    queryFn: async () => {
      const paths = await base44.entities.StarterPath.list();
      return paths[0] || null;
    }
  });

  const startPathMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      return await base44.entities.StarterPath.create({
        current_day: 1,
        started_date: today
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['starterPath']);
    }
  });

  const refreshPathMutation = useMutation({
    mutationFn: async () => {
      if (starterPath) {
        await base44.entities.StarterPath.delete(starterPath.id);
      }
      const today = new Date().toISOString().split('T')[0];
      return await base44.entities.StarterPath.create({
        current_day: 1,
        started_date: today,
        completed: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['starterPath']);
    }
  });

  const currentDay = starterPath?.current_day || 0;
  const isStarted = currentDay > 0;
  const isCompleted = starterPath?.completed || currentDay >= 7;
  const dayTheme = currentDay > 0 && currentDay <= 7 ? DAY_THEMES[currentDay - 1] : null;
  
  const therapeuticActions = [
    {
      title: t('quick_actions.ai_therapist.title'),
      description: t('quick_actions.ai_therapist.description'),
      icon: MessageCircle,
      intent: null,
      page: 'Chat',
      color: '#26A69A',
      bgColor: 'rgba(38, 166, 154, 0.15)',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%202.mp4?alt=media&token=15202381-d3a7-44f4-ade9-cc118256e8c1'
    },
    {
      title: t('quick_actions.journal_thought.title'),
      description: t('quick_actions.journal_thought.description'),
      icon: BookOpen,
      intent: null,
      page: 'ThoughtCoach',
      color: '#9F7AEA',
      bgColor: 'rgba(159, 122, 234, 0.15)',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%206.mp4?alt=media&token=78391ab6-7f22-4288-a22f-2efa53ad0aac'
    },
    {
      title: t('quick_actions.set_goal.title'),
      description: t('quick_actions.set_goal.description'),
      icon: Target,
      intent: null,
      page: 'GoalCoach',
      color: '#F6AD55',
      bgColor: 'rgba(246, 173, 85, 0.15)',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%204.mp4?alt=media&token=389888db-76eb-42e4-ba04-6b62335217cb'
    },
    {
      title: t('quick_actions.mind_games.title'),
      description: t('quick_actions.mind_games.description'),
      icon: Puzzle,
      page: 'ExperientialGames',
      color: '#4299E1',
      bgColor: 'rgba(66, 153, 225, 0.15)',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%205.mp4?alt=media&token=905b8eb3-09ba-4f02-ba8e-930b44dd5070',
      testIds: ['quickaction-grounding', 'quickaction-mindgames']
    },
    {
      title: t('quick_actions.journeys.title'),
      description: t('quick_actions.journeys.description'),
      icon: Compass,
      page: 'Journeys',
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.15)',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%205.mp4?alt=media&token=905b8eb3-09ba-4f02-ba8e-930b44dd5070'
    }
  ];
  
  const selfDirectedActions = [
    {
      title: t('quick_actions.exercises_library.title'),
      description: t('quick_actions.exercises_library.description'),
      icon: Dumbbell,
      page: 'Exercises',
      color: '#38B2AC',
      bgColor: 'rgba(56, 178, 172, 0.15)',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%205.mp4?alt=media&token=905b8eb3-09ba-4f02-ba8e-930b44dd5070'
    },
    {
      title: t('quick_actions.video_library.title'),
      description: t('quick_actions.video_library.description'),
      icon: Play,
      page: 'Videos',
      color: '#ED8936',
      bgColor: 'rgba(237, 137, 54, 0.15)',
      videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%207.mp4?alt=media&token=3cfbbe9d-39eb-4f87-805e-53b4a36395dd'
    }
  ];
  
  const actions = [...therapeuticActions, ...selfDirectedActions];

  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <h2 className="text-lg font-semibold mb-4 truncate" style={{ color: '#1A3A34' }}>{t('quick_actions.title')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full overflow-x-hidden">
        {/* AI Recommendations Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="relative"
        >
          <motion.div
            whileHover={{ scale: 1.04, y: -6 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="border-0 hover:shadow-xl transition-all cursor-pointer group h-full" 
              style={{
                borderRadius: '28px',
                background: 'linear-gradient(145deg, rgba(255, 142, 66, 0.15) 0%, rgba(255, 255, 255, 0.7) 100%)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 6px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
              onClick={() => setShowRecommendations(true)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div 
                    className="w-14 h-14 flex items-center justify-center"
                    style={{ 
                      borderRadius: '20px',
                      backgroundColor: 'rgb(var(--accent))',
                      boxShadow: '0 6px 16px rgba(255, 142, 66, 0.4)'
                    }}
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </motion.div>
                </div>
                <h3 className="font-semibold text-sm mb-1 break-words" style={{ color: '#1A3A34' }}>{t('quick_actions.recommended.title')}</h3>
                <p className="text-xs line-clamp-2 break-words" style={{ color: '#5A7A72' }}>{t('quick_actions.recommended.description')}</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* StarterPath Card */}
        {!pathLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.65 }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.04, y: -6 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="border-0 hover:shadow-xl transition-all cursor-pointer group h-full" 
                style={{
                  borderRadius: '28px',
                  background: 'linear-gradient(145deg, rgba(38, 166, 154, 0.15) 0%, rgba(255, 255, 255, 0.7) 100%)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.6)'
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div 
                      className="w-14 h-14 flex items-center justify-center"
                      style={{ 
                        borderRadius: '20px',
                        backgroundColor: '#26A69A',
                        boxShadow: '0 6px 16px rgba(38, 166, 154, 0.4)'
                      }}
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </motion.div>
                    
                    <motion.button
                      animate={{ 
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          '0 4px 12px rgba(38, 166, 154, 0.4)',
                          '0 6px 16px rgba(38, 166, 154, 0.6)',
                          '0 4px 12px rgba(38, 166, 154, 0.4)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: [0.2, 0.8, 0.2, 1] }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowStarterPathVideo(true);
                      }}
                      className="flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                      style={{ 
                        width: '56px',
                        height: '56px',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(38, 166, 154, 0.15)',
                        border: 'none',
                        outline: 'none'
                      }}
                      aria-label="Guided introduction video"
                      title="Guided introduction video"
                    >
                      <User className="w-6 h-6 icon-default" style={{ color: '#26A69A' }} strokeWidth={2} />
                    </motion.button>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm break-words" style={{ color: '#1A3A34' }}>
                      StarterPath
                    </h3>
                    {isStarted && (
                      <Badge variant="secondary" className="border-0 text-xs" style={{ 
                        borderRadius: '12px',
                        backgroundColor: 'rgba(38, 166, 154, 0.15)',
                        color: '#26A69A'
                      }}>
                        {currentDay}/7
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs mb-3 line-clamp-2 break-words" style={{ color: '#5A7A72' }}>
                    {isStarted 
                      ? dayTheme?.description || "Continue your journey"
                      : "7-day guided CBT foundation"}
                  </p>

                  {/* Progress Bar */}
                  {isStarted && (
                    <div className="mb-3">
                      <div className="h-2 overflow-hidden" style={{ 
                        backgroundColor: 'rgba(200, 220, 215, 0.5)',
                        borderRadius: '10px'
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentDay / 7) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          style={{ 
                            height: '100%',
                            backgroundColor: '#26A69A',
                            borderRadius: '10px'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isStarted ? (
                      <>
                        <Link to={createPageUrl('StarterPath')} className="flex-1">
                          <Button
                            className="w-full px-4 py-2 font-medium transition-calm text-white text-xs"
                            style={{ 
                              borderRadius: '16px',
                              backgroundColor: '#26A69A'
                            }}
                          >
                            {isCompleted ? 'Review' : 'Continue'}
                            <ArrowRight className="w-3 h-3 ml-1" strokeWidth={2} />
                          </Button>
                        </Link>
                        {isCompleted && (
                          <Button
                            onClick={() => refreshPathMutation.mutate()}
                            disabled={refreshPathMutation.isPending}
                            variant="outline"
                            size="icon"
                            className="flex-shrink-0"
                            style={{ 
                              borderRadius: '16px',
                              borderColor: 'rgba(38, 166, 154, 0.3)'
                            }}
                            title="Restart path"
                          >
                            <RefreshCw className="w-4 h-4" style={{ color: '#26A69A' }} strokeWidth={2} />
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        onClick={() => startPathMutation.mutate()}
                        disabled={startPathMutation.isPending}
                        className="w-full px-4 py-2 font-medium transition-calm text-white text-xs"
                        style={{ 
                          borderRadius: '16px',
                          backgroundColor: '#26A69A'
                        }}
                      >
                        {startPathMutation.isPending ? 'Starting...' : 'Start'}
                        <ArrowRight className="w-3 h-3 ml-1" strokeWidth={2} />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.04, y: -6 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link 
                  to={action.intent ? createPageUrl('Chat', `intent=${action.intent}`) : createPageUrl(action.page)}
                  data-testid={action.testIds ? action.testIds[0] : undefined}
                >
                  <Card 
                    className="border-0 hover:shadow-xl transition-all cursor-pointer group h-full" 
                    data-testid={action.testIds ? action.testIds[1] : undefined}
                    style={{
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
                      <h3 className="font-semibold text-sm mb-1 break-words" style={{ color: '#1A3A34' }}>{action.title}</h3>
                      <p className="text-xs line-clamp-2 break-words" style={{ color: '#5A7A72' }}>{action.description}</p>
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

      {/* StarterPath Video Modal */}
      {showStarterPathVideo && (
        <VideoModal
          videoUrl="https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%203.mp4?alt=media&token=7d591673-f152-496d-987f-e8cc393ff58d"
          onClose={() => setShowStarterPathVideo(false)}
        />
      )}

      {/* AI Recommendations Modal - Conditional rendering to avoid DialogPortal error */}
      {showRecommendations && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-24 overflow-y-auto"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)'
          }}
          onClick={() => setShowRecommendations(false)}
        >
          <Card 
            className="w-full max-w-2xl border-0 shadow-2xl my-8" 
            style={{ maxHeight: 'calc(100vh - 160px)', borderRadius: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: 'rgb(var(--accent))' }} />
                  <h2 className="text-xl font-semibold">{t('quick_actions.personalized_recommendations')}</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowRecommendations(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </Button>
              </div>
              <AiPersonalizedFeed />
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}