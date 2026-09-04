import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { translations } from '../../src/components/i18n/translations.jsx';
import { applyStageBUiTranslations } from '../../src/components/i18n/stageBUiTranslations.js';
import { getLegalCopy } from '../../src/components/legal/legalContent.js';

const read = (path) => readFileSync(path, 'utf8');
const languages = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];

function getNested(root, path) {
  return path.split('.').reduce((value, part) => value?.[part], root);
}

applyStageBUiTranslations(translations);

describe('Stage A multilingual completion', () => {
  it('provides privacy, terms, and AI consent in every supported language', () => {
    for (const language of languages) {
      const copy = getLegalCopy(language);
      expect(copy.language, language).toBe(language);
      expect(copy.privacy.title, language).toBeTruthy();
      expect(copy.privacy.sections.length, language).toBeGreaterThanOrEqual(8);
      expect(copy.terms.title, language).toBeTruthy();
      expect(copy.terms.sections.length, language).toBeGreaterThanOrEqual(8);
      expect(copy.consent.acknowledgement, language).toBeTruthy();
      expect(copy.consent.accept, language).toBeTruthy();
    }
    expect(getLegalCopy('he').direction).toBe('rtl');
  });

  it('localizes registration, login, consent, and account deletion controls', () => {
    const keys = [
      'auth.login.title',
      'auth.register.title',
      'auth.social.continue_with',
      'auth.otp.title',
      'consent.account_verify_error',
      'consent.save_error',
      'settings.account.delete_confirm_title',
      'settings.account.delete_confirm_description',
      'settings.account.delete_confirm_button',
      'settings.account.delete_error',
    ];

    for (const language of languages) {
      const root = translations[language]?.translation;
      for (const key of keys) {
        const value = getNested(root, key);
        expect(typeof value, `${language}:${key}`).toBe('string');
        expect(value.trim().length, `${language}:${key}`).toBeGreaterThan(2);
      }
    }
  });
});

describe('Stage B usability contracts', () => {
  it('keeps onboarding short, personalized, four-step, and persistence-safe', () => {
    const source = read('src/components/onboarding/WelcomeWizard.jsx');
    expect(source).toContain('step === 1');
    expect(source).toContain('step === 2');
    expect(source).toContain('step === 3');
    expect(source).toContain('step === 4');
    expect(source).toContain('focus_areas');
    expect(source).toContain('onboarding_mood');
    expect(source).toContain('support_style');
    expect(source).toContain('await updateUserMutation.mutateAsync');
    expect(source.indexOf('await updateUserMutation.mutateAsync')).toBeLessThan(source.indexOf('onComplete?.()'));
  });

  it('shows the three-part daily path before secondary home content', () => {
    const home = read('src/pages/Home.jsx');
    const dailyPath = read('src/components/home/DailyPath.jsx');
    expect(home).toContain('<DailyPath');
    expect(dailyPath).toContain("daily_path.checkin");
    expect(dailyPath).toContain("daily_path.coach");
    expect(dailyPath).toContain("daily_path.action");
    expect(dailyPath).toContain('hasRecommendedExercise');
  });

  it('uses the same five primary destinations on desktop, tablet, and mobile', () => {
    const files = [
      'src/components/layout/Sidebar.jsx',
      'src/components/layout/BottomNav.jsx',
      'src/components/layout/MobileMenu.jsx',
    ];
    for (const path of files) {
      const source = read(path);
      for (const page of ['Home', 'Chat', 'MyPath', 'Journal', 'Tools']) {
        expect(source, `${path}:${page}`).toContain(`page: '${page}'`);
      }
    }
    expect(read('src/pages/MyPath.jsx')).toContain("my_path.title");
    expect(read('src/pages/Tools.jsx')).toContain("tools_hub.title");
  });

  it('starts desktop chat collapsed and keeps one calm intent and summary action', () => {
    const chat = read('src/pages/Chat.jsx');
    const summary = read('src/components/chat/SessionSummary.jsx');
    expect(chat).toContain('useState(true)');
    expect(chat).toContain('chat-intent-chooser');
    expect(chat).toContain("chat_stage.intent.unload");
    expect(chat).toContain("chat_stage.intent.practical");
    expect(chat).toContain("chat_stage.queue_hint");
    expect(summary).toContain('suggestedExercises[0]');
    expect(summary).toContain("chat_stage.summary.understood");
    expect(summary).toContain("chat_stage.summary.practice");
    expect(summary).toContain("chat_stage.summary.return");
  });

  it('localizes all new Stage B surfaces in every supported language', () => {
    const keys = [
      'onboarding.focus.title',
      'onboarding.mood.title',
      'onboarding.support.title',
      'onboarding.first.title',
      'onboarding.step_label',
      'daily_path.title',
      'nav_stage.home',
      'nav_stage.coach',
      'nav_stage.my_path',
      'nav_stage.journal',
      'nav_stage.tools',
      'chat_stage.intent.unload',
      'chat_stage.intent.practical',
      'chat_stage.summary.understood',
      'chat_stage.summary.practice',
      'chat_stage.summary.return',
    ];

    for (const language of languages) {
      const root = translations[language]?.translation;
      for (const key of keys) {
        const value = getNested(root, key);
        expect(typeof value, `${language}:${key}`).toBe('string');
        expect(value.trim().length, `${language}:${key}`).toBeGreaterThan(2);
      }
    }
  });
});
