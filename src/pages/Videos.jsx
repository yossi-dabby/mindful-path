import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Plus, List } from 'lucide-react';
import { motion } from 'framer-motion';
import CreatePlaylistModal from '../components/playlists/CreatePlaylistModal';
import AddToPlaylistModal from '../components/playlists/AddToPlaylistModal';

export default function Videos() {
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

  return (
    <div className="min-h-screen bg-warm-gradient">
      <div className="page-container max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1" style={{ color: 'rgb(var(--text))' }}>
              CBT Video Library
            </h1>
            <p className="text-sm opacity-70" style={{ color: 'rgb(var(--muted))' }}>
              Guided videos to practice CBT
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreatePlaylist(true)}
              className="text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
            <Link to={createPageUrl('Playlists')}>
              <Button
                className="text-sm font-medium"
                style={{ 
                  backgroundColor: 'rgb(var(--accent))',
                  color: 'rgb(var(--accent-contrast))'
                }}
              >
                <List className="w-4 h-4 mr-1" />
                My Playlists
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p style={{ color: 'rgb(var(--muted))' }}>Loading videos...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg mb-2" style={{ color: 'rgb(var(--text))' }}>No videos yet</p>
            <p style={{ color: 'rgb(var(--muted))' }}>Videos will appear here once added</p>
          </div>
        )}

        {/* Video Grid */}
        {!isLoading && videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-soft hover:shadow-md transition-calm overflow-hidden group" style={{ 
                  borderRadius: 'var(--r-md)',
                  backgroundColor: 'rgb(var(--surface))'
                }}>
                  <CardContent className="p-0">
                    <Link 
                      to={`${createPageUrl('VideoPlayer')}?videoUrl=${encodeURIComponent(video.videoUrl)}&title=${encodeURIComponent(video.title)}&videoId=${video.id}`}
                    >
                      {/* Thumbnail with Play Overlay */}
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent group-hover:from-black/50 transition-colors flex items-center justify-center">
                          <div 
                            className="w-12 h-12 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform bg-white/20 backdrop-blur-sm"
                            style={{ 
                              borderRadius: 'var(--r-lg)'
                            }}
                          >
                            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                          </div>
                        </div>
                        {(() => {
                          const progress = getVideoProgress(video.id);
                          return progress && progress.progress > 0 && (
                            <>
                              {progress.completed && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                  ✓
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
                        
                        {/* Metadata Badges */}
                        <div className="absolute bottom-2 right-2 flex gap-1.5">
                          {video.duration_minutes && (
                            <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs font-medium">
                              {video.duration_minutes} min
                            </div>
                          )}
                          {video.difficulty && (
                            <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs font-medium capitalize">
                              {video.difficulty}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Video Info */}
                    <div className="p-3">
                      <h3 className="text-sm font-semibold mb-0.5 line-clamp-2" style={{ color: 'rgb(var(--text))' }}>
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between mb-2">
                        {video.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {video.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mb-2 opacity-70" style={{ color: 'rgb(var(--muted))' }}>
                        Watch & reflect with guided prompts
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedVideo(video);
                        }}
                        className="w-full h-8 text-xs hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Playlist
                      </Button>
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
  );
}