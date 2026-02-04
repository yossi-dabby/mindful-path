import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JourneyCard from '../components/journeys/JourneyCard';
import JourneyDetail from '../components/journeys/JourneyDetail';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function JourneysPage() {
  const { t } = useTranslation();
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [selectedProgress, setSelectedProgress] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: journeys = [] } = useQuery({
    queryKey: ['journeys'],
    queryFn: () => base44.entities.Journey.filter({ is_active: true }),
  });

  const { data: progressList = [] } = useQuery({
    queryKey: ['journey_progress'],
    queryFn: () => base44.entities.UserJourneyProgress.list(),
  });

  const startJourneyMutation = useMutation({
    mutationFn: async (journey) => {
      return base44.entities.UserJourneyProgress.create({
        journey_id: journey.id,
        journey_title: journey.title,
        status: 'in_progress',
        started_date: new Date().toISOString().split('T')[0],
        current_step: 0,
        completed_steps: [],
        total_steps: journey.steps?.length || 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey_progress'] });
    }
  });

  const handleStartJourney = async (journey) => {
    await startJourneyMutation.mutateAsync(journey);
    setSelectedJourney(journey);
    const newProgress = progressList.find(p => p.journey_id === journey.id);
    setSelectedProgress(newProgress);
    setShowDetail(true);
  };

  const handleContinueJourney = (journey, progress) => {
    setSelectedJourney(journey);
    setSelectedProgress(progress);
    setShowDetail(true);
  };

  const handleViewJourney = (journey, progress) => {
    setSelectedJourney(journey);
    setSelectedProgress(progress);
    setShowDetail(true);
  };

  const handlePlayGame = (gameSlug) => {
    navigate(createPageUrl('ExperientialGames') + `?game=${gameSlug}`);
  };

  const progressMap = {};
  progressList.forEach(p => {
    progressMap[p.journey_id] = p;
  });

  const inProgressJourneys = journeys.filter(j => {
    const prog = progressMap[j.id];
    return prog && prog.status === 'in_progress';
  });

  const completedJourneys = journeys.filter(j => {
    const prog = progressMap[j.id];
    return prog && prog.status === 'completed';
  });

  const availableJourneys = journeys.filter(j => !progressMap[j.id]);

  return (
    <div className="min-h-screen p-6 safe-bottom">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Compass className="w-8 h-8" style={{ color: '#26A69A' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#1A3A34' }}>
              {t('journeys.page_title')}
            </h1>
          </div>
          <p className="text-base" style={{ color: '#5A7A72' }}>
            {t('journeys.page_subtitle')}
          </p>
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="available">
              {t('journeys.tabs.available')} ({availableJourneys.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              {t('journeys.tabs.in_progress')} ({inProgressJourneys.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              {t('journeys.tabs.completed')} ({completedJourneys.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {availableJourneys.length === 0 ? (
              <p className="text-center py-12" style={{ color: '#5A7A72' }}>
                {t('journeys.empty_state.no_available')}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableJourneys.map(journey => (
                  <JourneyCard
                    key={journey.id}
                    journey={journey}
                    progress={null}
                    onStart={handleStartJourney}
                    onView={handleViewJourney}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4">
            {inProgressJourneys.length === 0 ? (
              <p className="text-center py-12" style={{ color: '#5A7A72' }}>
                {t('journeys.empty_state.no_in_progress')}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inProgressJourneys.map(journey => (
                  <JourneyCard
                    key={journey.id}
                    journey={journey}
                    progress={progressMap[journey.id]}
                    onContinue={handleContinueJourney}
                    onView={handleViewJourney}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedJourneys.length === 0 ? (
              <p className="text-center py-12" style={{ color: '#5A7A72' }}>
                {t('journeys.empty_state.no_completed')}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedJourneys.map(journey => (
                  <JourneyCard
                    key={journey.id}
                    journey={journey}
                    progress={progressMap[journey.id]}
                    onView={handleViewJourney}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-3xl" style={{ borderRadius: '24px' }}>
            {selectedJourney && (
              <JourneyDetail
                journey={selectedJourney}
                progress={selectedProgress}
                onClose={() => setShowDetail(false)}
                onPlayGame={handlePlayGame}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}