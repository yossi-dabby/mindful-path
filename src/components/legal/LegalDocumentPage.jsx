import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LEGAL_CONTACT_EMAIL, LEGAL_EFFECTIVE_DATE, getLegalCopy } from './legalContent';

export default function LegalDocumentPage({ document }) {
  const { i18n } = useTranslation();
  const copy = getLegalCopy(i18n.resolvedLanguage || i18n.language);
  const content = copy[document];
  const isRtl = copy.direction === 'rtl';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <main
      dir={copy.direction}
      lang={copy.language}
      className="min-h-screen bg-gradient-to-b from-teal-50/80 via-white to-amber-50/40 px-4 py-8 text-slate-800 sm:px-6 sm:py-12"
    >
      <article className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-white/90 bg-white/90 shadow-[0_24px_70px_rgba(15,118,110,0.12)] backdrop-blur-xl">
        <header className="border-b border-teal-100 bg-gradient-to-br from-teal-50 to-white px-5 py-7 sm:px-9 sm:py-9">
          <Link to="/" className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-teal-800 hover:bg-teal-100/70 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <BackIcon className="h-4 w-4" aria-hidden="true" />
            {copy.common.back}
          </Link>
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="mb-1 text-sm font-semibold tracking-wide text-teal-700">{copy.common.appName}</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{content.title}</h1>
              <p className="mt-3 text-sm text-slate-600">
                {copy.common.effectiveDateLabel}: <time dateTime={LEGAL_EFFECTIVE_DATE}>{LEGAL_EFFECTIVE_DATE}</time>
              </p>
            </div>
          </div>
          <p className="mt-6 text-base leading-7 text-slate-700">{content.intro}</p>
        </header>

        <div className="space-y-8 px-5 py-8 sm:px-9 sm:py-10">
          {content.sections.map((section) => (
            <section key={section.title} className="scroll-mt-6">
              <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-7 text-slate-700">{paragraph}</p>
              ))}
              {section.bullets && (
                <ul className="mt-3 list-disc space-y-2 ps-6 leading-7 text-slate-700">
                  {section.bullets.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>

        <footer className="flex flex-wrap gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-6 text-sm sm:px-9">
          <Link className="rounded-lg px-2 py-2 font-medium text-teal-800 underline-offset-4 hover:underline" to={document === 'privacy' ? '/terms' : '/privacy'}>
            {document === 'privacy' ? copy.common.terms : copy.common.privacy}
          </Link>
          <Link className="rounded-lg px-2 py-2 font-medium text-teal-800 underline-offset-4 hover:underline" to="/contact">
            {copy.common.contact}
          </Link>
          <a className="rounded-lg px-2 py-2 font-medium text-teal-800 underline-offset-4 hover:underline" href={`mailto:${LEGAL_CONTACT_EMAIL}`}>
            {LEGAL_CONTACT_EMAIL}
          </a>
        </footer>
      </article>
    </main>
  );
}
