import fs from 'node:fs';
import path from 'node:path';

import { FORMS_ADOLESCENTS_CBT_CORE_EN } from '../src/data/therapeuticForms/forms.adolescents.cbt-core.en.js';
import { FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN } from '../src/data/therapeuticForms/forms.adolescents.cbt-specialized.en.js';
import { FORMS_CHILDREN_CBT_CORE_EN } from '../src/data/therapeuticForms/forms.children.cbt-core.en.js';
import { FORMS_CHILDREN_CBT_SPECIALIZED } from '../src/data/therapeuticForms/forms.children.cbt-specialized.js';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUTPUT_FILE = path.join(ROOT, 'src/generated/therapeutic-forms-index.json');

const KNOWN_AUDIENCES = new Set(['children', 'adolescents', 'adults', 'older_adults', 'parents']);
const KNOWN_CATEGORIES = new Set([
  'children_cbt_core',
  'children_cbt_specialized',
  'adolescents_cbt_core',
  'adolescents_cbt_specialized',
  'workbook_series',
  'coping_tools',
  'thought_records',
]);

function walk(dirPath) {
  const output = [];
  if (!fs.existsSync(dirPath)) return output;

  for (const dirent of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const absolute = path.join(dirPath, dirent.name);
    if (dirent.isDirectory()) {
      output.push(...walk(absolute));
      continue;
    }
    output.push(absolute);
  }

  return output;
}

