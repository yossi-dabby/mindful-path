import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlaylistDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const playlistId = urlParams.get('id');

  const { data: playlist } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: async () => {
      const playlists = await base44.entities.Playlist.filter({ id: playlistId });
      return playlists[0];
    },
    enabled: !!playlistId
  });

  const { data: playlistVideos = [] } = useQuery({
    queryKey: ['playlistVideos', playlistId],
    queryFn: () => base44.entities.PlaylistVideo.filter({ playlist_id: playlistId }),
    enabled: !!playlistId
  });

  const { data: videos = [] } = useQuery({
    queryKey: ['videos', playlistVideos],
    queryFn: async () => {
      if (playlistVideos.length === 0) return [];
      const allVideos = await base44.entities.Video.list();
      const videoMap = new Map(allVideos.map(v => [v.id, v]));
      return playlistVideos
        .map(pv => videoMap.get(pv.video_id))
        .filter(v => v)
        .sort((a, b) => {
          const posA = playlistVideos.find(pv => pv.video_id === a.id)?.position || 0;
          const posB = playlistVideos.find(pv => pv.video_id === b.id)?.position || 0;
          return posA - posB;
        });
    },
    enabled: playlistVideos.length > 0,
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

  const removeMutation = useMutation({
    mutationFn: async (videoId) => {
      const link = playlistVideos.find(pv => pv.video_id === videoId);
      if (link) {
        await base44.entities.PlaylistVideo.delete(link.id);
        await base44.entities.Playlist.update(playlistId, {
          video_count: Math.max(0, (playlist.video_count || 0) - 1)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['playlist', playlistId]);
      queryClient.invalidateQueries(['playlistVideos', playlistId]);
      queryClient.invalidateQueries(['playlists']);
    }
  });

  if (!playlist) {
    return (
      <div className="min-h-screen bg-warm-gradient">
        <div className="page-container max-w-7xl">
          <div className="text-center py-12">
            <p style={{ color: 'rgb(var(--muted))' }}>Loading playlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-gradient">
      <div className="page-container max-w-7xl">
        {/* Header */}
        <div className="mb-8 mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('Playlists'))}
            className="mb-4 -ml-2"
            style={{ color: 'rgb(var(--muted))' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Playlists
          </Button>
          <h1 className="text-3xl font-semibold mb-2" style={{ color: 'rgb(var(--text))' }}>
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-base mb-2" style={{ color: 'rgb(var(--muted))' }}>
              {playlist.description}
            </p>
          )}
          <p className="text-sm" style={{ color: 'rgb(var(--accent))' }}>
            {videos.length} videos
          </p>
        </div>

        {/* Empty State */}
        {videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg mb-2" style={{ color: 'rgb(var(--text))' }}>No videos in this playlist</p>
            <p style={{ color: 'rgb(var(--muted))' }}>
              Go to the Video Library and add videos to this playlist
            </p>
            <Button
              onClick={() => navigate(createPageUrl('Videos'))}
              className="mt-4"
              style={{ 
                backgroundColor: 'rgb(var(--accent))',
                color: 'rgb(var(--accent-contrast))'
              }}
            >
              Browse Videos
            </Button>
          </div>
        )}

        {/* Video Grid */}
        {videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group"
              >
                <Card className="border-0 shadow-soft hover:shadow-lg transition-calm overflow-hidden" style={{ 
                  borderRadius: 'var(--r-lg)',
                  backgroundColor: 'rgb(var(--surface))'
                }}>
                  <CardContent className="p-0">
                    <Link to={`${createPageUrl('VideoPlayer')}?videoUrl=${encodeURIComponent(video.videoUrl)}&title=${encodeURIComponent(video.title)}&videoId=${video.id}`}>
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <div 
                            className="w-16 h-16 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                            style={{ 
                              borderRadius: 'var(--r-xl)',
                              backgroundColor: 'rgb(var(--accent))'
                            }}
                          >
                            <Play className="w-8 h-8 text-white fill-white" />
                          </div>
                        </div>
                        {(() => {
                          const progress = getVideoProgress(video.id);
                          return progress && progress.progress > 0 && (
                            <>
                              {progress.completed && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                  ✓ Completed
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                                <div 
                                  className="h-full transition-all duration-300"
                                  style={{ 
                                    width: `${progress.progress}%`,
                                    backgroundColor: 'rgb(var(--accent))'
                                  }}
                                />
                              </div>
                            </>
                          );
                        })()}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            removeMutation.mutate(video.id);
                          }}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </Link>
                    <div className="p-4">
                      <h3 className="text-base font-semibold mb-1 line-clamp-2" style={{ color: 'rgb(var(--text))' }}>
                        {video.title}
                      </h3>
                      {video.category && (
                        <p className="text-sm" style={{ color: 'rgb(var(--muted))' }}>
                          {video.category}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}