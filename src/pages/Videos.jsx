import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Plus, List, Dumbbell, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import CreatePlaylistModal from '../components/playlists/CreatePlaylistModal';
import AddToPlaylistModal from '../components/playlists/AddToPlaylistModal';
import { useTranslation } from 'react-i18next';
import PullToRefresh from '../components/utils/PullToRefresh';

export default function Videos() {
  const { t } = useTranslation();
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => base44.entities.Video.list('order', 100),
    initialData: []
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['allVideoProgress'],
    queryFn: async () => {
      try {
        return await base44.entities.VideoProgress.list();
      } catch (error) {
        console.error('Error fetching video progress:', error);
        return [];
      }
    },
    initialData: []
  });

  const getVideoProgress = (videoId) => {
    return allProgress.find(p => p.video_id === videoId);
  };

  const getVideoMetaBadge = (video) => {
    const parts = [];
    if (video.duration_minutes) parts.push(`${video.duration_minutes}m`);
    if (video.difficulty) parts.push(video.difficulty.substring(0, 3));
    return parts.join(' · ');
  };

  const inProgressVideo = useMemo(
    () =>
      videos.find((video) => {
        const progress = getVideoProgress(video.id);
        return progress && progress.progress > 0 && !progress.completed;
      }),
    [videos, allProgress]
  );

  return (
    <PullToRefresh queryKeys={['videos', 'allVideoProgress']}>
      <div className="min-h-dvh bg-transparent">
        <div className="page-container max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1 text-foreground">
              {t('videos.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('videos.subtitle')}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap md:flex-nowrap md:items-center">
            <Link to={createPageUrl('Playlists')}>
              <Button
                className="text-sm font-medium px-5 py-4 rounded-full w-full md:w-auto"
              >
                <List className="w-4 h-4 mr-1" />
                {t('videos.my_playlists')}
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setShowCreatePlaylist(true)}
              className="text-sm px-4 py-4 w-full md:w-auto"
              style={{ borderRadius: '9999px' }}
            >
              <Plus className="w-4 h-4 mr-1" />
              {t('videos.new_button')}
            </Button>
          </div>
        </div>

        {!isLoading && videos.length > 0 && (
          <Card className="surface-secondary rounded-[var(--radius-card)] border-border/70 shadow-[var(--shadow-sm)] mb-6">
            <CardContent className="p-4 md:p-5">
              <div className="flex flex-wrap gap-2.5">
                {inProgressVideo && (
                  <Link
                    to={`${createPageUrl('VideoPlayer')}?videoUrl=${encodeURIComponent(inProgressVideo.videoUrl)}&title=${encodeURIComponent(inProgressVideo.title)}&videoId=${inProgressVideo.id}`}
                  >
                    <Button className="text-sm">
                      {t('common.continue')}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
                <Link to={createPageUrl('Playlists')}>
                  <Button variant="outline" className="text-sm">
                    <List className="w-4 h-4 mr-1" />
                    {t('videos.my_playlists')}
                  </Button>
                </Link>
                <Link to={createPageUrl('Exercises')}>
                  <Button variant="outline" className="text-sm">
                    <Dumbbell className="w-4 h-4 mr-1" />
                    {t('quick_actions.exercises_library.title')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('videos.loading')}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg mb-2 text-foreground">{t('videos.no_videos_title')}</p>
            <p className="text-muted-foreground">{t('videos.no_videos_description')}</p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Button onClick={() => setShowCreatePlaylist(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-1" />
                {t('playlists.create_playlist')}
              </Button>
              <Link to={createPageUrl('Exercises')} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Dumbbell className="w-4 h-4 mr-1" />
                  {t('quick_actions.exercises_library.title')}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Video Grid */}
        {!isLoading && videos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="surface-primary rounded-[var(--radius-card)] hover:shadow-[var(--shadow-lg)] transition-calm overflow-hidden group flex flex-col h-full">
                  <CardContent className="p-0 flex flex-col" style={{ height: '100%' }}>
                    <Link 
                      to={`${createPageUrl('VideoPlayer')}?videoUrl=${encodeURIComponent(video.videoUrl)}&title=${encodeURIComponent(video.title)}&videoId=${video.id}`}
                    >
                      {/* Thumbnail with Play Overlay */}
                      <div className="relative bg-secondary/40" style={{ aspectRatio: '16/10' }}>
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/40 transition-colors flex items-center justify-center">
                          <div 
                            className="w-10 h-10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform bg-white/20 backdrop-blur-sm"
                            style={{ 
                              borderRadius: 'var(--r-lg)'
                            }}
                          >
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                          </div>
                        </div>
                        {(() => {
                          const progress = getVideoProgress(video.id);
                          return progress && progress.progress > 0 && (
                            <>
                              {progress.completed && (
                                <div className="absolute top-1.5 left-1.5 bg-green-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
                                  ✓
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                                <div 
                                  className="h-full transition-all duration-300 bg-green-500"
                                  style={{ 
                                    width: `${progress.progress}%`
                                  }}
                                />
                              </div>
                            </>
                          );
                        })()}
                        
                        {/* Metadata Badges */}
                        {getVideoMetaBadge(video) && (
                          <div className="absolute bottom-1.5 right-1.5">
                            <div className="bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-xs font-medium">
                              {getVideoMetaBadge(video)}
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Video Info */}
                    <div className="flex flex-1 flex-col">
                      <div className="p-3 pb-2">
                        <h3 className="text-sm font-semibold mb-1 line-clamp-2 leading-tight text-foreground" style={{ minHeight: '2.5rem' }}>
                          {video.title}
                        </h3>
                        {getVideoMetaBadge(video) && (
                          <p className="text-[11px] text-muted-foreground mb-2">{getVideoMetaBadge(video)}</p>
                        )}
                        {video.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-primary border border-border/60 w-fit">
                            {video.category}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto border-t border-border/60 px-3 pt-2.5 pb-3">
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedVideo(video);
                          }}
                          className="w-full h-8 text-xs font-medium text-white"
                          style={{ 
                            backgroundColor: '#26A69A',
                            borderRadius: '8px'
                          }}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          {t('videos.add_to_list')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <CreatePlaylistModal 
          isOpen={showCreatePlaylist} 
          onClose={() => setShowCreatePlaylist(false)} 
        />
        
        <AddToPlaylistModal 
          isOpen={!!selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
          video={selectedVideo}
        />
        </div>
      </div>
    </PullToRefresh>
  );
}
