import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Activity, Moon, Heart, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import HealthDataForm from './HealthDataForm';

export default function HealthDashboard() {
  const [showForm, setShowForm] = useState(false);

  const { data: healthMetrics } = useQuery({
    queryKey: ['healthMetrics'],
    queryFn: () => base44.entities.HealthMetric.list('-date', 30),
    initialData: []
  });

  // Calculate averages - single pass through the data
  const recentMetrics = healthMetrics.slice(0, 7);
  const { avgSleep, avgSteps, avgHeartRate } = (() => {
    const acc = recentMetrics.reduce((acc, m) => {
      if (m.sleep_hours) {
        acc.sleepSum += m.sleep_hours;
        acc.sleepCount++;
      }
      if (m.steps) {
        acc.stepsSum += m.steps;
        acc.stepsCount++;
      }
      if (m.heart_rate_avg) {
        acc.heartRateSum += m.heart_rate_avg;
        acc.heartRateCount++;
      }
      return acc;
    }, { sleepSum: 0, sleepCount: 0, stepsSum: 0, stepsCount: 0, heartRateSum: 0, heartRateCount: 0 });
    
    return {
      avgSleep: acc.sleepCount > 0 ? acc.sleepSum / acc.sleepCount : 0,
      avgSteps: acc.stepsCount > 0 ? acc.stepsSum / acc.stepsCount : 0,
      avgHeartRate: acc.heartRateCount > 0 ? acc.heartRateSum / acc.heartRateCount : 0
    };
  })();

  // Prepare chart data
  const chartData = healthMetrics.slice(0, 14).reverse().map(m => ({
    date: m.date.split('-').slice(1).join('/'),
    sleep: m.sleep_hours || null,
    steps: m.steps ? m.steps / 1000 : null,
    heartRate: m.heart_rate_avg || null
  }));

  if (healthMetrics.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center mx-auto mb-4">
              <Activity className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Track Your Health</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start logging your sleep, activity, and vital signs to unlock holistic insights about your well-being.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8 py-6 text-lg rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Log Health Data
            </Button>
          </CardContent>
        </Card>

        {showForm && <HealthDataForm onClose={() => setShowForm(false)} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Sleep (7 days)</p>
                <p className="text-2xl font-bold text-purple-600">
                  {avgSleep.toFixed(1)}h
                </p>
              </div>
              <Moon className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Steps (7 days)</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(avgSteps).toLocaleString()}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Heart Rate</p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.round(avgHeartRate)} bpm
                </p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Health Trends (14 days)
            </h3>
            <Button onClick={() => setShowForm(true)} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Log Data
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="sleep" stroke="#9333ea" name="Sleep (hrs)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="steps" stroke="#22c55e" name="Steps (k)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name="Heart Rate" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {showForm && <HealthDataForm onClose={() => setShowForm(false)} />}
    </div>
  );
}