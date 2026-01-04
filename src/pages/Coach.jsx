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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Mobile Header - Matches web structure */}
      <motion.div 
        className="md:hidden bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = '/'}
              className="rounded-full h-9 w-9"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <motion.div 
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Heart className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-sm font-semibold text-gray-800">AI Wellness Coach</h1>
              <p className="text-xs text-gray-500">Structured guidance for your goals</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl('CoachingAnalytics')}>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <BarChart3 className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              onClick={handleStartSession}
              size="icon"
              className="rounded-full h-9 w-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
            >
              <Target className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Desktop Header - Hidden on mobile */}
      <motion.div 
        className="hidden md:block bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = '/'}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <motion.div 
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Heart className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">AI Wellness Coach</h1>
              <p className="text-sm text-gray-500">Structured guidance for your goals</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl('CoachingAnalytics')}>
              <Button variant="outline" className="gap-2 shadow-sm">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
            </Link>
            <Button
              onClick={handleStartSession}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <Target className="w-5 h-5 mr-2" />
              Start New Session
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-32 md:pb-24">
        {sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 md:mt-12"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 overflow-hidden">
              <CardContent className="p-6 md:p-12 text-center">
                {/* Animated Heart icon */}
                <motion.div 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </motion.div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                  Welcome to AI Coaching! 👋
                </h2>
                <p className="text-sm md:text-base text-gray-600 mb-6 max-w-lg mx-auto">
                  Work step-by-step with your AI coach to clarify challenges, set focused goals, and move forward with confidence.
                </p>
                <ul className="text-left text-sm md:text-base text-gray-700 mb-6 max-w-lg mx-auto space-y-2">
                  <li>• Break overwhelming thoughts into clear actions</li>
                  <li>• Get structured guidance, not generic advice</li>
                  <li>• Build momentum session by session</li>
                </ul>
                <Button
                  onClick={handleStartSession}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all w-full md:w-auto px-8 py-6 rounded-2xl text-base md:text-lg"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Start Your First Session
                </Button>
                <ul className="text-left text-sm md:text-base text-gray-700 mt-6 max-w-lg mx-auto space-y-2">
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Your Personalized Insights
              </h3>
              <PersonalizedInsights onStartSession={handleStartSession} />
            </div>

            <Tabs defaultValue="active">
              <TabsList className="bg-white/80 backdrop-blur-xl border shadow-sm">
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
            className="md:hidden fixed right-6 z-30 rounded-full w-14 h-14 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-0"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}
          >
            <Target className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  );
}