import fs from 'node:fs';
import path from 'node:path';
import { test, expect, type Page } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

type FormIndexEntry = {
  id: string;
  approved: boolean;
  language?: string;
  category?: string;
  audience?: string;
  collectionId?: string;
  title?: string;
  description?: string;
  fileUrl?: string;
  filePath?: string;
  languages?: Record<string, { title?: string; description?: string }>;
};

type GeneratedFile = {
  type: 'pdf';
  url: string;
  name: string;
  title: string;
  description: string | null;
  form_id: string;
  audience: string | null;
  category: string | null;
  language: string;
};

const FORMS_INDEX: FormIndexEntry[] = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'src/generated/therapeutic-forms-index.json'),
    'utf8',
  ),
);

const MULTI_FORM_CAPABILITY_RESPONSE_HE =
  'כן. אני יכול לשלוח כמה טפסים יחד, עד 5 טפסים בתגובה אחת. אם יש קובץ מאוחד מתאים, אעדיף לשלוח אותו במקום להציף בכמה קבצים.';

function findForm(predicate: (form: FormIndexEntry) => boolean, label: string): FormIndexEntry {
  const form = FORMS_INDEX.find((entry) => entry.approved === true && predicate(entry));
  if (!form) {
    throw new Error(`Missing form fixture for ${label}`);
  }
  return form;
}

function toGeneratedFile(form: FormIndexEntry): GeneratedFile {
  if (!form.fileUrl) throw new Error(`Form "${form.id}" is missing fileUrl`);
  const language = String(form.language || 'en').toLowerCase();
  const localized = form.languages?.[language];
  const title = localized?.title || form.title || form.id;
  const description = localized?.description || form.description || null;
  const basename = path.basename(form.filePath || form.fileUrl);
  return {
    type: 'pdf',
    url: form.fileUrl,
    name: basename || `${form.id}.pdf`,
    title,
    description,
    form_id: form.id,
    audience: form.audience || null,
    category: form.category || null,
    language,
  };
}

const HEBREW_SEPARATION_FORMS = FORMS_INDEX
  .filter((form) => form.approved === true)
  .filter((form) => form.language === 'he')
  .filter((form) => form.category === 'children_cbt_specialized')
  .filter((form) => {
    const payload = JSON.stringify(form);
    return payload.includes('חרדת פרידה') || payload.toLowerCase().includes('separation anxiety');
  })
  .slice(0, 5);

if (HEBREW_SEPARATION_FORMS.length < 2) {
  throw new Error('Expected at least two Hebrew children separation-anxiety forms in generated index');
}

const HEBREW_PRIMARY_FORM = HEBREW_SEPARATION_FORMS[0];
const HEBREW_EXACT_TITLE_FORM = HEBREW_SEPARATION_FORMS[0];
const HEBREW_CLINICAL_FORM = HEBREW_SEPARATION_FORMS[1];
const ENGLISH_ANXIETY_FORM = findForm(
  (form) => form.language === 'en' && form.category === 'children_cbt_specialized' && /anxiety/i.test(JSON.stringify(form)),
  'english anxiety specialized form',
);

const HEBREW_EXACT_TITLE = HEBREW_EXACT_TITLE_FORM.languages?.he?.title || HEBREW_EXACT_TITLE_FORM.title || HEBREW_EXACT_TITLE_FORM.id;

function buildAssistantTurn(rawContent: string) {
  if (rawContent.includes('האם אתה יכול לשלוח מספר טפסים במקביל או רק טופס אחד בכל פעם')) {
    return {
      role: 'assistant' as const,
      content: MULTI_FORM_CAPABILITY_RESPONSE_HE,
      metadata: {},
    };
  }

  if (rawContent.includes(HEBREW_EXACT_TITLE)) {
    const generated = toGeneratedFile(HEBREW_EXACT_TITLE_FORM);
    return {
      role: 'assistant' as const,
      content: `כמובן, מצאתי עבורך את "${generated.title}".`,
      metadata: { generated_file: generated },
    };
  }

  if (rawContent.includes('ילד עם חרדת פרידה שמתקשה להיפרד מההורה')) {
    const generated = toGeneratedFile(HEBREW_CLINICAL_FORM);
    return {
      role: 'assistant' as const,
      content: 'מצאתי טופס מתאים לפי הצורך הקליני שתיארת.',
      metadata: { generated_file: generated },
    };
  }

  if (rawContent.includes('Send me a CBT worksheet for a child with anxiety.')) {
    const generated = toGeneratedFile(ENGLISH_ANXIETY_FORM);
    return {
      role: 'assistant' as const,
      content: 'Sure — here is an English CBT worksheet for child anxiety.',
      metadata: { generated_file: generated },
    };
  }

  if (rawContent.includes('שלח לי כמה טפסים לילד עם חרדת פרידה')) {
    const generatedFiles = HEBREW_SEPARATION_FORMS.slice(0, 3).map(toGeneratedFile);
    return {
      role: 'assistant' as const,
      content: 'הכנתי כמה טפסים מתאימים.',
      metadata: {
        generated_files: generatedFiles,
      },
    };
  }

  if (
    rawContent.includes('שלח לי טופס לילד עם חרדה בעברית') ||
    rawContent.includes('שלח לי טופס CBT לילד בעברית') ||
    rawContent.includes('שלח לי טופס מתוך CBT ייעודי לילדים על חרדת פרידה')
  ) {
    const generated = toGeneratedFile(HEBREW_PRIMARY_FORM);
    return {
      role: 'assistant' as const,
      content: 'בשמחה, הנה טופס בעברית שמתאים לבקשה שלך.',
      metadata: { generated_file: generated },
    };
  }

  const fallback = toGeneratedFile(HEBREW_PRIMARY_FORM);
  return {
    role: 'assistant' as const,
    content: 'מצאתי טופס שמתאים לבקשה שלך.',
    metadata: { generated_file: fallback },
  };
}

