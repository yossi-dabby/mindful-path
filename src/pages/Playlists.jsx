import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { isAuthError, shouldShowAuthError } from '../components/utils/authErrorHandler';
import AuthErrorBanner from '../components/utils/AuthErrorBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, List, Trash2, ArrowLeft, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import CreatePlaylistModal from '../components/playlists/CreatePlaylistModal';
import { useTranslation } from 'react-i18next';
import PullToRefresh from '../components/utils/PullToRefresh';

export default function Playlists() {
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthError, setShowAuthError] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: playlists = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => base44.entities.Playlist.list('-created_date'),
    refetchOnWindowFocus: true
  });

  const deleteMutation = useMutation({
    mutationFn: async (playlistId) => {
      const links = await base44.entities.PlaylistVideo.filter({ playlist_id: playlistId });
      await Promise.all(links.map(link => base44.entities.PlaylistVideo.delete(link.id)));
      await base44.entities.Playlist.delete(playlistId);
    },
    onMutate: async (playlistId) => {
      await queryClient.cancelQueries({ queryKey: ['playlists'] });
      const previous = queryClient.getQueryData(['playlists']);
      queryClient.setQueryData(['playlists'], (old = []) =>
        old.filter(p => p.id !== playlistId)
      );
      return { previous };
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['playlists'], ctx.previous);
      if (isAuthError(error) && shouldShowAuthError()) {
        setShowAuthError(true);
      } else {
        alert(t('playlists.delete_error'));
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['playlists'] })
  });

  return (
    <>
      {showAuthError && <AuthErrorBanner onDismiss={() => setShowAuthError(false)} />}
      <PullToRefresh queryKeys={['playlists']}>
        <div className="min-h-dvh" style={{ background: 'linear-gradient(to bottom, #F0F9F8 0%, #E8F5F3 50%, #E0F2F1 100%)' }}>
          <div className="page-container max-w-7xl">
        {/* Header with Back Button */}
        <div className="mb-6 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(createPageUrl('Videos'))}
            className="mb-4 -ml-2 text-sm"
            style={{ color: '#26A69A' }}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('playlists.back_to_videos')}
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold mb-2" style={{ color: '#2D3748' }}>
                {t('playlists.title')}
              </h1>
              <p className="text-base" style={{ color: '#718096' }}>
                {t('playlists.subtitle')}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="text-white px-6 py-5 w-full md:w-auto"
              style={{ 
                borderRadius: '9999px',
                backgroundColor: '#26A69A',
                boxShadow: '0 3px 10px rgba(38, 166, 154, 0.2), 0 1px 3px rgba(0,0,0,0.08)'
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('playlists.new_playlist')}
            </Button>
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <Card className="border-0" style={{
            borderRadius: '32px',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 242, 242, 0.9) 100%)',
            boxShadow: '0 12px 40px rgba(239, 68, 68, 0.12)'
          }}>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4" style={{
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)'
              }}>
                <List className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">{t('playlists.error_title')}</h2>
              <p className="mb-6 text-gray-600">{t('playlists.error_description')}</p>
              <Button
                onClick={() => refetch()}
                className="text-white px-8 py-6"
                style={{
                  borderRadius: '24px',
                  backgroundColor: '#26A69A',
                  boxShadow: '0 4px 12px rgba(38, 166, 154, 0.3)'
                }}
              >
                {t('playlists.retry')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {!isError && isLoading && (
          <div className="text-center py-12">
            <p style={{ color: 'rgb(var(--theme-muted))' }}>{t('playlists.loading')}</p>
          </div>
        )}

        {/* Empty State */}
        {!isError && !isLoading && playlists.length === 0 && (
          <div className="text-center py-12">
            <List className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgb(var(--theme-muted))' }} />
            <p className="text-lg mb-2" style={{ color: 'rgb(var(--text))' }}>{t('playlists.no_playlists_title')}</p>
            <p className="mb-6" style={{ color: 'rgb(var(--theme-muted))' }}>
              {t('playlists.no_playlists_description')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto"
                style={{ 
                  backgroundColor: 'rgb(var(--theme-accent))',
                  color: 'rgb(var(--accent-contrast))'
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('playlists.create_playlist')}
              </Button>
              <Link to={createPageUrl('Videos')} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  {t('playlist_detail.browse_videos')}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Playlist Grid */}
        {!isError && !isLoading && playlists.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {playlists.map((playlist, index) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="border-0 hover:shadow-lg transition-calm group" style={{ 
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(224, 242, 241, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 3px 12px rgba(38, 166, 154, 0.1), 0 1px 3px rgba(0,0,0,0.04)'
                  }}>
                    <CardContent className="p-5 h-full flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1.5" style={{ color: '#2D3748' }}>
                          {playlist.name}
                        </h3>
                        {playlist.description && (
                          <p className="text-sm line-clamp-2 mb-3" style={{ color: '#718096' }}>
                            {playlist.description}
                          </p>
                        )}
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: '#26A69A' }}>
                          <List className="w-3.5 h-3.5" />
                          {t('playlists.video_count', { count: playlist.video_count || 0 })}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2">
                        <Link to={`${createPageUrl('PlaylistDetail')}?id=${playlist.id}`} className="flex-1">
                          <Button
                            className="w-full px-4 h-9 text-sm"
                            variant="outline"
                            style={{ borderRadius: '9999px' }}
                          >
                            {t('playlists.view_playlist')}
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            if (deleteMutation.isPending) return;
                            if (confirm(t('playlists.delete_confirm'))) {
                              deleteMutation.mutate(playlist.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          aria-label={t('playlists.delete_aria')}
                          className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="mt-6 border border-border/70 shadow-[var(--shadow-sm)]">
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-wrap gap-2.5">
                  <Link to={createPageUrl('Videos')}>
                    <Button variant="outline">
                      {t('playlist_detail.browse_videos')}
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Exercises')}>
                    <Button variant="outline">
                      <Dumbbell className="w-4 h-4 mr-1" />
                      {t('quick_actions.exercises_library.title')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <CreatePlaylistModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
        />
          </div>
        </div>
      </PullToRefresh>
    </>
  );
}
