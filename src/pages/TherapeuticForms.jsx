import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardList, ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  AUDIENCE_GROUPS,
  THERAPEUTIC_CATEGORIES,
  ALL_FORMS,
  resolveFormWithLanguage } from
'@/data/therapeuticForms/index.js';
import { downloadPdfFile } from '@/components/chat/utils/downloadPdfFile';

// ─── UI adapter ────────────────────────────────────────────────────────────────
// Returns all approved forms that match the given filters and are resolvable in lang.
// Keeps filtering logic minimal and delegates all validity checks to the resolver.
function getFilteredForms({ audience, category, lang }) {
  return ALL_FORMS.reduce((acc, form) => {
    if (audience !== 'all' && form.audience !== audience) return acc;
    if (category !== 'all' && form.category !== category) return acc;
    const resolved = resolveFormWithLanguage(form.id, lang);
    if (!resolved) return acc; // resolver rejected (unapproved, missing file_url, etc.)
    acc.push(resolved);
    return acc;
  }, []);
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
  const lang = i18n.language || 'en';
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
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
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
        
          {forms.map(({ form, languageData }) =>
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
                </div>
              </div>

              {/* Open / Download buttons */}
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
            </div>
        )}
        </div>
      }
    </div>);

}