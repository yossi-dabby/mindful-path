import React, { useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoPlayer() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const videoUrl = urlParams.get('videoUrl');
  const title = urlParams.get('title') || 'Video';
  const videoId = urlParams.get('videoId');

  // Get current progress
  const { data: videoProgress } = useQuery({
    queryKey: ['videoProgress', videoId],
    queryFn: async () => {
      if (!videoId) return null;
      try {
        const progress = await base44.entities.VideoProgress.filter({ video_id: videoId });
        return progress[0] || null;
      } catch (error) {
        console.error('Error fetching video progress:', error);
        return null;
      }
    },
    enabled: !!videoId
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ progress, completed }) => {
      if (!videoId) return;
      
      try {
        if (videoProgress) {
          await base44.entities.VideoProgress.update(videoProgress.id, {
            progress,
            completed,
            last_watched_at: new Date().toISOString()
          });
        } else {
          await base44.entities.VideoProgress.create({
            video_id: videoId,
            progress,
            completed,
            last_watched_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error updating video progress:', error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['videoProgress']);
      queryClient.invalidateQueries(['allVideoProgress']);
    }
  });

  // Track video progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoId) return;

    let lastUpdate = 0;

    const handleTimeUpdate = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      const roundedProgress = Math.floor(currentProgress);
      
      // Update every 5%
      if (roundedProgress - lastUpdate >= 5) {
        lastUpdate = roundedProgress;
        const completed = currentProgress >= 95;
        updateProgressMutation.mutate({ progress: roundedProgress, completed });
      }
    };

    const handleEnded = () => {
      updateProgressMutation.mutate({ progress: 100, completed: true });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoId, videoProgress]);

  const handleBack = () => {
    navigate(createPageUrl('Videos'));
  };

  if (!videoUrl) {
    return (
      <div className="min-h-screen bg-warm-gradient">
        <div className="page-container max-w-4xl">
          <div className="text-center py-12">
            <p className="text-lg mb-4" style={{ color: 'rgb(var(--text))' }}>
              No video selected
            </p>
            <Button onClick={handleBack}>Back to Video Library</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-gradient">
      <div className="page-container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="mb-6 mt-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 -ml-2"
              style={{ color: 'rgb(var(--muted))' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Video Library
            </Button>
            <h1 className="text-2xl font-semibold" style={{ color: 'rgb(var(--text))' }}>
              {title}
            </h1>
          </div>

          {/* Video Player Card */}
          <Card className="border-0 shadow-lg" style={{ 
            borderRadius: 'var(--r-lg)',
            backgroundColor: 'rgb(var(--surface))'
          }}>
            <CardContent className="p-0">
              <div className="relative" style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                <video
                  ref={videoRef}
                  className="w-full"
                  controls
                  autoPlay={false}
                  src={videoUrl}
                  style={{ maxHeight: '70vh' }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              {videoProgress && videoProgress.progress > 0 && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'rgb(var(--text))' }}>
                      {videoProgress.completed ? '✓ Completed' : `${Math.floor(videoProgress.progress)}% watched`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: `${videoProgress.progress}%`,
                        backgroundColor: 'rgb(var(--accent))'
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom Button */}
          <div className="mt-6 text-center">
            <Button
              onClick={handleBack}
              className="px-6 py-5 shadow-soft"
              style={{ 
                borderRadius: 'var(--r-lg)',
                backgroundColor: 'rgb(var(--accent))',
                color: 'rgb(var(--accent-contrast))'
              }}
            >
              Back to Video Library
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}