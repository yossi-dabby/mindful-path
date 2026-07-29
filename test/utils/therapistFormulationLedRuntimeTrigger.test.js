import { describe, it, expect } from 'vitest';

import {
  buildRuntimeFormulationLedSupplement,
  buildRuntimeSafetySupplement,
  matchRuntimeFormulationLedIntent,
  FORMULATION_LED_RUNTIME_TRIGGER_LOCALES,
} from '../../src/lib/workflowContextInjector.js';

import {
  CBT_THERAPIST_WIRING_HYBRID,
  CBT_THERAPIST_WIRING_STAGE2_V1,
  CBT_THERAPIST_WIRING_STAGE2_V2,
  CBT_THERAPIST_WIRING_STAGE2_V3,
  CBT_THERAPIST_WIRING_STAGE2_V4,
  CBT_THERAPIST_WIRING_STAGE2_V5,
  CBT_THERAPIST_WIRING_STAGE2_V6,
  CBT_THERAPIST_WIRING_STAGE2_V6_LED,
  CBT_THERAPIST_WIRING_STAGE2_V7,
} from '../../src/api/agentWiring.js';

const CASES = Object.freeze({
  en: Object.freeze({
    formulationDeepening: "You know the story, but you don't understand me. What is missing from the formulation?",
    understandBeforeExercise: "Please understand what is happening before deciding what to do. Don't give me an exercise yet.",
    greeting: 'Hello there',
    ordinaryTherapy: 'I feel stressed about work and want help thinking through my week.',
    singleKeyword: 'meaning',
  }),
  he: Object.freeze({
    formulationDeepening: 'אני מרגיש/ה שאתם כבר יודעים את הסיפור אבל לא באמת מבינים אותי. מה חסר בפורמולציה?',
    understandBeforeExercise: 'בבקשה תבינו אותי לפני שמתערבים. אל תציעו תרגיל עדיין.',
    greeting: 'שלום',
    ordinaryTherapy: 'אני לחוץ/ה מהעבודה ורוצה לדבר על השבוע שלי.',
    singleKeyword: 'משמעות',
  }),
  es: Object.freeze({
    formulationDeepening: 'Conoces la historia, pero no me entiendes. ¿Qué falta en la formulación?',
    understandBeforeExercise: 'Entiéndeme antes de intervenir. No me des un ejercicio todavía.',
    greeting: 'Hola',
    ordinaryTherapy: 'Me siento estresado por el trabajo y quiero hablar de mi semana.',
    singleKeyword: 'significado',
  }),
  fr: Object.freeze({
    formulationDeepening: "Tu connais l'histoire, mais tu ne me comprends pas. Qu'est-ce qui manque dans la formulation ?",
    understandBeforeExercise: "Comprends-moi avant d'intervenir. Ne me donne pas encore d'exercice.",
    greeting: 'Bonjour',
    ordinaryTherapy: 'Je me sens stressé par le travail et je veux parler de ma semaine.',
    singleKeyword: 'sens',
  }),
  de: Object.freeze({
    formulationDeepening: 'Du kennst die Geschichte, aber verstehst mich nicht. Was fehlt in der Formulierung?',
    understandBeforeExercise: 'Versteh mich bevor du eingreifst. Gib mir noch keine Übung.',
    greeting: 'Hallo',
    ordinaryTherapy: 'Ich bin wegen der Arbeit gestresst und möchte über meine Woche sprechen.',
    singleKeyword: 'bedeutung',
  }),
  it: Object.freeze({
    formulationDeepening: 'Conosci la storia, ma non mi capisci. Cosa manca nella formulazione?',
    understandBeforeExercise: 'Capiscimi prima di intervenire. Non darmi ancora un esercizio.',
    greeting: 'Ciao',
    ordinaryTherapy: 'Mi sento stressato per il lavoro e voglio parlare della mia settimana.',
    singleKeyword: 'significato',
  }),
  pt: Object.freeze({
    formulationDeepening: 'Você conhece a história, mas não me entende. O que falta na formulação?',
    understandBeforeExercise: 'Me entenda antes de intervir. Não me dê um exercício ainda.',
    greeting: 'Olá',
    ordinaryTherapy: 'Estou estressado com o trabalho e quero falar sobre a minha semana.',
    singleKeyword: 'exercício',
  }),
});

const ALL_LOCALES = Object.freeze(Object.keys(CASES));

function buildSelectedRuntimeSupplement(wiring, messageText, locale, options = {}) {
  const safety = buildRuntimeSafetySupplement(wiring, messageText, locale);
  const formulation = safety === null
    ? buildRuntimeFormulationLedSupplement(wiring, messageText, locale, options)
    : null;

  return Object.freeze({
    safety,
    formulation,
    combined: safety ?? formulation,
  });
}

