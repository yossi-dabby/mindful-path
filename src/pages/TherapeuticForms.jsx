import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardList, ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AUDIENCE_GROUPS,
  THERAPEUTIC_CATEGORIES,
  SUPPORTED_LANGUAGES,
  ALL_FORMS,
  resolveFormWithLanguage } from
'@/data/therapeuticForms/index.js';
import {
  FORMS_ADOLESCENTS_CBT_CORE_EN_STAGE_GROUPS,
  FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL,
} from '@/data/therapeuticForms/forms.adolescents.cbt-core.en.js';
import {
  FORMS_CHILDREN_CBT_CORE_EN_STAGE_GROUPS,
  FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL,
} from '@/data/therapeuticForms/forms.children.cbt-core.en.js';
import { openFile } from '@/components/chat/utils/openFile';
import { downloadPdfFile } from '@/components/chat/utils/downloadPdfFile';
import { getFormOpenUrl } from '@/components/chat/utils/formFileUrls';

export function resolveLibraryFormWithLanguage(form, lang) {
  const resolved = resolveFormWithLanguage(form.id, lang);
  if (!resolved) return null;
  return resolved;
}

function normalizeLanguageCode(language) {
  if (typeof language !== 'string' || !language.trim()) return 'en';
  const base = language.trim().toLowerCase().split('-')[0];
  return SUPPORTED_LANGUAGES.includes(base) ? base : 'en';
}

function hasValidPublicFormsUrl(fileUrl) {
  return typeof fileUrl === 'string' && fileUrl.trim().startsWith('/forms/');
}

function toWorksheetSortValue(worksheetNumber) {
  const value = String(worksheetNumber ?? '').trim();
  if (!value) return Number.MAX_SAFE_INTEGER;
  const [moduleRaw, worksheetRaw] = value.split('.');
  const moduleNumber = Number(moduleRaw);
  const worksheetNumberValue = Number(worksheetRaw);
  if (!Number.isFinite(moduleNumber) || !Number.isFinite(worksheetNumberValue)) return Number.MAX_SAFE_INTEGER;
  return moduleNumber * 100 + worksheetNumberValue;
}

function warnLanguageMismatch(form, lang, reason) {
  if (!import.meta.env?.DEV) return;
  console.warn(`[TherapeuticForms] Excluding form "${form?.id || 'unknown'}" for lang "${lang}": ${reason}`);
}

function hasValidLanguageMatch(resolved, lang) {
  if (!resolved?.form || !resolved?.languageData) return false;
  const { form, language, languageData } = resolved;
  if (language !== lang) {
    warnLanguageMismatch(form, lang, `resolved language "${language}" does not match active language`);
    return false;
  }
  if (form.language && form.language !== lang) {
    warnLanguageMismatch(form, lang, `form.language "${form.language}" does not match active language`);
    return false;
  }
  const blockLanguage = form.languages?.[lang] ? lang : null;
  if (!blockLanguage) {
    warnLanguageMismatch(form, lang, 'no exact language block found');
    return false;
  }
  const fileUrl = String(languageData.file_url || '').trim();
  if (!hasValidPublicFormsUrl(fileUrl)) {
    warnLanguageMismatch(form, lang, `file_url "${fileUrl}" is not a public forms path`);
    return false;
  }
  return true;
}

