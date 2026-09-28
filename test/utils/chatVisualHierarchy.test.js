import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Chat visual hierarchy contract', () => {
  const chat = readFileSync('src/pages/Chat.jsx', 'utf8');
  const bubble = readFileSync('src/components/chat/MessageBubble.jsx', 'utf8');
  const proactive = readFileSync('src/components/chat/ProactiveCheckIn.jsx', 'utf8');

  it('keeps the in-chat heading compact while the mobile shell title is visible', () => {
    expect(chat).toContain('hidden md:flex flex-1 min-w-0 items-center gap-3');
    expect(chat).toContain('bg-white/80');
  });

  it('gives the welcome state a centered, responsive visual anchor', () => {
    expect(chat).toContain('mx-auto mb-3 sm:mb-4 rounded-2xl w-12 h-12 sm:w-14 sm:h-14');
    expect(chat).toContain('p-3 flex items-center justify-center sm:p-4 lg:p-6');
    expect(chat).toContain('w-full sm:w-auto');
    expect(chat).not.toContain('mr-20 ml-24');
  });

  it('visually distinguishes user and assistant messages', () => {
    expect(bubble).toContain("isUser ? 'justify-end' : 'justify-start'");
    expect(bubble).toContain("'bg-teal-600 text-white rounded-ee-md'");
    expect(bubble).toContain('overflow-wrap-anywhere !text-white');
    expect(bubble).toContain("'bg-white/95 text-slate-800 border border-teal-100/90 rounded-es-md backdrop-blur-sm'");
    expect(bubble).toContain('Sparkles');
    expect(bubble).toContain('UserRound');
  });

  it('uses calm, readable suggestion cards instead of purple-heavy chrome', () => {
    expect(proactive).toContain('bg-white/90');
    expect(proactive).toContain('text-slate-600 leading-relaxed');
    expect(proactive).toContain('text-teal-700 font-semibold');
  });
});
