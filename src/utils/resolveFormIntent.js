/**
 * @file src/utils/resolveFormIntent.js
 *
 * TherapeuticForms Phase 4B — Expanded AI Form Intent Resolver
 *
 * This module is the ONLY path through which the AI chat assistant may attach
 * a TherapeuticForms library file to a message.
 *
 * SAFETY CONTRACT
 * ---------------
 * - Never accepts arbitrary URLs from the model.
 * - Only returns forms that are `approved: true` in the TherapeuticForms registry.
 * - Only returns forms that have a valid, non-empty `file_url`.
 * - All resolution goes through `resolveFormWithLanguage` + `toGeneratedFileMetadata`
 *   from the TherapeuticForms resolver — no URL construction outside the registry.
 * - Returns null instead of fabricating anything.
 * - Language resolution is strict exact-match by default (no implicit fallback);
 *   explicit language requests are handled only where a resolver supports them.
 * - Hebrew RTL metadata is preserved by the underlying resolver.
 *
 * APPROVED INTENT MAP (Phase 4B)
 * --------------------------------
 * Maps intent families to all currently approved forms across all audiences.
 * Audience-specific forms (children / adolescents) require audience-specific
 * alias wording — generic aliases are intentionally omitted to prevent
 * age-inappropriate form delivery.
 *
 * AUDIENCE POLICY
 * ---------------
 * Children / adolescent forms MUST NOT be sent unless the audience is
 * explicitly known. Aliases for these forms require child/teen/adolescent
 * wording to guard against accidental delivery to adult users.
 *
 * This module is imported by src/components/utils/validateAgentOutput.jsx
 * and is designed to be test-importable (no browser globals required).
 */

import {
  resolveFormWithLanguage,
  toGeneratedFileMetadata,
  ALL_FORMS,
} from '../data/therapeuticForms/index.js';
import { FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL } from '../data/therapeuticForms/forms.adolescents.cbt-core.en.js';

// ─── Approved intent → form ID map ───────────────────────────────────────────
//
// Each key is a canonical intent slug.  Values are exact form IDs from the
// TherapeuticForms registry.  Only approved forms with real file assets may
// appear here.
//
// Adding a new intent: add one entry here and ensure the form has approved: true
// and valid file_url values in the registry before enabling.