// ─── UI adapter ────────────────────────────────────────────────────────────────
// Returns all approved forms that match the given filters and are resolvable in lang.
// Keeps filtering logic minimal and delegates all validity checks to the resolver.
// For English/adolescents, also returns stage group cards (each grouping 5 worksheets).
export function getFilteredForms({ audience, category, lang }) {
  const normalizedLang = normalizeLanguageCode(lang);
  const langFiltered = ALL_FORMS.filter((form) => {
    if (!form.languages?.[normalizedLang] || form.approved !== true) return false;
    if (form.type !== 'individual_worksheet') return true;
    return (
      normalizedLang === 'he' &&
      form.language === 'he' &&
      (
        (form.audience === 'adolescents' && (form.category === 'adolescents_cbt_core' || form.category === 'adolescents_cbt_specialized')) ||
        (form.audience === 'children' && form.category === 'children_cbt_core')
      )
    );
  });

  const audienceFiltered = langFiltered.filter(
    (form) => audience === 'all' || form.audience === audience
  );

  const categoryFiltered = audienceFiltered.filter((form) => {
    if (category === 'all') return true;
    if (form.category === category) return true;
    const secondary = Array.isArray(form.secondaryCategories) ? form.secondaryCategories : [];
    return secondary.includes(category);
  });

  const regularForms = categoryFiltered.reduce((acc, form) => {
    const resolved = resolveLibraryFormWithLanguage(form, normalizedLang);
    if (!resolved) return acc;
    if (!hasValidLanguageMatch(resolved, normalizedLang)) return acc;
    acc.push(resolved);
    return acc;
  }, []);

  const dedupedRegularForms = [];
  const seenLanguageVariantCards = new Set();
  for (const resolved of regularForms) {
    const form = resolved?.form;
    const resolvedLanguage = resolved?.language || normalizedLang;
    const logicalId = form?.logical_form_id || form?.variant_group_id || form?.id;
    const dedupeKey = `${logicalId}::${resolvedLanguage}`;
    if (seenLanguageVariantCards.has(dedupeKey)) continue;
    seenLanguageVariantCards.add(dedupeKey);
    dedupedRegularForms.push(resolved);
  }

  // Stage groups — English only, derived from the canonical forms source.
  // Each stage_group card lists its 6 individual worksheets for open/download.
  let stageGroupResults = [];
  if (normalizedLang === 'en') {
    const adolescentGroups = FORMS_ADOLESCENTS_CBT_CORE_EN_STAGE_GROUPS
      .filter((sg) => audience === 'all' || sg.audience === audience)
      .filter((sg) => {
        if (category === 'all') return true;
        if (sg.category === category) return true;
        return (sg.secondaryCategories || []).includes(category);
      })
      .map((sg) => {
        const worksheets = FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL
          .filter((w) => w.stageNumber === sg.stageNumber)
          .map((w) => {
            const wLang = w.languages.en;
            return {
              form: w,
              languageData: {
                title: wLang.title,
                description: wLang.description,
                file_url: wLang.file_url,
                file_type: wLang.file_type,
                file_name: wLang.file_name,
                rtl: false,
              },
            };
          });
        return {
          form: sg,
          language: 'en',
          languageData: {
            title: sg.title,
            description: sg.description,
            file_url: null,
            file_type: null,
            file_name: null,
            rtl: false,
          },
          worksheets,
        };
      });

    const childrenGroups = FORMS_CHILDREN_CBT_CORE_EN_STAGE_GROUPS
      .filter((sg) => audience === 'all' || sg.audience === audience)
      .filter((sg) => {
        if (category === 'all') return true;
        if (sg.category === category) return true;
        return (sg.secondaryCategories || []).includes(category);
      })
      .map((sg) => {
        const worksheets = FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL
          .filter((w) => w.stageNumber === sg.stageNumber)
          .map((w) => {
            const wLang = w.languages.en;
            return {
              form: w,
              languageData: {
                title: wLang.title,
                description: wLang.description,
                file_url: wLang.file_url,
                file_type: wLang.file_type,
                file_name: wLang.file_name,
                rtl: false,
              },
            };
          });
        return {
          form: sg,
          language: 'en',
          languageData: {
            title: sg.title,
            description: sg.description,
            file_url: null,
            file_type: null,
            file_name: null,
            rtl: false,
          },
          worksheets,
        };
      });

    stageGroupResults = [...adolescentGroups, ...childrenGroups];
  }

  // Type ordering: workbook_package (0) sorts before stage_group (1) before others (2)
  const TYPE_ORDER = { workbook_package: 0, stage_group: 1 };

  return [...dedupedRegularForms, ...stageGroupResults].sort((a, b) => {
    const byLanguage = String(a.language || '').localeCompare(String(b.language || ''));
    if (byLanguage !== 0) return byLanguage;
    const byAudience = String(a.form.audience || '').localeCompare(String(b.form.audience || ''));
    if (byAudience !== 0) return byAudience;
    const byCategory = String(a.form.category || '').localeCompare(String(b.form.category || ''));
    if (byCategory !== 0) return byCategory;
    const aType = TYPE_ORDER[a.form.type] ?? 2;
    const bType = TYPE_ORDER[b.form.type] ?? 2;
    if (aType !== bType) return aType - bType;
    const bySeries = String(a.form.series || a.form.adolescentSeries || '').localeCompare(
      String(b.form.series || b.form.adolescentSeries || '')
    );
    if (bySeries !== 0) return bySeries;
    const byModule = Number(a.form.moduleNumber || 0) - Number(b.form.moduleNumber || 0);
    if (byModule !== 0) return byModule;
    return toWorksheetSortValue(a.form.worksheetNumber || a.form.displayNumber) -
      toWorksheetSortValue(b.form.worksheetNumber || b.form.displayNumber);
  });
}

