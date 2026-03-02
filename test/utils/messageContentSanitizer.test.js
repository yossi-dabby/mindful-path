import { describe, it, expect } from 'vitest';
import { sanitizeMessageContent, hasReasoningLeakage } from '../../src/components/utils/messageContentSanitizer.jsx';

describe('sanitizeMessageContent – <think> block stripping', () => {
  it('strips a single <think>…</think> block', () => {
    const input = '<think>I should respond warmly.</think>Hello! How are you?';
    expect(sanitizeMessageContent(input)).toBe('Hello! How are you?');
  });

  it('strips multiple <think>…</think> blocks', () => {
    const input = '<think>Step 1</think>Hi there.<think>Step 2</think> How can I help?';
    expect(sanitizeMessageContent(input)).toBe('Hi there. How can I help?');
  });

  it('strips multiline <think>…</think> blocks', () => {
    const input = '<think>\nLet me think carefully.\nOkay.\n</think>\nI understand your concern.';
    expect(sanitizeMessageContent(input)).toBe('I understand your concern.');
  });

  it('is case-insensitive for <THINK> tags', () => {
    const input = '<THINK>internal note</THINK>Here is my answer.';
    expect(sanitizeMessageContent(input)).toBe('Here is my answer.');
  });

  it('leaves content unchanged when no <think> block is present', () => {
    const input = 'I am here to help you.';
    expect(sanitizeMessageContent(input)).toBe('I am here to help you.');
  });

  it('returns a failsafe string if stripping removes all content', () => {
    const input = '<think>everything is internal</think>';
    const result = sanitizeMessageContent(input, 'en');
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toContain('<think>');
  });
});

describe('hasReasoningLeakage – <think> detection', () => {
  it('detects a <think> block as reasoning leakage', () => {
    expect(hasReasoningLeakage('<think>internal</think>Some reply.')).toBe(true);
  });

  it('returns false when no reasoning markers are present', () => {
    expect(hasReasoningLeakage('Just a normal message.')).toBe(false);
  });

  it('detects existing line-prefixed markers', () => {
    expect(hasReasoningLeakage('THOUGHT: I should say hello\nHello!')).toBe(true);
  });
});