export const APPROVED_FORM_INTENT_MAP = Object.freeze({
  // ── Adults: Thought Records / CBT worksheets ───────────────────────────────
  'tf-adults-cbt-thought-record':                    'tf-adults-cbt-thought-record',
  'adults-cbt-thought-record':                       'tf-adults-cbt-thought-record',
  'cbt-thought-record':                              'tf-adults-cbt-thought-record',
  'thought-record':                                  'tf-adults-cbt-thought-record',
  // Hebrew title alias — normalised to lowercase by resolveFormIntent
  'רשומת מחשבות cbt':                               'tf-adults-cbt-thought-record',
  'registro dei pensieri cbt':                      'tf-adults-cbt-thought-record',
  'registro de pensamentos cbt':                    'tf-adults-cbt-thought-record',

  // ── Adults: Behavioral Activation ─────────────────────────────────────────
  'tf-adults-behavioral-activation-plan':            'tf-adults-behavioral-activation-plan',
  'adults-behavioral-activation-plan':               'tf-adults-behavioral-activation-plan',
  'behavioral-activation-plan':                      'tf-adults-behavioral-activation-plan',
  'behavioral-activation':                           'tf-adults-behavioral-activation-plan',

  // ── Adults: Cognitive Distortions ─────────────────────────────────────────
  'tf-adults-cognitive-distortions-worksheet':       'tf-adults-cognitive-distortions-worksheet',
  'adults-cognitive-distortions-worksheet':          'tf-adults-cognitive-distortions-worksheet',
  'cognitive-distortions-worksheet':                 'tf-adults-cognitive-distortions-worksheet',
  'cognitive-distortions':                           'tf-adults-cognitive-distortions-worksheet',
  'thinking-traps':                                  'tf-adults-cognitive-distortions-worksheet',
  'distorted-thinking':                              'tf-adults-cognitive-distortions-worksheet',
  'scheda sulle distorsioni cognitive':              'tf-adults-cognitive-distortions-worksheet',
  'ficha sobre distorções cognitivas':               'tf-adults-cognitive-distortions-worksheet',

  // ── Adults: Values & Goals ─────────────────────────────────────────────────
  'tf-adults-values-and-goals-worksheet':            'tf-adults-values-and-goals-worksheet',
  'adults-values-and-goals-worksheet':               'tf-adults-values-and-goals-worksheet',
  'values-and-goals-worksheet':                      'tf-adults-values-and-goals-worksheet',
  'values-and-goals':                                'tf-adults-values-and-goals-worksheet',
  'goal-setting':                                    'tf-adults-values-and-goals-worksheet',
  'values-worksheet':                                'tf-adults-values-and-goals-worksheet',

  // ── Adults: Mood Tracking ──────────────────────────────────────────────────
  'tf-adults-mood-tracking-sheet':                   'tf-adults-mood-tracking-sheet',
  'adults-mood-tracking-sheet':                      'tf-adults-mood-tracking-sheet',
  'mood-tracking-sheet':                             'tf-adults-mood-tracking-sheet',
  'mood-tracking':                                   'tf-adults-mood-tracking-sheet',
  'mood-tracker':                                    'tf-adults-mood-tracking-sheet',
  'track-my-mood':                                   'tf-adults-mood-tracking-sheet',

  // ── Adults: Weekly Coping Plan ────────────────────────────────────────────
  'tf-adults-weekly-coping-plan':                    'tf-adults-weekly-coping-plan',
  'adults-weekly-coping-plan':                       'tf-adults-weekly-coping-plan',
  'weekly-coping-plan':                              'tf-adults-weekly-coping-plan',
  'weekly-coping':                                   'tf-adults-weekly-coping-plan',
  'coping-plan':                                     'tf-adults-weekly-coping-plan',
  'weekly-plan':                                     'tf-adults-weekly-coping-plan',

  // ── Older Adults: Mood Reflection ─────────────────────────────────────────
  'tf-older-adults-mood-reflection-sheet':           'tf-older-adults-mood-reflection-sheet',
  'older-adults-mood-reflection-sheet':              'tf-older-adults-mood-reflection-sheet',
  'mood-reflection-sheet':                           'tf-older-adults-mood-reflection-sheet',
  'mood-reflection':                                 'tf-older-adults-mood-reflection-sheet',
  'reflection-sheet':                                'tf-older-adults-mood-reflection-sheet',

  // ── Older Adults: Sleep Routine Reflection ────────────────────────────────
  'tf-older-adults-sleep-routine-reflection':        'tf-older-adults-sleep-routine-reflection',
  'older-adults-sleep-routine-reflection':           'tf-older-adults-sleep-routine-reflection',
  'sleep-routine-reflection':                        'tf-older-adults-sleep-routine-reflection',
  'sleep-routine':                                   'tf-older-adults-sleep-routine-reflection',
  'sleep-reflection':                                'tf-older-adults-sleep-routine-reflection',

  // ── Older Adults: Daily Coping Plan ──────────────────────────────────────
  'tf-older-adults-daily-coping-plan':               'tf-older-adults-daily-coping-plan',
  'older-adults-daily-coping-plan':                  'tf-older-adults-daily-coping-plan',
  'daily-coping-plan':                               'tf-older-adults-daily-coping-plan',
  'daily-coping':                                    'tf-older-adults-daily-coping-plan',

  // ── Older Adults: Caregiver Support Reflection ───────────────────────────
  'tf-older-adults-caregiver-support-reflection':    'tf-older-adults-caregiver-support-reflection',
  'older-adults-caregiver-support-reflection':       'tf-older-adults-caregiver-support-reflection',
  'caregiver-support-reflection':                    'tf-older-adults-caregiver-support-reflection',
  'caregiver-support':                               'tf-older-adults-caregiver-support-reflection',
  'caregiver-reflection':                            'tf-older-adults-caregiver-support-reflection',

  // ── Adolescents: Anxiety Thought Record ──────────────────────────────────
  // Aliases MUST include adolescent/teen wording — generic anxiety terms are not mapped
  'tf-adolescents-anxiety-thought-record':           'tf-adolescents-anxiety-thought-record',
  'adolescents-anxiety-thought-record':              'tf-adolescents-anxiety-thought-record',
  'adolescent-anxiety-thought-record':               'tf-adolescents-anxiety-thought-record',
  'teen-anxiety-worksheet':                          'tf-adolescents-anxiety-thought-record',

  // ── Adolescents: Emotion Regulation ──────────────────────────────────────
  'tf-adolescents-emotion-regulation-worksheet':     'tf-adolescents-emotion-regulation-worksheet',
  'adolescents-emotion-regulation-worksheet':        'tf-adolescents-emotion-regulation-worksheet',
  'teen-emotion-regulation':                         'tf-adolescents-emotion-regulation-worksheet',
  'adolescent-emotion-regulation':                   'tf-adolescents-emotion-regulation-worksheet',
  'adolescent-emotion-worksheet':                    'tf-adolescents-emotion-regulation-worksheet',

  // ── Adolescents: Weekly Practice Planner ─────────────────────────────────
  'tf-adolescents-weekly-practice-planner':          'tf-adolescents-weekly-practice-planner',
  'adolescents-weekly-practice-planner':             'tf-adolescents-weekly-practice-planner',
  'teen-weekly-practice':                            'tf-adolescents-weekly-practice-planner',
  'adolescent-weekly-planner':                       'tf-adolescents-weekly-practice-planner',
  'teen-weekly-planner':                             'tf-adolescents-weekly-practice-planner',

  // ── Adolescents: Social Pressure Coping Tool ─────────────────────────────
  'tf-adolescents-social-pressure-coping-tool':      'tf-adolescents-social-pressure-coping-tool',
  'adolescents-social-pressure-coping-tool':         'tf-adolescents-social-pressure-coping-tool',
  'social-pressure-coping':                          'tf-adolescents-social-pressure-coping-tool',
  'peer-pressure-coping':                            'tf-adolescents-social-pressure-coping-tool',

  // ── Children: Simple Feelings Check-In ───────────────────────────────────
  // Aliases MUST include child/children — generic feeling terms are not mapped
  'tf-children-feelings-checkin':                    'tf-children-feelings-checkin',
  'tf-children-simple-feelings-check-in':            'tf-children-feelings-checkin',
  'children-simple-feelings-check-in':               'tf-children-feelings-checkin',
  'child-feelings-check-in':                         'tf-children-feelings-checkin',
  'children-feelings-check-in':                      'tf-children-feelings-checkin',

  // ── Children: Grounding Exercise ─────────────────────────────────────────
  'tf-children-grounding-exercise':                  'tf-children-grounding-exercise',
  'children-grounding-exercise':                     'tf-children-grounding-exercise',
  'child-grounding':                                 'tf-children-grounding-exercise',
  'grounding-for-children':                          'tf-children-grounding-exercise',

  // ── Children: Parent-Guided Coping Card ──────────────────────────────────
  
  'tf-children-parent-guided-coping-card':           'tf-children-parent-guided-coping-card',
  'children-parent-guided-coping-card':              'tf-children-parent-guided-coping-card',
  'parent-guided-coping':                            'tf-children-parent-guided-coping-card',
  'child-coping-card':                               'tf-children-parent-guided-coping-card',

  // ── Children: Box Breathing ───────────────────────────────────────────────
  'tf-children-box-breathing':                       'tf-children-box-breathing',
  'children-box-breathing':                          'tf-children-box-breathing',
  'child-box-breathing':                             'tf-children-box-breathing',
  'box-breathing-for-children':                      'tf-children-box-breathing',

  // ── Hebrew Premium Workbooks: Formulation & Mapping ───────────────────────
  // AI uses [FORM:adults-formulation-mapping-premium-he:he] marker.
  // Hebrew phrase keys support direct intent resolution when called programmatically.
  'tf-adults-formulation-mapping-premium-he':              'tf-adults-formulation-mapping-premium-he',
  'adults-formulation-mapping-premium-he':                 'tf-adults-formulation-mapping-premium-he',
  'מיפוי':                                                 'tf-adults-formulation-mapping-premium-he',
  'המשגה':                                                 'tf-adults-formulation-mapping-premium-he',
  'מיפוי והמשגה':                                          'tf-adults-formulation-mapping-premium-he',
  'ניסוח מקרה':                                            'tf-adults-formulation-mapping-premium-he',
  'להבין את הבעיה':                                        'tf-adults-formulation-mapping-premium-he',
  'להבין מה קורה לי':                                      'tf-adults-formulation-mapping-premium-he',
  'תמונה כללית של הקושי':                                  'tf-adults-formulation-mapping-premium-he',
  'בירור ראשוני':                                          'tf-adults-formulation-mapping-premium-he',
  'הערכה ראשונית':                                         'tf-adults-formulation-mapping-premium-he',
  'קונטרס מיפוי':                                          'tf-adults-formulation-mapping-premium-he',
  'קונטרס המשגה':                                          'tf-adults-formulation-mapping-premium-he',

  // ── Hebrew Premium Workbooks: Awareness & Identification ──────────────────
  'tf-adults-awareness-identification-premium-he':         'tf-adults-awareness-identification-premium-he',
  'adults-awareness-identification-premium-he':            'tf-adults-awareness-identification-premium-he',
  'זיהוי מחשבות':                                          'tf-adults-awareness-identification-premium-he',
  'זיהוי רגשות':                                           'tf-adults-awareness-identification-premium-he',
  'זיהוי תחושות':                                          'tf-adults-awareness-identification-premium-he',
  'זיהוי התנהגות':                                         'tf-adults-awareness-identification-premium-he',
  'מחשבות רגשות תחושות והתנהגות':                          'tf-adults-awareness-identification-premium-he',
  'ניטור מחשבות':                                          'tf-adults-awareness-identification-premium-he',
  'ניטור רגשות':                                           'tf-adults-awareness-identification-premium-he',
  'יומן מחשבות':                                           'tf-adults-awareness-identification-premium-he',
  'מעקב מחשבות':                                           'tf-adults-awareness-identification-premium-he',
  'להבין מחשבות ורגשות':                                   'tf-adults-awareness-identification-premium-he',
  'קונטרס זיהוי':                                          'tf-adults-awareness-identification-premium-he',

  // ── Hebrew Premium Workbooks: Cognitive Flexibility ───────────────────────
  'tf-adults-cognitive-flexibility-premium-he':            'tf-adults-cognitive-flexibility-premium-he',
  'adults-cognitive-flexibility-premium-he':               'tf-adults-cognitive-flexibility-premium-he',
  'הפרכת מחשבות':                                          'tf-adults-cognitive-flexibility-premium-he',
  'גמישות מחשבתית':                                        'tf-adults-cognitive-flexibility-premium-he',
  'מחשבה מתווכת':                                          'tf-adults-cognitive-flexibility-premium-he',
  'דיבור עצמי':                                            'tf-adults-cognitive-flexibility-premium-he',
  'ערעור מחשבות':                                          'tf-adults-cognitive-flexibility-premium-he',
  'ערעור אמונות':                                          'tf-adults-cognitive-flexibility-premium-he',
  'מחשבות שליליות':                                        'tf-adults-cognitive-flexibility-premium-he',
  'מחשבות אוטומטיות':                                      'tf-adults-cognitive-flexibility-premium-he',
  'בדיקת ראיות':                                           'tf-adults-cognitive-flexibility-premium-he',
  'שאלות סוקרטיות':                                        'tf-adults-cognitive-flexibility-premium-he',
  'פרופורציות':                                            'tf-adults-cognitive-flexibility-premium-he',
  'פרספקטיבה':                                             'tf-adults-cognitive-flexibility-premium-he',
  'קונטרס הפרכת מחשבות':                                   'tf-adults-cognitive-flexibility-premium-he',

  // ── Hebrew Premium Workbooks: Emotional Regulation ────────────────────────
  'tf-adults-emotional-regulation-premium-he':             'tf-adults-emotional-regulation-premium-he',
  'adults-emotional-regulation-premium-he':                'tf-adults-emotional-regulation-premium-he',
  'ויסות רגשי':                                            'tf-adults-emotional-regulation-premium-he',
  'רגשות חזקים':                                           'tf-adults-emotional-regulation-premium-he',
  'פחד':                                                   'tf-adults-emotional-regulation-premium-he',
  'חרדה':                                                  'tf-adults-emotional-regulation-premium-he',
  'עצב':                                                   'tf-adults-emotional-regulation-premium-he',
  'כעס':                                                   'tf-adults-emotional-regulation-premium-he',
  'בושה':                                                  'tf-adults-emotional-regulation-premium-he',
  'אשמה':                                                  'tf-adults-emotional-regulation-premium-he',
  'רגשות מעורבים':                                         'tf-adults-emotional-regulation-premium-he',
  'דחפים':                                                 'tf-adults-emotional-regulation-premium-he',
  'התפרצות':                                               'tf-adults-emotional-regulation-premium-he',
  'הצפה רגשית':                                            'tf-adults-emotional-regulation-premium-he',
  'קונטרס ויסות רגשי':                                     'tf-adults-emotional-regulation-premium-he',

  // ── Hebrew Premium Workbooks: Coping & Change ─────────────────────────────
  'tf-adults-coping-change-premium-he':                    'tf-adults-coping-change-premium-he',
  'adults-coping-change-premium-he':                       'tf-adults-coping-change-premium-he',
  'התמודדות':                                              'tf-adults-coping-change-premium-he',
  'שינוי התנהגות':                                         'tf-adults-coping-change-premium-he',
  'שינוי הרגלים':                                          'tf-adults-coping-change-premium-he',
  'הרגלים מקשים':                                          'tf-adults-coping-change-premium-he',
  'דחיינות':                                               'tf-adults-coping-change-premium-he',
  'הימנעות':                                               'tf-adults-coping-change-premium-he',
  'מיומנויות חברתיות':                                     'tf-adults-coping-change-premium-he',
  'אסרטיביות':                                             'tf-adults-coping-change-premium-he',
  'גבולות':                                                'tf-adults-coping-change-premium-he',
  'פתרון בעיות':                                           'tf-adults-coping-change-premium-he',
  'ניהול עומס':                                            'tf-adults-coping-change-premium-he',
  'ביקורת':                                                'tf-adults-coping-change-premium-he',
  'ויסות דחפים':                                           'tf-adults-coping-change-premium-he',
  'קונטרס התמודדות':                                       'tf-adults-coping-change-premium-he',
  'קונטרס שינוי':                                          'tf-adults-coping-change-premium-he',

  // ── Hebrew Premium Workbooks: Strengths & Resilience ─────────────────────
  'tf-adults-strengths-resilience-premium-he':             'tf-adults-strengths-resilience-premium-he',
  'adults-strengths-resilience-premium-he':                'tf-adults-strengths-resilience-premium-he',
  'כוחות':                                                 'tf-adults-strengths-resilience-premium-he',
  'חוזקות':                                                'tf-adults-strengths-resilience-premium-he',
  'חוסן':                                                  'tf-adults-strengths-resilience-premium-he',
  'גורמי חוסן':                                            'tf-adults-strengths-resilience-premium-he',
  'ביטחון עצמי':                                           'tf-adults-strengths-resilience-premium-he',
  'מסוגלות':                                               'tf-adults-strengths-resilience-premium-he',
  'תחושת מסוגלות':                                         'tf-adults-strengths-resilience-premium-he',
  'משאבים':                                                'tf-adults-strengths-resilience-premium-he',
  'תקווה':                                                 'tf-adults-strengths-resilience-premium-he',
  'ערכים':                                                 'tf-adults-strengths-resilience-premium-he',
  'רשת תמיכה':                                             'tf-adults-strengths-resilience-premium-he',
  'קול פנימי מחזק':                                        'tf-adults-strengths-resilience-premium-he',
  'קונטרס כוחות':                                          'tf-adults-strengths-resilience-premium-he',
  'קונטרס חוסן':                                           'tf-adults-strengths-resilience-premium-he',

  // ── Hebrew Premium Workbooks: Treatment Summary & Custom Forms ────────────
  'tf-adults-treatment-summary-custom-forms-premium-he':   'tf-adults-treatment-summary-custom-forms-premium-he',
  'adults-treatment-summary-custom-forms-premium-he':      'tf-adults-treatment-summary-custom-forms-premium-he',
  'סיכום טיפול':                                           'tf-adults-treatment-summary-custom-forms-premium-he',
  'סיכום תהליך':                                           'tf-adults-treatment-summary-custom-forms-premium-he',
  'סיום טיפול':                                            'tf-adults-treatment-summary-custom-forms-premium-he',
  'מה למדתי בטיפול':                                       'tf-adults-treatment-summary-custom-forms-premium-he',
  'תכנית המשך':                                            'tf-adults-treatment-summary-custom-forms-premium-he',
  'טופס אישי':                                             'tf-adults-treatment-summary-custom-forms-premium-he',
  'טפסים אישיים':                                          'tf-adults-treatment-summary-custom-forms-premium-he',
  'טופס ריק':                                              'tf-adults-treatment-summary-custom-forms-premium-he',
  'טופס מותאם אישית':                                      'tf-adults-treatment-summary-custom-forms-premium-he',
  'לבנות טופס עם המטפל':                                   'tf-adults-treatment-summary-custom-forms-premium-he',
  'משוב על הטיפול':                                        'tf-adults-treatment-summary-custom-forms-premium-he',
  'קונטרס סיכום':                                          'tf-adults-treatment-summary-custom-forms-premium-he',
  'קונטרס טפסים אישיים':                                   'tf-adults-treatment-summary-custom-forms-premium-he',

  // ── English Premium Workbooks: Formulation & Mapping ──────────────────────
  'tf-adults-formulation-mapping-premium-en':              'tf-adults-formulation-mapping-premium-en',
  'adults-formulation-mapping-premium-en':                 'tf-adults-formulation-mapping-premium-en',

  // ── English Premium Workbooks: Awareness & Identification ─────────────────
  'tf-adults-awareness-identification-premium-en':         'tf-adults-awareness-identification-premium-en',
  'adults-awareness-identification-premium-en':            'tf-adults-awareness-identification-premium-en',

  // ── English Premium Workbooks: Cognitive Flexibility ──────────────────────
  'tf-adults-cognitive-flexibility-premium-en':            'tf-adults-cognitive-flexibility-premium-en',
  'adults-cognitive-flexibility-premium-en':               'tf-adults-cognitive-flexibility-premium-en',

  // ── English Premium Workbooks: Emotional Regulation ───────────────────────
  'tf-adults-emotional-regulation-premium-en':             'tf-adults-emotional-regulation-premium-en',
  'adults-emotional-regulation-premium-en':                'tf-adults-emotional-regulation-premium-en',

  // ── English Premium Workbooks: Coping & Change ────────────────────────────
  'tf-adults-coping-change-premium-en':                    'tf-adults-coping-change-premium-en',
  'adults-coping-change-premium-en':                       'tf-adults-coping-change-premium-en',

  // ── English Premium Workbooks: Strengths & Resilience ────────────────────
  'tf-adults-strengths-resilience-premium-en':             'tf-adults-strengths-resilience-premium-en',
  'adults-strengths-resilience-premium-en':                'tf-adults-strengths-resilience-premium-en',

  // ── English Premium Workbooks: Treatment Summary & Custom Forms ───────────
  'tf-adults-treatment-summary-custom-forms-premium-en':   'tf-adults-treatment-summary-custom-forms-premium-en',
  'adults-treatment-summary-custom-forms-premium-en':      'tf-adults-treatment-summary-custom-forms-premium-en',

  // ── Spanish Premium Workbooks: Formulation & Mapping ──────────────────────
  'tf-adults-formulation-mapping-premium-es':              'tf-adults-formulation-mapping-premium-es',
  'adults-formulation-mapping-premium-es':                 'tf-adults-formulation-mapping-premium-es',
  'formulación del caso':                                  'tf-adults-formulation-mapping-premium-es',
  'formulación':                                           'tf-adults-formulation-mapping-premium-es',
  'mapeo del caso':                                        'tf-adults-formulation-mapping-premium-es',
  'cuaderno de formulación':                               'tf-adults-formulation-mapping-premium-es',
  'cuaderno de mapeo':                                     'tf-adults-formulation-mapping-premium-es',
  'entender qué me pasa':                                  'tf-adults-formulation-mapping-premium-es',
  'evaluación inicial es':                                 'tf-adults-formulation-mapping-premium-es',
  'metas terapéuticas es':                                 'tf-adults-formulation-mapping-premium-es',

  // ── Spanish Premium Workbooks: Awareness & Identification ─────────────────
  'tf-adults-awareness-identification-premium-es':         'tf-adults-awareness-identification-premium-es',
  'adults-awareness-identification-premium-es':            'tf-adults-awareness-identification-premium-es',
  'cuaderno de identificación':                            'tf-adults-awareness-identification-premium-es',
  'identificar pensamientos emociones cuerpo conducta':    'tf-adults-awareness-identification-premium-es',
  'cadena pensamiento emoción conducta':                   'tf-adults-awareness-identification-premium-es',
  'cadena cbt es':                                         'tf-adults-awareness-identification-premium-es',

  // ── Spanish Premium Workbooks: Cognitive Flexibility ──────────────────────
  'tf-adults-cognitive-flexibility-premium-es':            'tf-adults-cognitive-flexibility-premium-es',
  'adults-cognitive-flexibility-premium-es':               'tf-adults-cognitive-flexibility-premium-es',
  'cuaderno de pensamientos':                              'tf-adults-cognitive-flexibility-premium-es',
  'cuaderno de flexibilidad cognitiva':                    'tf-adults-cognitive-flexibility-premium-es',
  'desafiar pensamientos':                                 'tf-adults-cognitive-flexibility-premium-es',
  'cuestionar pensamientos':                               'tf-adults-cognitive-flexibility-premium-es',
  'pensamientos negativos es':                             'tf-adults-cognitive-flexibility-premium-es',
  'distorsiones cognitivas es':                            'tf-adults-cognitive-flexibility-premium-es',
  'flexibilidad cognitiva es':                             'tf-adults-cognitive-flexibility-premium-es',

  // ── Spanish Premium Workbooks: Emotional Regulation ───────────────────────
  'tf-adults-emotional-regulation-premium-es':             'tf-adults-emotional-regulation-premium-es',
  'adults-emotional-regulation-premium-es':                'tf-adults-emotional-regulation-premium-es',
  'cuaderno de regulación emocional':                      'tf-adults-emotional-regulation-premium-es',
  'regulación emocional es':                               'tf-adults-emotional-regulation-premium-es',
  'emociones fuertes es':                                  'tf-adults-emotional-regulation-premium-es',
  'desborde emocional es':                                 'tf-adults-emotional-regulation-premium-es',

  // ── Spanish Premium Workbooks: Coping & Change ────────────────────────────
  'tf-adults-coping-change-premium-es':                    'tf-adults-coping-change-premium-es',
  'adults-coping-change-premium-es':                       'tf-adults-coping-change-premium-es',
  'cuaderno de afrontamiento':                             'tf-adults-coping-change-premium-es',
  'cuaderno de cambio':                                    'tf-adults-coping-change-premium-es',
  'afrontamiento es':                                      'tf-adults-coping-change-premium-es',
  'procrastinación es':                                    'tf-adults-coping-change-premium-es',
  'evitación es':                                          'tf-adults-coping-change-premium-es',
  'hábitos difíciles es':                                  'tf-adults-coping-change-premium-es',

  // ── Spanish Premium Workbooks: Strengths & Resilience ────────────────────
  'tf-adults-strengths-resilience-premium-es':             'tf-adults-strengths-resilience-premium-es',
  'adults-strengths-resilience-premium-es':                'tf-adults-strengths-resilience-premium-es',
  'cuaderno de fortalezas':                                'tf-adults-strengths-resilience-premium-es',
  'cuaderno de resiliencia':                               'tf-adults-strengths-resilience-premium-es',
  'fortalezas es':                                         'tf-adults-strengths-resilience-premium-es',
  'resiliencia es':                                        'tf-adults-strengths-resilience-premium-es',
  'autoeficacia es':                                       'tf-adults-strengths-resilience-premium-es',

  // ── Spanish Premium Workbooks: Treatment Summary & Custom Forms ───────────
  'tf-adults-treatment-summary-custom-forms-premium-es':   'tf-adults-treatment-summary-custom-forms-premium-es',
  'adults-treatment-summary-custom-forms-premium-es':      'tf-adults-treatment-summary-custom-forms-premium-es',
  'cuaderno de resumen':                                   'tf-adults-treatment-summary-custom-forms-premium-es',
  'cuaderno de formularios personalizados':                'tf-adults-treatment-summary-custom-forms-premium-es',
  'resumen del tratamiento es':                            'tf-adults-treatment-summary-custom-forms-premium-es',
  'terminar terapia es':                                   'tf-adults-treatment-summary-custom-forms-premium-es',
  'formulario personalizado es':                           'tf-adults-treatment-summary-custom-forms-premium-es',

  // ── French Premium Workbooks: Formulation & Mapping ───────────────────────
  'tf-adults-formulation-mapping-premium-fr':              'tf-adults-formulation-mapping-premium-fr',
  'adults-formulation-mapping-premium-fr':                 'tf-adults-formulation-mapping-premium-fr',
  'cahier de formulation':                                 'tf-adults-formulation-mapping-premium-fr',
  'cahier de cartographie':                                'tf-adults-formulation-mapping-premium-fr',
  'formulation du cas fr':                                 'tf-adults-formulation-mapping-premium-fr',
  'cartographie du problème fr':                           'tf-adults-formulation-mapping-premium-fr',
  'évaluation initiale fr':                                'tf-adults-formulation-mapping-premium-fr',
  'objectifs thérapeutiques fr':                           'tf-adults-formulation-mapping-premium-fr',

  // ── French Premium Workbooks: Awareness & Identification ──────────────────
  'tf-adults-awareness-identification-premium-fr':         'tf-adults-awareness-identification-premium-fr',
  'adults-awareness-identification-premium-fr':            'tf-adults-awareness-identification-premium-fr',
  "cahier d'identification":                               'tf-adults-awareness-identification-premium-fr',
  'identifier pensées émotions corps comportements':       'tf-adults-awareness-identification-premium-fr',
  'chaîne pensée émotion comportement fr':                 'tf-adults-awareness-identification-premium-fr',
  'chaîne cbt fr':                                         'tf-adults-awareness-identification-premium-fr',

  // ── French Premium Workbooks: Cognitive Flexibility ───────────────────────
  'tf-adults-cognitive-flexibility-premium-fr':            'tf-adults-cognitive-flexibility-premium-fr',
  'adults-cognitive-flexibility-premium-fr':               'tf-adults-cognitive-flexibility-premium-fr',
  'cahier de pensées':                                     'tf-adults-cognitive-flexibility-premium-fr',
  'cahier de flexibilité cognitive':                       'tf-adults-cognitive-flexibility-premium-fr',
  'questionner les pensées fr':                            'tf-adults-cognitive-flexibility-premium-fr',
  'pensées négatives fr':                                  'tf-adults-cognitive-flexibility-premium-fr',
  'distorsions cognitives fr':                             'tf-adults-cognitive-flexibility-premium-fr',
  'flexibilité cognitive fr':                              'tf-adults-cognitive-flexibility-premium-fr',

  // ── French Premium Workbooks: Emotional Regulation ────────────────────────
  'tf-adults-emotional-regulation-premium-fr':             'tf-adults-emotional-regulation-premium-fr',
  'adults-emotional-regulation-premium-fr':                'tf-adults-emotional-regulation-premium-fr',
  'cahier de régulation émotionnelle':                     'tf-adults-emotional-regulation-premium-fr',
  'régulation émotionnelle fr':                            'tf-adults-emotional-regulation-premium-fr',
  'émotions fortes fr':                                    'tf-adults-emotional-regulation-premium-fr',
  'débordement émotionnel fr':                             'tf-adults-emotional-regulation-premium-fr',

  // ── French Premium Workbooks: Coping & Change ─────────────────────────────
  'tf-adults-coping-change-premium-fr':                    'tf-adults-coping-change-premium-fr',
  'adults-coping-change-premium-fr':                       'tf-adults-coping-change-premium-fr',
  "cahier d'adaptation":                                   'tf-adults-coping-change-premium-fr',
  'cahier de changement':                                  'tf-adults-coping-change-premium-fr',
  'procrastination fr':                                    'tf-adults-coping-change-premium-fr',
  'évitement fr':                                          'tf-adults-coping-change-premium-fr',
  'habitudes difficiles fr':                               'tf-adults-coping-change-premium-fr',

  // ── French Premium Workbooks: Strengths & Resilience ─────────────────────
  'tf-adults-strengths-resilience-premium-fr':             'tf-adults-strengths-resilience-premium-fr',
  'adults-strengths-resilience-premium-fr':                'tf-adults-strengths-resilience-premium-fr',
  'cahier des forces':                                     'tf-adults-strengths-resilience-premium-fr',
  'cahier de résilience':                                  'tf-adults-strengths-resilience-premium-fr',
  'forces fr':                                             'tf-adults-strengths-resilience-premium-fr',
  'résilience fr':                                         'tf-adults-strengths-resilience-premium-fr',
  'auto-efficacité fr':                                    'tf-adults-strengths-resilience-premium-fr',

  // ── French Premium Workbooks: Treatment Summary & Custom Forms ────────────
  'tf-adults-treatment-summary-custom-forms-premium-fr':   'tf-adults-treatment-summary-custom-forms-premium-fr',
  'adults-treatment-summary-custom-forms-premium-fr':      'tf-adults-treatment-summary-custom-forms-premium-fr',
  'cahier de synthèse':                                    'tf-adults-treatment-summary-custom-forms-premium-fr',
  'cahier de fiches personnalisées':                       'tf-adults-treatment-summary-custom-forms-premium-fr',
  'résumé du traitement fr':                               'tf-adults-treatment-summary-custom-forms-premium-fr',
  'fin de thérapie fr':                                    'tf-adults-treatment-summary-custom-forms-premium-fr',
  'fiche personnalisée fr':                                'tf-adults-treatment-summary-custom-forms-premium-fr',

  // ── German Premium Workbooks: Formulation & Mapping ───────────────────────
  'tf-adults-formulation-mapping-premium-de':              'tf-adults-formulation-mapping-premium-de',
  'adults-formulation-mapping-premium-de':                 'tf-adults-formulation-mapping-premium-de',
  'arbeitsheft zur fallformulierung':                      'tf-adults-formulation-mapping-premium-de',
  'arbeitsheft zur problemlandkarte':                      'tf-adults-formulation-mapping-premium-de',
  'fallformulierung de':                                   'tf-adults-formulation-mapping-premium-de',
  'problemlandkarte de':                                   'tf-adults-formulation-mapping-premium-de',
  'erste einschätzung de':                                 'tf-adults-formulation-mapping-premium-de',
  'therapieziele de':                                      'tf-adults-formulation-mapping-premium-de',

  // ── German Premium Workbooks: Awareness & Identification ──────────────────
  'tf-adults-awareness-identification-premium-de':         'tf-adults-awareness-identification-premium-de',
  'adults-awareness-identification-premium-de':            'tf-adults-awareness-identification-premium-de',
  'arbeitsheft zum erkennen':                              'tf-adults-awareness-identification-premium-de',
  'gedanken erkennen de':                                  'tf-adults-awareness-identification-premium-de',
  'cbt-kette de':                                          'tf-adults-awareness-identification-premium-de',
  'situation gedanke gefühl verhalten de':                 'tf-adults-awareness-identification-premium-de',

  // ── German Premium Workbooks: Cognitive Flexibility ───────────────────────
  'tf-adults-cognitive-flexibility-premium-de':            'tf-adults-cognitive-flexibility-premium-de',
  'adults-cognitive-flexibility-premium-de':               'tf-adults-cognitive-flexibility-premium-de',
  'arbeitsheft zu gedanken':                               'tf-adults-cognitive-flexibility-premium-de',
  'arbeitsheft zu kognitiver flexibilität':                'tf-adults-cognitive-flexibility-premium-de',
  'negative gedanken de':                                  'tf-adults-cognitive-flexibility-premium-de',
  'kognitive verzerrungen de':                             'tf-adults-cognitive-flexibility-premium-de',
  'gedanken prüfen de':                                    'tf-adults-cognitive-flexibility-premium-de',
  'kognitive flexibilität de':                             'tf-adults-cognitive-flexibility-premium-de',

  // ── German Premium Workbooks: Emotional Regulation ────────────────────────
  'tf-adults-emotional-regulation-premium-de':             'tf-adults-emotional-regulation-premium-de',
  'adults-emotional-regulation-premium-de':                'tf-adults-emotional-regulation-premium-de',
  'arbeitsheft zur emotionsregulation':                    'tf-adults-emotional-regulation-premium-de',
  'arbeitsheft zu emotionaler regulation':                 'tf-adults-emotional-regulation-premium-de',
  'emotionale regulation de':                              'tf-adults-emotional-regulation-premium-de',
  'starke gefühle de':                                     'tf-adults-emotional-regulation-premium-de',
  'emotionale überforderung de':                           'tf-adults-emotional-regulation-premium-de',

  // ── German Premium Workbooks: Coping & Change ─────────────────────────────
  'tf-adults-coping-change-premium-de':                    'tf-adults-coping-change-premium-de',
  'adults-coping-change-premium-de':                       'tf-adults-coping-change-premium-de',
  'arbeitsheft zu bewältigung':                            'tf-adults-coping-change-premium-de',
  'arbeitsheft zu veränderung':                            'tf-adults-coping-change-premium-de',
  'prokrastination de':                                    'tf-adults-coping-change-premium-de',
  'vermeidung de':                                         'tf-adults-coping-change-premium-de',
  'schwierige gewohnheiten de':                            'tf-adults-coping-change-premium-de',

  // ── German Premium Workbooks: Strengths & Resilience ─────────────────────
  'tf-adults-strengths-resilience-premium-de':             'tf-adults-strengths-resilience-premium-de',
  'adults-strengths-resilience-premium-de':                'tf-adults-strengths-resilience-premium-de',
  'arbeitsheft zu stärken':                                'tf-adults-strengths-resilience-premium-de',
  'arbeitsheft zu resilienz':                              'tf-adults-strengths-resilience-premium-de',
  'stärken de':                                            'tf-adults-strengths-resilience-premium-de',
  'resilienz de':                                          'tf-adults-strengths-resilience-premium-de',
  'selbstwirksamkeit de':                                  'tf-adults-strengths-resilience-premium-de',

  // ── German Premium Workbooks: Treatment Summary & Custom Forms ────────────
  'tf-adults-treatment-summary-custom-forms-premium-de':   'tf-adults-treatment-summary-custom-forms-premium-de',
  'adults-treatment-summary-custom-forms-premium-de':      'tf-adults-treatment-summary-custom-forms-premium-de',
  'arbeitsheft zur therapiezusammenfassung':               'tf-adults-treatment-summary-custom-forms-premium-de',
  'arbeitsheft zu persönlichen formularen':                'tf-adults-treatment-summary-custom-forms-premium-de',
  'therapiezusammenfassung de':                            'tf-adults-treatment-summary-custom-forms-premium-de',
  'therapie beenden de':                                   'tf-adults-treatment-summary-custom-forms-premium-de',
  'persönliches formular de':                              'tf-adults-treatment-summary-custom-forms-premium-de',

  // ── Italian Premium Workbooks: Formulation & Mapping ───────────────────────
  'tf-adults-formulation-mapping-premium-it':              'tf-adults-formulation-mapping-premium-it',
  'adults-formulation-mapping-premium-it':                 'tf-adults-formulation-mapping-premium-it',
  'quaderno di formulazione':                              'tf-adults-formulation-mapping-premium-it',
  'quaderno di mappatura':                                 'tf-adults-formulation-mapping-premium-it',
  'formulazione del caso it':                              'tf-adults-formulation-mapping-premium-it',
  'mappatura del problema it':                             'tf-adults-formulation-mapping-premium-it',
  'valutazione iniziale it':                               'tf-adults-formulation-mapping-premium-it',
  'obiettivi terapeutici it':                              'tf-adults-formulation-mapping-premium-it',

  // ── Italian Premium Workbooks: Awareness & Identification ──────────────────
  'tf-adults-awareness-identification-premium-it':         'tf-adults-awareness-identification-premium-it',
  'adults-awareness-identification-premium-it':            'tf-adults-awareness-identification-premium-it',
  'quaderno di riconoscimento':                            'tf-adults-awareness-identification-premium-it',
  'quaderno di identificazione':                           'tf-adults-awareness-identification-premium-it',
  'riconoscere pensieri emozioni corpo comportamento':     'tf-adults-awareness-identification-premium-it',
  'catena pensiero emozione comportamento it':             'tf-adults-awareness-identification-premium-it',
  'catena cbt it':                                         'tf-adults-awareness-identification-premium-it',

  // ── Italian Premium Workbooks: Cognitive Flexibility ───────────────────────
  'tf-adults-cognitive-flexibility-premium-it':            'tf-adults-cognitive-flexibility-premium-it',
  'adults-cognitive-flexibility-premium-it':               'tf-adults-cognitive-flexibility-premium-it',
  'quaderno sui pensieri':                                 'tf-adults-cognitive-flexibility-premium-it',
  'quaderno di flessibilità cognitiva':                    'tf-adults-cognitive-flexibility-premium-it',
  'pensieri negativi it':                                  'tf-adults-cognitive-flexibility-premium-it',
  'distorsioni cognitive it':                              'tf-adults-cognitive-flexibility-premium-it',
  'verificare i pensieri it':                              'tf-adults-cognitive-flexibility-premium-it',
  'flessibilità cognitiva it':                             'tf-adults-cognitive-flexibility-premium-it',

  // ── Italian Premium Workbooks: Emotional Regulation ────────────────────────
  'tf-adults-emotional-regulation-premium-it':             'tf-adults-emotional-regulation-premium-it',
  'adults-emotional-regulation-premium-it':                'tf-adults-emotional-regulation-premium-it',
  'quaderno di regolazione emotiva':                       'tf-adults-emotional-regulation-premium-it',
  'regolazione emotiva it':                                'tf-adults-emotional-regulation-premium-it',
  'emozioni forti it':                                     'tf-adults-emotional-regulation-premium-it',
  'sovraccarico emotivo it':                               'tf-adults-emotional-regulation-premium-it',

  // ── Italian Premium Workbooks: Coping & Change ─────────────────────────────
  'tf-adults-coping-change-premium-it':                    'tf-adults-coping-change-premium-it',
  'adults-coping-change-premium-it':                       'tf-adults-coping-change-premium-it',
  'quaderno di fronteggiamento':                           'tf-adults-coping-change-premium-it',
  'quaderno di cambiamento':                               'tf-adults-coping-change-premium-it',
  'procrastinazione it':                                   'tf-adults-coping-change-premium-it',
  'evitamento it':                                         'tf-adults-coping-change-premium-it',
  'abitudini difficili it':                                'tf-adults-coping-change-premium-it',

  // ── Italian Premium Workbooks: Strengths & Resilience ──────────────────────
  'tf-adults-strengths-resilience-premium-it':             'tf-adults-strengths-resilience-premium-it',
  'adults-strengths-resilience-premium-it':                'tf-adults-strengths-resilience-premium-it',
  'quaderno sui punti di forza':                           'tf-adults-strengths-resilience-premium-it',
  'quaderno di resilienza':                                'tf-adults-strengths-resilience-premium-it',
  'punti di forza it':                                     'tf-adults-strengths-resilience-premium-it',
  'resilienza it':                                         'tf-adults-strengths-resilience-premium-it',
  'autoefficacia it':                                      'tf-adults-strengths-resilience-premium-it',

  // ── Italian Premium Workbooks: Treatment Summary & Custom Forms ────────────
  'tf-adults-treatment-summary-custom-forms-premium-it':   'tf-adults-treatment-summary-custom-forms-premium-it',
  'adults-treatment-summary-custom-forms-premium-it':      'tf-adults-treatment-summary-custom-forms-premium-it',
  'quaderno di sintesi':                                   'tf-adults-treatment-summary-custom-forms-premium-it',
  'quaderno di moduli personalizzati':                     'tf-adults-treatment-summary-custom-forms-premium-it',
  'sintesi del trattamento it':                            'tf-adults-treatment-summary-custom-forms-premium-it',
  'fine terapia it':                                       'tf-adults-treatment-summary-custom-forms-premium-it',
  'modulo personalizzato it':                              'tf-adults-treatment-summary-custom-forms-premium-it',

  // ── Portuguese Premium Workbooks: Formulation & Mapping ─────────────────────
  'tf-adults-formulation-mapping-premium-pt':              'tf-adults-formulation-mapping-premium-pt',
  'adults-formulation-mapping-premium-pt':                 'tf-adults-formulation-mapping-premium-pt',
  'caderno de formulação':                                 'tf-adults-formulation-mapping-premium-pt',
  'caderno de mapeamento':                                 'tf-adults-formulation-mapping-premium-pt',
  'formulação do caso':                                    'tf-adults-formulation-mapping-premium-pt',
  'mapeamento do problema':                                'tf-adults-formulation-mapping-premium-pt',
  'avaliação inicial':                                     'tf-adults-formulation-mapping-premium-pt',
  'objetivos terapêuticos':                                'tf-adults-formulation-mapping-premium-pt',

  // ── Portuguese Premium Workbooks: Awareness & Identification ─────────────────
  'tf-adults-awareness-identification-premium-pt':         'tf-adults-awareness-identification-premium-pt',
  'adults-awareness-identification-premium-pt':            'tf-adults-awareness-identification-premium-pt',
  'caderno de reconhecimento':                             'tf-adults-awareness-identification-premium-pt',
  'caderno de identificação':                              'tf-adults-awareness-identification-premium-pt',
  'reconhecer pensamentos emoções corpo comportamento':    'tf-adults-awareness-identification-premium-pt',
  'cadeia pensamento emoção comportamento':                'tf-adults-awareness-identification-premium-pt',
  'cadeia cbt':                                            'tf-adults-awareness-identification-premium-pt',

  // ── Portuguese Premium Workbooks: Cognitive Flexibility ──────────────────────
  'tf-adults-cognitive-flexibility-premium-pt':            'tf-adults-cognitive-flexibility-premium-pt',
  'adults-cognitive-flexibility-premium-pt':               'tf-adults-cognitive-flexibility-premium-pt',
  'caderno sobre pensamentos':                             'tf-adults-cognitive-flexibility-premium-pt',
  'caderno de flexibilidade cognitiva':                    'tf-adults-cognitive-flexibility-premium-pt',
  'pensamentos negativos':                                 'tf-adults-cognitive-flexibility-premium-pt',
  'distorções cognitivas':                                 'tf-adults-cognitive-flexibility-premium-pt',
  'verificar pensamentos':                                 'tf-adults-cognitive-flexibility-premium-pt',
  'flexibilidade cognitiva':                               'tf-adults-cognitive-flexibility-premium-pt',

  // ── Portuguese Premium Workbooks: Emotional Regulation ───────────────────────
  'tf-adults-emotional-regulation-premium-pt':             'tf-adults-emotional-regulation-premium-pt',
  'adults-emotional-regulation-premium-pt':                'tf-adults-emotional-regulation-premium-pt',
  'caderno de regulação emocional':                        'tf-adults-emotional-regulation-premium-pt',
  'regulação emocional':                                   'tf-adults-emotional-regulation-premium-pt',
  'emoções fortes':                                        'tf-adults-emotional-regulation-premium-pt',
  'sobrecarga emocional':                                  'tf-adults-emotional-regulation-premium-pt',

  // ── Portuguese Premium Workbooks: Coping & Change ────────────────────────────
  'tf-adults-coping-change-premium-pt':                    'tf-adults-coping-change-premium-pt',
  'adults-coping-change-premium-pt':                       'tf-adults-coping-change-premium-pt',
  'caderno de enfrentamento':                              'tf-adults-coping-change-premium-pt',
  'caderno de mudança':                                    'tf-adults-coping-change-premium-pt',
  'procrastinação':                                        'tf-adults-coping-change-premium-pt',
  'evitação':                                              'tf-adults-coping-change-premium-pt',
  'hábitos difíceis':                                      'tf-adults-coping-change-premium-pt',

  // ── Portuguese Premium Workbooks: Strengths & Resilience ─────────────────────
  'tf-adults-strengths-resilience-premium-pt':             'tf-adults-strengths-resilience-premium-pt',
  'adults-strengths-resilience-premium-pt':                'tf-adults-strengths-resilience-premium-pt',
  'caderno de pontos fortes':                              'tf-adults-strengths-resilience-premium-pt',
  'caderno de resiliência':                                'tf-adults-strengths-resilience-premium-pt',
  'pontos fortes':                                         'tf-adults-strengths-resilience-premium-pt',
  'resiliência':                                           'tf-adults-strengths-resilience-premium-pt',
  'autoeficácia':                                          'tf-adults-strengths-resilience-premium-pt',

  // ── Portuguese Premium Workbooks: Treatment Summary & Custom Forms ───────────
  'tf-adults-treatment-summary-custom-forms-premium-pt':   'tf-adults-treatment-summary-custom-forms-premium-pt',
  'adults-treatment-summary-custom-forms-premium-pt':      'tf-adults-treatment-summary-custom-forms-premium-pt',
  'caderno de síntese':                                    'tf-adults-treatment-summary-custom-forms-premium-pt',
  'caderno de formulários personalizados':                 'tf-adults-treatment-summary-custom-forms-premium-pt',
  'síntese do tratamento':                                 'tf-adults-treatment-summary-custom-forms-premium-pt',
  'encerramento da terapia':                               'tf-adults-treatment-summary-custom-forms-premium-pt',
  'formulário personalizado':                              'tf-adults-treatment-summary-custom-forms-premium-pt',

  // ── Hebrew Children CBT Premium: Full Series Workbook ─────────────────────
  // Audience guard: aliases MUST include child/children/ילד/ילדים wording
  'tf-children-cbt-series-premium-he':                    'tf-children-cbt-series-premium-he',
  'children-cbt-series-premium-he':                       'tf-children-cbt-series-premium-he',
  'סדרת ילדים':                                           'tf-children-cbt-series-premium-he',
  'סדרת cbt לילדים':                                      'tf-children-cbt-series-premium-he',
  'חוברת ילדים':                                          'tf-children-cbt-series-premium-he',
  'קונטרס ילדים':                                         'tf-children-cbt-series-premium-he',
  'כל שלבי הילדים':                                       'tf-children-cbt-series-premium-he',
  'כל הטפסים לילדים':                                     'tf-children-cbt-series-premium-he',
  'סט מלא לילדים':                                        'tf-children-cbt-series-premium-he',
  'children cbt workbook':                                 'tf-children-cbt-series-premium-he',
  'children worksheet series':                             'tf-children-cbt-series-premium-he',
  'full children cbt series':                              'tf-children-cbt-series-premium-he',
  'חוברת עבודה לילדים':                                   'tf-children-cbt-series-premium-he',
  'כל הסדרה לילדים':                                      'tf-children-cbt-series-premium-he',

  // ── Hebrew Children CBT Premium: Stage 1 (Assessment & Alliance) ─────────
  'tf-children-cbt-stage-1-premium-he':                   'tf-children-cbt-stage-1-premium-he',
  'children-cbt-stage-1-premium-he':                      'tf-children-cbt-stage-1-premium-he',
  'היכרות ילד':                                           'tf-children-cbt-stage-1-premium-he',
  'הערכה ילד':                                            'tf-children-cbt-stage-1-premium-he',
  'בניית אמון ילד':                                       'tf-children-cbt-stage-1-premium-he',
  'ברית טיפולית ילד':                                     'tf-children-cbt-stage-1-premium-he',
  'תחילת טיפול עם ילד':                                   'tf-children-cbt-stage-1-premium-he',
  'להכיר את הילד':                                        'tf-children-cbt-stage-1-premium-he',
  'שלב ראשון ילד':                                        'tf-children-cbt-stage-1-premium-he',

  'tf-children-cbt-stage-1-1-premium-he':                 'tf-children-cbt-stage-1-1-premium-he',
  'children-cbt-stage-1-1-premium-he':                    'tf-children-cbt-stage-1-1-premium-he',
  'מי אני ומה חשוב לי':                                   'tf-children-cbt-stage-1-1-premium-he',
  'מה חשוב לילד':                                         'tf-children-cbt-stage-1-1-premium-he',
  'מה חשוב לי ילד':                                       'tf-children-cbt-stage-1-1-premium-he',

  'tf-children-cbt-stage-1-2-premium-he':                 'tf-children-cbt-stage-1-2-premium-he',
  'children-cbt-stage-1-2-premium-he':                    'tf-children-cbt-stage-1-2-premium-he',
  'מתי קשה לי ילד':                                       'tf-children-cbt-stage-1-2-premium-he',
  'מתי קשה לילד':                                         'tf-children-cbt-stage-1-2-premium-he',

  'tf-children-cbt-stage-1-3-premium-he':                 'tf-children-cbt-stage-1-3-premium-he',
  'children-cbt-stage-1-3-premium-he':                    'tf-children-cbt-stage-1-3-premium-he',
  'מה אני עושה כשקשה לי ילד':                             'tf-children-cbt-stage-1-3-premium-he',
  'מה הילד עושה כשקשה לו':                                'tf-children-cbt-stage-1-3-premium-he',

  'tf-children-cbt-stage-1-4-premium-he':                 'tf-children-cbt-stage-1-4-premium-he',
  'children-cbt-stage-1-4-premium-he':                    'tf-children-cbt-stage-1-4-premium-he',
  'כמה זה קורה לי וכמה זה מפריע לי':                     'tf-children-cbt-stage-1-4-premium-he',
  'כמה זה קורה ילד':                                      'tf-children-cbt-stage-1-4-premium-he',
  'כמה זה מפריע ילד':                                     'tf-children-cbt-stage-1-4-premium-he',

  // ── Hebrew Children CBT Premium: Stage 2 (Case Formulation) ─────────────
  'tf-children-cbt-stage-2-premium-he':                   'tf-children-cbt-stage-2-premium-he',
  'children-cbt-stage-2-premium-he':                      'tf-children-cbt-stage-2-premium-he',
  'המפה שלי ילד':                                         'tf-children-cbt-stage-2-premium-he',
  'מפת הקושי ילד':                                        'tf-children-cbt-stage-2-premium-he',
  'מעגל הקושי ילד':                                       'tf-children-cbt-stage-2-premium-he',
  'המשגה ילד':                                            'tf-children-cbt-stage-2-premium-he',
  'שלב שני ילד':                                          'tf-children-cbt-stage-2-premium-he',

  'tf-children-cbt-stage-2-1-premium-he':                 'tf-children-cbt-stage-2-1-premium-he',
  'children-cbt-stage-2-1-premium-he':                    'tf-children-cbt-stage-2-1-premium-he',
  'מה היה רגע לפני ילד':                                  'tf-children-cbt-stage-2-1-premium-he',
  'טריגר ילד':                                            'tf-children-cbt-stage-2-1-premium-he',
  'להבין מה קורה לפני ילד':                               'tf-children-cbt-stage-2-1-premium-he',

  'tf-children-cbt-stage-2-2-premium-he':                 'tf-children-cbt-stage-2-2-premium-he',
  'children-cbt-stage-2-2-premium-he':                    'tf-children-cbt-stage-2-2-premium-he',
  'מה הראש אמר לי ילד':                                   'tf-children-cbt-stage-2-2-premium-he',
  'מה הראש אמר ילד':                                      'tf-children-cbt-stage-2-2-premium-he',
  'מה הראש אומר לו ילד':                                  'tf-children-cbt-stage-2-2-premium-he',
  'מחשבות אוטומטיות ילד':                                 'tf-children-cbt-stage-2-2-premium-he',
  'מחשבה אוטומטית ילד':                                   'tf-children-cbt-stage-2-2-premium-he',
  'לזהות מחשבה ברגע קשה':                                 'tf-children-cbt-stage-2-2-premium-he',
  'מה עובר לו בראש ילד':                                  'tf-children-cbt-stage-2-2-premium-he',
  'מה הוא אומר לעצמו ילד':                                'tf-children-cbt-stage-2-2-premium-he',

  'tf-children-cbt-stage-2-3-premium-he':                 'tf-children-cbt-stage-2-3-premium-he',
  'children-cbt-stage-2-3-premium-he':                    'tf-children-cbt-stage-2-3-premium-he',
  'מה הרגשתי בגוף ילד':                                   'tf-children-cbt-stage-2-3-premium-he',
  'תחושות גוף ילד':                                       'tf-children-cbt-stage-2-3-premium-he',

  'tf-children-cbt-stage-2-4-premium-he':                 'tf-children-cbt-stage-2-4-premium-he',
  'children-cbt-stage-2-4-premium-he':                    'tf-children-cbt-stage-2-4-premium-he',
  'מה עשיתי אחר כך ילד':                                  'tf-children-cbt-stage-2-4-premium-he',
  'מחשבה רגש גוף פעולה ילד':                              'tf-children-cbt-stage-2-4-premium-he',

  // ── Hebrew Children CBT Premium: Stage 3 (Cognitive Restructuring) ───────
  'tf-children-cbt-stage-3-premium-he':                   'tf-children-cbt-stage-3-premium-he',
  'children-cbt-stage-3-premium-he':                      'tf-children-cbt-stage-3-premium-he',
  'עובדים על המחשבות ילד':                                'tf-children-cbt-stage-3-premium-he',
  'עבודה קוגניטיבית ילד':                                 'tf-children-cbt-stage-3-premium-he',
  'שלב שלישי ילד':                                        'tf-children-cbt-stage-3-premium-he',

  'tf-children-cbt-stage-3-1-premium-he':                 'tf-children-cbt-stage-3-1-premium-he',
  'children-cbt-stage-3-1-premium-he':                    'tf-children-cbt-stage-3-1-premium-he',
  'תפסתי מחשבה ילד':                                      'tf-children-cbt-stage-3-1-premium-he',
  'לתפוס מחשבה ילד':                                      'tf-children-cbt-stage-3-1-premium-he',

  'tf-children-cbt-stage-3-2-premium-he':                 'tf-children-cbt-stage-3-2-premium-he',
  'children-cbt-stage-3-2-premium-he':                    'tf-children-cbt-stage-3-2-premium-he',
  'מחשבה או עובדה ילד':                                   'tf-children-cbt-stage-3-2-premium-he',
  'לבדוק מחשבה ילד':                                      'tf-children-cbt-stage-3-2-premium-he',
  'ראיות בעד ונגד ילד':                                   'tf-children-cbt-stage-3-2-premium-he',

  'tf-children-cbt-stage-3-3-premium-he':                 'tf-children-cbt-stage-3-3-premium-he',
  'children-cbt-stage-3-3-premium-he':                    'tf-children-cbt-stage-3-3-premium-he',
  'בלש מחשבות ילד':                                       'tf-children-cbt-stage-3-3-premium-he',
  'בלש המחשבות שלי ילד':                                  'tf-children-cbt-stage-3-3-premium-he',
  'מחשבה מפחידה ילד':                                     'tf-children-cbt-stage-3-3-premium-he',

  'tf-children-cbt-stage-3-4-premium-he':                 'tf-children-cbt-stage-3-4-premium-he',
  'children-cbt-stage-3-4-premium-he':                    'tf-children-cbt-stage-3-4-premium-he',
  'מחשבה חדשה שעוזרת לי ילד':                             'tf-children-cbt-stage-3-4-premium-he',
  'מחשבה חדשה ילד':                                       'tf-children-cbt-stage-3-4-premium-he',
  'מחשבה שעוזרת ילד':                                     'tf-children-cbt-stage-3-4-premium-he',
  'מחשבה מאוזנת ילד':                                     'tf-children-cbt-stage-3-4-premium-he',
  'מחשבה חלופית ילד':                                     'tf-children-cbt-stage-3-4-premium-he',

  // ── Hebrew Children CBT Premium: Stage 4 (Behavioral Interventions) ──────
  'tf-children-cbt-stage-4-premium-he':                   'tf-children-cbt-stage-4-premium-he',
  'children-cbt-stage-4-premium-he':                      'tf-children-cbt-stage-4-premium-he',
  'עובדים במציאות ילד':                                   'tf-children-cbt-stage-4-premium-he',
  'עבודה התנהגותית ילד':                                  'tf-children-cbt-stage-4-premium-he',
  'חשיפה ילד':                                            'tf-children-cbt-stage-4-premium-he',
  'שלב רביעי ילד':                                        'tf-children-cbt-stage-4-premium-he',

  'tf-children-cbt-stage-4-1-premium-he':                 'tf-children-cbt-stage-4-1-premium-he',
  'children-cbt-stage-4-1-premium-he':                    'tf-children-cbt-stage-4-1-premium-he',
  'סולם אומץ ילד':                                        'tf-children-cbt-stage-4-1-premium-he',
  'סולם האומץ שלי':                                       'tf-children-cbt-stage-4-1-premium-he',
  'חשיפה הדרגתית ילד':                                    'tf-children-cbt-stage-4-1-premium-he',
  'להתמודד לאט לאט ילד':                                  'tf-children-cbt-stage-4-1-premium-he',

  'tf-children-cbt-stage-4-2-premium-he':                 'tf-children-cbt-stage-4-2-premium-he',
  'children-cbt-stage-4-2-premium-he':                    'tf-children-cbt-stage-4-2-premium-he',
  'הצעד הקטן שלי ילד':                                    'tf-children-cbt-stage-4-2-premium-he',
  'צעד קטן ילד':                                          'tf-children-cbt-stage-4-2-premium-he',

  'tf-children-cbt-stage-4-3-premium-he':                 'tf-children-cbt-stage-4-3-premium-he',
  'children-cbt-stage-4-3-premium-he':                    'tf-children-cbt-stage-4-3-premium-he',
  'ניסוי אמיץ ילד':                                       'tf-children-cbt-stage-4-3-premium-he',
  'ניסוי התנהגותי ילד':                                   'tf-children-cbt-stage-4-3-premium-he',
  'הפעלה התנהגותית ילד':                                  'tf-children-cbt-stage-4-3-premium-he',

  'tf-children-cbt-stage-4-4-premium-he':                 'tf-children-cbt-stage-4-4-premium-he',
  'children-cbt-stage-4-4-premium-he':                    'tf-children-cbt-stage-4-4-premium-he',
  'מה מפעיל אותי ילד':                                    'tf-children-cbt-stage-4-4-premium-he',
  'מפעילים ילד':                                          'tf-children-cbt-stage-4-4-premium-he',

  // ── Hebrew Children CBT Premium: Stage 5 (Skill Building) ───────────────
  'tf-children-cbt-stage-5-premium-he':                   'tf-children-cbt-stage-5-premium-he',
  'children-cbt-stage-5-premium-he':                      'tf-children-cbt-stage-5-premium-he',
  'ארגז כלים ילד':                                        'tf-children-cbt-stage-5-premium-he',
  'מיומנויות ילד':                                        'tf-children-cbt-stage-5-premium-he',
  'כלים לארגז שלי':                                       'tf-children-cbt-stage-5-premium-he',
  'שלב חמישי ילד':                                        'tf-children-cbt-stage-5-premium-he',

  'tf-children-cbt-stage-5-1-premium-he':                 'tf-children-cbt-stage-5-1-premium-he',
  'children-cbt-stage-5-1-premium-he':                    'tf-children-cbt-stage-5-1-premium-he',
  'כלים שמרגיעים את הגוף שלי':                            'tf-children-cbt-stage-5-1-premium-he',
  'כלים להרגעה ילד':                                      'tf-children-cbt-stage-5-1-premium-he',
  'נשימה ילד':                                            'tf-children-cbt-stage-5-1-premium-he',
  'הרפיה ילד':                                            'tf-children-cbt-stage-5-1-premium-he',

  'tf-children-cbt-stage-5-2-premium-he':                 'tf-children-cbt-stage-5-2-premium-he',
  'children-cbt-stage-5-2-premium-he':                    'tf-children-cbt-stage-5-2-premium-he',
  'משפטים שעוזרים לי ילד':                                'tf-children-cbt-stage-5-2-premium-he',
  'משפטים שעוזרים ילד':                                   'tf-children-cbt-stage-5-2-premium-he',
  'משפטים מחזקים ילד':                                    'tf-children-cbt-stage-5-2-premium-he',

  'tf-children-cbt-stage-5-3-premium-he':                 'tf-children-cbt-stage-5-3-premium-he',
  'children-cbt-stage-5-3-premium-he':                    'tf-children-cbt-stage-5-3-premium-he',
  'איך אני מבקש עזרה ילד':                                'tf-children-cbt-stage-5-3-premium-he',
  'בקשת עזרה ילד':                                        'tf-children-cbt-stage-5-3-premium-he',
  'איך מבקשים עזרה ילד':                                  'tf-children-cbt-stage-5-3-premium-he',

  'tf-children-cbt-stage-5-4-premium-he':                 'tf-children-cbt-stage-5-4-premium-he',
  'children-cbt-stage-5-4-premium-he':                    'tf-children-cbt-stage-5-4-premium-he',
  'איך מתקנים קשר ילד':                                   'tf-children-cbt-stage-5-4-premium-he',
  'תיקון קשר ילד':                                        'tf-children-cbt-stage-5-4-premium-he',
  'פתרון ריב ילד':                                        'tf-children-cbt-stage-5-4-premium-he',

  // ── Hebrew Children CBT Premium: Stage 6 (Relapse Prevention / Ending) ───
  'tf-children-cbt-stage-6-premium-he':                   'tf-children-cbt-stage-6-premium-he',
  'children-cbt-stage-6-premium-he':                      'tf-children-cbt-stage-6-premium-he',
  'שומרים על ההצלחה ילד':                                 'tf-children-cbt-stage-6-premium-he',
  'סיום טיפול ילד':                                       'tf-children-cbt-stage-6-premium-he',
  'מניעת נסיגה ילד':                                      'tf-children-cbt-stage-6-premium-he',
  'שימור הישגים ילד':                                     'tf-children-cbt-stage-6-premium-he',
  'שלב שישי ילד':                                         'tf-children-cbt-stage-6-premium-he',

  'tf-children-cbt-stage-6-1-premium-he':                 'tf-children-cbt-stage-6-1-premium-he',
  'children-cbt-stage-6-1-premium-he':                    'tf-children-cbt-stage-6-1-premium-he',
  'מה למדתי על עצמי ילד':                                 'tf-children-cbt-stage-6-1-premium-he',
  'מה הילד למד':                                          'tf-children-cbt-stage-6-1-premium-he',

  'tf-children-cbt-stage-6-2-premium-he':                 'tf-children-cbt-stage-6-2-premium-he',
  'children-cbt-stage-6-2-premium-he':                    'tf-children-cbt-stage-6-2-premium-he',
  'מתי עלול להיות לי שוב קשה ילד':                       'tf-children-cbt-stage-6-2-premium-he',
  'מניעת נסיגה לילד':                                     'tf-children-cbt-stage-6-2-premium-he',

  'tf-children-cbt-stage-6-3-premium-he':                 'tf-children-cbt-stage-6-3-premium-he',
  'children-cbt-stage-6-3-premium-he':                    'tf-children-cbt-stage-6-3-premium-he',
  'כרטיס הכוח שלי ילד':                                   'tf-children-cbt-stage-6-3-premium-he',
  'כרטיס כוח ילד':                                        'tf-children-cbt-stage-6-3-premium-he',
  'כרטיס התמודדות ילד':                                   'tf-children-cbt-stage-6-3-premium-he',

  'tf-children-cbt-stage-6-4-premium-he':                 'tf-children-cbt-stage-6-4-premium-he',
  'children-cbt-stage-6-4-premium-he':                    'tf-children-cbt-stage-6-4-premium-he',
  'אני ממשיך לבד ילד':                                    'tf-children-cbt-stage-6-4-premium-he',
  'הכלים שלי ילד':                                        'tf-children-cbt-stage-6-4-premium-he',
  'להמשיך לבד ילד':                                       'tf-children-cbt-stage-6-4-premium-he',

  // ── Children series — additional natural-language aliases ─────────────────
  'כל סדרת הטפסים לילדים':                                'tf-children-cbt-series-premium-he',
  'כל הסדרה לילדים בעברית':                               'tf-children-cbt-series-premium-he',
  'סדרת הטפסים לילדים':                                   'tf-children-cbt-series-premium-he',
  'סדרת הטפסים לילדים בעברית':                            'tf-children-cbt-series-premium-he',
});

