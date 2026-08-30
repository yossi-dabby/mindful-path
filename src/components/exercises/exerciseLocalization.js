import { SUPPORTED_LOCALES, normalizeAppLocale } from '@/components/i18n/appLocale';

const TRANSLATABLE_FIELDS = [
  'title',
  'description',
  'detailed_description',
  'instructions',
  'detailed_steps',
  'tips',
  'benefits',
  'tags',
  'visualization_script',
  'summary',
  'when_to_use',
  'contraindications',
  'evidence_base'
];

function getLocaleObject(exercise, locale) {
  const containers = [
    exercise?.translations,
    exercise?.localized_content,
    exercise?.localizations
  ];

  for (const container of containers) {
    if (container && typeof container === 'object' && container[locale] && typeof container[locale] === 'object') {
      return container[locale];
    }
  }

  const fieldVariant = {};
  for (const field of TRANSLATABLE_FIELDS) {
    const localizedValue = exercise?.[`${field}_${locale}`];
    if (localizedValue !== undefined && localizedValue !== null && localizedValue !== '') {
      fieldVariant[field] = localizedValue;
    }
  }
  return fieldVariant;
}

export function getExerciseIdentity(exercise) {
  return exercise?.slug || exercise?.translation_key || exercise?.source_id || exercise?.id || exercise?.title;
}

export function localizeExercise(exercise, requestedLocale) {
  if (!exercise || typeof exercise !== 'object') return exercise;

  const locale = normalizeAppLocale(requestedLocale);
  const localized = getLocaleObject(exercise, locale);
  const hasLocalizedFields = Object.keys(localized).length > 0;
  const contentLanguage = normalizeAppLocale(exercise.language || 'en');

  return {
    ...exercise,
    ...(hasLocalizedFields ? localized : {}),
    content_language: hasLocalizedFields ? locale : contentLanguage,
    localization_available: hasLocalizedFields || contentLanguage === locale || locale === 'en'
  };
}

export function localizeExerciseCollection(exercises, requestedLocale) {
  const locale = normalizeAppLocale(requestedLocale);
  const source = Array.isArray(exercises) ? exercises : [];
  const localizedByIdentity = new Map();

  for (const exercise of source) {
    const identity = getExerciseIdentity(exercise);
    const language = normalizeAppLocale(exercise?.language || 'en');
    const existing = localizedByIdentity.get(identity);
    const priority = language === locale ? 3 : language === 'en' ? 2 : 1;

    if (!existing || priority > existing.priority) {
      localizedByIdentity.set(identity, { exercise, priority });
    }
  }

  return Array.from(localizedByIdentity.values(), ({ exercise }) => localizeExercise(exercise, locale));
}

export function hasExerciseLocale(exercise, requestedLocale) {
  const locale = normalizeAppLocale(requestedLocale);
  if (!SUPPORTED_LOCALES.includes(locale)) return false;
  return localizeExercise(exercise, locale)?.localization_available === true;
}

export { TRANSLATABLE_FIELDS };
