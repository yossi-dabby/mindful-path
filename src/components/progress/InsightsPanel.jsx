import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

export default function InsightsPanel({ moodEntries, journalEntries }) {
  const getAverageMood = () => {
    if (moodEntries.length === 0) return null;
    const moodValues = { very_low: 1, low: 2, okay: 3, good: 4, excellent: 5 };
    const sum = moodEntries.reduce((acc, entry) => acc + moodValues[entry.mood], 0);
    return (sum / moodEntries.length).toFixed(1);
  };

  const getMostCommonEmotions = () => {
    const emotionCounts = {};
    moodEntries.forEach(entry => {
      entry.emotions?.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });
    return Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([emotion]) => emotion);
  };

  const getTopDistortions = () => {
    const distortionCounts = {};
    journalEntries.forEach(entry => {
      entry.cognitive_distortions?.forEach(distortion => {
        distortionCounts[distortion] = (distortionCounts[distortion] || 0) + 1;
      });
    });
    return Object.entries(distortionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([distortion, count]) => ({ distortion, count }));
  };

  const avgMood = getAverageMood();
  const commonEmotions = getMostCommonEmotions();
  const topDistortions = getTopDistortions();

  return (
    <Card className="border border-border/80 bg-card shadow-[var(--shadow-md)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Mood */}
        {avgMood && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Average Mood</p>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-foreground">{avgMood}</div>
              <div className="text-sm text-muted-foreground">/ 5.0</div>
            </div>
          </div>
        )}

        {/* Mood Streak */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Check-in Streak</p>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold text-primary">{moodEntries.length}</div>
            <div className="text-sm text-muted-foreground">days</div>
          </div>
        </div>

        {/* Common Emotions */}
        {commonEmotions.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Common Emotions</p>
            <div className="flex flex-wrap gap-2">
              {commonEmotions.map((emotion) => (
                <Badge key={emotion} variant="secondary">
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Top Thinking Patterns */}
        {topDistortions.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-3">Thinking Patterns to Watch</p>
            <div className="space-y-2">
              {topDistortions.map(({ distortion, count }) => (
                <div key={distortion} className="p-2 rounded-[var(--radius-nested)] bg-secondary/45 border border-border/60">
                  <p className="text-xs font-medium text-foreground">{distortion}</p>
                  <p className="text-xs text-primary mt-0.5">Identified {count} times</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Encouragement */}
        <div className="p-4 rounded-[var(--radius-control)] bg-secondary/45 border border-border/60">
          <p className="text-sm font-medium text-foreground mb-1">Keep Going! 🌟</p>
          <p className="text-xs text-muted-foreground">
            {journalEntries.length > 5 
              ? "You're building great self-awareness through consistent practice."
              : "Every entry brings you closer to understanding your patterns."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}