// ─── Marker format ────────────────────────────────────────────────────────────
//
// The AI embeds a form intent using this exact marker format in message content:
//
//   [FORM:intent-slug]           — uses current session language (resolved by Chat)
//   [FORM:intent-slug:lang]      — requests a specific language (e.g. [FORM:thought-record:he])
//
// The marker is stripped from visible message content during sanitization.
// Only the intent-slug is passed to resolveFormIntent — the model never provides a URL.

export const FORM_INTENT_MARKER_PATTERN = /\[FORM:([a-z0-9_-]+)(?::([a-z]{2}))?\]/g;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Resolves a form intent string (slug or alias) to a `generated_file` metadata
 * object compatible with `message.metadata.generated_file`.
 *
 * This is the ONLY approved path for the AI to attach a therapeutic form.
 * The model must only emit intent slugs from the approved map — the actual
 * file URL is resolved here, never from model output.
 *
 * @param {string} intentOrSlug  - The intent slug from the `[FORM:slug]` marker.
 * @param {string} [lang='en']   - Preferred language code (ISO 639-1).
 * @returns {object|null}        - Generated file metadata, or null if unresolvable.
 */
export function resolveFormIntent(intentOrSlug, lang) {
  if (typeof intentOrSlug !== 'string' || !intentOrSlug.trim()) return null;

  // Normalize: lowercase, trim
  const normalizedIntent = intentOrSlug.toLowerCase().trim();

  // Look up the canonical form ID in the approved intent map
  const formId =
    APPROVED_FORM_INTENT_MAP[normalizedIntent] ||
    findApprovedExactFormId(normalizedIntent);
  if (!formId) return null;

  // Resolve language (default to English for safe fallback)
  const resolvedLang = typeof lang === 'string' && lang.trim() ? lang.trim() : 'en';

  return resolveApprovedFormById(formId, resolvedLang);
}

