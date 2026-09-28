import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Chat responsive layout contract', () => {
  const chat = readFileSync('src/pages/Chat.jsx', 'utf8');
  const layout = readFileSync('src/Layout.jsx', 'utf8');
  const appContent = readFileSync('src/components/layout/AppContent.jsx', 'utf8');
  const sidebar = readFileSync('src/components/layout/Sidebar.jsx', 'utf8');
  const mobileHeader = readFileSync('src/components/layout/MobileHeader.jsx', 'utf8');
  const bottomNav = readFileSync('src/components/layout/BottomNav.jsx', 'utf8');
  const conversations = readFileSync('src/components/chat/ConversationsList.jsx', 'utf8');

  it('uses the desktop shell for tablet and desktop widths', () => {
    expect(appContent).toContain('const desktopBreakpoint = 768');
    expect(sidebar).toContain("const visibilityClass = 'hidden md:flex'");
    expect(mobileHeader).toContain("const visibilityClass = 'md:hidden'");
    expect(bottomNav).toContain("const visibilityClass = 'md:hidden'");
    expect(chat).toContain('@media (min-width: 768px)');
    expect(sidebar).toContain('CHAT_SIDEBAR_WIDTH = 224');
  });

  it('uses the conversation list as a drawer and allows it to collapse on extra-wide desktop', () => {
    expect(chat).toContain("showSidebar ? 'block' : 'hidden'");
    expect(chat).toContain("desktopSidebarCollapsed ? 'xl:hidden' : 'xl:block'");
    expect(chat).toContain('xl:hidden fixed inset-0');
    expect(chat).toContain('fixed xl:relative');
    expect(chat).toContain('setDesktopSidebarCollapsed((collapsed) => !collapsed)');
    expect(chat).toContain('aria-expanded={!desktopSidebarCollapsed}');
    expect(conversations).toContain('className="xl:hidden flex-shrink-0"');
  });

  it('prevents the chat and composer columns from overflowing', () => {
    expect(chat).toContain('flex flex-col min-h-0 min-w-0');
    expect(chat).toContain('max-w-5xl flex min-w-0');
    expect(chat).toContain('flex flex-col flex-1 gap-1 min-w-0');
    expect(chat).toContain('data-testid="chat-composer-row"');
    expect(chat).toContain('flex min-w-0 items-end gap-2');
  });

  it('keeps the mobile intent choices in one horizontally scrollable row', () => {
    expect(chat).toContain('data-testid="chat-intent-options"');
    expect(chat).toContain('flex-nowrap gap-2 overflow-x-auto');
    expect(chat).toContain('shrink-0 rounded-xl');
  });

  it('keeps support inline with the recording actions instead of floating over chat', () => {
    expect(chat).toContain('data-testid="chat-actions-row"');
    expect(chat).toContain('data-testid="chat-human-support"');
    expect(chat).toContain('ms-auto inline-flex h-11 w-11');
    expect(chat).toContain('data-testid="chat-disclaimer"');
    expect(layout).toContain("currentPageName !== 'Chat'");
  });

  it('uses the ordinary mobile bottom clearance because support is no longer floating', () => {
    expect(appContent).toContain('paddingBottom: `calc(${BOTTOM_NAV_HEIGHT}px');
    expect(appContent).not.toContain('BOTTOM_NAV_HEIGHT + 72');
  });
});
