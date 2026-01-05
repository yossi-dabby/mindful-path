import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import PersonalizedContentFeed from '../components/home/PersonalizedContentFeed';
import FeedPreferences from '../components/feed/FeedPreferences';
import FeedFilters from '../components/feed/FeedFilters';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonalizedFeed() {
  const [userInterests, setUserInterests] = useState([]);
  const [contentType, setContentType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const handlePreferencesChange = (interests) => {
    setUserInterests(interests);
  };

  const handleClearFilters = () => {
    setContentType('all');
    setSortBy('relevance');
  };

  const hasActiveFilters = contentType !== 'all' || sortBy !== 'relevance';

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 max-w-5xl mx-auto" style={{ background: 'linear-gradient(to bottom, #F0F9F8 0%, #E8F5F3 50%, #E0F2F1 100%)' }}>
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between mb-6 mt-4"
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
              <Sparkles className="w-6 h-6" style={{ color: '#26A69A' }} />
              <h1 className="text-3xl md:text-4xl font-light" style={{ color: '#2D3748' }}>Personalized Feed</h1>
            </div>
            <p className="mt-1" style={{ color: '#718096' }}>AI-curated content tailored to your interests</p>
          </div>
        </div>
      </motion.div>

      {/* Preferences */}
      <FeedPreferences onPreferencesChange={handlePreferencesChange} />

      {/* Filters */}
      <FeedFilters
        contentType={contentType}
        setContentType={setContentType}
        sortBy={sortBy}
        setSortBy={setSortBy}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Feed Content */}
      <PersonalizedContentFeed
        userInterests={userInterests}
        contentType={contentType}
        sortBy={sortBy}
      />
    </div>
  );
}