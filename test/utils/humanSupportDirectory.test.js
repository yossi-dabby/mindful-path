import { describe, expect, it } from 'vitest';
import {
  HUMAN_SUPPORT_DIRECTORY_VERSION,
  ISRAEL_HUMAN_SUPPORT_DIRECTORY,
  getHumanSupportResources,
} from '../../src/lib/humanSupportDirectory.js';

describe('humanSupportDirectory', () => {
  it('keeps every resource auditable and explicitly classified', () => {
    expect(HUMAN_SUPPORT_DIRECTORY_VERSION).toBe('2026-09-06');
    expect(ISRAEL_HUMAN_SUPPORT_DIRECTORY.length).toBeGreaterThanOrEqual(5);

    for (const resource of ISRAEL_HUMAN_SUPPORT_DIRECTORY) {
      expect(['immediate', 'urgent_support', 'non_emergency']).toContain(resource.urgency);
      expect(resource.lastVerifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(resource.verificationOwner).toBeTruthy();
      expect(resource.sourceUrl).toMatch(/^https:\/\//);
      expect(resource.channels.length).toBeGreaterThan(0);
    }
  });

  it('keeps emergency response separate from emotional support', () => {
    expect(getHumanSupportResources('immediate').map((item) => item.id)).toEqual(['israel-police', 'magen-david-adom']);
    expect(getHumanSupportResources('urgent_support').map((item) => item.id)).toEqual(['eran', 'natal']);
    expect(getHumanSupportResources('non_emergency').map((item) => item.id)).toEqual(['health-funds', 'international-directory']);
  });

  it('uses the official Israeli emergency and ERAN phone numbers', () => {
    const channelLabels = ISRAEL_HUMAN_SUPPORT_DIRECTORY.flatMap((resource) => resource.channels.map((channel) => channel.label));
    expect(channelLabels).toContain('100');
    expect(channelLabels).toContain('101');
    expect(channelLabels).toContain('1201');
  });
});
