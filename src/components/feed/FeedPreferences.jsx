import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INTEREST_AREAS = [
  { id: 'stress_management', label: 'Stress Management', color: 'bg-blue-100 text-blue-700' },
  { id: 'anxiety_relief', label: 'Anxiety Relief', color: 'bg-purple-100 text-purple-700' },
  { id: 'productivity', label: 'Productivity', color: 'bg-orange-100 text-orange-700' },
  { id: 'emotional_intelligence', label: 'Emotional Intelligence', color: 'bg-pink-100 text-pink-700' },
  { id: 'mindfulness', label: 'Mindfulness', color: 'bg-green-100 text-green-700' },
  { id: 'sleep_improvement', label: 'Sleep Improvement', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'relationship_building', label: 'Relationship Building', color: 'bg-rose-100 text-rose-700' },
  { id: 'self_esteem', label: 'Self-Esteem', color: 'bg-amber-100 text-amber-700' },
  { id: 'habit_formation', label: 'Habit Formation', color: 'bg-teal-100 text-teal-700' },
  { id: 'cognitive_restructuring', label: 'Cognitive Restructuring', color: 'bg-cyan-100 text-cyan-700' }
];

export default function FeedPreferences({ onPreferencesChange }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const user = await base44.auth.me();
      const interests = user?.feed_preferences?.interests || [];
      setSelectedInterests(interests);
      onPreferencesChange?.(interests);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const toggleInterest = (interestId) => {
    setSelectedInterests(prev => {
      const newInterests = prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId];
      return newInterests;
    });
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        feed_preferences: { interests: selectedInterests }
      });
      onPreferencesChange?.(selectedInterests);
      setExpanded(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-0 shadow-md mb-4">
      <CardContent className="p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Content Preferences</h3>
            <Badge variant="secondary" className="text-xs">
              {selectedInterests.length} selected
            </Badge>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </motion.div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  Select areas of interest to personalize your feed content:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {INTEREST_AREAS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-all
                          ${isSelected 
                            ? interest.color + ' ring-2 ring-offset-1 ring-current' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                        {interest.label}
                      </button>
                    );
                  })}
                </div>
                <Button
                  onClick={savePreferences}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}