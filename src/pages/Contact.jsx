import { Link } from 'react-router-dom';
import { ExternalLink, HeartHandshake, Phone, ShieldAlert, Stethoscope } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getHumanSupportResources } from '@/lib/humanSupportDirectory';

const copy = {
  he: {
    title: 'עזרה אנושית',
    intro: 'בחרו את סוג העזרה שמתאים למצב כרגע. הפנייה נעשית ביוזמתכם ישירות לשירות החיצוני.',
    immediateTitle: 'סכנה מיידית',
    immediateText: 'אם קיימת סכנה מיידית, אל תסתמכו על האפליקציה. התקשרו עכשיו או פנו לחדר המיון הקרוב.',
    urgentTitle: 'תמיכה רגשית עכשיו',
    urgentText: 'לשיחה אנונימית עם אדם בזמן מצוקה או משבר.',
    careTitle: 'עזרה מקצועית שאינה דחופה',
    careText: 'לסיוע דרך מערכת הבריאות או לאיתור שירות מחוץ לישראל.',
    verified: 'אומת לאחרונה',
    source: 'מקור רשמי',
    disclaimer: 'Mindful Path מציעה כלי עזרה עצמית בגישת CBT. היא אינה שירות חירום ואינה תחליף לטיפול של איש או אשת מקצוע מורשים.',
    productSupport: 'לתמיכה טכנית או משוב על האפליקציה בלבד:',
    about: 'אודות', privacy: 'מדיניות פרטיות', terms: 'תנאי שימוש',
  },
  en: {
    title: 'Human support',
    intro: 'Choose the kind of help that fits the situation now. You decide whether to contact an external service directly.',
    immediateTitle: 'Immediate danger',
    immediateText: 'If there is immediate danger, do not rely on this app. Call now or go to the nearest emergency department.',
    urgentTitle: 'Emotional support now',
    urgentText: 'Talk anonymously with a person during distress or crisis.',
    careTitle: 'Non-emergency professional help',
    careText: 'Get help through the health system or find support outside Israel.',
    verified: 'Last verified',
    source: 'Official source',
    disclaimer: 'Mindful Path provides CBT-informed self-help tools. It is not a crisis service and is not a replacement for licensed professional care.',
    productSupport: 'For technical support or app feedback only:',
    about: 'About', privacy: 'Privacy Policy', terms: 'Terms of Use',
  },
};

function ResourceCard({ resource, language, labels }) {
  const name = resource.name[language] || resource.name.en;
  const description = resource.description[language] || resource.description.en;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" data-testid={`human-support-${resource.id}`}>
      <h3 className="font-semibold text-slate-900">{name}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {resource.channels.map((channel) => (
          <a
            key={`${resource.id}-${channel.type}`}
            href={channel.href}
            target={channel.type === 'web' || channel.type === 'whatsapp' ? '_blank' : undefined}
            rel={channel.type === 'web' || channel.type === 'whatsapp' ? 'noreferrer' : undefined}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {channel.type === 'phone' ? <Phone className="h-4 w-4" aria-hidden="true" /> : <ExternalLink className="h-4 w-4" aria-hidden="true" />}
            {channel.label}
          </a>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span>{labels.verified}: {resource.lastVerifiedAt}</span>
        <a className="underline" href={resource.sourceUrl} target="_blank" rel="noreferrer">{labels.source}</a>
      </div>
    </article>
  );
}

function SupportSection({ icon: Icon, title, text, tone, resources, language, labels }) {
  return (
    <section className={`rounded-3xl border p-5 md:p-6 ${tone}`}>
      <div className="flex items-start gap-3">
        <span className="rounded-2xl bg-white/80 p-2.5"><Icon className="h-6 w-6" aria-hidden="true" /></span>
        <div><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm leading-6">{text}</p></div>
      </div>
      <div className="mt-4 grid gap-3">{resources.map((resource) => <ResourceCard key={resource.id} resource={resource} language={language} labels={labels} />)}</div>
    </section>
  );
}

export default function Contact() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.startsWith('he') || i18n.language?.startsWith('he') ? 'he' : 'en';
  const labels = copy[language];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-slate-800 md:px-6 md:py-12" dir={language === 'he' ? 'rtl' : 'ltr'} data-testid="human-support-page">
      <h1 className="text-3xl font-bold text-slate-950">{labels.title}</h1>
      <p className="mt-3 leading-7 text-slate-600">{labels.intro}</p>

      <div className="mt-7 space-y-5">
        <SupportSection icon={ShieldAlert} title={labels.immediateTitle} text={labels.immediateText} tone="border-red-200 bg-red-50 text-red-950" resources={getHumanSupportResources('immediate')} language={language} labels={labels} />
        <SupportSection icon={HeartHandshake} title={labels.urgentTitle} text={labels.urgentText} tone="border-amber-200 bg-amber-50 text-amber-950" resources={getHumanSupportResources('urgent_support')} language={language} labels={labels} />
        <SupportSection icon={Stethoscope} title={labels.careTitle} text={labels.careText} tone="border-teal-200 bg-teal-50 text-teal-950" resources={getHumanSupportResources('non_emergency')} language={language} labels={labels} />
      </div>

      <aside className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">{labels.disclaimer}</aside>
      <p className="mt-6 text-sm">{labels.productSupport} <a className="underline" href="mailto:support@mindful-path.app">support@mindful-path.app</a></p>
      <nav className="mt-6 flex flex-wrap gap-4 text-sm"><Link className="underline" to="/about">{labels.about}</Link><Link className="underline" to="/privacy">{labels.privacy}</Link><Link className="underline" to="/terms">{labels.terms}</Link></nav>
    </main>
  );
}

