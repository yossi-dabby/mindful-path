import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Videos() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => base44.entities.Video.list('order', 100),
    initialData: []
  });

  return (
    <div className="min-h-screen bg-warm-gradient">
      <div className="page-container max-w-7xl">
        {/* Header */}
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-semibold mb-2" style={{ color: 'rgb(var(--text))' }}>
            CBT Video Library
          </h1>
          <p className="text-base" style={{ color: 'rgb(var(--muted))' }}>
            Short guided videos to understand and practice CBT step by step
          </p>
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
                <Link 
                  to={`${createPageUrl('VideoPlayer')}?videoUrl=${encodeURIComponent(video.videoUrl)}&title=${encodeURIComponent(video.title)}`}
                  className="block group"
                >
                  <Card className="border-0 shadow-soft hover:shadow-lg transition-calm overflow-hidden" style={{ 
                    borderRadius: 'var(--r-lg)',
                    backgroundColor: 'rgb(var(--surface))'
                  }}>
                    <CardContent className="p-0">
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

                      {/* Video Info */}
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
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}