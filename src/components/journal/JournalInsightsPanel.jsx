import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, TrendingUp, Loader2 } from 'lucide-react';
import AiTrendsSummary from './AiTrendsSummary';

export default function JournalInsightsPanel({ entriesCount }) {
  const [showInsights, setShowInsights] = useState(false);

  if (entriesCount < 3) {
    return (
      <Card className="border-0 mb-4 sm:mb-6" style={{
        borderRadius: '20px',
        background: 'linear-gradient(145deg, rgba(159, 122, 234, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
        boxShadow: '0 4px 12px rgba(159, 122, 234, 0.1)'
      }}>
        <CardContent className="p-4 sm:p-6 text-center">
          <Brain className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3" style={{ color: '#9F7AEA', opacity: 0.6 }} />
          <h3 className="font-semibold mb-2 text-sm sm:text-base" style={{ color: '#3D5A52' }}>
            AI Insights Coming Soon
          </h3>
          <p className="text-xs sm:text-sm" style={{ color: '#5A7A72' }}>
            Keep journaling! AI insights will be available after {3 - entriesCount} more {3 - entriesCount === 1 ? 'entry' : 'entries'}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 mb-4 sm:mb-6 cursor-pointer hover:shadow-xl transition-all" style={{
        borderRadius: '20px',
        background: 'linear-gradient(145deg, rgba(159, 122, 234, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
        boxShadow: '0 6px 20px rgba(159, 122, 234, 0.15)'
      }} onClick={() => setShowInsights(true)}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0" style={{
                borderRadius: '16px',
                background: 'linear-gradient(145deg, rgba(159, 122, 234, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)',
                boxShadow: '0 4px 12px rgba(159, 122, 234, 0.2)'
              }}>
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#9F7AEA' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-sm sm:text-base" style={{ color: '#1A3A34' }}>
                  AI-Powered Insights
                </h3>
                <p className="text-xs sm:text-sm mb-2" style={{ color: '#5A7A72' }}>
                  Discover patterns, themes, and personalized recommendations
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full" style={{
                    background: 'rgba(159, 122, 234, 0.15)',
                    color: '#7C3AED'
                  }}>
                    📊 Emotional Trends
                  </span>
                  <span className="px-2 py-1 rounded-full" style={{
                    background: 'rgba(159, 122, 234, 0.15)',
                    color: '#7C3AED'
                  }}>
                    🧠 Cognitive Patterns
                  </span>
                  <span className="px-2 py-1 rounded-full" style={{
                    background: 'rgba(159, 122, 234, 0.15)',
                    color: '#7C3AED'
                  }}>
                    💡 Key Themes
                  </span>
                </div>
              </div>
            </div>
            <Button className="text-white w-full sm:w-auto" style={{
              borderRadius: '16px',
              backgroundColor: '#9F7AEA',
              boxShadow: '0 4px 12px rgba(159, 122, 234, 0.3)'
            }}>
              <TrendingUp className="w-4 h-4 mr-2" />
              View Insights
            </Button>
          </div>
        </CardContent>
      </Card>

      {showInsights && <AiTrendsSummary onClose={() => setShowInsights(false)} />}
    </>
  );
}