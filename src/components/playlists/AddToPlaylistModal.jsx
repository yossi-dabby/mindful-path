import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Check, List } from 'lucide-react';
import { motion } from 'framer-motion';
import CreatePlaylistModal from './CreatePlaylistModal';

export default function AddToPlaylistModal({ isOpen, onClose, video }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => base44.entities.Playlist.list('-created_date'),
    enabled: isOpen
  });

  const { data: playlistVideos = [] } = useQuery({
    queryKey: ['playlistVideos', video?.id],
    queryFn: () => base44.entities.PlaylistVideo.filter({ video_id: video.id }),
    enabled: isOpen && !!video
  });

  const addMutation = useMutation({
    mutationFn: async ({ playlistId }) => {
      const existingVideos = await base44.entities.PlaylistVideo.filter({ playlist_id: playlistId });
      const position = existingVideos.length + 1;
      
      await base44.entities.PlaylistVideo.create({
        playlist_id: playlistId,
        video_id: video.id,
        position
      });

      const playlist = playlists.find(p => p.id === playlistId);
      await base44.entities.Playlist.update(playlistId, {
        video_count: (playlist.video_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['playlists']);
      queryClient.invalidateQueries(['playlistVideos']);
    }
  });

  const removeMutation = useMutation({
    mutationFn: async ({ playlistId }) => {
      const link = playlistVideos.find(pv => pv.playlist_id === playlistId);
      if (link) {
        await base44.entities.PlaylistVideo.delete(link.id);
        const playlist = playlists.find(p => p.id === playlistId);
        await base44.entities.Playlist.update(playlistId, {
          video_count: Math.max(0, (playlist.video_count || 0) - 1)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['playlists']);
      queryClient.invalidateQueries(['playlistVideos']);
    }
  });

  const isVideoInPlaylist = (playlistId) => {
    return playlistVideos.some(pv => pv.playlist_id === playlistId);
  };

  const togglePlaylist = (playlistId) => {
    if (isVideoInPlaylist(playlistId)) {
      removeMutation.mutate({ playlistId });
    } else {
      addMutation.mutate({ playlistId });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md" style={{ borderRadius: 'var(--r-lg)' }}>
          <DialogHeader>
            <DialogTitle>Add to Playlist</DialogTitle>
            <p className="text-sm mt-1" style={{ color: 'rgb(var(--muted))' }}>{video?.title}</p>
          </DialogHeader>
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {playlists.length === 0 ? (
              <div className="text-center py-8">
                <List className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgb(var(--muted))' }} />
                <p className="text-base font-medium mb-2" style={{ color: 'rgb(var(--text))' }}>
                  No playlists yet
                </p>
                <p className="text-sm mb-6" style={{ color: 'rgb(var(--muted))' }}>
                  Create your first playlist to organize videos
                </p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    style={{ 
                      backgroundColor: '#26A69A',
                      color: 'white'
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Playlist
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
            playlists.map((playlist) => {
              const inPlaylist = isVideoInPlaylist(playlist.id);
              return (
                <motion.button
                  key={playlist.id}
                  type="button"
                  onClick={() => togglePlaylist(playlist.id)}
                  className="w-full p-3 flex items-center justify-between transition-all"
                  style={{ 
                    borderRadius: 'var(--r-md)', 
                    border: inPlaylist ? '2px solid #26A69A' : '1px solid rgb(var(--border))',
                    backgroundColor: inPlaylist ? 'rgba(38, 166, 154, 0.05)' : 'white'
                  }}
                  whileHover={{ scale: 1.02, backgroundColor: inPlaylist ? 'rgba(38, 166, 154, 0.08)' : 'rgba(0,0,0,0.02)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: inPlaylist ? '#26A69A' : 'rgb(var(--text))' }}>
                      {playlist.name}
                    </p>
                    <p className="text-xs" style={{ color: 'rgb(var(--muted))' }}>
                      {playlist.video_count || 0} videos
                    </p>
                  </div>
                  {inPlaylist ? (
                    <Check className="w-5 h-5" style={{ color: '#26A69A' }} />
                  ) : (
                    <Plus className="w-5 h-5" style={{ color: 'rgb(var(--muted))' }} />
                  )}
                </motion.button>
              );
            })
            )}
            </div>
            <div className="flex justify-end mt-4">
            <Button type="button" onClick={onClose}>Done</Button>
            </div>
            </DialogContent>
            </Dialog>

            <CreatePlaylistModal 
            isOpen={showCreateModal} 
            onClose={() => setShowCreateModal(false)} 
            />
            </>
            );
            }