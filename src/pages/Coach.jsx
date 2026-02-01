import React, { useState } from 'react';
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

  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');

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
      queryClient.invalidateQueries(['coachingSessions']);
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
        onBack={() => setSelectedSession(null)}
      />
    );
  }

  // Main coach page
  return (
    <div className="w-full overflow-x-hidden" style={{ minHeight: '100vh', background: 'linear-gradient(165deg, #D4EDE8 0%, #BDE0D9 30%, #A8D4CB 60%, #9ECCC2 100%)' }}>
      {/* Mobile Header - Matches web structure */}
      <motion.div 
        className="md:hidden backdrop-blur-xl border-b p-4 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'linear-gradient(to bottom, rgba(212, 237, 232, 0.95) 0%, rgba(200, 230, 225, 0.92) 100%)',
          borderColor: 'rgba(38, 166, 154, 0.25)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = '/'}
              style={{ borderRadius: '50%', width: '36px', height: '36px' }}
              aria-label="Go back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <motion.div 
              className="w-9 h-9 flex items-center justify-center shadow-md"
              style={{
                borderRadius: '18px',
                background: 'linear-gradient(145deg, #26A69A, #38B2AC)'
              }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Heart className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-sm font-semibold" style={{ color: '#1A3A34' }}>AI Wellness Coach</h1>
              <p className="text-xs" style={{ color: '#5A7A72' }}>Structured guidance for your goals</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl('CoachingAnalytics')}>
              <Button variant="ghost" size="icon" style={{ borderRadius: '50%', width: '36px', height: '36px' }}>
                <BarChart3 className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              onClick={handleStartSession}
              size="icon"
              className="text-white shadow-md"
              style={{
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                backgroundColor: '#26A69A',
                boxShadow: '0 4px 12px rgba(38, 166, 154, 0.3)'
              }}
            >
              <Target className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Desktop Header - Hidden on mobile */}
      <motion.div 
        className="hidden md:block backdrop-blur-xl border-b p-4 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'linear-gradient(to bottom, rgba(212, 237, 232, 0.95) 0%, rgba(200, 230, 225, 0.92) 100%)',
          borderColor: 'rgba(38, 166, 154, 0.25)'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = '/'}
              style={{ borderRadius: '50%' }}
              aria-label="Go back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <motion.div 
              className="w-12 h-12 flex items-center justify-center shadow-lg"
              style={{
                borderRadius: '24px',
                background: 'linear-gradient(145deg, #26A69A, #38B2AC)'
              }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Heart className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: '#1A3A34' }}>AI Wellness Coach</h1>
              <p className="text-sm" style={{ color: '#5A7A72' }}>Structured guidance for your goals</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl('CoachingAnalytics')}>
              <Button variant="outline" className="gap-2 shadow-sm" style={{ borderRadius: '24px' }}>
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
            </Link>
            <Button
              onClick={handleStartSession}
              className="text-white"
              style={{
                borderRadius: '28px',
                backgroundColor: '#26A69A',
                boxShadow: '0 8px 24px rgba(38, 166, 154, 0.35)'
              }}
            >
              <Target className="w-5 h-5 mr-2" />
              Start New Session
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-32 md:pb-24 w-full overflow-x-hidden">
        {sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 md:mt-12"
          >
            <Card className="border-0 overflow-hidden" style={{
              borderRadius: '36px',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 246, 243, 0.9) 100%)',
              boxShadow: '0 16px 48px rgba(38, 166, 154, 0.15), 0 6px 20px rgba(0,0,0,0.05)'
            }}>
              <CardContent className="p-6 md:p-12 text-center">
                {/* Animated Heart icon */}
                <motion.div 
                  className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4 shadow-lg"
                  style={{
                    borderRadius: '50%',
                    background: 'linear-gradient(145deg, #26A69A, #38B2AC)'
                  }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </motion.div>
                <h2 className="text-xl md:text-2xl font-bold mb-3" style={{ color: '#1A3A34' }}>
                  Welcome to AI Coaching! 👋
                </h2>
                <p className="text-sm md:text-base mb-6 max-w-lg mx-auto" style={{ color: '#5A7A72' }}>
                  Work step-by-step with your AI coach to clarify challenges, set focused goals, and move forward with confidence.
                </p>
                <ul className="text-left text-sm md:text-base mb-6 max-w-lg mx-auto space-y-2" style={{ color: '#3D5A52' }}>
                  <li>• Break overwhelming thoughts into clear actions</li>
                  <li>• Get structured guidance, not generic advice</li>
                  <li>• Build momentum session by session</li>
                </ul>
                <Button
                  onClick={handleStartSession}
                  size="lg"
                  className="text-white shadow-lg hover:shadow-xl transition-all w-full md:w-auto px-8 py-6 text-base md:text-lg"
                  style={{
                    borderRadius: '32px',
                    backgroundColor: '#26A69A',
                    boxShadow: '0 8px 24px rgba(38, 166, 154, 0.35)'
                  }}
                >
                  <Target className="w-5 h-5 mr-2" />
                  Start Your First Session
                </Button>
                <ul className="text-left text-sm md:text-base mt-6 max-w-lg mx-auto space-y-2" style={{ color: '#3D5A52' }}>
                  <li>• Identify what matters most right now</li>
                  <li>• Turn stress into an actionable plan</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Personalized Insights */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A3A34' }}>
                <Brain className="w-5 h-5" style={{ color: '#26A69A' }} />
                Your Personalized Insights
              </h3>
              <PersonalizedInsights onStartSession={handleStartSession} />
            </div>

            <Tabs defaultValue="active">
              <TabsList className="backdrop-blur-xl border shadow-sm" style={{
                background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.7) 0%, rgba(180, 220, 210, 0.6) 100%)',
                borderColor: 'rgba(38, 166, 154, 0.25)',
                borderRadius: '28px'
              }}>
                <TabsTrigger value="active" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Active ({activeSessions.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Completed ({completedSessions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <CoachingSessionList 
                  sessions={activeSessions}
                  onSelectSession={handleSelectSession}
                  onDeleteSession={handleDeleteSession}
                />
              </TabsContent>

              <TabsContent value="completed">
                <CoachingSessionList 
                  sessions={completedSessions}
                  onSelectSession={handleSelectSession}
                  onDeleteSession={handleDeleteSession}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Mobile FAB for Starting Session */}
        {sessions.length > 0 && (
          <Button
            onClick={handleStartSession}
            size="lg"
            className="md:hidden fixed right-6 z-30 text-white shadow-2xl p-0"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              backgroundColor: '#26A69A',
              boxShadow: '0 8px 24px rgba(38, 166, 154, 0.35)'
            }}
          >
            <Target className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  );
}