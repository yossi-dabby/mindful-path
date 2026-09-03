import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { Button } from '@/components/ui/button';
import { persistCurrentChatConsent } from '@/lib/chatConsent';
import { Card } from '@/components/ui/card';
import { Bot, HeartHandshake, LifeBuoy, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  LEGAL_CONSENT_VERSION,
  getLegalCopy,
} from '@/components/legal/legalContent';

export default function InlineConsentBanner({ onAccept }) {
  const { i18n } = useTranslation();
  const copy = getLegalCopy(i18n.resolvedLanguage || i18n.language);
  const consent = copy.consent;
  const [safetyProfile, setSafetyProfile] = useState('standard');

  useEffect(() => {
    base44.auth.me().then((user) => {
      setSafetyProfile(user?.preferences?.safety_profile || 'standard');
    }).catch(() => {});
  }, []);

  const handleAccept = () => {
    const language = copy.language;
    const acceptedAt = new Date().toISOString();
    const record = {
      document: 'ai_chat_terms_and_privacy',
      version: LEGAL_CONSENT_VERSION,
      language,
      surface: 'chat',
      accepted_at: acceptedAt,
    };

    // Consent must never depend on analytics availability. Persist the minimum
    // audit record when possible, without storing message content, IP, or device data.
    if (appParams.appId) {
      base44.entities.ConsentRecord.create(record).catch((error) => {
        console.warn('Consent record persistence failed:', error);
      });
      try {
        base44.analytics.track({
          eventName: 'consent_accepted',
          properties: {
            surface: 'chat',
            consent_version: LEGAL_CONSENT_VERSION,
            language,
            safety_profile: safetyProfile,
          },
        });
      } catch (error) {
        console.warn('Consent analytics failed:', error);
      }
    }

    persistCurrentChatConsent();
    onAccept();
  };

  const items = [
    { icon: HeartHandshake, title: consent.wellnessTitle, body: consent.wellnessBody },
    { icon: Bot, title: consent.aiTitle, body: consent.aiBody },
    { icon: LockKeyhole, title: consent.privacyTitle, body: consent.privacyBody },
    { icon: LifeBuoy, title: consent.crisisTitle, body: consent.crisisBody },
  ];

  return (
    <Card
      data-testid="consent-banner"
      role="region"
      aria-labelledby="consent-banner-title"
      dir={copy.direction}
      lang={copy.language}
      className="mb-4 overflow-hidden rounded-[22px] border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-teal-50/60 shadow-[0_12px_32px_rgba(120,53,15,0.10)]"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="consent-banner-title" className="text-base font-bold text-slate-900">
              {consent.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-700">{consent.description}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {items.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-white bg-white/80 p-3">
                  <div className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-700" aria-hidden="true" />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-600">{consent.acknowledgement}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <Link className="min-h-11 py-3 font-semibold text-teal-800 underline underline-offset-4" to="/terms">
                {copy.common.terms}
              </Link>
              <Link className="min-h-11 py-3 font-semibold text-teal-800 underline underline-offset-4" to="/privacy">
                {copy.common.privacy}
              </Link>
            </div>

            <Button
              onClick={handleAccept}
              data-testid="consent-accept"
              className="mt-3 min-h-12 w-full rounded-2xl bg-teal-700 font-semibold text-white shadow-lg shadow-teal-700/20 hover:bg-teal-800 sm:w-auto"
            >
              {consent.accept}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
