import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, BookOpen, Target, Dumbbell, Play, Sparkles, Puzzle, User, Compass, RefreshCw, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // motion used for StarterPath expand, AnimatePresence for video modal
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AiPersonalizedFeed from './AiPersonalizedFeed';
import VideoModal from './VideoModal';
import { useTranslation } from 'react-i18next';

export default function QuickActions() {
  const { t } = useTranslation();
  const [activeVideo, setActiveVideo] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showRecommendedVideo, setShowRecommendedVideo] = useState(false);
  const [showStarterPathVideo, setShowStarterPathVideo] = useState(false);
  const [starterPathExpanded, setStarterPathExpanded] = useState(false);
  const queryClient = useQueryClient();

  // Get user's starter path progress
  const { data: starterPath, isLoading: pathLoading } = useQuery({
    queryKey: ['starterPath'],
    queryFn: async () => {
      const paths = await base44.entities.StarterPath.list();
      return paths[0] || null;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false
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
      queryClient.invalidateQueries({ queryKey: ['starterPath'] });
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
      queryClient.invalidateQueries({ queryKey: ['starterPath'] });
    }
  });

  const currentDay = starterPath?.current_day || 0;
  const isStarted = currentDay > 0;
  const isCompleted = starterPath?.completed || currentDay >= 7;

  const therapeuticActions = [
  {
    title: t('quick_actions.ai_therapist.title'),
    description: t('quick_actions.ai_therapist.description'),
    icon: MessageCircle,
    intent: null,
    page: 'Chat',
    color: '#26A69A',
    bgColor: 'rgba(38, 166, 154, 0.15)',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/AI%20Therapist.mp4?alt=media&token=db591799-a5af-422f-9b95-0c4ceb15f17b'
  },
  {
    title: t('quick_actions.journal_thought.title'),
    description: t('quick_actions.journal_thought.description'),
    icon: BookOpen,
    intent: null,
    page: 'ThoughtCoach',
    color: '#9F7AEA',
    bgColor: 'rgba(159, 122, 234, 0.15)',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/Journal%20a%20Thought.mp4?alt=media&token=863057e2-8265-47cc-ade1-1fae55cbca20'
  },
  {
    title: t('quick_actions.set_goal.title'),
    description: t('quick_actions.set_goal.description'),
    icon: Target,
    intent: null,
    page: 'GoalCoach',
    color: '#F6AD55',
    bgColor: 'rgba(246, 173, 85, 0.15)',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/Goal%20Coach.mp4?alt=media&token=f28cf868-bf68-4896-816e-2a02e43951de'
  },
  {
    title: t('quick_actions.mind_games.title'),
    description: t('quick_actions.mind_games.description'),
    icon: Puzzle,
    page: 'ExperientialGames',
    color: '#4299E1',
    bgColor: 'rgba(66, 153, 225, 0.15)',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/Mind%20Games.mp4?alt=media&token=275ef615-9611-457c-8e0e-f17c5621dac7',
    testIds: ['quickaction-grounding', 'quickaction-mindgames']
  },
  {
    title: t('quick_actions.journeys.title'),
    description: t('quick_actions.journeys.description'),
    icon: Compass,
    page: 'Journeys',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/Journeys.mp4?alt=media&token=07d21248-a2b0-47ed-ab83-bf26a0ca0d0b'
  }];


  const selfDirectedActions = [
  {
    title: t('quick_actions.exercises_library.title'),
    description: t('quick_actions.exercises_library.description'),
    icon: Dumbbell,
    page: 'Exercises',
    color: '#38B2AC',
    bgColor: 'rgba(56, 178, 172, 0.15)',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/Exercises%20Library.mp4?alt=media&token=3c3d0112-f226-4a69-b8c9-74ad0a5a3a05'
  },
  {
    title: t('quick_actions.video_library.title'),
    description: t('quick_actions.video_library.description'),
    icon: Play,
    page: 'Videos',
    color: '#ED8936',
    bgColor: 'rgba(237, 137, 54, 0.15)',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/CBT%20Video%20Library.mp4?alt=media&token=3e7a4ce8-5b61-4398-8579-dd2c42c83687'
  }];


  const actions = [...therapeuticActions, ...selfDirectedActions];

  return (
    <div className="mb-6">
      <h2 className="text-emerald-600 mb-4 text-lg font-semibold truncate">{t('quick_actions.title')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full overflow-x-hidden">
        {/* AI Recommendations Card */}
        <div className="relative">
          <Card
            className="rounded-[var(--radius-card)] hover:shadow-[var(--shadow-lg)] transition-all cursor-pointer group h-full border overflow-hidden"
            style={{ borderColor: 'rgba(118, 170, 156, 0.34)', background: 'linear-gradient(180deg, rgba(255,252,248,0.99) 0%, rgba(227,244,238,0.96) 100%)', boxShadow: '0 24px 56px rgba(68, 108, 96, 0.16), 0 10px 22px rgba(68, 108, 96, 0.08)' }}
            onClick={() => setShowRecommendations(true)}>

              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 flex items-center justify-center rounded-[var(--radius-control)] bg-accent text-accent-foreground shadow-[var(--shadow-sm)]">
                    <Sparkles className="text-teal-600 lucide lucide-sparkles w-7 h-7" strokeWidth={2.5} />
                  </div>
                  <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowRecommendedVideo(true);
                  }} className="bg-green-50 text-emerald-50 rounded-[var(--radius-control)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform w-14 h-14 border-0 outline-none"

                  aria-label="Guided introduction video"
                  title="Guided introduction video">

                    <User className="text-teal-600 lucide lucide-user w-6 h-6 icon-default" strokeWidth={2} />
                  </button>
                </div>
                <h3 className="font-semibold text-sm mb-1 break-words text-foreground">{t('quick_actions.recommended.title')}</h3>
                <p className="text-xs line-clamp-2 break-words text-muted-foreground">{t('quick_actions.recommended.description')}</p>
              </CardContent>
            </Card>
        </div>

        {/* StarterPath Card — collapsible, same size as other cards when folded */}
        {!pathLoading &&
        <div className="relative">
              <Card
            className="rounded-[var(--radius-card)] hover:shadow-[var(--shadow-lg)] transition-all cursor-pointer group h-full border border-border/70 overflow-hidden"
            style={{ borderColor: 'rgba(118, 170, 156, 0.34)', background: 'linear-gradient(180deg, rgba(252,248,242,0.99) 0%, rgba(231,245,239,0.96) 100%)', boxShadow: '0 24px 56px rgba(68, 108, 96, 0.16), 0 10px 22px rgba(68, 108, 96, 0.08)' }}
            onClick={() => setStarterPathExpanded((v) => !v)}>

                <CardContent className="p-5">
                  {/* Always-visible header row — same layout as other cards */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-teal-500 text-teal-500 rounded-[var(--radius-control)] w-14 h-14 flex items-center justify-center flex-shrink-0 shadow-[var(--shadow-sm)]">
                      <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>

                    <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowStarterPathVideo(true);
                  }} className="bg-teal-100 text-primary rounded-[var(--radius-control)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform flex-shrink-0 w-14 h-14 border-0 outline-none"

                  aria-label="Guided introduction video"
                  title="Guided introduction video">

                      <User className="bg-teal-100 text-teal-600 lucide lucide-user w-6 h-6 icon-default" strokeWidth={2} />
                    </button>
                  </div>

                  {/* Title row */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm break-words leading-tight text-foreground">
                      {t('starter_path.card_title')}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                      {isStarted &&
                  <Badge variant="default" className="text-xs">
                          {currentDay}/7
                        </Badge>
                  }
                      <motion.span
                    animate={{ rotate: starterPathExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-primary inline-flex">

                        <ArrowRight className="w-3 h-3" style={{ transform: 'rotate(90deg)' }} strokeWidth={2.5} />
                      </motion.span>
                    </div>
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence initial={false}>
                    {starterPathExpanded &&
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                  onClick={(e) => e.stopPropagation()}>

                        <p className="text-xs mt-2 mb-3 line-clamp-2 break-words text-muted-foreground">
                          {isStarted ?
                    t(`starter_path.day_themes.${currentDay}.description`, { defaultValue: t('starter_path.card_description_continue') }) :
                    t('starter_path.card_description_new')}
                        </p>

                        {isStarted &&
                  <div className="mb-3">
                            <div className="h-2 overflow-hidden" style={{
                      backgroundColor: 'rgba(200, 220, 215, 0.5)',
                      borderRadius: '10px'
                    }}>
                              <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentDay / 7 * 100}%` }}
                        transition={{ duration: 0.5 }}
                        style={{
                          height: '100%',
                          backgroundColor: '#26A69A',
                          borderRadius: '10px'
                        }} />

                            </div>
                          </div>
                  }

                        <div className="flex gap-2">
                          {isStarted ?
                    <>
                              <Link to={createPageUrl('StarterPath')} className="flex-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                          className="w-full px-4 py-2 font-medium transition-calm text-xs shadow-[var(--shadow-md)]">

                                  {isCompleted ? t('starter_path.card_btn_review') : t('starter_path.card_btn_continue')}
                                  <ArrowRight className="w-3 h-3 ml-1" strokeWidth={2} />
                                </Button>
                              </Link>
                              {isCompleted &&
                      <Button
                        onClick={(e) => {e.stopPropagation();refreshPathMutation.mutate();}}
                        disabled={refreshPathMutation.isPending}
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0 rounded-[var(--radius-control)]"
                        aria-label="Restart path">

                                  <RefreshCw className="w-4 h-4 text-primary" strokeWidth={2} />
                                </Button>
                      }
                            </> :

                    <Button
                      onClick={(e) => {e.stopPropagation();startPathMutation.mutate();}}
                      disabled={startPathMutation.isPending}
                      className="w-full px-4 py-2 font-medium transition-calm text-xs shadow-[var(--shadow-md)]">

                              {startPathMutation.isPending ? t('starter_path.card_btn_starting') : t('starter_path.card_btn_start')}
                              <ArrowRight className="w-3 h-3 ml-1" strokeWidth={2} />
                            </Button>
                    }
                        </div>
                      </motion.div>
                }
                  </AnimatePresence>
                </CardContent>
              </Card>
          </div>
        }

        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div key={action.title} className="relative">
              <Link
                to={action.intent ? createPageUrl('Chat', `intent=${action.intent}`) : createPageUrl(action.page)}
                data-testid={action.testIds ? action.testIds[0] : undefined}>

                <Card
                  className="rounded-[var(--radius-card)] hover:shadow-[var(--shadow-lg)] transition-all cursor-pointer group h-full border overflow-hidden"
                  style={{ borderColor: 'rgba(118, 170, 156, 0.34)', background: 'linear-gradient(180deg, rgba(255,252,248,0.99) 0%, rgba(230,244,238,0.96) 100%)', boxShadow: '0 24px 56px rgba(68, 108, 96, 0.16), 0 10px 22px rgba(68, 108, 96, 0.08)' }}
                  data-testid={action.testIds ? action.testIds[1] : undefined}>

                  <CardContent className="p-5 rounded-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-14 h-14 flex items-center justify-center rounded-[var(--radius-control)]"
                        style={{ background: `linear-gradient(180deg, ${action.color} 0%, ${action.color}dd 100%)`, boxShadow: '0 16px 30px rgba(68, 108, 96, 0.16)' }}>

                        <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                      </div>
                      
                      {/* Angel Button - next to icon */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveVideo(action.videoUrl);
                        }}
                        className="flex items-center justify-center cursor-pointer hover:scale-105 transition-transform w-14 h-14 rounded-[var(--radius-control)] border-0 outline-none"
                        style={{ backgroundColor: action.bgColor }}
                        aria-label="Guided introduction video"
                        title="Guided introduction video">

                        <User className="w-6 h-6 icon-default" style={{ color: action.color }} strokeWidth={2} />
                      </button>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 break-words text-foreground">{action.title}</h3>
                    <p className="text-xs line-clamp-2 break-words text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>);

        })}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
          onClick={() => setActiveVideo(null)}>

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
            }}>

              <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              style={{
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Close video">

                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <video
              autoPlay
              controls
              playsInline
              className="w-full"
              style={{ maxHeight: '80vh', backgroundColor: '#000' }}>

                <source src={activeVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Recommended for You Video Modal */}
      {showRecommendedVideo &&
      <VideoModal
        videoUrl="https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/Recommended%20for%20You.mp4?alt=media&token=d6126635-2c04-459b-b88c-fce5d36135b5"
        onClose={() => setShowRecommendedVideo(false)} />

      }

      {/* StarterPath Video Modal */}
      {showStarterPathVideo &&
      <VideoModal
        videoUrl="https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/7-Day%20Starter%20Path.mp4?alt=media&token=4fcbf1a9-fbec-42f2-a969-fb887f804819"
        onClose={() => setShowStarterPathVideo(false)} />

      }

      {/* AI Recommendations Modal */}
      {showRecommendations &&
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-24 overflow-y-auto"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)'
      }}
      onClick={() => setShowRecommendations(false)}>

          <Card
          className="w-full max-w-2xl border-0 shadow-2xl my-8"
          style={{ maxHeight: 'calc(100vh - 160px)', borderRadius: '24px' }}
          onClick={(e) => e.stopPropagation()}>

            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: 'rgb(var(--theme-accent))' }} />
                  <h2 className="text-xl font-semibold">{t('quick_actions.personalized_recommendations')}</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowRecommendations(false)} aria-label="Close recommendations">
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
      }
    </div>);

}