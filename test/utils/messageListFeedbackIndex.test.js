import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, it, expect, vi } from 'vitest';

const { capturedProps } = vi.hoisted(() => ({
  capturedProps: [],
}));

vi.mock('../../src/components/chat/MessageBubble.jsx', () => ({
  default: function MockMessageBubble(props) {
    capturedProps.push(props);
    return null;
  },
}));

import MessageList from '../../src/components/chat/MessageList.jsx';

describe('MessageList feedback index targeting', () => {
  beforeEach(() => {
    capturedProps.length = 0;
  });

  it('prefers raw message indexes for feedback targeting when available', () => {
    renderToStaticMarkup(
      React.createElement(MessageList, {
        messages: [
        { role: 'user', content: 'hello', __rawIndex: 0 },
        { role: 'system', content: 'progress', __rawIndex: 1 },
        { role: 'assistant', content: 'final', __rawIndex: 2 },
        ],
        visibleCount: 3,
        conversationId: 'conv-1',
        sessionLanguage: 'en',
      })
    );

    expect(capturedProps).toHaveLength(2);
    expect(capturedProps[0].messageIndex).toBe(0);
    expect(capturedProps[1].messageIndex).toBe(2);
  });

  it('falls back to visible indexes when raw indexes are unavailable', () => {
    renderToStaticMarkup(
      React.createElement(MessageList, {
        messages: [
        { role: 'user', content: 'hello' },
        { role: 'system', content: 'progress' },
        { role: 'assistant', content: 'final' },
        ],
        visibleCount: 3,
        conversationId: 'conv-2',
        sessionLanguage: 'en',
      })
    );

    expect(capturedProps).toHaveLength(2);
    expect(capturedProps[0].messageIndex).toBe(0);
    expect(capturedProps[1].messageIndex).toBe(1);
  });
});
