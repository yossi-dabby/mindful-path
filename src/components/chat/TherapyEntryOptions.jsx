import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Cloud, BookOpen, Target, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const OPTIONS = [
  {
    id: 'help_now',
    label: "I'm not feeling well and want help right now",
    icon: Heart,
    color: '#E57373'
  },
  {
    id: 'bothering_thought',
    label: "I have a thought that's bothering me",
    icon: Cloud,
    color: '#9F7AEA'
  },
  {
    id: 'write_reflect',
    label: "I want to write or reflect a bit",
    icon: BookOpen,
    color: '#4FC3F7'
  },
  {
    id: 'work_on_goal',
    label: "I want to work on a goal",
    icon: Target,
    color: '#FFB74D'
  },
  {
    id: 'something_calming',
    label: "I just want something short and calming",
    icon: Leaf,
    color: '#81C784'
  }
];

export default function TherapyEntryOptions({ onSelectOption }) {
  return (
    <Card className="p-6 border-0 max-w-2xl mx-auto" style={{
      borderRadius: '28px',
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 16px 48px rgba(38, 166, 154, 0.15), 0 6px 20px rgba(0,0,0,0.05)'
    }}>
      <div className="mb-6">
        <p className="text-sm mb-4" style={{ color: '#5A7A72' }}>
          Welcome. I'm here to support you.
        </p>
        <h3 className="text-xl font-semibold" style={{ color: '#1A3A34' }}>
          What would you like to do today?
        </h3>
      </div>

      <div className="space-y-3">
        {OPTIONS.map((option, index) => {
          const Icon = option.icon;
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                onClick={() => onSelectOption(option)}
                variant="ghost"
                className="w-full h-auto min-h-[56px] justify-start text-left p-4 hover:bg-transparent"
                style={{
                  borderRadius: '20px',
                  border: '1px solid rgba(38, 166, 154, 0.15)',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                  e.currentTarget.style.borderColor = option.color + '40';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${option.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.borderColor = 'rgba(38, 166, 154, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderRadius: '14px',
                      backgroundColor: option.color + '20'
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: option.color }} strokeWidth={2} />
                  </div>
                  <span className="text-sm font-medium flex-1" style={{ color: '#1A3A34' }}>
                    {option.label}
                  </span>
                </div>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}