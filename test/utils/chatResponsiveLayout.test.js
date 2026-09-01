import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Chat responsive layout contract', () => {
  const chat = readFileSync('src/pages/Chat.jsx', 'utf8');
  const appContent = readFileSync('src/components/layout/AppContent.jsx', 'utf8');
  const sidebar = readFileSync('src/components/layout/Sidebar.jsx', 'utf8');
  const mobileHeader = readFileSync('src/components/layout/MobileHeader.jsx', 'utf8');
  const bottomNav = readFileSync('src/components/layout/BottomNav.jsx', 'utf8');
  const conversations = readFileSync('src/components/chat/ConversationsList.jsx', 'utf8');

  it('keeps the mobile app shell through tablet widths on Chat only', () => {
    expect(appContent).toContain("currentPageName === 'Chat' ? 1024 : 768");
    expect(sidebar).toContain("currentPageName === 'Chat' ? 'hidden lg:flex' : 'hidden md:flex'");
    expect(mobileHeader).toContain("currentPageName === 'Chat' ? 'lg:hidden' : 'md:hidden'");
    expect(bottomNav).toContain("currentPageName === 'Chat' ? 'lg:hidden' : 'md:hidden'");
    expect(chat).toContain('@media (min-width: 1024px)');
  });

  it('uses the conversation list as a drawer until extra-wide desktop', () => {
    expect(chat).toContain("showSidebar ? 'block' : 'hidden xl:block'");
    expect(chat).toContain('xl:hidden fixed inset-0');
    expect(chat).toContain('fixed xl:relative');
    expect(conversations).toContain('className="xl:hidden flex-shrink-0"');
  });

  it('prevents the chat and composer columns from overflowing', () => {
    expect(chat).toContain('flex flex-col min-h-0 min-w-0');
    expect(chat).toContain('max-w-4xl flex gap-2 min-w-0');
    expect(chat).toContain('flex flex-col flex-1 gap-1 min-w-0');
  });
});
