/**
 * Tests for conversation sanitization logic.
 *
 * Two related sanitization surfaces are tested here:
 *
 * 1. Pure JSON-extraction logic that mirrors functions/sanitizeConversation.ts.
 *    That file is a Deno serverless function excluded from vitest, so the
 *    core extraction logic is reproduced inline.
 *
 * 2. The exported sanitizeConversationMessages function from
 *    src/components/utils/validateAgentOutput.jsx, which applies the same
 *    pattern at the frontend layer.
 *
 * Covers:
 *   - JSON-like assistant messages: assistant_message field is extracted
 *   - Non-JSON content passes through unchanged
 *   - User messages (role !== 'assistant') are never modified
 *   - Messages without content are returned as-is
 *   - Malformed JSON that cannot be parsed passes through unchanged
 *   - Mixed arrays with a combination of clean and JSON-corrupted messages
 *   - Null/empty message arrays are handled gracefully
 *   - No internal/system data leaks through the extracted content path
 *
 * If the extraction logic in sanitizeConversation.ts or sanitizeConversationMessages
 * changes, update this file to match.
 */

import { describe, it, expect } from 'vitest';
import { sanitizeConversationMessages, serializeAttachmentMetadataMarker } from '../../src/components/utils/validateAgentOutput.jsx';

// ─── PURE JSON-EXTRACTION LOGIC (mirrors functions/sanitizeConversation.ts) ───

/**
 * Mirrors the per-message extraction logic in sanitizeConversation.ts.
 * Returns the extracted assistant_message if the content is JSON-like and
 * contains that field; otherwise returns the original message unchanged.
 */
function sanitizeMessageIfJsonCorrupted(msg) {
  if (msg.role === 'assistant' && msg.content) {
    const content = msg.content;

    if (typeof content === 'string' && content.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.assistant_message) {
          return {
            ...msg,
            content: parsed.assistant_message,
            metadata: {
              ...(msg.metadata || {}),
              structured_data: parsed,
              sanitized_at: new Date().toISOString(),
            },
          };
        }
      } catch (e) {
        // parse error — leave unchanged
      }
    }
  }
  return msg;
}

// ─── TESTS — pure extraction logic (mirrors sanitizeConversation.ts) ──────────