function resolveApprovedFormById(formId, lang = 'he') {
  const resolved = resolveFormWithLanguage(formId, lang);
  if (!resolved) return null;
  return toGeneratedFileMetadata(resolved);
}

function findApprovedExactFormId(candidateId) {
  const match = ALL_FORMS.find(
    (form) =>
      form?.approved === true &&
      typeof form.id === 'string' &&
      (form.id === candidateId ||
        (typeof form.slug === 'string' && form.slug === candidateId))
  );
  return match?.id || null;
}

// ─── Content-aware resolver for Hebrew children CBT premium ──────────────────

/**
 * Phrases that signal the user wants the FULL children CBT series, not one form.
 * Checked before individual-form scoring.
 */
const CHILDREN_HE_SERIES_TRIGGER_PHRASES = [
  'כל סדרת הטפסים לילדים',
  'כל הסדרה לילדים',
  'כל הטפסים לילדים',
  'סדרת ילדים',
  'סדרת cbt לילדים',
  'חוברת ילדים',
  'קונטרס ילדים',
  'כל שלבי הילדים',
  'חוברת עבודה לילדים',
  'סדרת הטפסים לילדים',
  'כל הרשימה של הטפסים',
  'את כל הרשימה',
  'הרשימה של הטפסים',
  'רשימת הטפסים',
  'מ-1 עד 6.4',
  'מ 1 עד 6.4',
  'כל הטפסים מהסידרה',
  'כל הטפסים מהסדרה',
];

