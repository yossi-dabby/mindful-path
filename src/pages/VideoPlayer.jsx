import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoPlayer() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const videoUrl = urlParams.get('videoUrl');
  const title = urlParams.get('title') || 'Video';

  const handleBack = () => {
    navigate(createPageUrl('Videos'));
  };

  if (!videoUrl) {
    return (
      <div className="min-h-screen bg-warm-gradient">
        <div className="page-container max-w-4xl">
          <div className="text-center py-12">
            <p className="text-lg mb-4" style={{ color: 'rgb(var(--text))' }}>
              No video selected
            </p>
            <Button onClick={handleBack}>Back to Video Library</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-gradient">
      <div className="page-container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="mb-6 mt-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 -ml-2"
              style={{ color: 'rgb(var(--muted))' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Video Library
            </Button>
            <h1 className="text-2xl font-semibold" style={{ color: 'rgb(var(--text))' }}>
              {title}
            </h1>
          </div>

          {/* Video Player Card */}
          <Card className="border-0 shadow-lg" style={{ 
            borderRadius: 'var(--r-lg)',
            backgroundColor: 'rgb(var(--surface))'
          }}>
            <CardContent className="p-0">
              <div className="relative" style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                <video
                  className="w-full"
                  controls
                  autoPlay={false}
                  src={videoUrl}
                  style={{ maxHeight: '70vh' }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Button */}
          <div className="mt-6 text-center">
            <Button
              onClick={handleBack}
              className="px-6 py-5 shadow-soft"
              style={{ 
                borderRadius: 'var(--r-lg)',
                backgroundColor: 'rgb(var(--accent))',
                color: 'rgb(var(--accent-contrast))'
              }}
            >
              Back to Video Library
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}