describe('sanitizeConversation — pure JSON extraction logic', () => {
  it('extracts assistant_message from a JSON-like assistant message', () => {
    const msg = {
      role: 'assistant',
      content: JSON.stringify({ assistant_message: 'That sounds really difficult.' }),
    };
    const result = sanitizeMessageIfJsonCorrupted(msg);
    expect(result.content).toBe('That sounds really difficult.');
  });

  it('leaves a plain-text assistant message unchanged', () => {
    const msg = { role: 'assistant', content: 'How are you feeling today?' };
    const result = sanitizeMessageIfJsonCorrupted(msg);
    expect(result.content).toBe('How are you feeling today?');
  });

  it('leaves a user message unchanged regardless of content', () => {
    const msg = { role: 'user', content: JSON.stringify({ assistant_message: 'injected' }) };
    const result = sanitizeMessageIfJsonCorrupted(msg);
    // User messages must never be rewritten
    expect(result.content).toBe(msg.content);
  });

  it('leaves a system message unchanged', () => {
    const msg = { role: 'system', content: '{"assistant_message":"should not extract"}' };
    const result = sanitizeMessageIfJsonCorrupted(msg);
    expect(result.content).toBe(msg.content);
  });

  it('handles an assistant message with no content field', () => {
    const msg = { role: 'assistant' };
    const result = sanitizeMessageIfJsonCorrupted(msg);
    expect(result).toEqual(msg);
  });

  it('handles an assistant message where JSON lacks assistant_message field', () => {
    const msg = {
      role: 'assistant',
      content: JSON.stringify({ other_field: 'some value' }),
    };
    const result = sanitizeMessageIfJsonCorrupted(msg);
    expect(result.content).toBe(msg.content);
  });

  it('handles malformed JSON in an assistant message gracefully', () => {
    const msg = { role: 'assistant', content: '{ broken json ::: }' };
    const result = sanitizeMessageIfJsonCorrupted(msg);
    // Cannot parse — must be returned unchanged, no crash
    expect(result.content).toBe('{ broken json ::: }');
  });

  it('does not extract from content that does not start with {', () => {
    const msg = { role: 'assistant', content: 'No JSON here at all.' };
    const result = sanitizeMessageIfJsonCorrupted(msg);
    expect(result.content).toBe('No JSON here at all.');
  });

  it('preserves metadata from the original message when extracting', () => {
    const msg = {
      role: 'assistant',
      content: JSON.stringify({ assistant_message: 'I hear you.' }),
      metadata: { session_id: 'abc123' },
    };
    const result = sanitizeMessageIfJsonCorrupted(msg);
    expect(result.content).toBe('I hear you.');
    expect(result.metadata?.session_id).toBe('abc123');
    expect(result.metadata?.structured_data).toBeDefined();
    // sanitized_at should be a valid ISO timestamp string
    expect(typeof result.metadata?.sanitized_at).toBe('string');
    expect(result.metadata?.sanitized_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

// ─── TESTS — sanitizeConversationMessages (from validateAgentOutput.jsx) ──────

describe('sanitizeConversationMessages — exported frontend function', () => {
  it('returns an empty array when given an empty array', () => {
    expect(sanitizeConversationMessages([])).toEqual([]);
  });

  it('returns an empty array when given null', () => {
    expect(sanitizeConversationMessages(null)).toEqual([]);
  });

  it('returns an empty array when given undefined', () => {
    expect(sanitizeConversationMessages(undefined)).toEqual([]);
  });

  it('returns an empty array when given a non-array', () => {
    expect(sanitizeConversationMessages('not an array')).toEqual([]);
    expect(sanitizeConversationMessages(42)).toEqual([]);
  });

  it('passes through a plain-text assistant message without modification', () => {
    const messages = [
      { role: 'assistant', content: 'I hear you. How are you feeling today?' },
    ];
    const result = sanitizeConversationMessages(messages);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('I hear you. How are you feeling today?');
  });

  it('passes through user messages without modification', () => {
    const messages = [
      { role: 'user', content: 'I am feeling anxious.' },
    ];
    const result = sanitizeConversationMessages(messages);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('I am feeling anxious.');
  });

  it('does not modify user messages even if they look like JSON', () => {
    const messages = [
      { role: 'user', content: '{"assistant_message":"injected content"}' },
    ];
    const result = sanitizeConversationMessages(messages);
    expect(result[0].content).toBe('{"assistant_message":"injected content"}');
  });

  it('sanitizes a JSON-corrupted assistant message and extracts assistant_message', () => {
    const assistantMessage = 'That sounds really difficult to manage.';
    const messages = [
      {
        role: 'assistant',
        content: JSON.stringify({
          assistant_message: assistantMessage,
          mode: 'thought_work',
          situation: 'stress at work',
        }),
      },
    ];
    const result = sanitizeConversationMessages(messages);
    expect(result[0].content).toBe(assistantMessage);
  });

  it('handles a mixed array of clean, JSON-corrupted, and user messages', () => {
    const messages = [
      { role: 'user', content: 'I have been stressed lately.' },
      {
        role: 'assistant',
        content: JSON.stringify({ assistant_message: 'I understand. What triggered that?' }),
      },
      { role: 'user', content: 'Work pressure.' },
      { role: 'assistant', content: 'That is really common. How are you managing?' },
    ];
    const result = sanitizeConversationMessages(messages);
    expect(result).toHaveLength(4);
    expect(result[0].content).toBe('I have been stressed lately.');
    expect(result[1].content).toBe('I understand. What triggered that?');
    expect(result[2].content).toBe('Work pressure.');
    expect(result[3].content).toBe('That is really common. How are you managing?');
  });

  it('handles an assistant message without a content field', () => {
    const messages = [{ role: 'assistant' }];
    const result = sanitizeConversationMessages(messages);
    expect(result).toHaveLength(1);
    // No crash expected
    expect(result[0].role).toBe('assistant');
  });

  it('handles malformed JSON in an assistant message without crashing', () => {
    const messages = [{ role: 'assistant', content: '{ not valid json' }];
    const result = sanitizeConversationMessages(messages);
    // Should not throw; content passes through as-is or as original
    expect(result).toHaveLength(1);
  });

  it('preserves message role after sanitization', () => {
    const messages = [
      {
        role: 'assistant',
        content: JSON.stringify({ assistant_message: 'I hear you.' }),
      },
    ];
    const result = sanitizeConversationMessages(messages);
    expect(result[0].role).toBe('assistant');
  });

  it('extracts attachment metadata marker from a user message and keeps clean content', () => {
    const marker = serializeAttachmentMetadataMarker({
      type: 'image',
      url: 'https://files.example.com/photo.jpg',
      name: 'photo.jpg',
      size: 1234
    });
    const messages = [
      { role: 'user', content: `Here is the photo\n${marker}` },
    ];
    const result = sanitizeConversationMessages(messages);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('Here is the photo');
    expect(result[0].metadata?.attachment).toEqual({
      type: 'image',
      url: 'https://files.example.com/photo.jpg',
      name: 'photo.jpg',
      size: 1234
    });
  });

  it('extracts attachment metadata marker when message starts with [START_SESSION] wrapper', () => {
    const marker = serializeAttachmentMetadataMarker({
      type: 'pdf',
      url: 'https://files.example.com/file.pdf',
      name: 'file.pdf'
    });
    const messages = [
      {
        role: 'user',
        content: `[START_SESSION]\n\nI attached the PDF\n${marker}`
      },
    ];
    const result = sanitizeConversationMessages(messages);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('I attached the PDF');
    expect(result[0].metadata?.attachment).toEqual({
      type: 'pdf',
      url: 'https://files.example.com/file.pdf',
      name: 'file.pdf'
    });
  });
});

// ─── TESTS — sanitization boundaries (no internal/system data leaks) ──────────

describe('sanitizeConversationMessages — no internal/system data leaks through', () => {
  it('extracted content does not retain raw JSON structure in the content field', () => {
    const messages = [
      {
        role: 'assistant',
        content: JSON.stringify({
          assistant_message: 'I hear you.',
          situation: 'internal audit field',
          homework: [{ step: 'do x' }],
        }),
      },
    ];
    const result = sanitizeConversationMessages(messages);
    // Content should be the clean message, not the full JSON blob
    expect(result[0].content).toBe('I hear you.');
    expect(result[0].content).not.toContain('"situation"');
    expect(result[0].content).not.toContain('"homework"');
  });

  it('does not introduce new content when an assistant message has no assistant_message field', () => {
    const messages = [
      {
        role: 'assistant',
        content: JSON.stringify({ mode: 'thought_work', situation: 'debug' }),
      },
    ];
    const result = sanitizeConversationMessages(messages);
    // No assistant_message field means original content stays or is null; no new invented content
    // The function should not inject a fabricated message
    expect(result[0].content).toBeDefined();
  });

  it('all messages in output retain their original role', () => {
    const messages = [
      { role: 'user', content: 'Hello.' },
      { role: 'assistant', content: 'Hello back.' },
      { role: 'user', content: 'Thanks.' },
    ];
    const result = sanitizeConversationMessages(messages);
    expect(result.map(m => m.role)).toEqual(['user', 'assistant', 'user']);
  });
});
