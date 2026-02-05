import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Puzzle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function GameCard({ game, onClick, index }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card
        className="border-0 hover:shadow-xl transition-all cursor-pointer group h-full"
        style={{
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 24px rgba(38, 166, 154, 0.12), 0 4px 12px rgba(0,0,0,0.04)'
        }}
        onClick={onClick}
        data-testid={game.testId}
      >
        <CardContent className="p-5 h-full flex flex-col">
          <div className="flex items-start gap-3 w-full min-w-0">
            <div
              className="w-12 h-12 flex items-center justify-center flex-shrink-0"
              style={{
                borderRadius: '16px',
                backgroundColor: 'rgba(38, 166, 154, 0.15)',
                color: '#26A69A'
              }}
            >
              <Puzzle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1 min-w-0">
                <h3
                  className="font-semibold text-base break-words line-clamp-2 flex-1 min-w-0"
                  style={{ color: '#1A3A34' }}
                >
                  {game.titleKey ? t(game.titleKey) : game.title}
                </h3>
                <Badge
                  variant="outline"
                  className="text-xs flex-shrink-0 whitespace-nowrap"
                  style={{
                    borderRadius: '12px',
                    borderColor: 'rgba(38, 166, 154, 0.3)',
                    color: '#26A69A'
                  }}
                >
                  {game.time}
                </Badge>
              </div>
              <p className="text-sm break-words line-clamp-2" style={{ color: '#5A7A72' }}>
                {game.descriptionKey ? t(game.descriptionKey) : game.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}