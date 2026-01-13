import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Frown, AlertCircle, Zap, Flame, Users, Target, Cloud, HeartCrack, HelpCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const thoughtTypes = [
  {
    type: 'fear_anxiety',
    label: 'Fear / Anxiety',
    description: 'Worried about the future, feeling nervous or scared',
    icon: Frown,
    color: '#9F7AEA',
    bgColor: 'rgba(159, 122, 234, 0.15)'
  },
  {
    type: 'self_criticism',
    label: 'Self-Criticism / Failure',
    description: 'Harsh self-judgment, feeling like you failed',
    icon: AlertCircle,
    color: '#ED8936',
    bgColor: 'rgba(237, 137, 54, 0.15)'
  },
  {
    type: 'catastrophizing',
    label: 'Catastrophizing',
    description: 'Expecting the worst possible outcome',
    icon: Zap,
    color: '#F56565',
    bgColor: 'rgba(245, 101, 101, 0.15)'
  },
  {
    type: 'guilt_shame',
    label: 'Guilt / Shame',
    description: 'Feeling bad about something you did or who you are',
    icon: HeartCrack,
    color: '#805AD5',
    bgColor: 'rgba(128, 90, 213, 0.15)'
  },
  {
    type: 'anger_resentment',
    label: 'Anger / Resentment',
    description: 'Frustrated, upset, or holding a grudge',
    icon: Flame,
    color: '#E53E3E',
    bgColor: 'rgba(229, 62, 62, 0.15)'
  },
  {
    type: 'social_anxiety',
    label: 'Social Anxiety',
    description: 'Worried about what others think or social situations',
    icon: Users,
    color: '#4299E1',
    bgColor: 'rgba(66, 153, 225, 0.15)'
  },
  {
    type: 'perfectionism',
    label: 'Perfectionism',
    description: 'Setting impossible standards, fear of mistakes',
    icon: Target,
    color: '#38B2AC',
    bgColor: 'rgba(56, 178, 172, 0.15)'
  },
  {
    type: 'overthinking',
    label: 'Overthinking / Uncertainty',
    description: 'Can\'t stop analyzing, stuck in loops, confused',
    icon: Cloud,
    color: '#718096',
    bgColor: 'rgba(113, 128, 150, 0.15)'
  },
  {
    type: 'hopelessness',
    label: 'Hopelessness',
    description: 'Feeling like nothing will get better',
    icon: HeartCrack,
    color: '#2D3748',
    bgColor: 'rgba(45, 55, 72, 0.15)'
  },
  {
    type: 'other',
    label: 'Other / Free Thought',
    description: 'Something else, or just want to journal freely',
    icon: HelpCircle,
    color: '#26A69A',
    bgColor: 'rgba(38, 166, 154, 0.15)'
  }
];

export default function ThoughtCoach() {
  const navigate = useNavigate();

  const handleSelectThoughtType = (thoughtType) => {
    navigate(createPageUrl('Chat', `intent=thought_work&thought_type=${thoughtType}`));
  };

  return (
    <div className="w-full overflow-x-hidden" style={{ minHeight: '100vh', background: 'linear-gradient(165deg, #D4EDE8 0%, #BDE0D9 30%, #A8D4CB 60%, #9ECCC2 100%)' }}>
      {/* Mobile Header */}
      <motion.div 
        className="md:hidden backdrop-blur-xl border-b p-4 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'linear-gradient(to bottom, rgba(212, 237, 232, 0.95) 0%, rgba(200, 230, 225, 0.92) 100%)',
          borderColor: 'rgba(38, 166, 154, 0.25)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              style={{ borderRadius: '50%', width: '36px', height: '36px' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <motion.div 
              className="w-9 h-9 flex items-center justify-center shadow-md"
              style={{
                borderRadius: '18px',
                background: 'linear-gradient(145deg, #9F7AEA, #B794F4)'
              }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Brain className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-sm font-semibold" style={{ color: '#1A3A34' }}>Thought Coach</h1>
              <p className="text-xs" style={{ color: '#5A7A72' }}>Work through challenging thoughts</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Desktop Header */}
      <motion.div 
        className="hidden md:block backdrop-blur-xl border-b p-4 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'linear-gradient(to bottom, rgba(212, 237, 232, 0.95) 0%, rgba(200, 230, 225, 0.92) 100%)',
          borderColor: 'rgba(38, 166, 154, 0.25)'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              style={{ borderRadius: '50%' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <motion.div 
              className="w-12 h-12 flex items-center justify-center shadow-lg"
              style={{
                borderRadius: '24px',
                background: 'linear-gradient(145deg, #9F7AEA, #B794F4)'
              }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Brain className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: '#1A3A34' }}>Thought Coach</h1>
              <p className="text-sm" style={{ color: '#5A7A72' }}>Work through challenging thoughts with structured CBT guidance</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-32 md:pb-24 w-full overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 md:mt-8"
        >
          <Card className="border-0 overflow-hidden mb-6" style={{
            borderRadius: '36px',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 246, 243, 0.9) 100%)',
            boxShadow: '0 16px 48px rgba(38, 166, 154, 0.15), 0 6px 20px rgba(0,0,0,0.05)'
          }}>
            <CardContent className="p-6 md:p-8">
              <motion.div 
                className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-4 shadow-lg"
                style={{
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #9F7AEA, #B794F4)'
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </motion.div>
              <h2 className="text-xl md:text-2xl font-bold mb-3 text-center" style={{ color: '#1A3A34' }}>
                What's on your mind? 🧠
              </h2>
              <p className="text-sm md:text-base mb-4 max-w-2xl mx-auto text-center" style={{ color: '#5A7A72' }}>
                Choose the type of thought you'd like to work through. I'll guide you step-by-step using CBT techniques to challenge and reframe it.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {thoughtTypes.map((thought, index) => {
              const Icon = thought.icon;
              return (
                <motion.div
                  key={thought.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    onClick={() => handleSelectThoughtType(thought.type)}
                    className="border-0 hover:shadow-xl transition-all cursor-pointer group h-full"
                    style={{
                      borderRadius: '28px',
                      background: `linear-gradient(145deg, ${thought.bgColor} 0%, rgba(255, 255, 255, 0.7) 100%)`,
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 6px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <CardContent className="p-5 md:p-6">
                      <div className="flex items-start gap-4">
                        <motion.div 
                          className="w-14 h-14 flex items-center justify-center flex-shrink-0"
                          style={{ 
                            borderRadius: '20px',
                            backgroundColor: thought.color,
                            boxShadow: `0 6px 16px ${thought.color}40`
                          }}
                          whileHover={{ rotate: 5, scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base mb-1 truncate" style={{ color: '#1A3A34' }}>
                            {thought.label}
                          </h3>
                          <p className="text-xs line-clamp-2" style={{ color: '#5A7A72' }}>
                            {thought.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}