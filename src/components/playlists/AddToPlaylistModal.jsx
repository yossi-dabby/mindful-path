import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AddToPlaylistModal({ isOpen, onClose, video }) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" style={{ borderRadius: 'var(--r-lg)' }}>
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <p className="text-sm mt-1" style={{ color: 'rgb(var(--muted))' }}>{video?.title}</p>
        </DialogHeader>
        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
          {playlists.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'rgb(var(--muted))' }}>
              No playlists yet. Create one first!
            </p>
          ) : (
            playlists.map((playlist) => {
              const inPlaylist = isVideoInPlaylist(playlist.id);
              return (
                <motion.button
                  key={playlist.id}
                  onClick={() => togglePlaylist(playlist.id)}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  style={{ borderRadius: 'var(--r-md)', border: '1px solid rgb(var(--border))' }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="text-left">
                    <p className="font-medium text-sm" style={{ color: 'rgb(var(--text))' }}>
                      {playlist.name}
                    </p>
                    <p className="text-xs" style={{ color: 'rgb(var(--muted))' }}>
                      {playlist.video_count || 0} videos
                    </p>
                  </div>
                  {inPlaylist ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Plus className="w-5 h-5" style={{ color: 'rgb(var(--muted))' }} />
                  )}
                </motion.button>
              );
            })
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}