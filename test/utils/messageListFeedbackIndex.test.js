import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/components/chat/MessageBubble.jsx', () => ({
  default: function MockMessageBubble() {
    return null;
  },
}));

import MessageList from '../../src/components/chat/MessageList.jsx';

describe('MessageList feedback index targeting', () => {
  it('prefers raw message indexes for feedback targeting when available', () => {
    const rendered = MessageList({
      messages: [
        { role: 'user', content: 'hello', __rawIndex: 0 },
        { role: 'system', content: 'progress', __rawIndex: 1 },
        { role: 'assistant', content: 'final', __rawIndex: 2 },
      ],
      visibleCount: 3,
      conversationId: 'conv-1',
      sessionLanguage: 'en',
    });

    expect(rendered).toHaveLength(2);
    expect(rendered[0].props.messageIndex).toBe(0);
    expect(rendered[1].props.messageIndex).toBe(2);
  });

  it('falls back to visible indexes when raw indexes are unavailable', () => {
    const rendered = MessageList({
      messages: [
        { role: 'user', content: 'hello' },
        { role: 'system', content: 'progress' },
        { role: 'assistant', content: 'final' },
      ],
      visibleCount: 3,
      conversationId: 'conv-2',
      sessionLanguage: 'en',
    });

    expect(rendered).toHaveLength(2);
    expect(rendered[0].props.messageIndex).toBe(0);
    expect(rendered[1].props.messageIndex).toBe(1);
  });
});