function toPublicUrl(filePath) {
  if (!filePath || typeof filePath !== 'string') return null;
  const normalized = filePath.replace(/\\/g, '/').trim();
  if (!normalized) return null;

  if (normalized.startsWith('/forms/')) return normalized;
  if (normalized.startsWith('public/')) return `/${normalized.slice('public/'.length)}`;

  const abs = path.isAbsolute(normalized) ? normalized : path.resolve(ROOT, normalized);
  const publicPrefix = `${PUBLIC_DIR.replace(/\\/g, '/')}/`;
  const absNormalized = abs.replace(/\\/g, '/');
  if (!absNormalized.startsWith(publicPrefix)) return null;
  return `/${absNormalized.slice(publicPrefix.length)}`;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function titleFromFileName(fileName) {
  const base = String(fileName || '').replace(/\.pdf$/i, '');
  if (!base) return 'Therapeutic Form';
  return base
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function inferAudienceAndLanguage(fileUrl) {
  const segments = String(fileUrl || '').split('/').filter(Boolean);
  // /forms/{audience}/{lang}/{category}/...
  const audience = segments[1] || 'adults';
  const language = segments[2] || 'en';
  return {
    audience: KNOWN_AUDIENCES.has(audience) ? audience : 'adults',
    language,
    categorySegment: segments[3] || '',
  };
}

function inferCategory(audience, categorySegment) {
  const segment = String(categorySegment || '').toLowerCase();

  if (audience === 'children' && segment.includes('cbt-core')) return 'children_cbt_core';
  if (audience === 'adolescents' && (segment === 'core' || segment.includes('cbt-core'))) return 'adolescents_cbt_core';
  if (audience === 'adolescents' && segment.includes('specialized')) return 'adolescents_cbt_specialized';

  return 'workbook_series';
}

function normalizeFormCategory(formCategory, audience, fallbackSegment) {
  const candidate = String(formCategory || '').trim();
  if (KNOWN_CATEGORIES.has(candidate)) return candidate;
  return inferCategory(audience, fallbackSegment || candidate);
}

function extractManifestItems() {
  const allFiles = walk(PUBLIC_DIR);
  const manifestFiles = allFiles.filter((f) => /manifest.*\.json$/i.test(path.basename(f)));

  const byFileUrl = new Map();

  for (const manifestFile of manifestFiles) {
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    } catch {
      continue;
    }

    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    for (const item of items) {
      const fileUrl = toPublicUrl(item?.file_path);
      if (!fileUrl || !fileUrl.startsWith('/forms/')) continue;

      byFileUrl.set(fileUrl, {
        worksheet_number: item?.worksheet_number || null,
        module_number: item?.module_number ?? null,
        module_title: item?.module_title_en || null,
        therapeutic_goal: item?.therapeutic_goal || null,
        when_to_use: item?.when_to_use || null,
        keywords: Array.isArray(item?.keywords_en) ? item.keywords_en : [],
        ai_matching_summary: item?.ai_matching_summary || null,
        safety_notes: item?.safety_notes || null,
        preview_path: toPublicUrl(item?.preview_path),
        source_manifest: path.relative(ROOT, manifestFile).replace(/\\/g, '/'),
        title_en: item?.title_en || null,
        audience: item?.audience || null,
        language: item?.language || null,
        category: item?.category || null,
      });
    }
  }

  return byFileUrl;
}

function resolveFileUrlFromForm(form, languageCode) {
  const langBlock = form?.languages?.[languageCode];
  if (langBlock?.file_url) return String(langBlock.file_url).trim();
  if (form?.fileUrl) return String(form.fileUrl).trim();
  return null;
}

function buildCuratedEntries(manifestByFileUrl) {
  const curatedForms = [
    ...FORMS_ADOLESCENTS_CBT_CORE_EN,
    ...FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN,
    ...FORMS_CHILDREN_CBT_CORE_EN,
    ...FORMS_CHILDREN_CBT_SPECIALIZED,
  ].filter((form) => form?.approved === true);

  const entries = [];

  for (const form of curatedForms) {
    const languageCodes = Object.keys(form.languages || {});
    if (languageCodes.length === 0) continue;

    for (const language of languageCodes) {
      const fileUrl = resolveFileUrlFromForm(form, language);
      if (!fileUrl) continue;

      const fileName = path.basename(fileUrl);
      const manifestMeta = manifestByFileUrl.get(fileUrl) || {};
      const normalizedCategory = normalizeFormCategory(form.category, form.audience, form.category);

      entries.push({
        id: form.id,
        slug: form.slug || form.id,
        parentSeriesId: form.parentSeriesId || null,
        type: form.type || 'pdf_asset',
        approved: true,

        title: form.languages?.[language]?.title || form.title || manifestMeta.title_en || titleFromFileName(fileName),
        description: form.languages?.[language]?.description || form.description || null,

        language,
        audience: form.audience || manifestMeta.audience || 'adults',
        category: normalizedCategory,
        subcategory: form.series || form.stageTitle || form.moduleCode || null,
        secondaryCategories: Array.isArray(form.secondaryCategories) ? form.secondaryCategories : [],

        worksheetNumber: form.formNumber || manifestMeta.worksheet_number || null,
        formNumber: form.formNumber || manifestMeta.worksheet_number || null,
        stageNumber: form.stageNumber ?? form.moduleNumber ?? manifestMeta.module_number ?? null,
        moduleNumber: form.moduleNumber ?? manifestMeta.module_number ?? null,
        moduleCode: form.moduleCode || null,
        moduleTitle: form.stageTitle || manifestMeta.module_title || null,
        stageTitle: form.stageTitle || null,
        pageNumberInWorkbook: form.pageNumberInWorkbook ?? null,
        series: form.series || null,

        therapeuticGoal: form.therapeuticGoal || manifestMeta.therapeutic_goal || null,
        whenToUse: form.whenToUse || manifestMeta.when_to_use || null,
        clinicalKeywords: Array.isArray(form.clinicalKeywords) ? form.clinicalKeywords : manifestMeta.keywords || [],
        intentPhrases: Array.isArray(form.intentPhrases) ? form.intentPhrases : [],
        notFor: Array.isArray(form.notFor) ? form.notFor : [],
        aiMatchingSummary: form.aiMatchingSummary || manifestMeta.ai_matching_summary || null,
        safetyNotes: form.safetyNotes || manifestMeta.safety_notes || null,

        fileUrl,
        filePath: `public${fileUrl}`,
        previewPath: manifestMeta.preview_path || null,
        sourceManifest: manifestMeta.source_manifest || null,
        aiMetadataQuality: (form.therapeuticGoal || form.whenToUse || (Array.isArray(form.clinicalKeywords) && form.clinicalKeywords.length > 0)) ? 'rich' : 'limited',

        languages: form.languages,

        // Canonical normalized fields (snake_case)
        worksheet_number: form.formNumber || manifestMeta.worksheet_number || null,
        module_number: form.moduleNumber ?? manifestMeta.module_number ?? null,
        module_title: form.stageTitle || manifestMeta.module_title || null,
        therapeutic_goal: form.therapeuticGoal || manifestMeta.therapeutic_goal || null,
        when_to_use: form.whenToUse || manifestMeta.when_to_use || null,
        keywords: Array.isArray(form.clinicalKeywords) ? form.clinicalKeywords : manifestMeta.keywords || [],
        ai_matching_summary: form.aiMatchingSummary || manifestMeta.ai_matching_summary || null,
        safety_notes: form.safetyNotes || manifestMeta.safety_notes || null,
        file_path: `public${fileUrl}`,
        preview_path: manifestMeta.preview_path || null,
        source_manifest: manifestMeta.source_manifest || null,
      });
    }
  }

  return entries;
}

function buildFallbackEntries(existingByFileUrl, manifestByFileUrl) {
  const files = walk(path.join(PUBLIC_DIR, 'forms'))
    .filter((f) => f.toLowerCase().endsWith('.pdf'));

  const entries = [];

  for (const filePath of files) {
    const fileUrl = toPublicUrl(filePath);
    if (!fileUrl) continue;
    if (existingByFileUrl.has(fileUrl)) continue;

    const manifestMeta = manifestByFileUrl.get(fileUrl) || {};
    const { audience, language, categorySegment } = inferAudienceAndLanguage(fileUrl);
    const category = normalizeFormCategory(manifestMeta.category, audience, categorySegment);

    const fileName = path.basename(fileUrl);
    const title = manifestMeta.title_en || titleFromFileName(fileName);
    const id = slugify(`${audience}-${language}-${fileName.replace(/\.pdf$/i, '')}`);

    entries.push({
      id,
      slug: id,
      parentSeriesId: null,
      type: 'pdf_asset',
      approved: true,

      title,
      description: null,

      language,
      audience,
      category,
      subcategory: categorySegment || null,
      secondaryCategories: ['workbook_series'],

      worksheetNumber: manifestMeta.worksheet_number || null,
      formNumber: manifestMeta.worksheet_number || null,
      stageNumber: manifestMeta.module_number || null,
      moduleNumber: manifestMeta.module_number || null,
      moduleCode: null,
      moduleTitle: manifestMeta.module_title || null,
      stageTitle: manifestMeta.module_title || null,
      pageNumberInWorkbook: null,
      series: null,

      therapeuticGoal: manifestMeta.therapeutic_goal || null,
      whenToUse: manifestMeta.when_to_use || null,
      clinicalKeywords: Array.isArray(manifestMeta.keywords) ? manifestMeta.keywords : [],
      intentPhrases: [],
      notFor: [],
      aiMatchingSummary: manifestMeta.ai_matching_summary || null,
      safetyNotes: manifestMeta.safety_notes || null,

      fileUrl,
      filePath: `public${fileUrl}`,
      previewPath: manifestMeta.preview_path || null,
      sourceManifest: manifestMeta.source_manifest || null,
      aiMetadataQuality: (manifestMeta.therapeutic_goal || manifestMeta.when_to_use || (manifestMeta.keywords || []).length > 0)
        ? 'manifest'
        : 'limited',

      languages: {
        [language]: {
          title,
          description: null,
          file_url: fileUrl,
          file_type: 'pdf',
          file_name: fileName,
          rtl: language === 'he',
        },
      },

      worksheet_number: manifestMeta.worksheet_number || null,
      module_number: manifestMeta.module_number || null,
      module_title: manifestMeta.module_title || null,
      therapeutic_goal: manifestMeta.therapeutic_goal || null,
      when_to_use: manifestMeta.when_to_use || null,
      keywords: Array.isArray(manifestMeta.keywords) ? manifestMeta.keywords : [],
      ai_matching_summary: manifestMeta.ai_matching_summary || null,
      safety_notes: manifestMeta.safety_notes || null,
      file_path: `public${fileUrl}`,
      preview_path: manifestMeta.preview_path || null,
      source_manifest: manifestMeta.source_manifest || null,
    });
  }

  return entries;
}

function validateEntries(entries) {
  const seenIds = new Set();
  const missingFiles = [];

  for (const entry of entries) {
    if (!entry?.id) throw new Error('Entry missing id');
    if (seenIds.has(entry.id)) throw new Error(`Duplicate therapeutic form id: ${entry.id}`);
    seenIds.add(entry.id);

    if (!entry.language) throw new Error(`Entry ${entry.id} missing language`);
    if (!entry.audience) throw new Error(`Entry ${entry.id} missing audience`);
    if (!entry.category) throw new Error(`Entry ${entry.id} missing category`);

    const absolute = path.join(ROOT, entry.filePath || entry.file_path || '');
    if (!fs.existsSync(absolute)) {
      missingFiles.push(`${entry.id} -> ${entry.filePath || entry.file_path}`);
    }
  }

  if (missingFiles.length > 0) {
    throw new Error(`Therapeutic forms index contains missing files:\n${missingFiles.join('\n')}`);
  }
}

function main() {
  const manifestByFileUrl = extractManifestItems();

  const curatedEntries = buildCuratedEntries(manifestByFileUrl);
  const byFileUrl = new Map(curatedEntries.map((entry) => [entry.fileUrl, entry]));

  const fallbackEntries = buildFallbackEntries(byFileUrl, manifestByFileUrl);

  const allEntries = [...curatedEntries, ...fallbackEntries]
    .sort((a, b) => {
      const byLang = String(a.language).localeCompare(String(b.language));
      if (byLang !== 0) return byLang;
      const byAudience = String(a.audience).localeCompare(String(b.audience));
      if (byAudience !== 0) return byAudience;
      const byCategory = String(a.category).localeCompare(String(b.category));
      if (byCategory !== 0) return byCategory;
      return String(a.id).localeCompare(String(b.id));
    });

  validateEntries(allEntries);

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(allEntries, null, 2)}\n`, 'utf8');

  const countsByLanguage = allEntries.reduce((acc, form) => {
    acc[form.language] = (acc[form.language] || 0) + 1;
    return acc;
  }, {});

  const countsByAudience = allEntries.reduce((acc, form) => {
    acc[form.audience] = (acc[form.audience] || 0) + 1;
    return acc;
  }, {});

  console.log('[forms-index] generated:', OUTPUT_FILE);
  console.log('[forms-index] total forms:', allEntries.length);
  console.log('[forms-index] by language:', countsByLanguage);
  console.log('[forms-index] by audience:', countsByAudience);
}

main();
