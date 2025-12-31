import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Target, MessageCircle, TrendingUp, BarChart3, Brain } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <motion.div 
        className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
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
      {selectedSession ? (
        <CoachingChat 
          session={selectedSession}
          onBack={() => setSelectedSession(null)}
        />
      ) : (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {sessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12"
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
                <CardContent className="p-12 text-center">
                  <motion.div 
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Heart className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    Welcome to AI Coaching! 👋
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                    Work with your AI coach through structured sessions to tackle specific challenges, 
                    set meaningful goals, and create actionable plans for positive change.
                  </p>
                  <Button
                    onClick={handleStartSession}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-6 text-lg rounded-2xl shadow-lg"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Start Your First Session
                  </Button>
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
                  />
                </TabsContent>

                <TabsContent value="completed">
                  <CoachingSessionList 
                    sessions={completedSessions}
                    onSelectSession={handleSelectSession}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      )}

      {/* Wizard Modal */}
      {showWizard && (
        <CoachingSessionWizard onClose={handleCloseWizard} />
      )}
    </div>
  );
}