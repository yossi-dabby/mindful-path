import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, List, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import CreatePlaylistModal from '../components/playlists/CreatePlaylistModal';

export default function Playlists() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => base44.entities.Playlist.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: async (playlistId) => {
      const links = await base44.entities.PlaylistVideo.filter({ playlist_id: playlistId });
      await Promise.all(links.map(link => base44.entities.PlaylistVideo.delete(link.id)));
      await base44.entities.Playlist.delete(playlistId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['playlists']);
    }
  });

  return (
    <div className="min-h-screen bg-warm-gradient">
      <div className="page-container max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 mt-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2" style={{ color: 'rgb(var(--text))' }}>
              My Playlists
            </h1>
            <p className="text-base" style={{ color: 'rgb(var(--muted))' }}>
              Organize your CBT videos into custom playlists
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="shadow-soft"
            style={{ 
              borderRadius: 'var(--r-lg)',
              backgroundColor: 'rgb(var(--accent))',
              color: 'rgb(var(--accent-contrast))'
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Playlist
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p style={{ color: 'rgb(var(--muted))' }}>Loading playlists...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && playlists.length === 0 && (
          <div className="text-center py-12">
            <List className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgb(var(--muted))' }} />
            <p className="text-lg mb-2" style={{ color: 'rgb(var(--text))' }}>No playlists yet</p>
            <p className="mb-6" style={{ color: 'rgb(var(--muted))' }}>
              Create your first playlist to organize your videos
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              style={{ 
                backgroundColor: 'rgb(var(--accent))',
                color: 'rgb(var(--accent-contrast))'
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Playlist
            </Button>
          </div>
        )}

        {/* Playlist Grid */}
        {!isLoading && playlists.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-soft hover:shadow-lg transition-calm group" style={{ 
                  borderRadius: 'var(--r-lg)',
                  backgroundColor: 'rgb(var(--surface))'
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1" style={{ color: 'rgb(var(--text))' }}>
                          {playlist.name}
                        </h3>
                        {playlist.description && (
                          <p className="text-sm line-clamp-2 mb-2" style={{ color: 'rgb(var(--muted))' }}>
                            {playlist.description}
                          </p>
                        )}
                        <p className="text-sm font-medium" style={{ color: 'rgb(var(--accent))' }}>
                          {playlist.video_count || 0} videos
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm('Delete this playlist?')) {
                            deleteMutation.mutate(playlist.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <Link to={`${createPageUrl('PlaylistDetail')}?id=${playlist.id}`}>
                      <Button 
                        className="w-full"
                        variant="outline"
                        style={{ borderRadius: 'var(--r-md)' }}
                      >
                        View Playlist
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <CreatePlaylistModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
        />
      </div>
    </div>
  );
}