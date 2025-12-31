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

  return (
    <div className="min-h-screen bg-warm-gradient">
      <div className="page-container max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 mt-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2" style={{ color: 'rgb(var(--text))' }}>
              CBT Video Library
            </h1>
            <p className="text-base" style={{ color: 'rgb(var(--muted))' }}>
              Short guided videos to understand and practice CBT step by step
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreatePlaylist(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Playlist
            </Button>
            <Link to={createPageUrl('Playlists')}>
              <Button
                style={{ 
                  backgroundColor: 'rgb(var(--accent))',
                  color: 'rgb(var(--accent-contrast))'
                }}
              >
                <List className="w-4 h-4 mr-2" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-soft hover:shadow-lg transition-calm overflow-hidden group" style={{ 
                  borderRadius: 'var(--r-lg)',
                  backgroundColor: 'rgb(var(--surface))'
                }}>
                  <CardContent className="p-0">
                    <Link 
                      to={`${createPageUrl('VideoPlayer')}?videoUrl=${encodeURIComponent(video.videoUrl)}&title=${encodeURIComponent(video.title)}`}
                    >
                      {/* Thumbnail with Play Overlay */}
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
                      </div>
                    </Link>

                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className="text-base font-semibold mb-1 line-clamp-2" style={{ color: 'rgb(var(--text))' }}>
                        {video.title}
                      </h3>
                      {video.category && (
                        <p className="text-sm mb-3" style={{ color: 'rgb(var(--muted))' }}>
                          {video.category}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedVideo(video);
                        }}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Playlist
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