// ─── ScrollableChipRow ─────────────────────────────────────────────────────────
// Renders a horizontally scrollable chip row with visible left/right arrow buttons.
// Arrows are hidden when there is nothing to scroll in that direction.
// RTL-aware: in RTL layouts the scroll direction is naturally mirrored by the browser.
function ScrollableChipRow({ children, testId, isRtl }) {
  const scrollRef = useRef(null);
  const [canScrollStart, setCanScrollStart] = useState(false);
  const [canScrollEnd, setCanScrollEnd] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // In RTL the browser may use negative or positive scrollLeft depending on implementation.
    const absLeft = Math.abs(scrollLeft);
    setCanScrollStart(absLeft > 2);
    setCanScrollEnd(absLeft + clientWidth < scrollWidth - 2);
  }, []);

  const scrollBy = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 180;
    // In RTL, logical "forward" scrolls in the negative direction on some browsers.
    const delta = isRtl ? -direction * amount : direction * amount;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  // Initialise arrow state once after first render.
  const onRefReady = useCallback((node) => {
    scrollRef.current = node;
    if (node) {
      updateArrows();
      // Use requestAnimationFrame to re-check after the layout has fully rendered.
      requestAnimationFrame(updateArrows);
    }
  }, [updateArrows]);

  const BackIcon = isRtl ? ChevronRight : ChevronLeft;
  const ForwIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="relative flex items-center gap-1">
      {/* Back arrow */}
      {canScrollStart &&
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Scroll back"
        className="flex-shrink-0 rounded-full p-1 bg-background/80 border border-border/60 shadow-sm hover:bg-muted transition-colors z-10">
        
          <BackIcon className="text-emerald-700 lucide lucide-chevron-right w-3.5 h-3.5" />
        </button>
      }

      {/* Scrollable row */}
      <div
        ref={onRefReady}
        data-testid={testId}
        onScroll={updateArrows}
        className="flex flex-1 min-w-0 gap-2 overflow-x-auto pb-1 scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}>
        
        {children}
      </div>

      {/* Forward arrow */}
      {canScrollEnd &&
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Scroll forward" className="bg-background/80 p-1 rounded-full flex-shrink-0 border border-border/60 shadow-sm hover:bg-muted transition-colors z-10">
        
        
          <ForwIcon className="text-emerald-700 lucide lucide-chevron-left w-3.5 h-3.5" />
        </button>
      }
    </div>);

}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TherapeuticForms() {
  const { t, i18n } = useTranslation();
  const lang = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language || 'en');
  const isRtl = i18n.dir ? i18n.dir() === 'rtl' : lang === 'he';

  const [selectedAudience, setSelectedAudience] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const forms = getFilteredForms({
    audience: selectedAudience,
    category: selectedCategory,
    lang
  });

  // ─── Audience chips ──────────────────────────────────────────────────────────
  const audienceOptions = [
  { value: 'all', label: t('therapeutic_forms.audience.all') },
  ...AUDIENCE_GROUPS.map((ag) => ({
    value: ag.value,
    label: t(`therapeutic_forms.audience.${ag.value}`)
  }))];


  // ─── Category chips ──────────────────────────────────────────────────────────
  const categoryOptions = [
  { value: 'all', label: t('therapeutic_forms.category.all') },
  ...THERAPEUTIC_CATEGORIES.map((cat) => ({
    value: cat.value,
    label: t(`therapeutic_forms.category.${cat.value}`)
  }))];


  const handleOpenForm = (fileUrl) => {
    openFile(getFormOpenUrl(fileUrl));
  };

  const handleDownloadForm = async (fileUrl, fileName) => {
    try {
      await downloadPdfFile(fileUrl, fileName);
    } catch (error) {
      console.error('[TherapeuticForms] Download failed, opening in new tab:', error);
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-teal-400 mx-auto p-4 w-full box-border md:p-8 max-w-7xl min-h-dvh safe-bottom">
      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl md:text-4xl font-semibold mb-2 flex items-center gap-3 text-foreground">
          <ClipboardList className="w-8 h-8 text-primary" />
          {t('therapeutic_forms.page_title')}
        </h1>
        <p className="text-gray-950">{t('therapeutic_forms.page_subtitle')}</p>
      </div>

      {/* Audience Filter */}
      <div className="mb-6 space-y-4">
        <div>
          <p className="text-sm font-medium mb-2 text-foreground">
            {t('therapeutic_forms.filter_audience')}
          </p>
          <ScrollableChipRow testId="audience-filter" isRtl={isRtl}>
            {audienceOptions.map((opt) =>
            <Button
              key={opt.value}
              onClick={() => setSelectedAudience(opt.value)}
              variant={selectedAudience === opt.value ? 'default' : 'outline'}
              size="sm" className="bg-teal-300 text-secondary-foreground px-3 text-xs font-medium tracking-[0.005em] rounded-[var(--radius-card)] inline-flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-9 min-h-[44px] md:min-h-0 whitespace-nowrap flex-shrink-0 sm:text-sm"

              aria-pressed={selectedAudience === opt.value}>
              
                {opt.label}
              </Button>
            )}
          </ScrollableChipRow>
        </div>

        {/* Category Filter */}
        <div>
          <p className="text-sm font-medium mb-2 text-foreground">
            {t('therapeutic_forms.filter_category')}
          </p>
          <ScrollableChipRow testId="category-filter" isRtl={isRtl}>
            {categoryOptions.map((opt) =>
            <Button
              key={opt.value}
              onClick={() => setSelectedCategory(opt.value)}
              variant={selectedCategory === opt.value ? 'default' : 'outline'}
              size="sm" className="bg-teal-600 text-secondary-foreground px-3 text-xs font-medium tracking-[0.005em] rounded-[var(--radius-card)] inline-flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-9 min-h-[44px] md:min-h-0 whitespace-nowrap flex-shrink-0 sm:text-sm"

              aria-pressed={selectedCategory === opt.value}>
              
                {opt.label}
              </Button>
            )}
          </ScrollableChipRow>
        </div>
      </div>

      {/* Forms Grid / Empty State */}
      {forms.length === 0 ?
      <div
        data-testid="empty-state"
        className="text-center py-12 surface-secondary rounded-[var(--radius-card)] border-border/70 shadow-[var(--shadow-md)]">
        
          <ClipboardList className="w-16 h-16 mx-auto mb-4 text-primary/40" />
          <p className="mb-2 text-foreground">{t('therapeutic_forms.empty_state.title')}</p>
          <p className="text-sm text-muted-foreground">
            {t('therapeutic_forms.empty_state.message')}
          </p>
        </div> :

      <div
        data-testid="forms-grid"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
          {forms.map(({ form, languageData, worksheets }) =>
        <div
          key={form.id}
          data-testid={`form-card-${form.id}`}
          className="relative overflow-hidden rounded-[var(--radius-card)] border border-border/70 bg-[hsl(var(--card))] shadow-[var(--shadow-md)] flex flex-col"
          dir={languageData.rtl ? 'rtl' : 'ltr'}>
          
              <div className="bg-teal-200 p-5 flex flex-col gap-3 flex-1">
                {/* Title */}
                <h3 className="text-base font-semibold text-foreground leading-snug">
                  {languageData.title}
                </h3>

                {/* Description */}
                {languageData.description &&
            <p className="text-gray-950 text-sm leading-relaxed">
                    {languageData.description}
                  </p>
            }

                {/* Metadata badges */}
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {t(`therapeutic_forms.audience.${form.audience}`)}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border/50">
                    {t(`therapeutic_forms.category.${form.category}`)}
                  </span>
                  {(form.moduleNumber != null || form.stageNumber != null) &&
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-700/10 text-teal-900 border border-teal-700/20">
                      {languageData.rtl ? (form.moduleTitle || form.stageTitle || `שלב ${form.moduleNumber || form.stageNumber}`) : `M${form.moduleNumber || form.stageNumber}`}
                    </span>
                  }
                  {(form.worksheetNumber != null || form.displayNumber != null || form.cbt_substage_number != null) &&
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-700/10 text-teal-900 border border-teal-700/20">
                      {form.worksheetNumber || form.displayNumber || form.cbt_substage_number}
                    </span>
                  }
                  {(form.moduleHe || form.domainHe) &&
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-700/10 text-teal-900 border border-teal-700/20">
                    {form.moduleHe || form.domainHe}
                  </span>
                  }
                </div>

                {/* Stage group: worksheet list with per-worksheet Open/Download */}
                {form.type === 'stage_group' && worksheets && worksheets.length > 0 &&
                <div className="border-t border-teal-300 pt-3 space-y-1.5">
                    {worksheets.map(({ form: w, languageData: wLang }) =>
                  <div key={w.id} className="flex items-center gap-1.5 min-w-0">
                        <span className="flex-shrink-0 text-xs font-mono text-teal-700 w-8">
                          {w.formNumber}
                        </span>
                        <span className="flex-1 text-xs text-foreground truncate min-w-0" title={wLang.title}>
                          {wLang.title}
                        </span>
                        <button
                      type="button"
                      onClick={() => handleOpenForm(wLang.file_url)}
                      data-testid={`open-worksheet-${w.id}`}
                      aria-label={`${t('therapeutic_forms.open_form')} — ${wLang.title}`}
                      className="flex-shrink-0 inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button
                      type="button"
                      onClick={() => handleDownloadForm(wLang.file_url, wLang.file_name)}
                      data-testid={`download-worksheet-${w.id}`}
                      aria-label={`${t('therapeutic_forms.download_form')} — ${wLang.title}`}
                      className="flex-shrink-0 inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-medium bg-teal-700 text-white hover:bg-teal-800 transition-colors">
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                  )}
                  </div>
                }
              </div>

              {/* Open / Download buttons — only for forms that have a single file_url */}
              {languageData.file_url &&
              <div className="bg-teal-400 pb-5 px-5 flex gap-2">
                <Button
              onClick={() => handleOpenForm(languageData.file_url)}
              className="flex-1 bg-teal-600 text-[0.875rem] px-3 font-medium tracking-[0.005em] rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[var(--shadow-md)] hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-9 min-h-[44px] md:min-h-0"
              size="sm"
              data-testid={`open-form-${form.id}`}
              aria-label={`${t('therapeutic_forms.open_form')} — ${languageData.title}`}>
                  <ExternalLink className="w-4 h-4" />
                  {t('therapeutic_forms.open_form')}
                </Button>
                <Button
              onClick={() => handleDownloadForm(languageData.file_url, languageData.file_name)}
              className="flex-1 bg-teal-700 text-[0.875rem] px-3 font-medium tracking-[0.005em] rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[var(--shadow-md)] hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-9 min-h-[44px] md:min-h-0"
              size="sm"
              data-testid={`download-form-${form.id}`}
              aria-label={`${t('therapeutic_forms.download_form')} — ${languageData.title}`}>
                  <Download className="w-4 h-4" />
                  {t('therapeutic_forms.download_form')}
                </Button>
              </div>
              }
            </div>
        )}
        </div>
      }
    </div>);

}
