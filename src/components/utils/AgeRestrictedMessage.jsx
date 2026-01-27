import React from 'react';
import { Card } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function AgeRestrictedMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card 
        className="max-w-md w-full border-0 shadow-xl"
        style={{
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 246, 243, 0.95) 100%)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="p-8 text-center">
          <div 
            className="w-16 h-16 flex items-center justify-center mx-auto mb-4"
            style={{
              borderRadius: '20px',
              background: 'linear-gradient(145deg, rgba(156, 163, 175, 0.15) 0%, rgba(107, 114, 128, 0.15) 100%)',
            }}
          >
            <ShieldAlert className="w-8 h-8" style={{ color: '#6B7280' }} />
          </div>

          <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1A3A34' }}>
            Age Restricted
          </h2>

          <p className="text-base leading-relaxed mb-6" style={{ color: '#5A7A72' }}>
            Our AI-powered chat features are designed for users 18 and older. You still have access to other wellness tools like mood tracking, journaling, and exercises.
          </p>

          <a
            href="/"
            className="inline-block px-6 py-3 text-white font-medium rounded-xl"
            style={{
              backgroundColor: '#26A69A',
              boxShadow: '0 4px 12px rgba(38, 166, 154, 0.3)',
            }}
          >
            Back to Home
          </a>
        </div>
      </Card>
    </div>
  );
}