async function setupChatWithLanguage(page: Page, language: 'en' | 'he') {
  await page.addInitScript((lang: 'en' | 'he') => {
    localStorage.setItem('language', lang);
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  }, language);

  await mockApi(page);

  const state = {
    conversationMessages: [
      {
        role: 'assistant' as const,
        content: language === 'he' ? 'שלום, איך אפשר לעזור?' : 'Hi, how can I help?',
        metadata: {},
      },
    ] as Array<{ role: 'user' | 'assistant'; content: string; metadata?: Record<string, unknown> }>,
    messageCounts: [1] as number[],
  };

  const postMessagePattern = /\/agents\/conversations\/v2\/[^/]+\/messages(?:\?|$)/i;
  await page.route('**/api/**/agents/conversations/v2/**/messages**', async (route) => {
    const request = route.request();
    const url = request.url();
    if (request.method() !== 'POST' || !postMessagePattern.test(url)) {
      await route.fallback();
      return;
    }

    const body = request.postDataJSON?.() as { content?: string } | undefined;
    const content = String(body?.content || '');
    const assistantTurn = buildAssistantTurn(content);
    state.conversationMessages.push({ role: 'user', content, metadata: {} });
    state.conversationMessages.push(assistantTurn);
    state.messageCounts.push(state.conversationMessages.length);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user_message: {
          role: 'user',
          content,
          metadata: {},
          created_date: new Date().toISOString(),
        },
        assistant_message: {
          role: 'assistant',
          content: assistantTurn.content,
          metadata: assistantTurn.metadata || {},
          created_date: new Date().toISOString(),
        },
        messages: state.conversationMessages,
        created_date: new Date().toISOString(),
      }),
    });
  });

  const getConversationPattern = /\/agents\/conversations\/(?!v2\/)[^/?#]+(?:\?|$)/i;
  await page.route('**/api/**/agents/conversations/**', async (route) => {
    const request = route.request();
    const url = request.url();
    if (request.method() !== 'GET' || !getConversationPattern.test(url)) {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-conversation-123',
        agent_name: 'cbt_therapist',
        metadata: { name: 'Therapeutic forms test', description: 'E2E awareness coverage' },
        messages: state.conversationMessages,
        created_date: new Date().toISOString(),
      }),
    });
  });

  return state;
}

async function sendChatMessage(page: Page, message: string) {
  const input = page.locator('[data-testid="therapist-chat-input"]');
  const send = page.locator('[data-testid="therapist-chat-send"]');
  await expect(input).toBeVisible({ timeout: 15000 });
  await input.fill(message);
  await expect(send).toBeEnabled({ timeout: 15000 });
  await send.click();
}

async function openChat(page: Page) {
  await spaNavigate(page, '/Chat');
  await expect(page.locator('[data-testid="therapist-chat-input"]')).toBeVisible({ timeout: 15000 });
}

