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
    moodEntries.forEach((entry) => {
      entry.emotions?.forEach((emotion) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });
    return Object.entries(emotionCounts).
    sort((a, b) => b[1] - a[1]).
    slice(0, 4).
    map(([emotion]) => emotion);
  };

  const getTopDistortions = () => {
    const distortionCounts = {};
    journalEntries.forEach((entry) => {
      entry.cognitive_distortions?.forEach((distortion) => {
        distortionCounts[distortion] = (distortionCounts[distortion] || 0) + 1;
      });
    });
    return Object.entries(distortionCounts).
    sort((a, b) => b[1] - a[1]).
    slice(0, 3).
    map(([distortion, count]) => ({ distortion, count }));
  };

  const avgMood = getAverageMood();
  const commonEmotions = getMostCommonEmotions();
  const topDistortions = getTopDistortions();

  return (
    <Card className="bg-card text-card-foreground rounded-2xl backdrop-blur-[10px] border border-border/80 shadow-[var(--shadow-md)]">
      <CardHeader className="bg-teal-50 p-6 flex flex-col space-y-1.5">
        <CardTitle className="text-teal-600 font-semibold tracking-[-0.012em] leading-[1.3] flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-teal-50 pt-0 p-6 space-y-6">
        {/* Average Mood */}
        {avgMood &&
        <div>
            <p className="text-teal-600 mb-2 text-sm font-medium">Average Mood</p>
            <div className="flex items-center gap-2">
              <div className="text-teal-600 text-3xl font-bold">{avgMood}</div>
              <div className="text-teal-600 text-sm">/ 5.0</div>
            </div>
          </div>
        }

        {/* Mood Streak */}
        <div>
          <p className="text-teal-600 mb-2 text-sm font-medium">Check-in Streak</p>
          <div className="flex items-center gap-2">
            <div className="text-teal-600 text-3xl font-bold">{moodEntries.length}</div>
            <div className="text-teal-600 text-sm">days</div>
          </div>
        </div>

        {/* Common Emotions */}
        {commonEmotions.length > 0 &&
        <div>
            <p className="text-teal-600 mb-2 text-sm font-medium">Common Emotions</p>
            <div className="flex flex-wrap gap-2">
              {commonEmotions.map((emotion) =>
            <Badge key={emotion} variant="secondary" className="bg-secondary/86 text-teal-600 px-2.5 py-1 font-medium tracking-[0.01em] leading-4 rounded-[20px] inline-flex items-center border transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 border-border/60">
                  {emotion}
                </Badge>
            )}
            </div>
          </div>
        }

        {/* Top Thinking Patterns */}
        {topDistortions.length > 0 &&
        <div>
            <p className="text-sm text-muted-foreground mb-3">Thinking Patterns to Watch</p>
            <div className="space-y-2">
              {topDistortions.map(({ distortion, count }) =>
            <div key={distortion} className="p-2 rounded-[var(--radius-nested)] bg-secondary/45 border border-border/60">
                  <p className="text-xs font-medium text-foreground">{distortion}</p>
                  <p className="text-xs text-primary mt-0.5">Identified {count} times</p>
                </div>
            )}
            </div>
          </div>
        }

        {/* Encouragement */}
        <div className="p-4 rounded-[var(--radius-control)] bg-secondary/45 border border-border/60">
          <p className="text-sm font-medium text-foreground mb-1">Keep Going! 🌟</p>
          <p className="text-muted-foreground text-sm font-medium">
            {journalEntries.length > 5 ?
            "You're building great self-awareness through consistent practice." :
            "Every entry brings you closer to understanding your patterns."}
          </p>
        </div>
      </CardContent>
    </Card>);

}