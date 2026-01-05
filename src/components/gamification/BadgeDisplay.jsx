import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-pink-600',
  legendary: 'from-yellow-400 to-orange-600'
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
        background: 'linear-gradient(145deg, rgba(232, 246, 243, 0.7) 0%, rgba(212, 237, 232, 0.6) 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(38, 166, 154, 0.12), 0 4px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)'
      }}>
        <CardContent className="p-5 text-center">
          <Award className="w-8 h-8 mx-auto mb-2" style={{ color: '#ECC94B' }} strokeWidth={2} />
          <p className="text-2xl font-bold mb-1" style={{ color: '#1A3A34' }}>{earnedBadges.length}</p>
          <p className="text-xs" style={{ color: '#5A7A72' }}>Badges</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Earned Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {earnedBadges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="relative"
              >
                <div className={cn(
                  "aspect-square rounded-2xl bg-gradient-to-br shadow-lg flex flex-col items-center justify-center p-4",
                  rarityColors[badge.rarity]
                )}>
                  <span className="text-4xl mb-2">{badge.icon}</span>
                  <p className="text-xs text-white font-semibold text-center">{badge.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* In Progress */}
      {inProgressBadges.length > 0 && (
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inProgressBadges.map((badge) => (
                <div key={badge.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{badge.name}</p>
                        <p className="text-xs text-gray-600">{badge.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-600">Progress</p>
                      <p className="text-xs font-semibold text-gray-800">{badge.progress}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${badge.progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-r from-orange-400 to-pink-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}