/**
 * Words indicating the request concerns a child — required guard for form selection.
 * At least one must appear in the query (or the query must contain an explicit
 * stage/substage reference) before individual-form scoring is attempted.
 */
const CHILDREN_HE_CHILD_CONTEXT = [
  'ילד', 'ילדה', 'ילדים', 'הילד', 'לילד', 'עם ילד', 'הילדה', 'לילדה',
];

/**
 * Words that signal the user is requesting a form/worksheet/file, used as a
 * secondary guard when no child-context word is present.
 */
const CHILDREN_HE_FORM_REQUEST = [
  'טופס', 'דף עבודה', 'תשלח', 'לשלוח', 'תני לי',
];

/**
 * Regex for explicit substage references: "6.3", "4.1", etc.
 * Stage numbers 1–6, substage numbers 1–4.
 */
const SUBSTAGE_NUMBER_RE = /\b([1-6])\.([1-4])\b/;

/**
 * Scoring weights for the content-aware resolver.
 */
const CONTENT_SCORE = Object.freeze({
  SUBSTAGE_NUMBER_MATCH: 50,
  HEBREW_INTENT_PHRASE:  30,
  CHILD_SIGNAL:          20,
  CLINICAL_KEYWORD:      10,
});

/**
 * Minimum score required to return a match.
 * Must be ≥ one CHILD_SIGNAL match to avoid false positives.
 */
