import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Target, MessageCircle, TrendingUp, BarChart3, Brain, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import CoachingSessionList from '../components/coaching/CoachingSessionList';
import CoachingSessionWizard from '../components/coaching/CoachingSessionWizard';
import CoachingChat from '../components/coaching/CoachingChat';
import PersonalizedInsights from '../components/coaching/PersonalizedInsights';

export default function Coach() {
  const { t } = useTranslation();
  const [showWizard, setShowWizard] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: sessions } = useQuery({
    queryKey: ['coachingSessions', user?.email],
    queryFn: async () => {
      if (!user) return [];
      try {
        return await base44.entities.CoachingSession.filter(
          { created_by: user.email },
          '-created_date'
        );
      } catch (error) {
        console.error('Error fetching coaching sessions:', error);
        return [];
      }
    },
    enabled: !!user,
    initialData: []
  });

  const activeSessions = sessions.filter((s) => s.status === 'active');
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  const handleStartSession = () => {
    setShowWizard(true);
    setSelectedSession(null);
  };

  const handleSelectSession = (session) => {
    setSelectedSession(session);
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    setSelectedSession(null);
  };

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId) => base44.entities.CoachingSession.delete(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachingSessions'] });
    },
    onError: (error) => {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session. Please try again.');
    }
  });

  const handleDeleteSession = (sessionId) => {
    if (confirm('Are you sure you want to delete this coaching session? This action cannot be undone.')) {
      deleteSessionMutation.mutate(sessionId);
    }
  };

  // If wizard is shown, render it as the main content (not overlay)
  if (showWizard) {
    return <CoachingSessionWizard onClose={handleCloseWizard} />;
  }

  // If session is selected, show chat
  if (selectedSession) {
    return (
      <CoachingChat
        session={selectedSession}
        onBack={() => setSelectedSession(null)} />);


  }

  // Main coach page
  return (
    <div className="w-full min-h-[100dvh] bg-transparent">
      {/* Mobile Header - Matches web structure */}
      <motion.div className="bg-teal-50 p-4 md:hidden border-b border-border/70 backdrop-blur-2xl shadow-[var(--shadow-sm)]"

      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = '/'}
              style={{ borderRadius: '50%', width: '36px', height: '36px' }}
              aria-label={t('coach.go_back_aria')} className="text-teal-600 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-none hover:bg-secondary/78 hover:text-foreground active:bg-secondary/88 h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0">

              <ArrowLeft className="w-5 h-5 rtl:scale-x-[-1]" />
            </Button>
            <motion.div className="bg-teal-600 text-primary-foreground rounded-[20px] w-9 h-9 flex items-center justify-center shadow-[var(--shadow-sm)]"

            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}>

              <Heart className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-teal-600 text-sm font-semibold">{t('coach.title')}</h1>
              <p className="text-teal-600 text-xs font-medium">{t('coach.subtitle')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl('CoachingAnalytics')}>
              <Button variant="ghost" size="icon" style={{ borderRadius: '50%', width: '36px', height: '36px' }} aria-label={t('coach.analytics_aria')} className="text-teal-600 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-none hover:bg-secondary/78 hover:text-foreground active:bg-secondary/88 h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0">
                <BarChart3 className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              onClick={handleStartSession}
              size="icon" className="bg-teal-600 text-primary-foreground font-medium tracking-[0.005em] leading-none rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 w-9 h-9 shadow-[var(--shadow-sm)]"

              aria-label={t('coach.new_session_aria')}>

              <Target className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Desktop Header - Hidden on mobile */}
      <motion.div className="bg-teal-100 p-4 hidden md:block border-b border-border/70 backdrop-blur-2xl shadow-[var(--shadow-sm)]"

      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}>

        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = '/'}
              style={{ borderRadius: '50%' }}
              aria-label={t('coach.go_back_aria')} className="text-teal-600 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-none hover:bg-secondary/78 hover:text-foreground active:bg-secondary/88 h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0">

              <ArrowLeft className="w-5 h-5 rtl:scale-x-[-1]" />
            </Button>
            <motion.div className="bg-teal-600 text-primary-foreground rounded-3xl w-12 h-12 flex items-center justify-center shadow-[var(--shadow-md)]"

            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}>

              <Heart className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-teal-600 text-xl font-semibold">{t('coach.title')}</h1>
              <p className="text-teal-600 text-sm">{t('coach.subtitle')}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl('CoachingAnalytics')}>
              <Button variant="outline" className="bg-teal-600 text-slate-50 px-4 py-2 font-medium tracking-[0.005em] leading-none rounded inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-9 min-h-[44px] md:min-h-0 gap-2 shadow-sm" style={{ borderRadius: '24px' }}>
                <BarChart3 className="w-4 h-4" />
                {t('coach.analytics')}
              </Button>
            </Link>
            <Button
              onClick={handleStartSession} className="bg-teal-600 text-primary-foreground px-4 py-2 font-medium tracking-[0.005em] leading-none rounded-2xl inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[var(--shadow-md)] hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-9 min-h-[44px] md:min-h-0">


              <Target className="w-5 h-5 mr-2" />
              {t('coach.start_new_session')}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="bg-teal-50 mx-auto pb-32 p-4 max-w-7xl md:p-6 md:pb-24 w-full">
        {sessions.length === 0 ?
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 md:mt-12">

            <Card className="overflow-hidden border border-border/80 bg-card shadow-[var(--shadow-lg)]">
              <CardContent className="bg-teal-50 p-6 text-center md:p-12">
                {/* Animated Heart icon */}
                <motion.div className="bg-teal-600 text-teal-100 mb-4 mx-auto rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-[var(--shadow-md)]"

              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}>

                  <Heart className="bg-teal-600 text-white lucide lucide-heart w-8 h-8 md:w-10 md:h-10" />
                </motion.div>
                <h2 className="text-teal-600 mb-3 text-xl font-bold md:text-2xl">Welcome to AI Coaching! 👋

              </h2>
                <p className="text-teal-600 mb-6 mx-auto text-sm md:text-base max-w-lg">Work step-by-step with your AI coach to clarify challenges, set focused goals, and move forward with confidence.

              </p>
                <ul className="text-left text-sm md:text-base mb-6 max-w-lg mx-auto space-y-2 text-foreground/85">
                  <li className="text-teal-600">• Break overwhelming thoughts into clear actions</li>
                  <li className="text-teal-600">• Get structured guidance, not generic advice</li>
                  <li className="text-teal-600">• Build momentum session by session</li>
                </ul>
                <Button
                onClick={handleStartSession}
                size="lg" className="bg-teal-600 text-primary-foreground px-8 py-6 text-base font-medium tracking-[0.005em] rounded-2xl inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-10 min-h-[44px] md:min-h-0 shadow-[var(--shadow-lg)] transition-all w-full md:w-auto md:text-lg">


                  <Target className="w-5 h-5 mr-2" />
                  Start Your First Session
                </Button>
                <ul className="text-left text-sm md:text-base mt-6 max-w-lg mx-auto space-y-2 text-foreground/85">
                  <li className="text-teal-600">• Identify what matters most right now</li>
                  <li className="text-teal-600">• Turn stress into an actionable plan</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div> :

        <div className="space-y-6">
            {/* Personalized Insights */}
            <div>
              <h3 className="text-teal-600 mb-4 text-lg font-semibold flex items-center gap-2">Your Personalized Insights


            </h3>
              <PersonalizedInsights onStartSession={handleStartSession} />
            </div>

            <Tabs defaultValue="active">
              <TabsList className="bg-teal-100 text-muted-foreground p-1 rounded-[var(--radius-control)] inline-flex min-h-[44px] items-center justify-center gap-1 border border-border/60 shadow-[var(--shadow-sm)] backdrop-blur-[8px]">
                <TabsTrigger value="active" className="bg-teal-600 text-slate-50 px-3 py-1 font-medium tracking-[0.003em] leading-none rounded-[calc(var(--radius-control)-2px)] inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)] gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t('coach.tabs.active', { count: activeSessions.length })}
                </TabsTrigger>
                <TabsTrigger value="completed" className="bg-teal-600 text-slate-50 px-3 py-1 font-medium tracking-[0.003em] leading-none rounded-[calc(var(--radius-control)-2px)] inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)] gap-2">
                  <MessageCircle className="text-teal-600 lucide lucide-message-circle w-4 h-4" />
                  {t('coach.tabs.completed', { count: completedSessions.length })}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <CoachingSessionList
                sessions={activeSessions}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession} />

              </TabsContent>

              <TabsContent value="completed">
                <CoachingSessionList
                sessions={completedSessions}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession} />

              </TabsContent>
            </Tabs>
          </div>
        }

        {/* Mobile FAB for Starting Session */}
        {sessions.length > 0 &&
        <Button
          onClick={handleStartSession}
          size="lg" className="bg-teal-600 text-slate-50 p-0 font-medium tracking-[0.005em] leading-none rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 min-h-[44px] md:min-h-0 md:hidden fixed right-6 z-30 shadow-[var(--shadow-lg)] w-14 h-14"

          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)'
          }}>

            <Target className="w-6 h-6" />
          </Button>
        }
      </div>
    </div>);

}