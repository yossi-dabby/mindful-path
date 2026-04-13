import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Phone, MessageSquare } from 'lucide-react';
import { appParams } from '@/lib/app-params';
import { useTranslation } from 'react-i18next';

// Self-contained crisis UI strings — presentation only, no detection logic
const CRISIS_STRINGS = {
  en: {
    title: "We're Here to Help",
    body: "This AI cannot provide emergency support. If you're in crisis, please reach out to a professional immediately.",
    hotlineLabel: "Crisis Hotline",
    hotlineNumber: "988 (US)",
    textLabel: "Crisis Text Line",
    textNumber: 'Text "HELLO" to 741741',
    emergencyLabel: "Emergency",
    emergencyNumber: "911 / 112",
    button: "Return to Chat",
    disclaimer: "This AI is not a substitute for professional crisis care."
  },
  he: {
    title: "אנחנו כאן בשבילך",
    body: "בינה מלאכותית זו אינה יכולה לספק סיוע חירום. אם אתה/את במשבר, פנה/י לאיש מקצוע באופן מיידי.",
    hotlineLabel: "קו עזרה למשבר (ערן)",
    hotlineNumber: "1201",
    textLabel: "קו חירום כללי",
    textNumber: '101 (מד"א) / 100 (משטרה)',
    emergencyLabel: "חירום",
    emergencyNumber: "101 / 112",
    button: "חזרה לצ'אט",
    disclaimer: "בינה מלאכותית זו אינה תחליף לטיפול מקצועי בעת משבר."
  },
  es: {
    title: "Estamos aquí para ayudarte",
    body: "Esta IA no puede proporcionar apoyo de emergencia. Si estás en crisis, comunícate con un profesional de inmediato.",
    hotlineLabel: "Línea de crisis",
    hotlineNumber: "024 (España)",
    textLabel: "Emergencias generales",
    textNumber: "112",
    emergencyLabel: "Emergencia",
    emergencyNumber: "112",
    button: "Volver al chat",
    disclaimer: "Esta IA no reemplaza la atención profesional en situaciones de crisis."
  },
  fr: {
    title: "Nous sommes là pour vous aider",
    body: "Cette IA ne peut pas fournir un soutien d'urgence. Si vous êtes en crise, contactez immédiatement un professionnel.",
    hotlineLabel: "Numéro national de prévention du suicide",
    hotlineNumber: "3114 (France)",
    textLabel: "Urgences générales",
    textNumber: "15 / 112",
    emergencyLabel: "Urgence",
    emergencyNumber: "15 / 112",
    button: "Retour au chat",
    disclaimer: "Cette IA ne remplace pas une prise en charge professionnelle en situation de crise."
  },
  de: {
    title: "Wir sind für dich da",
    body: "Diese KI kann keine Notfallunterstützung bieten. Wenn du dich in einer Krise befindest, wende dich sofort an eine Fachkraft.",
    hotlineLabel: "Telefonseelsorge",
    hotlineNumber: "0800 111 0 111 (Deutschland)",
    textLabel: "Notruf",
    textNumber: "112",
    emergencyLabel: "Notruf",
    emergencyNumber: "112",
    button: "Zurück zum Chat",
    disclaimer: "Diese KI ersetzt keine professionelle Krisenunterstützung."
  },
  it: {
    title: "Siamo qui per aiutarti",
    body: "Questa IA non può fornire supporto di emergenza. Se sei in crisi, contatta immediatamente un professionista.",
    hotlineLabel: "Telefono Amico",
    hotlineNumber: "800 274 274 (Italia)",
    textLabel: "Emergenza generale",
    textNumber: "112",
    emergencyLabel: "Emergenza",
    emergencyNumber: "112",
    button: "Torna alla chat",
    disclaimer: "Questa IA non sostituisce l'assistenza professionale in situazioni di crisi."
  },
  pt: {
    title: "Estamos aqui para ajudar",
    body: "Esta IA não pode fornecer suporte de emergência. Se estiver em crise, contacte imediatamente um profissional.",
    hotlineLabel: "SOS Voz Amiga",
    hotlineNumber: "213 544 545 (Portugal)",
    textLabel: "Emergência geral",
    textNumber: "112",
    emergencyLabel: "Emergência",
    emergencyNumber: "112",
    button: "Voltar ao chat",
    disclaimer: "Esta IA não substitui o apoio profissional em situações de crise."
  }
};

export default function InlineRiskPanel({ onDismiss }) {
  const { i18n } = useTranslation();
  const baseLang = i18n.language?.split('-')[0];
  const lang = CRISIS_STRINGS[i18n.language] ? i18n.language
    : CRISIS_STRINGS[baseLang] ? baseLang
    : 'en';
  const s = CRISIS_STRINGS[lang];

  const handleDismiss = () => {
    if (appParams.appId) {
      import('@/api/base44Client').then(({ base44 }) => {
        base44.analytics.track({
          eventName: 'risk_panel_dismissed',
          properties: { surface: 'chat', lang, timestamp: new Date().toISOString() }
        });
      });
    }
    onDismiss();
  };

  return (
    <Card
      data-testid="inline-risk-panel"
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
              {s.title}
            </h3>
            <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: '#991B1B' }}>
              {s.body}
            </p>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#DC2626' }} />
                <div>
                  <span className="font-medium" style={{ color: '#7F1D1D' }}>{s.hotlineLabel}:</span>
                  <span className="ml-2" style={{ color: '#991B1B' }}>{s.hotlineNumber}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                <MessageSquare className="w-4 h-4 flex-shrink-0" style={{ color: '#DC2626' }} />
                <div>
                  <span className="font-medium" style={{ color: '#7F1D1D' }}>{s.textLabel}:</span>
                  <span className="ml-2" style={{ color: '#991B1B' }}>{s.textNumber}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#DC2626' }} />
                <div>
                  <span className="font-medium" style={{ color: '#7F1D1D' }}>{s.emergencyLabel}:</span>
                  <span className="ml-2" style={{ color: '#991B1B' }}>{s.emergencyNumber}</span>
                </div>
              </div>
            </div>

            <p className="text-xs mb-3" style={{ color: '#991B1B', opacity: 0.8 }}>
              {s.disclaimer}
            </p>

            <Button
              onClick={handleDismiss}
              data-testid="risk-panel-dismiss"
              className="w-full md:w-auto text-white font-medium"
              style={{
                borderRadius: '14px',
                backgroundColor: '#DC2626',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
              }}
            >
              {s.button}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}