const CONTENT_MIN_SCORE = 20;

/**
 * Resolves a natural-language Hebrew request to the most clinically appropriate
 * individual Hebrew children CBT premium worksheet, using content-aware scoring.
 *
 * Scoring (additive):
 *   1. Explicit substage number (e.g. "6.3") in query:   +50 for that form
 *   2. hebrewIntentPhrases substring match:               +30 per match
 *   3. childSignals substring match:                      +20 per match
 *   4. clinicalKeywords substring match:                  +10 per match
 *
 * Guards:
 *   - If the query contains a series-trigger phrase → returns the full series.
 *   - If no child-context word, no form-request word, and no substage reference
 *     is present → returns null (e.g. "אני עצוב היום").
 *   - If best score < CONTENT_MIN_SCORE → returns null.
 *
 * @param {string} query - User's natural-language Hebrew query.
 * @returns {object|null} Generated-file metadata or null.
 */
export function resolveChildrenCBTPremiumFormByContent(query) {
  if (typeof query !== 'string' || !query.trim()) return null;

  const lq = query.toLowerCase().trim();

  // 1. Full series shortcut
  if (CHILDREN_HE_SERIES_TRIGGER_PHRASES.some(p => lq.includes(p.toLowerCase()))) {
    return resolveFormIntent('tf-children-cbt-series-premium-he', 'he');
  }

  // 2. Guards: child context OR form request OR explicit substage reference
  const hasChildContext  = CHILDREN_HE_CHILD_CONTEXT.some(s => lq.includes(s));
  const hasFormRequest   = CHILDREN_HE_FORM_REQUEST.some(s => lq.includes(s));
  const substageMatch    = lq.match(SUBSTAGE_NUMBER_RE);
  const substageRef      = substageMatch ? `${substageMatch[1]}.${substageMatch[2]}` : null;

  if (!hasChildContext && !hasFormRequest && !substageRef) return null;

  // 3. Score every approved individual children CBT premium form
  const candidates = ALL_FORMS.filter(
    f =>
      f.approved &&
      f.audience === 'children' &&
      f.category === 'children_cbt_process' &&
      typeof f.id === 'string' &&
      f.id.startsWith('tf-children-cbt-stage-')
  );

  let best      = null;
  let bestScore = 0;

  for (const form of candidates) {
    let score = 0;

    // Substage number match (highest priority)
    if (substageRef && form.cbt_substage_number === substageRef) {
      score += CONTENT_SCORE.SUBSTAGE_NUMBER_MATCH;
    }

    // hebrewIntentPhrases
    for (const phrase of (form.hebrewIntentPhrases ?? [])) {
      if (lq.includes(phrase.toLowerCase())) score += CONTENT_SCORE.HEBREW_INTENT_PHRASE;
    }

    // childSignals
    for (const signal of (form.childSignals ?? [])) {
      if (lq.includes(signal.toLowerCase())) score += CONTENT_SCORE.CHILD_SIGNAL;
    }

    // clinicalKeywords
    for (const kw of (form.clinicalKeywords ?? [])) {
      if (lq.includes(kw.toLowerCase())) score += CONTENT_SCORE.CLINICAL_KEYWORD;
    }

    if (score > bestScore) {
      bestScore = score;
      best      = form;
    }
  }

  if (best && bestScore >= CONTENT_MIN_SCORE) {
    return resolveFormIntent(best.id, 'he');
  }

  return null;
}

const CHILDREN_SPECIALIZED_SERIES_TRIGGERS = [
  'כל סדרת הטפסים הייעודיים לילדים בעברית',
  'כל הטפסים הייעודיים לילדים',
  'כל סדרת הטפסים לילדים',
  'כל הרשימה',
  'מה הטפסים בסדרה',
];

const CHILDREN_SPECIALIZED_FORM_REQUEST = [
  'טופס',
  'דף עבודה',
  'שלח',
  'תשלח',
  'קובץ',
  'pdf',
  'מנה',
];

const CHILDREN_SPECIALIZED_DISPLAY_NUMBER_RE = /([1-9])\.([1-6])/;
const CHILDREN_SPECIALIZED_PACK_REQUEST_RE = /(?:מנה|pack)\s*([1-9])/;

const SPECIALIZED_SCORE = Object.freeze({
  EXACT_TITLE: 160,
  DISPLAY_NUMBER: 130,
  DOMAIN: 80,
  THERAPEUTIC_GOAL: 35,
  SHORT_DESCRIPTION: 35,
  WHEN_TO_USE: 24,
  CHILD_SIGNALS: 20,
  CLINICAL_KEYWORDS: 14,
  HEBREW_INTENT: 42,
  AUDIENCE_LANGUAGE: 20,
});

const SPECIALIZED_MIN_SCORE = 42;

function scoreTextField(query, text, weight) {
  if (typeof text !== 'string' || !text.trim()) return 0;
  const normalizedText = normalizeIntentText(text);
  if (!normalizedText) return 0;
  if (query.includes(normalizedText)) return weight;
  const words = normalizedText.split(' ').filter((w) => w.length > 2);
  const matchedWords = words.filter((w) => query.includes(w)).length;
  return matchedWords >= 2 ? Math.floor(weight / 2) : 0;
}

function scoreArrayField(query, list, weight) {
  if (!Array.isArray(list)) return 0;
  let score = 0;
  for (const value of list) {
    if (typeof value === 'string' && value.trim()) {
      score += scoreTextField(query, value, weight);
    }
  }
  return score;
}

function normalizeIntentText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}.\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAnyIntentToken(query, terms) {
  return terms.some((t) => query.includes(normalizeIntentText(t)));
}

function scoreByPackMatch(form, query) {
  const phrases = [`מנה ${form.packNumber}`, `pack ${form.packNumber}`, `${form.packNumber}.1`];
  return hasAnyIntentToken(query, phrases) ? Math.floor(SPECIALIZED_SCORE.DOMAIN / 2) : 0;
}

function scoreFromPackFallback(query, form) {
  let score = 0;
  if (form.packNumber === 2 && /(מתפרץ|צועק|כועס|כעס|מתחרט)/.test(query)) score += 70;
  if (form.packNumber === 3 && /(ocd|בודק|שוב ושוב|חייבת לשטוף|חייב לשטוף|דחף)/.test(query)) score += 70;
  if (form.packNumber === 4 && /(לא אוהבים|חברים|דימוי עצמי|בושה|ערך עצמי)/.test(query)) score += 70;
  if (form.packNumber === 5 && /(בלי כוח|מצב רוח|קשה.*להתחיל|כבדות|מוטיבציה)/.test(query)) score += 80;
  if (form.packNumber === 6 && /(נזכר|בטוח עכשיו|משהו קשה|כרטיס ביטחון|טריגר)/.test(query)) score += 70;
  if (
    form.displayNumber === '7.3' &&
    /(הפסקות קצרות|תזכורות|תזכורת|להתרכז|focus)/.test(query)
  ) score += 100;
  return score;
}

function getChildrenSpecializedIndividualForms() {
  return ALL_FORMS.filter(
    (f) =>
      f.approved === true &&
      f.audience === 'children' &&
      f.language === 'he' &&
      f.childrenSeries === 'specialized' &&
      f.category === 'children_cbt_process' &&
      typeof f.displayNumber === 'string'
  );
}

function getChildrenSpecializedPackPdf(packNumber) {
  return ALL_FORMS.find(
    (f) =>
      f.approved === true &&
      f.audience === 'children' &&
      f.language === 'he' &&
      f.childrenSeries === 'specialized' &&
      f.category === 'workbook_series' &&
      f.isDomainPdf === true &&
      Number(f.packNumber) === Number(packNumber)
  );
}

function getChildrenSpecializedSeriesPdf() {
  return ALL_FORMS.find(
    (f) =>
      f.approved === true &&
      f.audience === 'children' &&
      f.language === 'he' &&
      f.childrenSeries === 'specialized' &&
      f.category === 'workbook_series' &&
      f.isFullSpecializedSeries === true
  );
}

export function resolveChildrenCBTSpecializedFormByContent(query) {
  if (typeof query !== 'string' || !query.trim()) return null;
  const lq = normalizeIntentText(query);

  const asksForSeries = CHILDREN_SPECIALIZED_SERIES_TRIGGERS.some((p) => lq.includes(normalizeIntentText(p)));
  if (asksForSeries) {
    const fullSeries = getChildrenSpecializedSeriesPdf();
    return fullSeries ? resolveApprovedFormById(fullSeries.id, 'he') : null;
  }

  const packMatch = lq.match(CHILDREN_SPECIALIZED_PACK_REQUEST_RE);
  const asksForWholePack = packMatch && /(כל|מלא|המנה|כל המנה)/.test(lq);
  if (asksForWholePack) {
    const packPdf = getChildrenSpecializedPackPdf(Number(packMatch[1]));
    return packPdf ? resolveApprovedFormById(packPdf.id, 'he') : null;
  }

  const hasFormRequest = CHILDREN_SPECIALIZED_FORM_REQUEST.some((p) => lq.includes(normalizeIntentText(p)));
  const hasChildOrParentContext = /(ילד|ילדה|ילדים|הורה|הורים|אמא|אבא|adhd)/.test(lq);
  const displayMatch = lq.match(CHILDREN_SPECIALIZED_DISPLAY_NUMBER_RE);
  const displayRef = displayMatch ? `${displayMatch[1]}.${displayMatch[2]}` : null;

  if (!hasFormRequest && !displayRef && !hasChildOrParentContext) return null;
  if (!hasFormRequest && !displayRef) {
    const semanticTrigger = /(מפחד|מתפרץ|צועק|בודק|לבדוק|adhd|כואבת|לחץ|הורה|שינה|כעס|דכדוך|בלי כוח|להתחיל|בטוח|חברים|דימוי|טראומה|ocd)/.test(lq);
    if (!semanticTrigger) return null;
  }

  const candidates = getChildrenSpecializedIndividualForms();
  let best = null;
  let bestScore = 0;

  for (const form of candidates) {
    let score = 0;
    const titleHe = form.titleHe || form.languages?.he?.title;
    const domain = form.domain || '';
    const displayNumber = form.displayNumber || '';

    if (titleHe) {
      score += scoreTextField(lq, titleHe, SPECIALIZED_SCORE.EXACT_TITLE);
    }

    if (displayRef && displayRef === displayNumber) {
      score += SPECIALIZED_SCORE.DISPLAY_NUMBER;
    } else if (displayNumber && lq.includes(displayNumber)) {
      score += Math.floor(SPECIALIZED_SCORE.DISPLAY_NUMBER / 2);
    }

    score += scoreTextField(lq, String(domain), SPECIALIZED_SCORE.DOMAIN);
    score += scoreTextField(lq, String(form.domainHe || ''), SPECIALIZED_SCORE.DOMAIN);
    score += scoreTextField(lq, form.therapeuticGoal, SPECIALIZED_SCORE.THERAPEUTIC_GOAL);
    score += scoreTextField(lq, form.shortContentDescriptionHe, SPECIALIZED_SCORE.SHORT_DESCRIPTION);
    score += scoreTextField(lq, form.whenToUse, SPECIALIZED_SCORE.WHEN_TO_USE);
    score += scoreArrayField(lq, form.childSignals, SPECIALIZED_SCORE.CHILD_SIGNALS);
    score += scoreArrayField(lq, form.clinicalKeywords, SPECIALIZED_SCORE.CLINICAL_KEYWORDS);
    score += scoreArrayField(lq, form.hebrewIntentPhrases, SPECIALIZED_SCORE.HEBREW_INTENT);
    score += scoreByPackMatch(form, lq);
    score += scoreFromPackFallback(lq, form);

    if (form.audience === 'children' && form.language === 'he') {
      score += SPECIALIZED_SCORE.AUDIENCE_LANGUAGE;
    }

    if (score > bestScore) {
      bestScore = score;
      best = form;
    }
  }

  if (!best || bestScore < SPECIALIZED_MIN_SCORE) return null;
  return resolveApprovedFormById(best.id, 'he');
}

