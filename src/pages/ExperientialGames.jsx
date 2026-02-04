import React, { useState, useEffect } from 'react';
import { Dialog, DialogPortal, DialogOverlay, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { gamesCatalog } from '../components/experiential_games/mindGamesContent';
import GameCard from '../components/experiential_games/GameCard';
import MindGamesModalShell from '../components/experiential_games/MindGamesModalShell';
import MindGameRecommendations from '../components/experiential_games/MindGameRecommendations';
import { useMindGameTracking } from '../components/experiential_games/useMindGameTracking';
import ThoughtQuiz from '../components/experiential_games/ThoughtQuiz';
import ReframePick from '../components/experiential_games/ReframePick';
import ValueCompass from '../components/experiential_games/ValueCompass';
import TinyExperiment from '../components/experiential_games/TinyExperiment';
import QuickWin from '../components/experiential_games/QuickWin';
import CalmBingo from '../components/experiential_games/CalmBingo';
import DBTSTOP from '../components/experiential_games/DBTSTOP';
import OppositeAction from '../components/experiential_games/OppositeAction';
import UrgeSurfing from '../components/experiential_games/UrgeSurfing';
import WorryTime from '../components/experiential_games/WorryTime';
import EvidenceBalance from '../components/experiential_games/EvidenceBalance';
import DefusionCards from '../components/experiential_games/DefusionCards';
import TIPPSkills from '../components/experiential_games/TIPPSkills';
import ACCEPTS from '../components/experiential_games/ACCEPTS';
import WillingHands from '../components/experiential_games/WillingHands';
import HalfSmile from '../components/experiential_games/HalfSmile';
import IMPROVE from '../components/experiential_games/IMPROVE';
import LeavesOnStream from '../components/experiential_games/LeavesOnStream';
import Expansion from '../components/experiential_games/Expansion';
import ValuesCheck from '../components/experiential_games/ValuesCheck';
import ProsAndCons from '../components/experiential_games/ProsAndCons';
import CheckTheFacts from '../components/experiential_games/CheckTheFacts';
import SelfSoothe from '../components/experiential_games/SelfSoothe';
import MountainMeditation from '../components/experiential_games/MountainMeditation';

const gameComponents = {
  ThoughtQuiz,
  ReframePick,
  ValueCompass,
  TinyExperiment,
  QuickWin,
  CalmBingo,
  DBTSTOP,
  OppositeAction,
  UrgeSurfing,
  WorryTime,
  EvidenceBalance,
  DefusionCards,
  TIPPSkills,
  ACCEPTS,
  WillingHands,
  HalfSmile,
  IMPROVE,
  LeavesOnStream,
  Expansion,
  ValuesCheck,
  ProsAndCons,
  CheckTheFacts,
  SelfSoothe,
  MountainMeditation,
};

export default function ExperientialGames() {
  const [activeGame, setActiveGame] = useState(null);
  const [gameStartTime, setGameStartTime] = useState(null);
  const { trackGamePlay } = useMindGameTracking();

  React.useEffect(() => {
    const gameSlug = searchParams.get('game');
    if (gameSlug) {
      const game = mindGames.find(g => g.slug === gameSlug);
      if (game) {
        handleGameClick(game);
      }
    }
  }, []);

  const handleGameClick = (game) => {
    setActiveGame(game);
    setGameStartTime(Date.now());
  };

  const handleClose = () => {
    // Track game play when closing
    if (activeGame && gameStartTime) {
      const durationSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
      trackGamePlay({
        game: activeGame,
        completed: durationSeconds >= 30, // Consider completed if played for 30+ seconds
        durationSeconds,
      });
    }
    
    setActiveGame(null);
    setGameStartTime(null);
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

        {/* Recommendations */}
        <MindGameRecommendations onGameSelect={handleGameClick} />

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
            className="bg-emerald-50/70 backdrop-blur-sm"
            style={{
              background: 'rgba(212, 237, 232, 0.75)',
              backdropFilter: 'blur(8px)'
            }}
          />
          <DialogPrimitive.Content
            className="fixed left-[50%] top-[50%] z-50 w-[92vw] max-w-md sm:max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden p-0 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            style={{
              borderRadius: '24px',
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.98), rgba(232, 246, 243, 0.95))',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 16px 48px rgba(38, 166, 154, 0.15), 0 6px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(38, 166, 154, 0.2)',
              maxHeight: '85vh'
            }}
            data-testid={activeGame ? `mindgame-modal-${activeGame.slug}` : undefined}
          >
            <div className="flex flex-col h-full max-h-[85vh] overflow-hidden">
              <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-emerald-100/40">
                <DialogTitle style={{ color: '#1A3A34' }}>
                  {activeGame?.title}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 min-w-0">
                <MindGamesModalShell>
                  {ActiveGameComponent && <ActiveGameComponent onClose={handleClose} />}
                </MindGamesModalShell>
              </div>
            </div>
            <DialogPrimitive.Close
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              style={{ zIndex: 10 }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}