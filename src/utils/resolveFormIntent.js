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
 * - Language falls back to English when the requested language is unavailable.
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
} from '../data/therapeuticForms/index.js';

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
  const formId = APPROVED_FORM_INTENT_MAP[normalizedIntent];
  if (!formId) return null;

  // Resolve language (default to English for safe fallback)
  const resolvedLang = typeof lang === 'string' && lang.trim() ? lang.trim() : 'en';

  // Use the TherapeuticForms resolver — this enforces approved: true and valid file_url
  const resolved = resolveFormWithLanguage(formId, resolvedLang);
  if (!resolved) return null;

  // Convert to generated_file metadata shape
  const metadata = toGeneratedFileMetadata(resolved);
  return metadata; // null when shape is incomplete (resolver contract)
}
