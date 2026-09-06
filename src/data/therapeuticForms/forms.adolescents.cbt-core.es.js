const DEFINITIONS = Object.freeze([
  {
    number: '1.1',
    slug: 'que-me-esta-pasando-ahora-mismo',
    title: '¿Qué me está pasando ahora mismo?',
    fileName: '01-01-que-me-esta-pasando-ahora-mismo.pdf',
    description: 'Reconocer el estado actual y empezar a identificar lo que está ocurriendo ahora mismo.',
    therapeuticGoal: 'Desarrollar una primera conciencia de los pensamientos, las emociones y el contexto presentes.',
    whenToUse: 'Usar cuando un adolescente necesita hacer una pausa y describir lo que está ocurriendo.',
    keywords: ['registro personal', 'autoconciencia', 'estado actual'],
  },
  {
    number: '1.2',
    slug: 'mi-cuerpo-me-da-senales',
    title: 'Mi cuerpo me da señales',
    fileName: '01-02-mi-cuerpo-me-da-senales.pdf',
    description: 'Identificar señales corporales relacionadas con el estrés, la ansiedad y la activación emocional.',
    therapeuticGoal: 'Ayudar a adolescentes a reconocer sensaciones corporales como señales tempranas para regularse.',
    whenToUse: 'Usar ante consultas sobre señales corporales, síntomas físicos o emociones en el cuerpo.',
    keywords: ['señales corporales', 'sensaciones físicas', 'regulación emocional'],
  },
  {
    number: '1.3',
    slug: 'que-me-activo',
    title: '¿Qué me activó?',
    fileName: '01-03-que-me-activo.pdf',
    description: 'Identificar situaciones, lugares, pensamientos o comentarios que provocaron activación emocional.',
    therapeuticGoal: 'Aumentar la conciencia de los desencadenantes antes de que la reacción se intensifique.',
    whenToUse: 'Usar para reconocer qué inició una emoción o reacción intensa.',
    keywords: ['desencadenante', 'situación', 'activación'],
  },
  {
    number: '1.4',
    slug: 'pensamiento-emocion-accion',
    title: 'Pensamiento, emoción y acción',
    fileName: '01-04-pensamiento-emocion-accion.pdf',
    description: 'Representar la relación entre un pensamiento, una emoción y una conducta.',
    therapeuticGoal: 'Enseñar de manera práctica la conexión central del triángulo de la TCC.',
    whenToUse: 'Usar cuando se necesita analizar la relación entre pensamiento, emoción y acción.',
    keywords: ['triángulo TCC', 'pensamiento emoción acción', 'cadena de reacción'],
  },
  {
    number: '1.5',
    slug: 'mi-mapa-personal',
    title: 'Mi mapa personal',
    fileName: '01-05-mi-mapa-personal.pdf',
    description: 'Crear un mapa personal de recursos, apoyos y acciones útiles.',
    therapeuticGoal: 'Fortalecer una estructura personal de afrontamiento y planificación de apoyo.',
    whenToUse: 'Usar cuando un adolescente quiere identificar apoyos y acciones que le ayudan.',
    keywords: ['mapa de afrontamiento', 'apoyos', 'recursos personales'],
  },
]);

const NOT_FOR = Object.freeze([
  'menores de 12 años',
  'personas adultas',
  'intervención en crisis',
  'emergencias de salud mental',
  'procesamiento de trauma sin apoyo profesional',
]);

export const FORMS_ADOLESCENTS_CBT_CORE_ES_PILOT = Object.freeze(
  DEFINITIONS.map((definition, index) => {
    const worksheet = index + 1;
    const id = `adolescents-cbt-core-es-1-${worksheet}`;
    const sourceId = `adolescents-cbt-core-en-1-${worksheet}`;
    const fileUrl = `/forms/es/adolescents/cbt-core/stage-01/${definition.fileName}`;

    return Object.freeze({
      id,
      slug: `adolescents-cbt-core-es-1-${worksheet}-${definition.slug}`,
      parentSeriesId: 'adolescents-cbt-core-es',
      type: 'individual_worksheet',
      title: definition.title,
      language: 'es',
      audience: 'adolescents',
      category: 'adolescents_cbt_core',
      secondaryCategories: Object.freeze(['therapeutic_workbooks', 'thought_records', 'emotional_regulation', 'coping_tools']),
      formNumber: definition.number,
      worksheetNumber: definition.number,
      displayNumber: definition.number,
      stageNumber: 1,
      moduleNumber: 1,
      stageTitle: 'Etapa 1 — Comprender lo que está ocurriendo',
      pageNumberInWorkbook: worksheet,
      description: definition.description,
      therapeuticGoal: definition.therapeuticGoal,
      whenToUse: definition.whenToUse,
      clinicalKeywords: Object.freeze([...definition.keywords, 'TCC para adolescentes', `formulario ${definition.number}`]),
      intentPhrases: Object.freeze([definition.title, `formulario ${definition.number}`, `enviar formulario ${definition.number}`]),
      notFor: NOT_FOR,
      relatedForms: Object.freeze([sourceId]),
      therapeutic_use: 'adolescents_cbt_core_individual_worksheet',
      approved: true,
      logical_form_id: `adolescents-cbt-core-1-${worksheet}`,
      variant_language: 'es',
      available_languages: Object.freeze(['en', 'es']),
      sibling_variant_ids: Object.freeze([sourceId]),
      source_language: 'en',
      is_language_variant: true,
      variant_group_id: `adolescents-cbt-core-1-${worksheet}`,
      languages: Object.freeze({
        es: Object.freeze({
          title: definition.title,
          description: definition.description,
          file_url: fileUrl,
          file_type: 'pdf',
          file_name: definition.fileName,
          rtl: false,
        }),
      }),
    });
  })
);
