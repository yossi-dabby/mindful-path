import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Trash2 } from 'lucide-react';

const SUPPORT_EMAIL = 'support@mindful-path.app';

export default function AccountDeletion() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50/80 via-white to-amber-50/40 px-4 py-8 text-slate-800 sm:px-6 sm:py-12">
      <article className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-white/90 bg-white/90 shadow-[0_24px_70px_rgba(15,118,110,0.12)] backdrop-blur-xl">
        <header className="border-b border-teal-100 bg-gradient-to-br from-teal-50 to-white px-5 py-7 sm:px-9 sm:py-9">
          <Link to="/" className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-teal-800 hover:bg-teal-100/70 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Mindful Path
          </Link>
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
              <Trash2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="mb-1 text-sm font-semibold tracking-wide text-teal-700">Mindful Path</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Delete your account and data</h1>
            </div>
          </div>
          <p className="mt-6 text-base leading-7 text-slate-700">
            This page explains how to request permanent deletion of a Mindful Path account and its associated data.
          </p>
        </header>

        <div className="space-y-8 px-5 py-8 sm:px-9 sm:py-10">
          <section>
            <h2 className="text-xl font-bold text-slate-900">Delete from the app</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-6 leading-7 text-slate-700">
              <li>Sign in to Mindful Path.</li>
              <li>Open <strong>Settings</strong>, then <strong>Account</strong>.</li>
              <li>Select <strong>Delete Account</strong>.</li>
              <li>Enter the confirmation text shown in the app and confirm permanent deletion.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">Request deletion without app access</h2>
            <p className="mt-3 leading-7 text-slate-700">
              Email <a className="font-medium text-teal-800 underline" href={`mailto:${SUPPORT_EMAIL}?subject=Mindful%20Path%20account%20deletion%20request`}>{SUPPORT_EMAIL}</a> from the address registered to the account. Use the subject “Mindful Path account deletion request”. We may ask you to verify account ownership before processing the request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">What is deleted</h2>
            <ul className="mt-3 list-disc space-y-2 ps-6 leading-7 text-slate-700">
              <li>The account and profile information.</li>
              <li>User-owned wellness records, including goals, journals, mood entries, exercise progress, and conversations.</li>
              <li>Associated preferences and other user-created records.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">Limited retention</h2>
            <p className="mt-3 leading-7 text-slate-700">
              Active account data is scheduled for deletion when the request is completed. Residual encrypted backups may take up to 90 days to expire. Security, fraud-prevention, transaction, or legal records may be retained only for the period required by applicable law or a legitimate security obligation.
            </p>
          </section>

          <aside className="flex gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 p-4 text-sm leading-6 text-teal-950">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>Deleting the app from a device does not delete the account. Follow one of the methods above.</p>
          </aside>
        </div>

        <footer className="flex flex-wrap gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-6 text-sm sm:px-9">
          <Link className="rounded-lg px-2 py-2 font-medium text-teal-800 underline-offset-4 hover:underline" to="/privacy">Privacy Notice</Link>
          <Link className="rounded-lg px-2 py-2 font-medium text-teal-800 underline-offset-4 hover:underline" to="/contact">Contact</Link>
          <a className="rounded-lg px-2 py-2 font-medium text-teal-800 underline-offset-4 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </footer>
      </article>
    </main>
  );
}