const ADOLESCENTS_SPECIALIZED_SERIES_TRIGGERS = [
  'כל סדרת cbt ייעודית למתבגרים בעברית',
  'כל סדרת cbt הייעודית למתבגרים בעברית',
  'כל הסדרה הייעודית למתבגרים',
  'כל הטפסים הייעודיים למתבגרים',
  'כל סדרת המתבגרים הייעודית',
];

const ADOLESCENTS_SPECIALIZED_FORM_REQUEST = [
  'טופס',
  'דף עבודה',
  'worksheet',
  'pdf',
  'קובץ',
  'תשלח',
  'שלח',
  'מודול',
  'מנה',
  'סדרה',
];

const ADOLESCENTS_SPECIALIZED_DISPLAY_NUMBER_RE = /(?:^|\s)(10|[1-9])\.([1-6])(?:\s|$)/;
const ADOLESCENTS_SPECIALIZED_MODULE_REQUEST_RE = /(?:מודול|מנה|module|pack)\s*(10|[1-9])/;

function getAdolescentSpecializedIndividualForms() {
  return ALL_FORMS.filter(
    (f) =>
      f.approved === true &&
      f.audience === 'adolescents' &&
      f.language === 'he' &&
      f.adolescentSeries === 'specialized' &&
      f.category === 'adolescents_cbt_specialized' &&
      typeof f.worksheetNumber === 'string'
  );
}

function getAdolescentSpecializedModulePdf(moduleNumber) {
  return ALL_FORMS.find(
    (f) =>
      f.approved === true &&
      f.audience === 'adolescents' &&
      f.language === 'he' &&
      f.adolescentSeries === 'specialized' &&
      f.category === 'workbook_series' &&
      f.isModulePdf === true &&
      Number(f.moduleNumber) === Number(moduleNumber)
  );
}

function getAdolescentSpecializedSeriesPdf() {
  return ALL_FORMS.find(
    (f) =>
      f.approved === true &&
      f.audience === 'adolescents' &&
      f.language === 'he' &&
      f.adolescentSeries === 'specialized' &&
      f.category === 'workbook_series' &&
      f.isFullSpecializedSeries === true
  );
}

function scoreByAdolescentModuleMatch(form, query) {
  const phrases = [`מודול ${form.moduleNumber}`, `מנה ${form.moduleNumber}`, `${form.moduleNumber}.1`];
  return hasAnyIntentToken(query, phrases) ? Math.floor(SPECIALIZED_SCORE.DOMAIN / 2) : 0;
}

function scoreFromAdolescentModuleFallback(query, form) {
  let score = 0;
  if (form.moduleNumber === 1 && /(מבחן|מבחנים|לחץ|דואג|דאגה|נמנע|אומץ|פחד|חרדה|להיכשל|להמנע|להימנע)/.test(query)) score += 70;
  if (form.moduleNumber === 2 && /(בלי אנרגיה|אין אנרגיה|מצב רוח|תפקוד|להתחיל|פעולות קטנות|פעולה קטנה|אין חשק|כבדות)/.test(query)) score += 80;
  if (form.moduleNumber === 3 && /(משווה את עצמה|משווה את עצמי|לא שווה|ערך עצמי|ביקורת עצמית|חוזקות|זהות|השוואה)/.test(query)) score += 80;
  if (form.moduleNumber === 4 && /(דחוי|דחויה|חברים|חברתית|גבולות|תקשורת|רשתות|שייך|שייכות)/.test(query)) score += 80;
  if (form.moduleNumber === 5 && /(כעס|מתפרץ|מתפרצת|מתחרט|אימפולסיב|להירגע|תיקון|ריב)/.test(query)) score += 80;
  if (form.moduleNumber === 6 && /(ocd|חודרני|חודרניות|ספק|בודק|שוב ושוב|אישור|טקס|דחף)/.test(query)) score += 80;
  if (form.moduleNumber === 7 && /(adhd|מוסח|דוחה משימות|משימות|לארגן זמן|מתחיל משימה|דחיינות|מתכננים את הזמן|פועלים)/.test(query)) score += 80;
  if (form.moduleNumber === 8 && /(שינה|לא ישנה|לא ישן|לחץ בגוף|נשימות|להירגע|איזון|עומס|סטרס)/.test(query)) score += 80;
  if (form.moduleNumber === 9 && /(מקום בטוח|קרקוע|תמיכה|תקופה קשה|טריגר|טראומה|כאן ועכשיו|שגרה)/.test(query)) score += 80;
  if (form.moduleNumber === 10 && /(הורים|בבית|תקשורת בבית|גבולות|אמון|שיתוף פעולה|משפחתית|עצמאות)/.test(query)) score += 80;

  if (form.worksheetNumber === '1.3' && /(מבחן|מבחנים|להיכשל|ללמוד)/.test(query)) score += 100;
  if (form.worksheetNumber === '1.4' && /(נמנע|להימנע|דוחה|avoid)/.test(query)) score += 90;
  if (form.worksheetNumber === '1.5' && /(אומץ|צעד קטן|gradual|הדרגתי)/.test(query)) score += 100;
  if (form.worksheetNumber === '2.3' && /(פעולה קטנה|להתחיל|בקטן)/.test(query)) score += 100;
  if (form.worksheetNumber === '2.6' && /(שבוע הקרוב|שגרה|תוכנית)/.test(query)) score += 90;
  if (form.worksheetNumber === '3.1' && /(ביקורתי|אומרת שהיא לא שווה|אומר שהוא לא שווה|מה אני אומר|self critic)/.test(query)) score += 100;
  if (form.worksheetNumber === '3.4' && /(חוזקות|כוחות|strengths)/.test(query)) score += 90;
  if (form.worksheetNumber === '3.6' && /(משווה|השוואה|comparison)/.test(query)) score += 100;
  if (form.worksheetNumber === '4.2' && /(דחוי|דחויה|rejection)/.test(query)) score += 100;
  if (form.worksheetNumber === '4.3' && /(גבולות|boundary)/.test(query)) score += 100;
  if (form.worksheetNumber === '4.4' && /(תקשורת|להגיד|לומר|communicat)/.test(query)) score += 90;
  if (form.worksheetNumber === '5.1' && /(עוצרים רגע|pause|מתפרץ|מתחרט)/.test(query)) score += 100;
  if (form.worksheetNumber === '5.5' && /(מתחרט|repair|לתקן)/.test(query)) score += 90;
  if (form.worksheetNumber === '6.2' && /(ספק|uncertainty|אי ודאות)/.test(query)) score += 100;
  if (form.worksheetNumber === '6.5' && /(בודק|שוב ושוב|אישור)/.test(query)) score += 100;
  if (form.worksheetNumber === '7.3' && /(משימה|לפרק|צעדים|task breakdown)/.test(query)) score += 100;
  if (form.worksheetNumber === '7.4' && /(לארגן זמן|זמן|planning)/.test(query)) score += 100;
  if (form.worksheetNumber === '7.5' && /(דוחה משימות|דחיינות|procrastin)/.test(query)) score += 100;
  if (form.worksheetNumber === '8.2' && /(שינה|להירדם|sleep)/.test(query)) score += 100;
  if (form.worksheetNumber === '8.4' && /(נשימות|breath|לאיזון)/.test(query)) score += 100;
  if (form.worksheetNumber === '9.1' && /(מקום בטוח|safe place)/.test(query)) score += 100;
  if (form.worksheetNumber === '9.4' && /(קרקוע|grounding|כאן ועכשיו)/.test(query)) score += 100;
  if (form.worksheetNumber === '9.5' && /(תמיכה|support|מי תומך)/.test(query)) score += 90;
  if (form.worksheetNumber === '10.1' && /(תקשורת בבית|לדבר בבית|communication)/.test(query)) score += 100;
  if (form.worksheetNumber === '10.2' && /(גבולות|boundary)/.test(query)) score += 100;
  if (form.worksheetNumber === '10.3' && /(אמון|trust)/.test(query)) score += 100;
  if (form.worksheetNumber === '10.6' && /(תוכנית משפחתית|family plan|שיתוף פעולה)/.test(query)) score += 90;

  return score;
}

export function resolveAdolescentsCBTSpecializedFormByContent(query) {
  if (typeof query !== 'string' || !query.trim()) return null;
  const lq = normalizeIntentText(query);

  const asksForSeries = ADOLESCENTS_SPECIALIZED_SERIES_TRIGGERS.some((p) => lq.includes(normalizeIntentText(p)));
  if (asksForSeries && /(pdf|קובץ|תשלח|שלח)/.test(lq)) {
    const fullSeries = getAdolescentSpecializedSeriesPdf();
    return fullSeries ? resolveApprovedFormById(fullSeries.id, 'he') : null;
  }

  const moduleMatch = lq.match(ADOLESCENTS_SPECIALIZED_MODULE_REQUEST_RE);
  const asksForWholeModule = moduleMatch && /(כל|מלא|המודול|כל המודול|full)/.test(lq);
  if (asksForWholeModule) {
    const modulePdf = getAdolescentSpecializedModulePdf(Number(moduleMatch[1]));
    return modulePdf ? resolveApprovedFormById(modulePdf.id, 'he') : null;
  }

  const hasFormRequest = ADOLESCENTS_SPECIALIZED_FORM_REQUEST.some((p) => lq.includes(normalizeIntentText(p)));
  const hasTeenContext = /(מתבגר|מתבגרת|מתבגרים|מתבגרים|נער|נערה|בני נוער|נוער|teen|adolescent|בן 1[2-8]|בת 1[2-8]|גיל 1[2-8])/.test(lq);
  const hasChildContext = /(ילד|ילדה|ילדים|בן 8|בת 8|בן 9|בת 9|בן 10|בת 10|בן 11|בת 11|age under 12|age 8|age 9|age 10|age 11)/.test(lq);
  const displayMatch = lq.match(ADOLESCENTS_SPECIALIZED_DISPLAY_NUMBER_RE);
  const displayRef = displayMatch ? `${displayMatch[1]}.${displayMatch[2]}` : null;

  if (hasChildContext && !hasTeenContext && !displayRef) return null;
  if (!hasFormRequest && !displayRef && !hasTeenContext) return null;
  if (!hasFormRequest && !displayRef) {
    const semanticTrigger = /(לחץ|מבחן|להימנע|בלי אנרגיה|להתחיל|לא שווה|משווה|דחוי|גבולות|מתפרץ|מתחרט|חודרני|שוב ושוב|מוסח|דוחה משימות|שינה|נשימות|מקום בטוח|קרקוע|הורים|אמון)/.test(lq);
    if (!semanticTrigger) return null;
  }

  const candidates = getAdolescentSpecializedIndividualForms();
  let best = null;
  let bestScore = 0;

  for (const form of candidates) {
    let score = 0;
    const titleHe = form.titleHe || form.languages?.he?.title;
    const module = form.module || '';
    const moduleHe = form.moduleHe || '';
    const worksheetNumber = form.worksheetNumber || '';

    if (titleHe) {
      score += scoreTextField(lq, titleHe, SPECIALIZED_SCORE.EXACT_TITLE);
    }

    if (displayRef && displayRef === worksheetNumber) {
      score += SPECIALIZED_SCORE.DISPLAY_NUMBER;
    } else if (worksheetNumber && lq.includes(worksheetNumber)) {
      score += Math.floor(SPECIALIZED_SCORE.DISPLAY_NUMBER / 2);
    }

    score += scoreTextField(lq, String(module), SPECIALIZED_SCORE.DOMAIN);
    score += scoreTextField(lq, String(moduleHe), SPECIALIZED_SCORE.DOMAIN);
    score += scoreTextField(lq, form.therapeuticGoal, SPECIALIZED_SCORE.THERAPEUTIC_GOAL);
    score += scoreTextField(lq, form.shortContentDescriptionHe, SPECIALIZED_SCORE.SHORT_DESCRIPTION);
    score += scoreTextField(lq, form.whenToUse, SPECIALIZED_SCORE.WHEN_TO_USE);
    score += scoreArrayField(lq, form.teenSignals, SPECIALIZED_SCORE.CHILD_SIGNALS);
    score += scoreArrayField(lq, form.clinicalKeywords, SPECIALIZED_SCORE.CLINICAL_KEYWORDS);
    score += scoreArrayField(lq, form.hebrewIntentPhrases, SPECIALIZED_SCORE.HEBREW_INTENT);
    score += scoreByAdolescentModuleMatch(form, lq);
    score += scoreFromAdolescentModuleFallback(lq, form);

    if (form.audience === 'adolescents' && form.language === 'he') {
      score += SPECIALIZED_SCORE.AUDIENCE_LANGUAGE;
    }

    if (score > bestScore) {
      bestScore = score;
      best = form;
    }
  }

  if (!best || bestScore < SPECIALIZED_MIN_SCORE) return null;
  return resolveApprovedFormById(best.id, 'he');
}

