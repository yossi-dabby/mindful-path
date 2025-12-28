import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';

export default function AudioPlayer({ audioContent, onComplete, compact = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const audioRef = useRef(null);

  const updatePlayCountMutation = useMutation({
    mutationFn: () => base44.entities.AudioContent.update(audioContent.id, {
      play_count: (audioContent.play_count || 0) + 1
    })
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onComplete) onComplete();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onComplete]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
      if (currentTime === 0) {
        updatePlayCountMutation.mutate();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value) => {
    const audio = audioRef.current;
    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds) => {
    const audio = audioRef.current;
    audio.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadAudio = async () => {
    try {
      const response = await fetch(audioContent.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${audioContent.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
        <audio ref={audioRef} src={audioContent.audio_url} preload="metadata" />
        <Button
          onClick={togglePlay}
          size="icon"
          className="rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </Button>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{audioContent.title}</p>
          <p className="text-xs text-gray-500">{audioContent.duration_minutes} min</p>
        </div>
        <div className="text-xs text-gray-600">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden">
      <CardContent className="p-6">
        <audio ref={audioRef} src={audioContent.audio_url} preload="metadata" />
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{audioContent.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{audioContent.description}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {audioContent.duration_minutes} min
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
                {audioContent.type.replace('_', ' ')}
              </span>
              {audioContent.narrator && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  {audioContent.narrator}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className={cn(isFavorite && "text-red-500")}
            >
              <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
            </Button>
            {audioContent.download_enabled && (
              <Button variant="ghost" size="icon" onClick={downloadAudio}>
                <Download className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-gray-600"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => skip(-10)}
              className="rounded-full"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              onClick={togglePlay}
              size="lg"
              className="rounded-full w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => skip(10)}
              className="rounded-full"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-32" /> {/* Spacer for alignment */}
        </div>

        {/* Background Music Indicator */}
        {audioContent.background_music && (
          <p className="text-xs text-gray-500 text-center mt-3">
            🎵 Includes calming background music
          </p>
        )}
      </CardContent>
    </Card>
  );
}