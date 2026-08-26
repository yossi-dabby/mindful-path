import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const readSource = (relativePath) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('crisis hard-stop visibility and composer state', () => {
  const chatSource = readSource('src/pages/Chat.jsx');
  const riskPanelSource = readSource('src/components/chat/InlineRiskPanel.jsx');

  it('clears the composer and loading state in both hard-stop layers', () => {
    const layer1 = chatSource.slice(
      chatSource.indexOf('// Layer 1: Regex-based crisis detection'),
      chatSource.indexOf('// Layer 2: LLM-based crisis detection'),
    );
    const layer2 = chatSource.slice(
      chatSource.indexOf('// Layer 2: LLM-based crisis detection'),
      chatSource.indexOf('// Phase 7.1 — Explicit safety layer precedence'),
    );

    expect(layer1).toContain("setInputMessage('')");
    expect(layer1).toContain('setIsLoading(false)');
    expect(layer2).toContain("setInputMessage('')");
    expect(layer2).toContain('setIsLoading(false)');
  });

  it('moves viewport and focus to emergency resources when the panel opens', () => {
    expect(chatSource).toContain(
      "riskPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })",
    );
    expect(chatSource).toContain(
      'riskPanelRef.current?.focus({ preventScroll: true })',
    );
    expect(chatSource).toContain(
      '}, [showRiskPanel, currentConversationId]);',
    );
  });

  it('renders both panel locations as assertive accessible alerts', () => {
    expect(chatSource.match(/role="alert"/g)).toHaveLength(2);
    expect(chatSource.match(/aria-live="assertive"/g)).toHaveLength(2);
    expect(chatSource.match(/ref=\{riskPanelRef\}/g)).toHaveLength(2);
  });

  it('tells the user that the crisis message was not sent', () => {
    expect(riskPanelSource).toContain(
      "blockedNotice: 'ההודעה לא נשלחה ל-AI. משאבי חירום מוצגים להלן.'",
    );
    expect(riskPanelSource).toContain(
      'data-testid="risk-message-blocked-notice"',
    );
  });
});
