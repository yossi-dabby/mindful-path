import React, { useState } from 'react';
import { Dialog, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { gamesCatalog } from '../components/experiential_games/mindGamesContent';
import GameCard from '../components/experiential_games/GameCard';
import MindGamesModalShell, { mindGamesModalStyle } from '../components/experiential_games/MindGamesModalShell';
import ThoughtQuiz from '../components/experiential_games/ThoughtQuiz';
import ReframePick from '../components/experiential_games/ReframePick';
import ValueCompass from '../components/experiential_games/ValueCompass';
import TinyExperiment from '../components/experiential_games/TinyExperiment';
import QuickWin from '../components/experiential_games/QuickWin';
import CalmBingo from '../components/experiential_games/CalmBingo';

const gameComponents = {
  ThoughtQuiz,
  ReframePick,
  ValueCompass,
  TinyExperiment,
  QuickWin,
  CalmBingo,
};

export default function ExperientialGames() {
  const [activeGame, setActiveGame] = useState(null);

  const handleGameClick = (game) => {
    setActiveGame(game);
  };

  const handleClose = () => {
    setActiveGame(null);
  };

  const ActiveGameComponent = activeGame ? gameComponents[activeGame.componentKey] : null;

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(165deg, #D4EDE8 0%, #BDE0D9 30%, #A8D4CB 60%, #9ECCC2 100%)'
      }}
      data-testid="mindgames-hub"
    >
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.href = '/'}
            className="mb-4"
            aria-label="Go back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-semibold mb-2" style={{ color: '#1A3A34' }}>
            Mind Games
          </h1>
          <p className="text-sm md:text-base" style={{ color: '#5A7A72' }}>
            Quick, playful CBT/ACT/DBT micro-activities (30–120 seconds)
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gamesCatalog.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => handleGameClick(game)}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Game Modal */}
      <Dialog open={!!activeGame} onOpenChange={handleClose}>
        <DialogPortal>
          <DialogOverlay 
            className="!bg-emerald-50/70 backdrop-blur-sm"
          />
          <DialogContent
            className="w-[92vw] max-w-md sm:max-w-2xl max-h-[85vh] overflow-hidden p-0"
            style={{
              borderRadius: '24px',
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.98), rgba(232, 246, 243, 0.95))',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 16px 48px rgba(38, 166, 154, 0.15), 0 6px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(38, 166, 154, 0.2)'
            }}
            data-testid={activeGame ? `mindgame-modal-${activeGame.slug}` : undefined}
          >
            <div className="flex flex-col max-h-[85vh] overflow-hidden">
              <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
                <DialogTitle style={{ color: '#1A3A34' }}>
                  {activeGame?.title}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                <MindGamesModalShell>
                  {ActiveGameComponent && <ActiveGameComponent onClose={handleClose} />}
                </MindGamesModalShell>
              </div>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}