describe('Phase 10.1 — multilingual formulation-led runtime trigger coverage', () => {
  it('covers every supported user-facing app locale', () => {
    expect(FORMULATION_LED_RUNTIME_TRIGGER_LOCALES).toEqual(ALL_LOCALES);
  });

  it('fails closed for an unknown locale', () => {
    expect(
      buildRuntimeFormulationLedSupplement(
        CBT_THERAPIST_WIRING_STAGE2_V6_LED,
        CASES.en.formulationDeepening,
        'zz',
      )
    ).toBeNull();
  });

  it('returns only safe metadata from the deterministic matcher', () => {
    const match = matchRuntimeFormulationLedIntent(CASES.en.formulationDeepening, 'en');
    expect(match).toEqual({ locale: 'en', trigger_key: 'missing_formulation' });
    expect(Object.keys(match || {})).toEqual(['locale', 'trigger_key']);
  });

  for (const locale of ALL_LOCALES) {
    const scenario = CASES[locale];

    it(`${locale}: activates for formulation-deepening requests`, () => {
      const result = buildRuntimeFormulationLedSupplement(
        CBT_THERAPIST_WIRING_STAGE2_V6_LED,
        scenario.formulationDeepening,
        locale,
      );
      expect(typeof result).toBe('string');
      expect(result).toContain('FORMULATION-LED TURN PRIORITY');
      expect(result).not.toContain(scenario.formulationDeepening);
    });

    it(`${locale}: activates for understand-before-exercise requests`, () => {
      const result = buildRuntimeFormulationLedSupplement(
        CBT_THERAPIST_WIRING_STAGE2_V6_LED,
        scenario.understandBeforeExercise,
        locale,
      );
      expect(typeof result).toBe('string');
      expect(result).toContain('Do not assign or push an exercise yet');
      expect(result).not.toContain(scenario.understandBeforeExercise);
    });

    it(`${locale}: greeting does not activate`, () => {
      expect(
        buildRuntimeFormulationLedSupplement(
          CBT_THERAPIST_WIRING_STAGE2_V6_LED,
          scenario.greeting,
          locale,
        )
      ).toBeNull();
    });

    it(`${locale}: ordinary therapy message does not activate`, () => {
      expect(
        buildRuntimeFormulationLedSupplement(
          CBT_THERAPIST_WIRING_STAGE2_V6_LED,
          scenario.ordinaryTherapy,
          locale,
        )
      ).toBeNull();
    });

    it(`${locale}: broad single keyword does not activate`, () => {
      expect(
        buildRuntimeFormulationLedSupplement(
          CBT_THERAPIST_WIRING_STAGE2_V6_LED,
          scenario.singleKeyword,
          locale,
        )
      ).toBeNull();
    });

    it(`${locale}: Safety Mode override suppresses the formulation-led supplement`, () => {
      const result = buildSelectedRuntimeSupplement(
        CBT_THERAPIST_WIRING_STAGE2_V6_LED,
        `I feel completely hopeless. ${scenario.understandBeforeExercise}`,
        locale,
      );
      expect(result.safety).not.toBeNull();
      expect(result.formulation).toBeNull();
      expect(result.combined).toBe(result.safety);
    });

    it(`${locale}: HYBRID, V1-V5, and V6 context-only remain inactive`, () => {
      const wirings = [
        CBT_THERAPIST_WIRING_HYBRID,
        CBT_THERAPIST_WIRING_STAGE2_V1,
        CBT_THERAPIST_WIRING_STAGE2_V2,
        CBT_THERAPIST_WIRING_STAGE2_V3,
        CBT_THERAPIST_WIRING_STAGE2_V4,
        CBT_THERAPIST_WIRING_STAGE2_V5,
      ];

      for (const wiring of wirings) {
        expect(
          buildRuntimeFormulationLedSupplement(wiring, scenario.formulationDeepening, locale)
        ).toBeNull();
      }

      expect(
        buildRuntimeFormulationLedSupplement(
          CBT_THERAPIST_WIRING_STAGE2_V6,
          scenario.formulationDeepening,
          locale,
          { _formulationLedEnabled: false },
        )
      ).toBeNull();
    });

    it(`${locale}: V6-LED and higher effective formulation-led paths remain active`, () => {
      expect(
        buildRuntimeFormulationLedSupplement(
          CBT_THERAPIST_WIRING_STAGE2_V6_LED,
          scenario.formulationDeepening,
          locale,
        )
      ).toContain('FORMULATION-LED TURN PRIORITY');

      expect(
        buildRuntimeFormulationLedSupplement(
          CBT_THERAPIST_WIRING_STAGE2_V7,
          scenario.understandBeforeExercise,
          locale,
          { _formulationLedEnabled: true },
        )
      ).toContain('FORMULATION-LED TURN PRIORITY');
    });
  }
});
