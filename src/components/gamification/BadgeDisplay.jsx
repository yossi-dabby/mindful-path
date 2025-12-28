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
      <Card className="border-0 shadow-lg bg-white rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-800">Achievements</h3>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {earnedBadges.length} earned
            </Badge>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {earnedBadges.slice(0, 5).map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center",
                  rarityColors[badge.rarity]
                )}
              >
                <span className="text-2xl">{badge.icon}</span>
              </motion.div>
            ))}
            {earnedBadges.length > 5 && (
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <p className="text-sm font-semibold text-gray-600">+{earnedBadges.length - 5}</p>
              </div>
            )}
          </div>
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