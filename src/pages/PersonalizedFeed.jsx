import React from 'react';
import { Button } from '@/components/ui/button';
import PersonalizedContentFeed from '../components/home/PersonalizedContentFeed';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonalizedFeed() {
  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between mb-8 mt-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h1 className="text-3xl md:text-4xl font-light text-gray-800">Personalized Feed</h1>
            </div>
            <p className="text-gray-500 mt-1">AI-curated content just for you</p>
          </div>
        </div>
      </motion.div>

      {/* Feed Content */}
      <PersonalizedContentFeed />
    </div>
  );
}