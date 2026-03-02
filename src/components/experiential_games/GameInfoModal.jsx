import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Clock, Lightbulb, Play, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function GameInfoModal({ game, onClose, onPlay }) {
  const { t } = useTranslation();

  if (!game) return null;

  const helpKey = `mind_games.help.${game.id}`;
  const purpose = t(`${helpKey}.purpose`, { defaultValue: '' });
  const howToPlay = t(`${helpKey}.how_to_play`, { defaultValue: '' });
  const benefits = t(`${helpKey}.benefits`, { defaultValue: '', returnObjects: true });
  const benefitsArray = Array.isArray(benefits) ? benefits : [];
  const technique = t(`${helpKey}.technique`, { defaultValue: '' });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(26, 58, 52, 0.45)', backdropFilter: 'blur(6px)' }}
        />

        {/* Panel */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 340 }}
          className="relative w-full sm:max-w-md mx-auto sm:mx-4 overflow-hidden"
          style={{
            borderRadius: '28px 28px 0 0',
            maxHeight: '85vh',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div
            className="flex flex-col overflow-y-auto"
            style={{
              maxHeight: '85vh',
              background: 'linear-gradient(160deg, #f0faf7 0%, #e2f4ef 100%)',
              borderRadius: '28px 28px 0 0',
              paddingBottom: 'env(safe-area-inset-bottom, 16px)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b border-emerald-100/60">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#26A69A' }}>
                  {technique || t('mind_games.help.technique_label', 'CBT / DBT / ACT')}
                </p>
                <h2 className="text-xl font-bold break-words" style={{ color: '#1A3A34' }}>
                  {game.titleKey ? t(game.titleKey) : game.title}
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3.5 h-3.5" style={{ color: '#26A69A' }} />
                  <span className="text-xs" style={{ color: '#5A7A72' }}>{game.time}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'rgba(38,166,154,0.12)', color: '#26A69A' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-5 p-6">
              {/* Purpose */}
              {purpose && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 flex-shrink-0" style={{ color: '#26A69A' }} />
                    <span className="text-sm font-semibold" style={{ color: '#1A3A34' }}>
                      {t('mind_games.help.purpose_label', 'What is it for?')}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed pl-6" style={{ color: '#3A6A5E' }}>
                    {purpose}
                  </p>
                </div>
              )}

              {/* How to play */}
              {howToPlay && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-4 h-4 flex-shrink-0" style={{ color: '#26A69A' }} />
                    <span className="text-sm font-semibold" style={{ color: '#1A3A34' }}>
                      {t('mind_games.help.how_to_play_label', 'How to play')}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed pl-6" style={{ color: '#3A6A5E' }}>
                    {howToPlay}
                  </p>
                </div>
              )}

              {/* Benefits */}
              {benefitsArray.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 flex-shrink-0" style={{ color: '#26A69A' }} />
                    <span className="text-sm font-semibold" style={{ color: '#1A3A34' }}>
                      {t('mind_games.help.benefits_label', 'Benefits')}
                    </span>
                  </div>
                  <ul className="space-y-1.5 pl-6">
                    {benefitsArray.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#26A69A' }} />
                        <span className="text-sm" style={{ color: '#3A6A5E' }}>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Play button */}
            <div className="px-6 pb-6 pt-2">
              <Button
                onClick={onPlay}
                className="w-full h-12 text-base font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #26A69A 0%, #1A8A7E 100%)',
                  color: '#fff',
                  borderRadius: '16px',
                  border: 'none',
                }}
              >
                {t('mind_games.help.play_button', 'Start Game')}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}