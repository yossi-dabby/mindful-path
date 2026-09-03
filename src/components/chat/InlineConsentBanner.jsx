import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { Button } from '@/components/ui/button';
import { CHAT_CONSENT_DOCUMENT, persistCurrentChatConsent } from '@/lib/chatConsent';
import { Card } from '@/components/ui/card';
import { Bot, HeartHandshake, LifeBuoy, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
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
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    base44.auth.me().then((user) => {
      setCurrentUserId(user?.id || null);
      setSafetyProfile(user?.preferences?.safety_profile || 'standard');
    }).catch(() => {
      setSaveError(copy.language === 'he'
        ? 'לא ניתן לאמת את החשבון כרגע. נסו שוב.'
        : 'We could not verify your account. Please try again.');
    });
  }, [copy.language]);

  const handleAccept = async () => {
    const language = copy.language;
    const acceptedAt = new Date().toISOString();
    const record = {
      document: CHAT_CONSENT_DOCUMENT,
      version: LEGAL_CONSENT_VERSION,
      language,
      surface: 'chat',
      accepted_at: acceptedAt,
    };

    setIsSaving(true);
    setSaveError('');

    try {
      if (!appParams.appId || !currentUserId) {
        throw new Error('Authenticated user context is unavailable');
      }

      // Fail closed: AI access is unlocked only after the owner-scoped audit
      // record has been confirmed by Base44.
      await base44.entities.ConsentRecord.create(record);
      persistCurrentChatConsent(undefined, currentUserId);

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

      onAccept();
    } catch (error) {
      console.warn('Consent record persistence failed:', error);
      setSaveError(copy.language === 'he'
        ? 'שמירת ההסכמה נכשלה. לא נפתחה גישה ל-AI. נסו שוב.'
        : 'Consent could not be saved. AI access remains locked. Please try again.');
    } finally {
      setIsSaving(false);
    }
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

            {saveError && (
              <p role="alert" className="mt-3 text-sm font-medium text-red-700">{saveError}</p>
            )}
            <Button
              onClick={handleAccept}
              disabled={isSaving || !currentUserId}
              data-testid="consent-accept"
              className="mt-3 min-h-12 w-full rounded-2xl bg-teal-700 font-semibold text-white shadow-lg shadow-teal-700/20 hover:bg-teal-800 sm:w-auto"
            >
              {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {isSaving
                ? (copy.language === 'he' ? 'שומר הסכמה…' : 'Saving consent…')
                : consent.accept}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
