import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Info, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function InlineConsentBanner({ onAccept }) {
  const { t } = useTranslation();
  const [safetyProfile, setSafetyProfile] = useState('standard');
  useEffect(() => {
    // Load user's safety profile preference
    base44.auth.me().then((user) => {
      setSafetyProfile(user?.preferences?.safety_profile || 'standard');
    }).catch(() => {});
  }, []);

  const handleAccept = () => {
    // Track consent acceptance
    if (appParams.appId) {
      base44.analytics.track({
        eventName: 'consent_accepted',
        properties: {
          surface: 'chat',
          safety_profile: safetyProfile,
          timestamp: new Date().toISOString()
        }
      });
    }
    onAccept();
  };

  const profileKey = ['lenient', 'standard', 'strict'].includes(safetyProfile) ? safetyProfile : 'standard';

  return (
    <Card 
      data-testid="consent-banner"
      className="border-0 mb-4"
      style={{
        borderRadius: '20px',
        background: 'linear-gradient(145deg, rgba(255, 243, 224, 0.95) 0%, rgba(255, 237, 213, 0.9) 100%)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        boxShadow: '0 4px 12px rgba(251, 191, 36, 0.15)'
      }}
    >
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div 
            className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              borderRadius: '12px',
              background: 'linear-gradient(145deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)'
            }}
          >
            <Info className="w-4 h-4" style={{ color: '#D97706' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold mb-1.5" style={{ color: '#78350F' }}>
              {t(`chat.consent.${profileKey}.title`)}
            </h3>
            <p className="text-xs md:text-sm leading-relaxed mb-3" style={{ color: '#92400E' }}>
              {t(`chat.consent.${profileKey}.message`)}
            </p>
            <a 
              href="https://base44.com/safety-faq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs flex items-center gap-1 mb-3 hover:underline"
              style={{ color: '#D97706' }}
            >
              {t('chat.consent.learn_more')}
              <ExternalLink className="w-3 h-3" />
            </a>
            <Button
              onClick={handleAccept}
              data-testid="consent-accept"
              size="sm"
              className="text-white font-medium"
              style={{
                borderRadius: '14px',
                backgroundColor: '#D97706',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)'
              }}
            >
              {t('chat.consent.understand_button')}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
