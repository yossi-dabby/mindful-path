import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VideoModal({ videoUrl, onClose }) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        {/* Close Button */}
        <Button
          onClick={onClose}
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full shadow-lg"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Video Player */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <video
            className="absolute inset-0 w-full h-full"
            controls
            autoPlay
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}