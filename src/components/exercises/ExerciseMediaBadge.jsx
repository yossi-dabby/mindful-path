import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Headphones, Play, Eye, FileText } from 'lucide-react';

const mediaConfig = {
  audio: { icon: Headphones, label: 'Audio', color: 'bg-purple-100 text-purple-700' },
  video: { icon: Play, label: 'Video', color: 'bg-red-100 text-red-700' },
  visualization: { icon: Eye, label: 'Guided', color: 'bg-blue-100 text-blue-700' },
  text: { icon: FileText, label: 'Text', color: 'bg-gray-100 text-gray-700' }
};

export default function ExerciseMediaBadge({ mediaType, size = 'sm' }) {
  const config = mediaConfig[mediaType] || mediaConfig.text;
  const Icon = config.icon;
  
  if (mediaType === 'text' || !mediaType) return null;

  return (
    <Badge 
      variant="secondary" 
      className={`${config.color} flex items-center gap-1 ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config.label}
    </Badge>
  );
}