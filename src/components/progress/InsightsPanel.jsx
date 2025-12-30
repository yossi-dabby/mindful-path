import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';

export default function InsightsPanel({ moodEntries, journalEntries }) {
  const getAverageMood = () => {
    if (moodEntries.length === 0) return null;
    const moodValues = { very_low: 1, low: 2, okay: 3, good: 4, excellent: 5 };
    const sum = moodEntries.reduce((acc, entry) => acc + moodValues[entry.mood], 0);
    return (sum / moodEntries.length).toFixed(1);
  };

  const getMostCommonEmotions = () => {
    const emotionCounts = {};
    for (const entry of moodEntries) {
      if (entry.emotions) {
        for (const emotion of entry.emotions) {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        }
      }
    }
    return Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([emotion]) => emotion);
  };

  const getTopDistortions = () => {
    const distortionCounts = {};
    for (const entry of journalEntries) {
      if (entry.cognitive_distortions) {
        for (const distortion of entry.cognitive_distortions) {
          distortionCounts[distortion] = (distortionCounts[distortion] || 0) + 1;
        }
      }
    }
    return Object.entries(distortionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([distortion, count]) => ({ distortion, count }));
  };

  const avgMood = getAverageMood();
  const commonEmotions = getMostCommonEmotions();
  const topDistortions = getTopDistortions();

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Mood */}
        {avgMood && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Average Mood</p>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-green-600">{avgMood}</div>
              <div className="text-sm text-gray-600">/ 5.0</div>
            </div>
          </div>
        )}

        {/* Mood Streak */}
        <div>
          <p className="text-sm text-gray-500 mb-2">Check-in Streak</p>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold text-purple-600">{moodEntries.length}</div>
            <div className="text-sm text-gray-600">days</div>
          </div>
        </div>

        {/* Common Emotions */}
        {commonEmotions.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Common Emotions</p>
            <div className="flex flex-wrap gap-2">
              {commonEmotions.map((emotion) => (
                <Badge key={emotion} variant="secondary" className="bg-blue-100 text-blue-700">
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
                <div key={distortion} className="p-2 rounded-lg bg-orange-50 border border-orange-200">
                  <p className="text-xs font-medium text-orange-900">{distortion}</p>
                  <p className="text-xs text-orange-600 mt-0.5">Identified {count} times</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Encouragement */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-purple-50 border border-green-200">
          <p className="text-sm font-medium text-gray-800 mb-1">Keep Going! 🌟</p>
          <p className="text-xs text-gray-600">
            {journalEntries.length > 5 
              ? "You're building great self-awareness through consistent practice."
              : "Every entry brings you closer to understanding your patterns."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}