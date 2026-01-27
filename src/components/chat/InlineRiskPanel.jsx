import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Phone, MessageSquare } from 'lucide-react';

export default function InlineRiskPanel({ onDismiss }) {
  return (
    <Card 
      data-testid="risk-panel"
      className="border-0 mb-4"
      style={{
        borderRadius: '20px',
        background: 'linear-gradient(145deg, rgba(254, 242, 242, 0.98) 0%, rgba(254, 226, 226, 0.95) 100%)',
        backdropFilter: 'blur(8px)',
        border: '2px solid rgba(239, 68, 68, 0.3)',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
      }}
    >
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div 
            className="w-10 h-10 flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              borderRadius: '14px',
              background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)'
            }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: '#DC2626' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold mb-2" style={{ color: '#7F1D1D' }}>
              We're Here to Help
            </h3>
            <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: '#991B1B' }}>
              This AI cannot provide emergency support. If you're in crisis, please reach out to a professional immediately.
            </p>
            
            {/* Crisis Resources */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#DC2626' }} />
                <div>
                  <span className="font-medium" style={{ color: '#7F1D1D' }}>Crisis Hotline:</span>
                  <span className="ml-2" style={{ color: '#991B1B' }}>988 (US)</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                <MessageSquare className="w-4 h-4 flex-shrink-0" style={{ color: '#DC2626' }} />
                <div>
                  <span className="font-medium" style={{ color: '#7F1D1D' }}>Crisis Text Line:</span>
                  <span className="ml-2" style={{ color: '#991B1B' }}>Text "HELLO" to 741741</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#DC2626' }} />
                <div>
                  <span className="font-medium" style={{ color: '#7F1D1D' }}>Emergency:</span>
                  <span className="ml-2" style={{ color: '#991B1B' }}>911</span>
                </div>
              </div>
            </div>

            <Button
              onClick={onDismiss}
              data-testid="risk-return"
              className="w-full md:w-auto text-white font-medium"
              style={{
                borderRadius: '14px',
                backgroundColor: '#DC2626',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
              }}
            >
              Return to Chat
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}