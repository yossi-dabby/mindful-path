import { describe, expect, it } from 'vitest';

import {
  THERAPEUTIC_FORMS_CONTENT_AVAILABLE,
  THERAPEUTIC_FORMS_CONTENT_STATUS,
  getTherapeuticFormsAvailabilityCopy,
} from '../../src/data/therapeuticForms/availability.js';
import {
  THERAPEUTIC_FORMS_CATALOG,
} from '../../src/data/therapeuticForms/index.js';
import { resolveFormIntentRequest } from '../../src/utils/resolveFormIntent.js';

describe('therapeutic forms under-revision mode', () => {
  it('keeps localized status copy for every supported application language', () => {
    for (const language of ['en', 'he', 'es', 'fr', 'de', 'it', 'pt']) {
      const copy = getTherapeuticFormsAvailabilityCopy(language);
      expect(copy.title).toBeTruthy();
      expect(copy.message).toBeTruthy();
      expect(copy.aiMessage).toBeTruthy();
    }
  });

  it('keeps metadata-only catalog entries without file locations', () => {
    expect(THERAPEUTIC_FORMS_CONTENT_AVAILABLE).toBe(false);
    expect(THERAPEUTIC_FORMS_CONTENT_STATUS).toBe('under_revision');
    expect(THERAPEUTIC_FORMS_CATALOG.length).toBeGreaterThan(0);

    for (const entry of THERAPEUTIC_FORMS_CATALOG) {
      expect(entry.approved).toBe(false);
      expect(entry.contentStatus).toBe('under_revision');
      expect(entry.fileUrl).toBeUndefined();
      expect(entry.filePath).toBeUndefined();
      expect(entry.file_url).toBeUndefined();
      expect(entry.file_path).toBeUndefined();
      expect(entry.languages).toBeUndefined();
    }
  });

  it('never attaches or exposes a form file while content is under review', () => {
    const result = resolveFormIntentRequest('Please send me a CBT worksheet for a teenager', {
      language: 'en',
      audience: 'adolescents',
    });

    expect(result.intent).toBeTruthy();
    expect(result.contentStatus).toBe('under_revision');
    expect(result.generatedFile).toBeNull();
    expect(result.generatedFiles).toEqual([]);
    expect(result.matches).toEqual([]);
    expect(result.responseText).toContain('under review');
  });
});
