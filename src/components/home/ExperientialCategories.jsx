import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MessageCircle, Brain, Leaf, Sparkles, HandMetal, Scale, Users, HeartCrack, Lightbulb, Hand } from 'lucide-react';

const categories = [
  { name: 'Cognitive Restructuring', icon: Brain, description: 'Challenge unhelpful thoughts (CBT)', intent: 'cognitive_restructuring' },
  { name: 'Behavioral Activation', icon: Sparkles, description: 'Increase positive activities (CBT)', intent: 'behavioral_activation' },
  { name: 'Mindfulness Skills', icon: Leaf, description: 'Stay present and aware (DBT)', intent: 'mindfulness_skills' },
  { name: 'Distress Tolerance', icon: HandMetal, description: 'Cope with difficult emotions (DBT)', intent: 'distress_tolerance' },
  { name: 'Emotion Regulation', icon: Scale, description: 'Manage emotional responses (DBT)', intent: 'emotion_regulation' },
  { name: 'Interpersonal Effectiveness', icon: Users, description: 'Improve relationships (DBT)', intent: 'interpersonal_effectiveness' },
  { name: 'Acceptance & Commitment', icon: Hand, description: 'Embrace thoughts, take action (ACT)', intent: 'acceptance_commitment' },
  { name: 'Exposure Therapy', icon: HeartCrack, description: 'Face fears gradually (CBT)', intent: 'exposure_therapy' },
  { name: 'Thought Stopping', icon: Lightbulb, description: 'Break negative thought cycles (CBT)', intent: 'thought_stopping' },
  { name: 'Problem Solving', icon: MessageCircle, description: 'Systematically address issues (CBT)', intent: 'problem_solving' },
];

export default function ExperientialCategories() {
  return (
    <Card className="border-0" style={{
      borderRadius: '32px',
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
      boxShadow: '0 12px 40px rgba(38, 166, 154, 0.12), 0 4px 16px rgba(0,0,0,0.04)'
    }}>
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl" style={{ color: '#1A3A34' }}>Explore Guided Practices</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <Link
            key={index}
            to={createPageUrl('Chat', `intent=${category.intent}`)}
            className="flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            style={{
              border: '1px solid rgba(38, 166, 154, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div className="flex-shrink-0 p-2 rounded-lg" style={{ backgroundColor: 'rgba(38, 166, 154, 0.15)', color: '#26A69A' }}>
              <category.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-base" style={{ color: '#1A3A34' }}>{category.name}</p>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}