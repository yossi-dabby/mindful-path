import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-slate-800">
      <h1 className="mb-4 text-3xl font-semibold">Privacy Policy</h1>
      <p className="mb-4 leading-7">
        Mindful Path is committed to protecting your privacy and handling personal information responsibly.
      </p>
      <p className="mb-4 leading-7">
        We use data to provide app functionality, improve user experience, and maintain service reliability.
      </p>
      <p className="mb-4 leading-7">
        We do not sell personal information. Access controls and operational safeguards are used to reduce unauthorized access.
      </p>
      <p className="mb-8 leading-7">
        If you have privacy questions, contact us through the contact page.
      </p>
      <nav className="flex flex-wrap gap-4 text-sm">
        <Link className="underline" to="/about">About</Link>
        <Link className="underline" to="/terms">Terms of Use</Link>
        <Link className="underline" to="/contact">Contact</Link>
      </nav>
    </main>
  );
}
