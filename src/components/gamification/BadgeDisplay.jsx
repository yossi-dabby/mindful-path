import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Lock, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-pink-600',
  legendary: 'from-yellow-400 to-orange-600'
};

const rarityBgColors = {
  common: 'rgba(156, 163, 175, 0.15)',
  rare: 'rgba(59, 130, 246, 0.15)',
  epic: 'rgba(168, 85, 247, 0.15)',
  legendary: 'rgba(245, 158, 11, 0.15)'
};

export default function BadgeDisplay({ compact = false }) {
  const { data: badges, isLoading } = useQuery({
    queryKey: ['userBadges'],
    queryFn: () => base44.entities.Badge.list('-earned_date'),
    initialData: []
  });

  const earnedBadges = badges.filter(b => b.earned_date);
  const inProgressBadges = badges.filter(b => !b.earned_date && b.progress > 0);

  if (isLoading) return null;

  if (compact) {
    return (
      <Card className="border-0 hover:shadow-xl transition-calm" style={{ 
        borderRadius: '28px',
        background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.85) 0%, rgba(180, 220, 210, 0.75) 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(38, 166, 154, 0.18), 0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.4)'
      }}>
        <CardContent className="p-5 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Award className="w-8 h-8 mx-auto mb-2" style={{ color: '#ECC94B' }} strokeWidth={2} />
          </motion.div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#1A3A34' }}>{earnedBadges.length}</p>
          <p className="text-xs" style={{ color: '#3D5A52' }}>Badges</p>
          {inProgressBadges.length > 0 && (
            <p className="text-xs mt-1" style={{ color: '#7A9A92' }}>{inProgressBadges.length} in progress</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      <Card className="border-0 shadow-lg rounded-2xl" style={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)'
      }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#1A3A34' }}>
            <Trophy className="w-5 h-5" style={{ color: '#ECC94B' }} />
            Earned Badges
            <Badge className="ml-auto text-xs" style={{ background: 'rgba(236, 201, 75, 0.2)', color: '#B7791F' }}>
              {earnedBadges.length} earned
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earnedBadges.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: '#7A9A92' }} />
              <p className="text-sm" style={{ color: '#7A9A92' }}>Complete activities to earn your first badge!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
              {earnedBadges.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, scale: 1.05 }}
                  className="relative cursor-pointer group"
                >
                  <div 
                    className="aspect-square rounded-2xl flex flex-col items-center justify-center p-2 sm:p-3 transition-all"
                    style={{
                      background: `linear-gradient(145deg, ${rarityBgColors[badge.rarity] || rarityBgColors.common} 0%, rgba(255, 255, 255, 0.9) 100%)`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  >
                    <span className="text-2xl sm:text-3xl mb-1">{badge.icon}</span>
                    <p className="text-xs font-medium text-center line-clamp-2" style={{ color: '#1A3A34' }}>{badge.name}</p>
                    <Badge className="mt-1 text-xs capitalize" style={{ 
                      background: badge.rarity === 'legendary' ? 'rgba(245, 158, 11, 0.2)' :
                                  badge.rarity === 'epic' ? 'rgba(168, 85, 247, 0.2)' :
                                  badge.rarity === 'rare' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                      color: badge.rarity === 'legendary' ? '#B45309' :
                             badge.rarity === 'epic' ? '#7C3AED' :
                             badge.rarity === 'rare' ? '#2563EB' : '#4B5563'
                    }}>
                      {badge.rarity}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* In Progress */}
      {inProgressBadges.length > 0 && (
        <Card className="border-0 shadow-lg rounded-2xl" style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#1A3A34' }}>
              <Sparkles className="w-5 h-5" style={{ color: '#F6AD55' }} />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {inProgressBadges.map((badge, i) => (
                <motion.div 
                  key={badge.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl p-4 transition-all hover:shadow-md"
                  style={{ background: 'rgba(200, 230, 225, 0.3)' }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center opacity-50" style={{
                      background: 'rgba(200, 200, 200, 0.4)'
                    }}>
                      <span className="text-xl grayscale">{badge.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: '#1A3A34' }}>{badge.name}</p>
                      <p className="text-xs line-clamp-1" style={{ color: '#5A7A72' }}>{badge.description}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs" style={{ color: '#7A9A92' }}>Progress</p>
                      <p className="text-xs font-semibold" style={{ color: '#26A69A' }}>{badge.progress || 0}%</p>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(200, 230, 225, 0.5)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${badge.progress || 0}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #26A69A 0%, #38B2AC 100%)' }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}