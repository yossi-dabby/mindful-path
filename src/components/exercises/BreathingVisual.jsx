import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, X, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BreathingVisual({ exercise, duration, onClose, onComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState('inhale');
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [cycleProgress, setCycleProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const pattern = exercise.breathing_pattern || { inhale: 4, hold1: 0, exhale: 4, hold2: 0 };
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
          if (newProgress >= totalCycleTime) return 0;
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
    if (phase === 'inhale') return 2;
    if (phase === 'exhale') return 0.6;
    return phase === 'hold1' ? 2 : 0.6;
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

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
            x: [0, -80, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.15, 0.2, 0.15],
            x: [0, 60, 0],
            y: [0, -80, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 right-1/3 w-80 h-80 bg-pink-400 rounded-full blur-3xl"
        />
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          animate={{
            y: [Math.random() * window.innerHeight, -100],
            x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}

      {/* Background Audio */}
      <audio ref={audioRef} loop>
        <source src="https://assets.mixkit.co/music/preview/mixkit-meditation-time-3984.mp3" type="audio/mpeg" />
      </audio>

      {/* Controls - Top Bar */}
      <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-8 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-xl"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-xl"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-white px-4">
        {/* Breathing Circle */}
        <div className="relative mb-16">
          {/* Outer Ripple Effects */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 2.5],
                opacity: [0.4, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-full border-4 border-white/30"
            />
          ))}

          {/* Main Breathing Circle */}
          <motion.div
            animate={{ scale: getCircleScale() }}
            transition={{
              duration: phase === 'inhale' ? pattern.inhale : phase === 'exhale' ? pattern.exhale : 0.5,
              ease: "easeInOut"
            }}
            className="relative w-72 h-72 md:w-80 md:h-80 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 80px rgba(139, 92, 246, 0.5), inset 0 0 80px rgba(236, 72, 153, 0.3)'
            }}
          >
            <div className="text-center">
              <motion.p
                key={phase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-light mb-4 tracking-wide"
              >
                {getPhaseText()}
              </motion.p>
              <motion.p
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl md:text-8xl font-bold tracking-wider"
              >
                {formatTime(timeRemaining)}
              </motion.p>
            </div>
          </motion.div>

          {/* Glow Effect */}
          <motion.div
            animate={{
              scale: getCircleScale() * 1.15,
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: totalCycleTime,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.4))'
            }}
          />
        </div>

        {/* Exercise Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-light mb-12 text-white/90 tracking-wide"
        >
          {exercise.title}
        </motion.h2>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4"
        >
          <Button
            onClick={handlePlayPause}
            size="lg"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-xl border-2 border-white/40 text-white px-10 py-7 rounded-2xl text-lg font-medium shadow-2xl"
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6 mr-3" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-6 h-6 mr-3" />
                Start
              </>
            )}
          </Button>
          <Button
            onClick={handleReset}
            size="lg"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border-2 border-white/30 text-white px-10 py-7 rounded-2xl text-lg font-medium shadow-2xl"
          >
            <RotateCcw className="w-6 h-6 mr-3" />
            Reset
          </Button>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 w-full max-w-md"
        >
          <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-xl border border-white/30">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #8b5cf6, #ec4899)'
              }}
              animate={{ width: `${((duration * 60 - timeRemaining) / (duration * 60)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-white/60">
            <span>{formatTime((duration * 60) - timeRemaining)} elapsed</span>
            <span>{formatTime(timeRemaining)} remaining</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}