const ADOLESCENTS_CBT_CORE_EN_FORM_REQUEST = [
  'worksheet',
  'form',
  'pdf',
  'cbt core',
  'core series',
  'adolescent cbt',
  'teen cbt',
  'show me',
  'recommend',
  'stage',
];

const ADOLESCENTS_CBT_CORE_EN_SERIES_TRIGGERS = [
  'show me the english adolescent cbt core series',
  'show me the full english adolescent cbt core series',
  'full english adolescent cbt core series',
  'english adolescent cbt core series',
  'adolescents cbt core series 1',
];

const ADOLESCENTS_CBT_CORE_EN_WORKSHEET_RE = /\b([1-6])\.([1-5])\b/;
const ADOLESCENTS_CBT_CORE_EN_STAGE_RE = /\bstage\s*([1-6])\b/;
const ADOLESCENTS_CBT_CORE_EN_MIN_SCORE = 42;

function getAdolescentsCBTCoreEnglishForms() {
  return FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL.filter(
    (f) =>
      f.approved === true &&
      f.language === 'en' &&
      f.category === 'adolescents_cbt_core' &&
      typeof f.worksheetNumber === 'string'
  );
}

function scoreFromAdolescentsCoreEnglishFallback(query, form) {
  let score = 0;
  if (form.stageNumber === 1 && /(overwhelmed|what is happening|happening inside|body signals|trigger|thought.*feeling.*action)/.test(query)) score += 100;
  if (form.stageNumber === 2 && /(automatic thoughts|won't succeed|will not succeed|everyone will blame|thinking patterns|hidden beliefs)/.test(query)) score += 100;
  if (form.stageNumber === 3 && /(check evidence|evidence|balanced thought|alternative perspective|is this thought true|choose what to think)/.test(query)) score += 100;
  if (form.stageNumber === 4 && /(choose what to do|choosing actions|small steps|review|evaluation|difficult situation)/.test(query)) score += 100;
  if (form.stageNumber === 5 && /(avoid|avoidance|gradual exposure|effective action|persistence|tracking action)/.test(query)) score += 100;
  if (form.stageNumber === 6 && /(personal plan|weekly check|encouragement|road card|hard moments|looking ahead|keeping going)/.test(query)) score += 100;

  if (form.worksheetNumber === '1.1' && /(what is going on|right now)/.test(query)) score += 80;
  if (form.worksheetNumber === '1.2' && /(body signals|my body)/.test(query)) score += 80;
  if (form.worksheetNumber === '1.4' && /(thought.*feeling.*action)/.test(query)) score += 80;
  if (form.worksheetNumber === '5.3' && /(gradual exposure|exposure)/.test(query)) score += 80;
  return score;
}

export function resolveAdolescentsCBTCoreEnglishFormByContent(query) {
  if (typeof query !== 'string' || !query.trim()) return null;
  const lq = normalizeIntentText(query);

  const hasTeenContext = /(teen|teens|adolescent|adolescents|age 1[2-8]|age: 1[2-8]|\b1[2-8]\b)/.test(lq);
  const hasChildContext = /(child|children|kid|age 8|age 9|age 10|age 11|\b8 years old\b|\b9 years old\b|\b10 years old\b|\b11 years old\b)/.test(lq);
  if (hasChildContext && !hasTeenContext) return null;

  const asksForSeries = ADOLESCENTS_CBT_CORE_EN_SERIES_TRIGGERS.some((p) => lq.includes(normalizeIntentText(p)));
  const hasFormRequest = ADOLESCENTS_CBT_CORE_EN_FORM_REQUEST.some((p) => lq.includes(normalizeIntentText(p)));
  const worksheetMatch = lq.match(ADOLESCENTS_CBT_CORE_EN_WORKSHEET_RE);
  const worksheetRef = worksheetMatch ? `${worksheetMatch[1]}.${worksheetMatch[2]}` : null;
  const stageMatch = lq.match(ADOLESCENTS_CBT_CORE_EN_STAGE_RE);
  const stageRef = stageMatch ? Number(stageMatch[1]) : null;

  if (!asksForSeries && !hasFormRequest && !worksheetRef && !hasTeenContext) {
    const semanticTrigger = /(overwhelmed|what is going on for me right now|automatic thoughts|check evidence|balanced thought|difficult situation|avoid|exposure|weekly check|encouragement|road card|cbt core)/.test(lq);
    if (!semanticTrigger) return null;
  }

  const candidates = getAdolescentsCBTCoreEnglishForms();
  let best = null;
  let bestScore = 0;
  const INTENT_PHRASE_SCORE = SPECIALIZED_SCORE.HEBREW_INTENT;

  for (const form of candidates) {
    let score = 0;
    score += scoreTextField(lq, form.title, SPECIALIZED_SCORE.EXACT_TITLE);
    score += scoreTextField(lq, form.stageTitle, SPECIALIZED_SCORE.DOMAIN);
    score += scoreTextField(lq, form.therapeuticGoal, SPECIALIZED_SCORE.THERAPEUTIC_GOAL);
    score += scoreTextField(lq, form.shortContentDescription, SPECIALIZED_SCORE.SHORT_DESCRIPTION);
    score += scoreArrayField(lq, form.whenToUse, SPECIALIZED_SCORE.WHEN_TO_USE);
    score += scoreArrayField(lq, form.teenSignals, SPECIALIZED_SCORE.CHILD_SIGNALS);
    score += scoreArrayField(lq, form.clinicalKeywords, SPECIALIZED_SCORE.CLINICAL_KEYWORDS);
    score += scoreArrayField(lq, form.intentPhrases, INTENT_PHRASE_SCORE);
    score += scoreArrayField(lq, form.notFor, SPECIALIZED_SCORE.CLINICAL_KEYWORDS);
    score += scoreArrayField(lq, form.relatedForms, SPECIALIZED_SCORE.CLINICAL_KEYWORDS);

    if (worksheetRef && form.worksheetNumber === worksheetRef) {
      score += SPECIALIZED_SCORE.DISPLAY_NUMBER;
    } else if (form.worksheetNumber && lq.includes(form.worksheetNumber)) {
      score += Math.floor(SPECIALIZED_SCORE.DISPLAY_NUMBER / 2);
    }

    if (stageRef && Number(form.stageNumber) === stageRef) {
      score += SPECIALIZED_SCORE.DOMAIN;
    }
    if (asksForSeries) {
      score += 10;
    }

    score += scoreFromAdolescentsCoreEnglishFallback(lq, form);

    if (form.audience === 'adolescents' && form.language === 'en') {
      score += SPECIALIZED_SCORE.AUDIENCE_LANGUAGE;
    }

    if (score > bestScore) {
      bestScore = score;
      best = form;
    }
  }

  if (!best || bestScore < ADOLESCENTS_CBT_CORE_EN_MIN_SCORE) return null;
  return resolveApprovedFormById(best.id, 'en');
}

const ADOLESCENTS_CBT_SPECIALIZED_EN_FORM_REQUEST = [
  'worksheet',
  'worksheets',
  'form',
  'pdf',
  'cbt specialized',
  'specialized series',
  'adolescent cbt',
  'teen cbt',
  'module',
  'recommend',
  'show me',
];

const ADOLESCENTS_CBT_SPECIALIZED_EN_EXPLICIT_REQUEST = [
  'in english',
  'english worksheet',
  'english worksheets',
  'english forms',
  'english specialized',
];

const ADOLESCENTS_CBT_SPECIALIZED_EN_WORKSHEET_RE = /\b(10|[1-9])\.([1-6])\b/;
const ADOLESCENTS_CBT_SPECIALIZED_EN_MODULE_RE = /\bmodule\s*(10|[1-9])\b/;
const ADOLESCENTS_CBT_SPECIALIZED_EN_MIN_SCORE = 42;

function getAdolescentsCBTSpecializedEnglishForms() {
  return ALL_FORMS.filter(
    (f) =>
      f.approved === true &&
      f.audience === 'adolescents' &&
      f.language === 'en' &&
      f.adolescentSeries === 'specialized' &&
      f.category === 'adolescents_cbt_specialized' &&
      typeof f.worksheetNumber === 'string'
  );
}

function scoreFromAdolescentsSpecializedEnglishFallback(query, form) {
  let score = 0;
  if (form.moduleNumber === 1 && /(anxiety|stress|fear|fears|test|before the test|avoid|avoidance|courage)/.test(query)) score += 85;
  if (form.moduleNumber === 2 && /(low energy|energy|mood|functioning|small action|start small|can't start|activation)/.test(query)) score += 85;
  if (form.moduleNumber === 3 && /(self-worth|self worth|self-esteem|identity|comparison|criticism|inner critic)/.test(query)) score += 85;
  if (form.moduleNumber === 4 && /(friends|friendship|rejection|belonging|boundaries|conflict|social media)/.test(query)) score += 85;
  if (form.moduleNumber === 5 && /(anger|impulsive|impulsivity|pause|react quickly|repair)/.test(query)) score += 85;
  if (form.moduleNumber === 6 && /(ocd|intrusive|checking|reassurance|doubt|response prevention|uncertainty)/.test(query)) score += 95;
  if (form.moduleNumber === 7 && /(adhd|attention|distracted|procrastinat|organizing|organization|task breakdown)/.test(query)) score += 85;
  if (form.moduleNumber === 8 && /(sleep|body|somatic|stress in body|overload|relaxation|breathing)/.test(query)) score += 85;
  if (form.moduleNumber === 9 && /(trauma|grounding|safe coping|trigger|stabilization|safe place|gradual return)/.test(query)) score += 95;
  if (form.moduleNumber === 10 && /(parents|home|communication|trust|responsibility|cooperation|boundaries at home)/.test(query)) score += 85;
  return score;
}

function hasExplicitEnglishFormRequest(query) {
  const normalizedQuery = normalizeIntentText(query);
  return ADOLESCENTS_CBT_SPECIALIZED_EN_EXPLICIT_REQUEST.some((p) =>
    normalizedQuery.includes(normalizeIntentText(p))
  );
}

export function resolveAdolescentsCBTSpecializedEnglishFormByContent(query, options = {}) {
  if (typeof query !== 'string' || !query.trim()) return null;
  const lq = normalizeIntentText(query);
  const activeLanguage = normalizeIntentText(options.activeLanguage || 'en') || 'en';
  const explicitEnglishRequested = options.explicitEnglishRequested === true || hasExplicitEnglishFormRequest(query);

  if (activeLanguage !== 'en' && !explicitEnglishRequested) return null;

  const hasTeenContext = /(teen|teens|adolescent|adolescents|age 1[2-8]|age: 1[2-8]|\b1[2-8]\b)/.test(lq);
  const hasChildContext = /(child|children|kid|age 8|age 9|age 10|age 11|\b8 years old\b|\b9 years old\b|\b10 years old\b|\b11 years old\b)/.test(lq);
  if (hasChildContext && !hasTeenContext) return null;

  const hasFormRequest = ADOLESCENTS_CBT_SPECIALIZED_EN_FORM_REQUEST.some((p) =>
    lq.includes(normalizeIntentText(p))
  );
  const worksheetMatch = lq.match(ADOLESCENTS_CBT_SPECIALIZED_EN_WORKSHEET_RE);
  const worksheetRef = worksheetMatch ? `${worksheetMatch[1]}.${worksheetMatch[2]}` : null;
  const moduleMatch = lq.match(ADOLESCENTS_CBT_SPECIALIZED_EN_MODULE_RE);
  const moduleRef = moduleMatch ? Number(moduleMatch[1]) : null;

  if (!hasFormRequest && !worksheetRef && !moduleRef && !hasTeenContext) {
    const semanticTrigger = /(anxiety|stress|fear|test|avoid|low energy|mood|self-worth|identity|friends|boundaries|anger|impulsive|ocd|intrusive|adhd|procrastinat|sleep|body stress|grounding|trauma|parents|communication|cooperation)/.test(lq);
    if (!semanticTrigger) return null;
  }

  const candidates = getAdolescentsCBTSpecializedEnglishForms();
  let best = null;
  let bestScore = 0;
  const INTENT_PHRASE_SCORE = SPECIALIZED_SCORE.HEBREW_INTENT;

  for (const form of candidates) {
    let score = 0;
    score += scoreTextField(lq, form.title, SPECIALIZED_SCORE.EXACT_TITLE);
    score += scoreTextField(lq, form.moduleTitle, SPECIALIZED_SCORE.DOMAIN);
    score += scoreTextField(lq, form.therapeuticGoal, SPECIALIZED_SCORE.THERAPEUTIC_GOAL);
    score += scoreTextField(lq, form.shortContentDescription, SPECIALIZED_SCORE.SHORT_DESCRIPTION);
    score += scoreArrayField(lq, form.whenToUse, SPECIALIZED_SCORE.WHEN_TO_USE);
    score += scoreArrayField(lq, form.teenSignals, SPECIALIZED_SCORE.CHILD_SIGNALS);
    score += scoreArrayField(lq, form.clinicalKeywords, SPECIALIZED_SCORE.CLINICAL_KEYWORDS);
    score += scoreArrayField(lq, form.intentPhrases, INTENT_PHRASE_SCORE);

    if (worksheetRef && form.worksheetNumber === worksheetRef) {
      score += SPECIALIZED_SCORE.DISPLAY_NUMBER;
    } else if (form.worksheetNumber && lq.includes(form.worksheetNumber)) {
      score += Math.floor(SPECIALIZED_SCORE.DISPLAY_NUMBER / 2);
    }

    if (moduleRef && Number(form.moduleNumber) === moduleRef) {
      score += SPECIALIZED_SCORE.DOMAIN;
    }

    score += scoreFromAdolescentsSpecializedEnglishFallback(lq, form);

    if (form.audience === 'adolescents' && form.language === 'en') {
      score += SPECIALIZED_SCORE.AUDIENCE_LANGUAGE;
    }

    if (score > bestScore) {
      bestScore = score;
      best = form;
    }
  }

  if (!best || bestScore < ADOLESCENTS_CBT_SPECIALIZED_EN_MIN_SCORE) return null;
  return resolveApprovedFormById(best.id, 'en');
}
