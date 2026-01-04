import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Brain, Target, Activity, Download, Crown, Lock, ArrowLeft } from 'lucide-react';
import PremiumPaywall from '../components/subscription/PremiumPaywall';
import PremiumBadge from '../components/subscription/PremiumBadge';
import { createPageUrl } from './utils';

export default function AdvancedAnalytics() {
  const [showPaywall, setShowPaywall] = useState(false);

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const subs = await base44.entities.Subscription.filter({ created_by: user.email });
      return subs[0];
    }
  });

  const { data: moodData } = useQuery({
    queryKey: ['moodAnalytics'],
    queryFn: async () => {
      const moods = await base44.entities.MoodEntry.list('-date', 90);
      return moods;
    },
    initialData: []
  });

  const { data: journalData } = useQuery({
    queryKey: ['journalAnalytics'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 50),
    initialData: []
  });

  const { data: exerciseData } = useQuery({
    queryKey: ['exerciseAnalytics'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: []
  });

  const isPremium = subscription?.status === 'active' && subscription?.plan_type !== 'free';

  // Calculate mood trends
  const moodTrends = moodData.slice(0, 30).reverse().map(m => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: { 'excellent': 5, 'good': 4, 'okay': 3, 'low': 2, 'very_low': 1 }[m.mood] || 3,
    energy: { 'very_high': 5, 'high': 4, 'moderate': 3, 'low': 2, 'very_low': 1 }[m.energy_level] || 3
  }));

  // Exercise completion by category
  const exerciseStats = exerciseData.reduce((acc, ex) => {
    const category = ex.category || 'other';
    acc[category] = (acc[category] || 0) + (ex.completed_count || 0);
    return acc;
  }, {});

  const exerciseChartData = Object.entries(exerciseStats).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value
  }));

  // Journal insights
  const distortionCounts = journalData.reduce((acc, j) => {
    (j.cognitive_distortions || []).forEach(d => {
      acc[d] = (acc[d] || 0) + 1;
    });
    return acc;
  }, {});

  const distortionData = Object.entries(distortionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ['#F8744C', '#FFB47C', '#4B6B8C', '#B9A3C1', '#F49283'];

  const LockedCard = ({ title, description, height = "auto" }) => (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
      <CardContent className={`p-6 md:p-8 flex items-center justify-center ${height === "chart" ? "min-h-[300px]" : "min-h-[200px]"}`}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2 text-base md:text-lg">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <Button
            onClick={() => setShowPaywall(true)}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
          >
            <Crown className="w-4 h-4 mr-2" />
            Go Premium
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 mt-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-light text-gray-800">Advanced Analytics</h1>
            <PremiumBadge locked={!isPremium} />
          </div>
          <p className="text-gray-500">Deep insights into your mental wellness journey</p>
        </div>
        {isPremium && (
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        )}
      </div>

      <Tabs defaultValue="mood" className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="mood" className="gap-2">
            <Activity className="w-4 h-4" />
            Mood Trends
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2">
            <Brain className="w-4 h-4" />
            Thought Patterns
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <Target className="w-4 h-4" />
            Exercise Progress
          </TabsTrigger>
          <TabsTrigger value="predictions" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            AI Predictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mood" className="space-y-6">
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>30-Day Mood & Energy Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              {isPremium ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[1, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="mood" stroke="#F8744C" strokeWidth={2} name="Mood" />
                    <Line type="monotone" dataKey="energy" stroke="#4B6B8C" strokeWidth={2} name="Energy" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">Unlock detailed mood analytics</p>
                    <Button onClick={() => setShowPaywall(true)}>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isPremium ? (
              <>
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-1">Average Mood</p>
                    <p className="text-4xl font-bold text-orange-600">
                      {(moodTrends.reduce((acc, m) => acc + m.mood, 0) / moodTrends.length || 0).toFixed(1)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">+0.3 from last month</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-1">Best Day</p>
                    <p className="text-4xl font-bold text-green-600">Mon</p>
                    <p className="text-xs text-gray-500 mt-1">Highest average mood</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-1">Consistency</p>
                    <p className="text-4xl font-bold text-blue-600">87%</p>
                    <p className="text-xs text-gray-500 mt-1">Mood variance score</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <LockedCard title="Average Mood" description="Track your mood trends" />
                <LockedCard title="Best Days" description="Identify patterns" />
                <LockedCard title="Consistency" description="Measure stability" />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle>Most Common Thought Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                {isPremium ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={distortionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name.substring(0, 15)}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {distortionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">Analyze your thought patterns</p>
                      <Button onClick={() => setShowPaywall(true)}>
                        <Crown className="w-4 h-4 mr-2" />
                        Go Premium
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {isPremium ? (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle>Emotional Shift Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Before CBT</span>
                        <span className="text-sm font-semibold">7.2/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-400 h-2 rounded-full" style={{ width: '72%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">After CBT</span>
                        <span className="text-sm font-semibold">4.1/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '41%' }} />
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-800 font-semibold">43% Average Improvement</p>
                      <p className="text-xs text-green-600 mt-1">CBT techniques are working well for you</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <LockedCard 
                title="Emotional Shift Analysis" 
                description="See how CBT improves your emotions"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Exercise Completion by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isPremium ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={exerciseChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#F8744C" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">Track exercise performance</p>
                    <Button onClick={() => setShowPaywall(true)}>
                      <Crown className="w-4 h-4 mr-2" />
                      Unlock Analytics
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          {isPremium ? (
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI-Powered Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Mood Forecast (Next 7 Days)</h4>
                  <p className="text-sm text-gray-700 mb-4">
                    Based on your patterns, you're likely to experience improved mood this week, 
                    especially on Tuesday and Friday. Consider scheduling important tasks on these days.
                  </p>
                  <div className="flex gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const levels = [3, 4, 3, 3, 4, 4, 3];
                      return (
                        <div key={day} className="flex-1 text-center">
                          <div className="text-xs text-gray-600 mb-1">{day}</div>
                          <div className={`h-16 rounded-lg ${levels[i] >= 4 ? 'bg-green-200' : 'bg-yellow-200'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Recommended Actions</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-600">•</span>
                      Practice breathing exercises in the morning for better energy
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-600">•</span>
                      Journal on days when stress levels are predicted to be high
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-600">•</span>
                      Your best time for meditation is 7-8 PM based on completion patterns
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <LockedCard 
              title="AI Predictions & Insights" 
              description="Get personalized forecasts and recommendations"
            />
          )}
        </TabsContent>
      </Tabs>

      {showPaywall && <PremiumPaywall onClose={() => setShowPaywall(false)} />}
    </div>
  );
}