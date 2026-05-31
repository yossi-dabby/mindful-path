import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-slate-800">
      <h1 className="mb-4 text-3xl font-semibold">About Mindful Path</h1>
      <p className="mb-4 leading-7">
        Mindful Path is a mental wellness support app focused on mindfulness, journaling, and CBT-informed self-help tools.
      </p>
      <p className="mb-4 leading-7">
        The app is designed to help users build healthy routines and reflect on emotions in a structured, supportive way.
      </p>
      <p className="mb-8 leading-7">
        Mindful Path is not a crisis service and is not a replacement for licensed professional care.
      </p>
      <nav className="flex flex-wrap gap-4 text-sm">
        <Link className="underline" to="/privacy">Privacy Policy</Link>
        <Link className="underline" to="/terms">Terms of Use</Link>
        <Link className="underline" to="/contact">Contact</Link>
      </nav>
    </main>
  );
}
