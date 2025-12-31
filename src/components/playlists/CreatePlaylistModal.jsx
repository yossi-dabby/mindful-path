import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

export default function CreatePlaylistModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Playlist.create({ name, description, video_count: 0 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['playlists']);
      setName('');
      setDescription('');
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      createMutation.mutate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" style={{ borderRadius: 'var(--r-lg)' }}>
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'rgb(var(--text))' }}>
              Playlist Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My CBT Journey"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'rgb(var(--text))' }}>
              Description (optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Videos to help me with anxiety"
              rows={3}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || createMutation.isPending}
              style={{ 
                backgroundColor: 'rgb(var(--accent))',
                color: 'rgb(var(--accent-contrast))'
              }}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Playlist'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}