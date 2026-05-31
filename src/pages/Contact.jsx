import { Link } from 'react-router-dom';

export default function Contact() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-slate-800">
      <h1 className="mb-4 text-3xl font-semibold">Contact</h1>
      <p className="mb-4 leading-7">
        For general questions, support, or feedback about Mindful Path, email us at
        {' '}<a className="underline" href="mailto:support@mindful-path.app">support@mindful-path.app</a>.
      </p>
      <p className="mb-8 leading-7">
        If you need urgent mental health support, please contact local emergency services or a licensed professional.
      </p>
      <nav className="flex flex-wrap gap-4 text-sm">
        <Link className="underline" to="/about">About</Link>
        <Link className="underline" to="/privacy">Privacy Policy</Link>
        <Link className="underline" to="/terms">Terms of Use</Link>
      </nav>
    </main>
  );
}
