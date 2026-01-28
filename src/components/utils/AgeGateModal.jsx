import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function AgeGateModal({ onConfirm, onDecline }) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[200]"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <Card 
        className="max-w-md w-full border-0 shadow-2xl"
        style={{
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 246, 243, 0.95) 100%)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 60px rgba(38, 166, 154, 0.2)',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <div className="p-6 md:p-8">
          {/* Icon */}
          <div 
            className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center mx-auto mb-4"
            style={{
              borderRadius: '18px',
              background: 'linear-gradient(145deg, rgba(38, 166, 154, 0.15) 0%, rgba(56, 178, 172, 0.15) 100%)',
              boxShadow: '0 4px 12px rgba(38, 166, 154, 0.2)'
            }}
          >
            <ShieldCheck className="w-6 h-6 md:w-7 md:h-7" style={{ color: '#26A69A' }} />
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-3" style={{ color: '#1A3A34' }}>
            Age Verification Required
          </h2>

          {/* Content */}
          <div className="space-y-3 mb-4 text-sm md:text-base" style={{ color: '#5A7A72' }}>
            <p className="leading-relaxed text-center">
              Our AI therapy features are designed for adults 18 and older. This helps ensure we provide appropriate support and maintain safety standards.
            </p>
          </div>
          
          {/* Teen Resources */}
          <div 
            className="mb-6 p-3 rounded-lg text-xs md:text-sm"
            style={{
              background: 'linear-gradient(145deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}
          >
            <p className="font-semibold mb-2" style={{ color: '#78350F' }}>
              If you're under 18 and need support:
            </p>
            <ul className="space-y-1" style={{ color: '#92400E' }}>
              <li>• School counselor or trusted adult</li>
              <li>• Teen Line: 1-800-852-8336 (or text TEEN to 839863)</li>
              <li>• Crisis Text Line: Text "HOME" to 741741</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onConfirm}
              className="w-full py-6 text-base md:text-lg text-white font-medium"
              style={{
                borderRadius: '20px',
                backgroundColor: '#26A69A',
                boxShadow: '0 6px 20px rgba(38, 166, 154, 0.35)',
              }}
            >
              I'm 18 or Older
            </Button>
            <Button
              onClick={onDecline}
              variant="outline"
              className="w-full py-6 text-base md:text-lg font-medium"
              style={{
                borderRadius: '20px',
                borderColor: 'rgba(38, 166, 154, 0.3)',
              }}
            >
              I'm Under 18
            </Button>
          </div>
        </div>
      </Card>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}