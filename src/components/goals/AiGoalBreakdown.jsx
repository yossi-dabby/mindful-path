import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Target, CheckCircle, Plus } from 'lucide-react';
import { safeArray, safeText } from '@/components/utils/aiDataNormalizer';

export default function AiGoalBreakdown({ goal, onApplySteps, onClose }) {
  const [breakdown, setBreakdown] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateBreakdown = async () => {
    setIsLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Break down this goal into actionable steps and milestones:

**Goal:** ${goal.title}
**Category:** ${goal.category}
**Description:** ${goal.description}
${goal.target_date ? `**Target Date:** ${goal.target_date}` : ''}

Provide:
1. **Action Plan**: 5-8 specific, actionable steps to achieve this goal
2. **Milestones**: 3-5 key milestones that indicate progress
3. **Quick Wins**: 2-3 small, immediate actions to build momentum
4. **Potential Obstacles**: 2-3 challenges and how to overcome them
5. **Success Metrics**: How to measure if the goal is being achieved

Make each step concrete and actionable, not vague.`,
        response_json_schema: {
          type: "object",
          properties: {
            action_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: { type: "string" },
                  description: { type: "string" },
                  estimated_time: { type: "string" }
                }
              }
            },
            milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            quick_wins: {
              type: "array",
              items: { type: "string" }
            },
            potential_obstacles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  obstacle: { type: "string" },
                  solution: { type: "string" }
                }
              }
            },
            success_metrics: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setBreakdown(response);
    } catch (error) {
      console.error('Failed to generate breakdown:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    generateBreakdown();
  }, []);

  if (isLoading) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)'
        }}
      >
        <Card className="w-full max-w-2xl border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Breaking down your goal into actionable steps...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!breakdown) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-24 overflow-y-auto"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)'
      }}
    >
      <Card className="w-full max-w-3xl border-0 shadow-2xl my-8" style={{ maxHeight: 'calc(100vh - 160px)' }}>
        <CardContent className="p-4 md:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{goal.title}</h2>
              <p className="text-sm text-gray-600">AI-Generated Action Plan</p>
            </div>
            <Button onClick={onClose} variant="ghost">
              Close
            </Button>
          </div>

          <div className="space-y-6">
            {/* Quick Wins */}
            <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border-2 border-green-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Quick Wins (Start Here!)
              </h3>
              <ul className="space-y-2">
                {safeArray(breakdown.quick_wins).map((win, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Plan */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Detailed Action Plan
              </h3>
              <div className="space-y-3">
                {safeArray(breakdown.action_plan).map((action, i) => {
                  const act = typeof action === 'object' ? action : { step: safeText(action), description: '', estimated_time: '' };
                  return (
                  <div key={i} className="bg-white p-4 rounded-lg border-2 border-blue-100">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-800 flex items-center gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                          {i + 1}
                        </span>
                        {safeText(act.step, `Step ${i + 1}`)}
                      </h4>
                      {act.estimated_time && (
                        <span className="text-xs text-gray-500">{safeText(act.estimated_time)}</span>
                      )}
                    </div>
                    {act.description && <p className="text-sm text-gray-600 ml-8">{safeText(act.description)}</p>}
                  </div>
                );
                })}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Key Milestones</h3>
              <div className="space-y-2">
                {safeArray(breakdown.milestones).map((milestone, i) => {
                  const m = typeof milestone === 'object' ? milestone : { title: safeText(milestone), description: '' };
                  return (
                  <div key={i} className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <p className="font-medium text-gray-800 text-sm">{safeText(m.title, `Milestone ${i + 1}`)}</p>
                    {m.description && <p className="text-xs text-gray-600 mt-1">{safeText(m.description)}</p>}
                  </div>
                );
                })}
              </div>
            </div>

            {/* Potential Obstacles */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Prepare for Challenges</h3>
              <div className="space-y-2">
                {safeArray(breakdown.potential_obstacles).map((item, i) => {
                  const obs = typeof item === 'object' ? item : { obstacle: safeText(item), solution: '' };
                  return (
                  <div key={i} className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <p className="font-medium text-gray-800 text-sm">⚠️ {safeText(obs.obstacle, `Obstacle ${i + 1}`)}</p>
                    {obs.solution && (
                      <p className="text-xs text-gray-600 mt-1">
                        <span className="font-semibold">Solution:</span> {safeText(obs.solution)}
                      </p>
                    )}
                  </div>
                );
                })}
              </div>
            </div>

            {/* Success Metrics */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border-2 border-indigo-200">
              <h3 className="font-semibold text-gray-800 mb-3">Measuring Success</h3>
              <ul className="space-y-1">
                {safeArray(breakdown.success_metrics).map((metric, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-indigo-600 mt-0.5">📊</span>
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => onApplySteps(breakdown)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Apply These Steps to Goal
              </Button>
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}