test.describe('Therapeutic forms awareness — Playwright E2E', () => {
  test('Hebrew first-message single-form request', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await setupChatWithLanguage(page, 'he');
    await openChat(page);

    await sendChatMessage(page, 'שלח לי טופס לילד עם חרדה בעברית');

    await expect(page.getByText('Message send failed')).toHaveCount(0);
    await expect(page.locator('[data-testid="generated-file-card"]').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="generated-file-open"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="generated-file-download"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="generated-file-card"][data-language="he"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="generated-file-card"][data-language="en"]')).toHaveCount(0);
    expect(consoleErrors.some((entry) => entry.includes('Message content is too long'))).toBe(false);
  });

  test('Hebrew first-message multi-form request', async ({ page }) => {
    await setupChatWithLanguage(page, 'he');
    await openChat(page);

    await sendChatMessage(page, 'שלח לי כמה טפסים לילד עם חרדת פרידה');

    await expect(page.getByText('Message send failed')).toHaveCount(0);
    await expect(page.locator('[data-testid="generated-file-card"]').first()).toBeVisible({ timeout: 15000 });
    const cardCount = await page.locator('[data-testid="generated-file-card"]').count();
    expect(cardCount).toBeGreaterThan(1);
    expect(cardCount).toBeLessThanOrEqual(5);
    await expect(page.locator('[data-testid="generated-file-card"][data-language="en"]')).toHaveCount(0);
    expect(await page.locator('[data-testid="generated-file-card"][data-language="he"]').count()).toBe(cardCount);
  });

  test('Capability question (multi-form supported up to 5)', async ({ page }) => {
    await setupChatWithLanguage(page, 'he');
    await openChat(page);

    await sendChatMessage(page, 'האם אתה יכול לשלוח מספר טפסים במקביל או רק טופס אחד בכל פעם');

    await expect(page.getByText('Message send failed')).toHaveCount(0);
    await expect(page.getByText('עד 5 טפסים בתגובה אחת')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('רק טופס אחד')).toHaveCount(0);
  });

  test('English language isolation', async ({ page }) => {
    await setupChatWithLanguage(page, 'en');
    await openChat(page);

    await sendChatMessage(page, 'Send me a CBT worksheet for a child with anxiety.');

    await expect(page.locator('[data-testid="generated-file-card"][data-language="en"]').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="generated-file-card"][data-language="he"]')).toHaveCount(0);
  });

  test('Hebrew language isolation', async ({ page }) => {
    await setupChatWithLanguage(page, 'he');
    await openChat(page);

    await sendChatMessage(page, 'שלח לי טופס CBT לילד בעברית');

    await expect(page.locator('[data-testid="generated-file-card"][data-language="he"]').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid="generated-file-card"][data-language="en"]')).toHaveCount(0);
  });

  test('Exact-title lookup for approved Hebrew children specialized form', async ({ page }) => {
    await setupChatWithLanguage(page, 'he');
    await openChat(page);

    await sendChatMessage(page, `שלח לי את הטופס ${HEBREW_EXACT_TITLE}`);

    const card = page.locator('[data-testid="generated-file-card"]').first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(card).toContainText(HEBREW_EXACT_TITLE);
    await expect(page.locator('[data-testid="generated-file-card"][data-language="he"]').first()).toBeVisible();
  });

  test('Clinical metadata lookup', async ({ page }) => {
    await setupChatWithLanguage(page, 'he');
    await openChat(page);

    await sendChatMessage(page, 'ילד עם חרדת פרידה שמתקשה להיפרד מההורה');

    const card = page.locator('[data-testid="generated-file-card"]').first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(card).toContainText(toGeneratedFile(HEBREW_CLINICAL_FORM).title);
    await expect(page.locator('[data-testid="generated-file-card"][data-language="he"]').first()).toBeVisible();
  });

  test('Forms Library to Chat parity for CBT ייעודי לילדים collection', async ({ page }) => {
    await setupChatWithLanguage(page, 'he');
    await spaNavigate(page, '/TherapeuticForms');
    await expect(page.getByText('CBT ייעודי לילדים')).toBeVisible({ timeout: 15000 });

    await openChat(page);
    await sendChatMessage(page, 'שלח לי טופס מתוך CBT ייעודי לילדים על חרדת פרידה');

    const card = page.locator('[data-testid="generated-file-card"]').first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(card).toContainText('פרידה');
    await expect(page.locator('[data-testid="generated-file-card"][data-language="he"]').first()).toBeVisible();
  });

  test('Conversation mock preserves accumulated history', async ({ page }) => {
    const state = await setupChatWithLanguage(page, 'he');
    await openChat(page);
    await sendChatMessage(page, 'שלח לי טופס לילד עם חרדה בעברית');
    await expect(page.locator('[data-testid="generated-file-card"]').first()).toBeVisible({ timeout: 15000 });
    await sendChatMessage(page, 'שלח לי כמה טפסים לילד עם חרדת פרידה');
    await expect(page.locator('[data-testid="generated-file-card"]').first()).toBeVisible({ timeout: 15000 });
    const counts = state.messageCounts;
    for (let index = 1; index < counts.length; index += 1) {
      expect(counts[index]).toBeGreaterThanOrEqual(counts[index - 1]);
    }
  });
});
