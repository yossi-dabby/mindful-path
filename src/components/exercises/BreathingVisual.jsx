import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BreathingVisual({ exercise, duration, onClose, onComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState('inhale'); // inhale, hold1, exhale, hold2
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [cycleProgress, setCycleProgress] = useState(0);
  const audioRef = useRef(null);

  const pattern = exercise.breathing_pattern || { inhale: 4, hold1: 4, exhale: 4, hold2: 4 };
  const totalCycleTime = pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2;

  useEffect(() => {
    let interval;
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            onComplete();
            return 0;
          }
          return prev - 1;
        });

        setCycleProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= totalCycleTime) {
            return 0;
          }
          return newProgress;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining, totalCycleTime, onComplete]);

  useEffect(() => {
    if (cycleProgress < pattern.inhale) {
      setPhase('inhale');
    } else if (cycleProgress < pattern.inhale + pattern.hold1) {
      setPhase('hold1');
    } else if (cycleProgress < pattern.inhale + pattern.hold1 + pattern.exhale) {
      setPhase('exhale');
    } else {
      setPhase('hold2');
    }
  }, [cycleProgress, pattern]);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold2': return 'Hold';
      default: return '';
    }
  };

  const getCircleScale = () => {
    if (phase === 'inhale') return 1.8;
    if (phase === 'exhale') return 0.8;
    return phase === 'hold1' ? 1.8 : 0.8;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (audioRef.current) {
      if (!isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTimeRemaining(duration * 60);
    setCycleProgress(0);
    setPhase('inhale');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 z-50 flex items-center justify-center">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Background Audio */}
      <audio ref={audioRef} loop>
        <source src="https://assets.mixkit.co/music/preview/mixkit-meditation-time-3984.mp3" type="audio/mpeg" />
      </audio>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 z-10"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-white">
        {/* Breathing Circle */}
        <div className="relative mb-12">
          <motion.div
            animate={{ scale: getCircleScale() }}
            transition={{
              duration: phase === 'inhale' ? pattern.inhale : phase === 'exhale' ? pattern.exhale : 0.5,
              ease: "easeInOut"
            }}
            className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 backdrop-blur-xl border-4 border-white/30 flex items-center justify-center shadow-2xl"
          >
            <div className="text-center">
              <motion.p
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-light mb-2"
              >
                {getPhaseText()}
              </motion.p>
              <p className="text-6xl font-bold">{formatTime(timeRemaining)}</p>
            </div>
          </motion.div>

          {/* Outer Glow Ring */}
          <motion.div
            animate={{ scale: getCircleScale() * 1.1, opacity: [0.3, 0.6, 0.3] }}
            transition={{
              duration: totalCycleTime,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-xl"
          />
        </div>

        {/* Exercise Title */}
        <h2 className="text-2xl font-light mb-8 text-white/90">{exercise.title}</h2>

        {/* Controls */}
        <div className="flex gap-4">
          <Button
            onClick={handlePlayPause}
            size="lg"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 text-white px-8 py-6 rounded-2xl"
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button
            onClick={handleReset}
            size="lg"
            variant="outline"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/30 text-white px-8 py-6 rounded-2xl"
          >
            <RotateCcw className="w-6 h-6 mr-2" />
            Reset
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 w-full max-w-md">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-xl">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
              initial={{ width: '0%' }}
              animate={{ width: `${((duration * 60 - timeRemaining) / (duration * 60)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}