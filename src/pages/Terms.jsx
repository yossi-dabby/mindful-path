import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-slate-800">
      <h1 className="mb-4 text-3xl font-semibold">Terms of Use</h1>
      <p className="mb-4 leading-7">
        By using Mindful Path, you agree to use the app lawfully and responsibly.
      </p>
      <p className="mb-4 leading-7">
        Mindful Path provides educational and self-help wellness tools. It does not provide medical diagnosis, treatment, or emergency services.
      </p>
      <p className="mb-4 leading-7">
        If you are in crisis or at risk of harm, contact local emergency services or a qualified mental health professional immediately.
      </p>
      <p className="mb-8 leading-7">
        We may update these terms over time as the service evolves.
      </p>
      <nav className="flex flex-wrap gap-4 text-sm">
        <Link className="underline" to="/about">About</Link>
        <Link className="underline" to="/privacy">Privacy Policy</Link>
        <Link className="underline" to="/contact">Contact</Link>
      </nav>
    </main>
  );
}
