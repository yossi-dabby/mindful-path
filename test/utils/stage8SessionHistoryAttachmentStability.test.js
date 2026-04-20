import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  sanitizeConversationMessages,
  serializeAttachmentMetadataMarker,
} from '../../src/components/utils/validateAgentOutput.jsx';
import { getMessageRenderKey } from '../../src/components/chat/utils/messageRenderKey.js';

describe('Stage 8 — session/history attachment stability', () => {
  describe('historical message compatibility', () => {
    it('keeps legacy text-only messages stable', () => {
      const legacy = [
        { id: 'u1', role: 'user', content: 'Legacy text-only message' },
        { id: 'a1', role: 'assistant', content: 'Legacy assistant reply' },
      ];
      const sanitized = sanitizeConversationMessages(legacy);
      expect(sanitized).toHaveLength(2);
      expect(sanitized[0].content).toBe('Legacy text-only message');
      expect(sanitized[1].content).toBe('Legacy assistant reply');
    });

    it('preserves metadata attachment-only user messages for history rendering', () => {
      const history = [
        {
          id: 'u-attachment',
          role: 'user',
          content: '',
          metadata: {
            attachment: {
              type: 'image',
              url: 'https://files.example.com/history.png',
              name: 'history.png',
            },
          },
        },
      ];

      const sanitized = sanitizeConversationMessages(history);
      expect(sanitized).toHaveLength(1);
      expect(sanitized[0].metadata?.attachment?.url).toBe('https://files.example.com/history.png');
    });

    it('restores attachment metadata from historical marker content while keeping visible text clean', () => {
      const attachment = {
        type: 'pdf',
        url: 'https://files.example.com/history.pdf',
        name: 'history.pdf',
      };
      const marker = serializeAttachmentMetadataMarker(attachment);
      const messages = [
        {
          id: 'u-marker',
          role: 'user',
          content: `Please summarize this.\n[ATTACHMENT_CONTEXT]\ntype: pdf\nurl: ${attachment.url}\n${marker}`,
          metadata: {},
        },
      ];

      const sanitized = sanitizeConversationMessages(messages);
      expect(sanitized).toHaveLength(1);
      expect(sanitized[0].content).toBe('Please summarize this.');
      expect(sanitized[0].metadata?.attachment?.type).toBe('pdf');
      expect(sanitized[0].metadata?.attachment?.url).toBe(attachment.url);
    });
  });

  describe('message identity stability across sessions', () => {
    it('builds different keys for the same message across different conversations', () => {
      const message = { id: 'msg-1', role: 'user', content: 'same message body' };
      const keyA = getMessageRenderKey(message, 0, 'conv-a');
      const keyB = getMessageRenderKey(message, 0, 'conv-b');
      expect(keyA).not.toBe(keyB);
    });

    it('uses attachment-aware fallback keys when ids are missing', () => {
      const base = { role: 'user', content: '' };
      const keyA = getMessageRenderKey(
        { ...base, metadata: { attachment: { type: 'image', url: 'https://files.example.com/a.png' } } },
        0,
        'conv-a'
      );
      const keyB = getMessageRenderKey(
        { ...base, metadata: { attachment: { type: 'image', url: 'https://files.example.com/b.png' } } },
        0,
        'conv-a'
      );
      expect(keyA).not.toBe(keyB);
    });
  });

  describe('composer attachment isolation on session switches', () => {
    it('clears selected attachment when starting a new session or loading another session', () => {
      const chatSource = readFileSync(resolve(process.cwd(), 'src/pages/Chat.jsx'), 'utf8');
      expect(chatSource).toMatch(/const startNewConversationWithIntent = async \(intentParam\) => \{\s*try \{\s*removeSelectedAttachment\(\);/s);
      expect(chatSource).toMatch(/const loadConversation = async \(conversationId\) => \{\s*try \{\s*if \(conversationId !== currentConversationId\) \{\s*removeSelectedAttachment\(\);/s);
    });
  });
});
