import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { SUPPORTED_LANGUAGES, ALL_FORMS, resolveFormWithLanguage } from '@/data/therapeuticForms/index.js';
import { openFile } from '@/components/chat/utils/openFile';
import { downloadPdfFile } from '@/components/chat/utils/downloadPdfFile';
import { getFormDownloadUrl, getFormOpenUrl } from '@/components/chat/utils/formFileUrls';
import { resolveWorksheetFileUrl } from '@/components/chat/utils/worksheetFileResolver';
import { useTranslation } from 'react-i18next';
import FormsCollectionCard from '@/components/forms/FormsCollectionCard';
import FormsModuleCard from '@/components/forms/FormsModuleCard';
import FormsWorksheetCard from '@/components/forms/FormsWorksheetCard';
import FormsBreadcrumb from '@/components/forms/FormsBreadcrumb';
import FormsViewModeToggle, { FORMS_VIEW_MODES } from '@/components/forms/FormsViewModeToggle';
import FormsNavigationControls from '@/components/forms/FormsNavigationControls';
import FormsCombinedPdfCard from '@/components/forms/FormsCombinedPdfCard';

const AUDIENCE_ORDER = ['children', 'adolescents', 'adults', 'older_adults'];
const COLLECTION_TYPE_ORDER = { core: 0, specialized: 1 };
export const FORMS_VIEW_MODE_STORAGE_KEY = 'mindfulPath.formsLibrary.viewMode';
export const DEFAULT_FORMS_VIEW_MODE = 'medium';

function isValidViewMode(mode) {
  return FORMS_VIEW_MODES.includes(mode);
}

export function getInitialFormsViewMode() {
  if (typeof window === 'undefined') return DEFAULT_FORMS_VIEW_MODE;
  try {
    const stored = window.localStorage.getItem(FORMS_VIEW_MODE_STORAGE_KEY);
    return isValidViewMode(stored) ? stored : DEFAULT_FORMS_VIEW_MODE;
  } catch {
    return DEFAULT_FORMS_VIEW_MODE;
  }
}

function getGridClassForViewMode(viewMode) {
  const gridByMode = {
    large: 'grid grid-cols-1 md:grid-cols-2 gap-8',
    medium: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    compact: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3',
    list: 'grid grid-cols-1 gap-3',
    tiles: 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3',
  };
  return gridByMode[viewMode] || gridByMode.medium;
}

export function normalizeLanguageCode(language) {
  if (typeof language !== 'string' || !language.trim()) return 'en';
  const base = language.trim().toLowerCase().split('-')[0];
  return SUPPORTED_LANGUAGES.includes(base) ? base : 'en';
}

export function hasValidPublicFormsUrl(fileUrl) {
  return typeof fileUrl === 'string' && fileUrl.trim().startsWith('/forms/');
}

export function resolveLibraryFormWithLanguage(form, lang) {
  const resolved = resolveFormWithLanguage(form.id, lang);
  if (!resolved) return null;
  return resolved;
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
  if (!form.languages?.[lang]) {
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

function toNumberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getModuleSignature(form) {
  const moduleNumber = toNumberOrNull(form?.moduleNumber ?? form?.stageNumber);
  if (moduleNumber != null) return `module:${moduleNumber}`;

  const formNumberParts = String(form?.formNumber || '').split('.').map((part) => part.trim()).filter(Boolean);
  if (formNumberParts.length >= 3) return `series:${formNumberParts[0]}.${formNumberParts[1]}`;
  if (formNumberParts.length >= 2) return `stage:${formNumberParts[0]}`;
  return null;
}

function getLocalizedField(form, lang, field) {
  const localized = form?.localizedDisplay?.[lang]?.[field];
  if (typeof localized === 'string' && localized.trim()) return localized.trim();
  const langValue = form?.languages?.[lang]?.[field];
  if (typeof langValue === 'string' && langValue.trim()) return langValue.trim();
  if (field === 'title' && lang !== 'he') {
    const fallback = form?.title;
    if (typeof fallback === 'string' && fallback.trim()) return fallback.trim();
  }
  if (field === 'description' && lang !== 'he') {
    const fallback = form?.description;
    if (typeof fallback === 'string' && fallback.trim()) return fallback.trim();
  }
  return '';
}

function buildModuleFallbackTitle(module, lang) {
  const number = module.stageNumber ?? module.moduleNumber;
  if (number == null) {
    return lang === 'he' ? 'מודול' : 'Module';
  }
  if (lang === 'he') return `שלב ${number}`;
  return `Stage ${number}`;
}

export function getLanguageVisibleForms(lang) {
  const normalizedLang = normalizeLanguageCode(lang);
  return ALL_FORMS
    .filter((form) => form.approved === true)
    .filter((form) => form.languages?.[normalizedLang])
    .map((form) => resolveLibraryFormWithLanguage(form, normalizedLang))
    .filter((resolved) => hasValidLanguageMatch(resolved, normalizedLang));
}

export function buildCollectionsFromForms(resolvedForms) {
  const grouped = new Map();

  for (const resolved of resolvedForms) {
    const collectionId = String(resolved?.form?.collectionId || '').trim();
    if (!collectionId) continue;
    if (!grouped.has(collectionId)) {
      grouped.set(collectionId, {
        collectionId,
        language: resolved.form.language,
        audience: resolved.form.audience,
        category: resolved.form.category,
        collectionType: resolved.form.collectionType || 'core',
        forms: [],
      });
    }
    grouped.get(collectionId).forms.push(resolved);
  }

  return Array.from(grouped.values())
    .map((collection) => {
      const representativeForm =
        collection.forms.find((item) => item.form.cardType === 'workbook_package') ||
        collection.forms.find((item) => item.form.cardType === 'combined_pdf') ||
        collection.forms[0];

      const worksheetCount = collection.forms.filter((item) => item.form.cardType === 'worksheet').length;
      const combinedCount = collection.forms.filter((item) => item.form.cardType === 'combined_pdf').length;
      const moduleCount = buildModulesFromCollectionForms(collection.forms, collection.language).length;
      const minDisplayOrder = Math.min(...collection.forms.map((item) => Number(item.form.displayOrder || 9999)));

      return {
        ...collection,
        representativeForm,
        worksheetCount,
        combinedCount,
        moduleCount,
        displayOrder: Number.isFinite(minDisplayOrder) ? minDisplayOrder : 9999,
      };
    })
    .sort((a, b) => {
      const byAudience = (AUDIENCE_ORDER.indexOf(a.audience) === -1 ? 999 : AUDIENCE_ORDER.indexOf(a.audience)) -
        (AUDIENCE_ORDER.indexOf(b.audience) === -1 ? 999 : AUDIENCE_ORDER.indexOf(b.audience));
      if (byAudience !== 0) return byAudience;
      const byType = (COLLECTION_TYPE_ORDER[a.collectionType] ?? 9) - (COLLECTION_TYPE_ORDER[b.collectionType] ?? 9);
      if (byType !== 0) return byType;
      return a.displayOrder - b.displayOrder;
    });
}

export function getAudienceOptionsFromCollections(collections) {
  return AUDIENCE_ORDER.filter((audience) => collections.some((collection) => collection.audience === audience));
}

export function buildModulesFromCollectionForms(collectionForms, lang) {
  const forms = collectionForms
    .filter((entry) => entry.form.cardType === 'worksheet' || entry.form.cardType === 'combined_pdf')
    .sort((a, b) => Number(a.form.displayOrder || 9999) - Number(b.form.displayOrder || 9999));

  const modulesByKey = new Map();
  const keysBySignature = new Map();

  const ensureModule = (key, form) => {
    if (!modulesByKey.has(key)) {
      modulesByKey.set(key, {
        id: key,
        moduleNumber: toNumberOrNull(form.moduleNumber),
        stageNumber: toNumberOrNull(form.stageNumber),
        moduleTitle: '',
        combinedTitle: '',
        clinicalDomain: form.clinicalDomain || '',
        worksheetEntries: [],
        combinedEntries: [],
        sortOrder: Number(form.displayOrder || 9999),
      });
    }

    const module = modulesByKey.get(key);
    const newSortOrder = Number(form.displayOrder || 9999);
    if (newSortOrder < module.sortOrder) module.sortOrder = newSortOrder;
    if (!module.moduleNumber) module.moduleNumber = toNumberOrNull(form.moduleNumber);
    if (!module.stageNumber) module.stageNumber = toNumberOrNull(form.stageNumber);
    if (!module.clinicalDomain && form.clinicalDomain) module.clinicalDomain = form.clinicalDomain;
    return module;
  };

  const registerSignature = (signature, key) => {
    if (!signature) return;
    if (!keysBySignature.has(signature)) keysBySignature.set(signature, new Set());
    keysBySignature.get(signature).add(key);
  };

  for (const entry of forms) {
    const { form } = entry;
    const signature = getModuleSignature(form);
    const preferredParentKey = form.parentId ? `parent:${form.parentId}` : null;
    const fallbackSignatureKey = signature ? `signature:${signature}` : `entry:${form.id}`;

    let resolvedKey = preferredParentKey || fallbackSignatureKey;

    if (!form.parentId && signature && keysBySignature.has(signature)) {
      const candidateKeys = Array.from(keysBySignature.get(signature));
      if (candidateKeys.length === 1) {
        resolvedKey = candidateKeys[0];
      }
    }

    const module = ensureModule(resolvedKey, form);
    registerSignature(signature, resolvedKey);

    const moduleTitle = String(form.moduleTitle || form.stageTitle || '').trim();
    if (moduleTitle && !module.moduleTitle) module.moduleTitle = moduleTitle;

    if (form.cardType === 'combined_pdf') {
      const combinedTitle = getLocalizedField(form, lang, 'title');
      if (combinedTitle && !module.combinedTitle) module.combinedTitle = combinedTitle;
      module.combinedEntries.push(entry);
    } else {
      module.worksheetEntries.push(entry);
    }
  }

  return Array.from(modulesByKey.values())
    .map((module) => {
      const title = module.combinedTitle || module.moduleTitle || buildModuleFallbackTitle(module, lang);
      return {
        id: module.id,
        title,
        numberLabel: module.stageNumber || module.moduleNumber ?
          (lang === 'he' ? `שלב ${module.stageNumber || module.moduleNumber}` : `Stage ${module.stageNumber || module.moduleNumber}`)
          : '',
        stageNumber: module.stageNumber,
        moduleNumber: module.moduleNumber,
        worksheetCount: module.worksheetEntries.length,
        worksheetEntries: module.worksheetEntries.sort((a, b) => Number(a.form.displayOrder || 9999) - Number(b.form.displayOrder || 9999)),
        combinedForm: module.combinedEntries[0] || null,
        combinedCount: module.combinedEntries.length,
        clinicalDomain: module.clinicalDomain,
        sortOrder: module.sortOrder,
      };
    })
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      const aNumber = a.stageNumber || a.moduleNumber || 999;
      const bNumber = b.stageNumber || b.moduleNumber || 999;
      return aNumber - bNumber;
    });
}

function formatClinicalDomain(clinicalDomain) {
  if (!clinicalDomain) return '';
  return String(clinicalDomain)
    .split('_')
    .map((part) => {
      const lower = part.toLowerCase();
      if (lower === 'cbt') return 'CBT';
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function getWorksheetTags({ worksheet, module, t, lang }) {
  const tags = [];

  const categoryKey = `therapeutic_forms.category.${worksheet.form.category}`;
  const categoryLabel = t(categoryKey);
  if (categoryLabel && categoryLabel !== categoryKey) tags.push(categoryLabel);

  const secondary = Array.isArray(worksheet.form.secondaryCategories) ? worksheet.form.secondaryCategories : [];
  for (const key of secondary) {
    const labelKey = `therapeutic_forms.category.${key}`;
    const translated = t(labelKey);
    if (translated && translated !== labelKey) tags.push(translated);
    if (tags.length >= 3) break;
  }

  if (lang !== 'he' && module?.clinicalDomain) {
    tags.push(formatClinicalDomain(module.clinicalDomain));
  }

  return Array.from(new Set(tags)).slice(0, 3);
}

export default function TherapeuticForms() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const lang = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language || 'en');
  const isRtl = i18n.dir ? i18n.dir() === 'rtl' : lang === 'he';

  const visibleForms = useMemo(() => getLanguageVisibleForms(lang), [lang]);
  const collections = useMemo(() => buildCollectionsFromForms(visibleForms), [visibleForms]);
  const availableAudiences = useMemo(() => getAudienceOptionsFromCollections(collections), [collections]);

  const [viewMode, setViewMode] = useState(getInitialFormsViewMode);
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [navigationState, setNavigationState] = useState({
    history: [{ collectionId: null, moduleId: null }],
    index: 0,
  });

  const updateCurrentNavigationState = (collectionId, moduleId) => {
    setNavigationState((previous) => {
      const current = previous.history[previous.index] || { collectionId: null, moduleId: null };
      if (current.collectionId === collectionId && current.moduleId === moduleId) return previous;
      const nextHistory = [...previous.history];
      nextHistory[previous.index] = { collectionId, moduleId };
      return { ...previous, history: nextHistory };
    });
  };

  const pushNavState = (collectionId, moduleId) => {
    const nextState = { collectionId, moduleId };
    setNavigationState((previous) => {
      const trimmed = previous.history.slice(0, previous.index + 1);
      const last = trimmed[trimmed.length - 1];
      if (last?.collectionId === nextState.collectionId && last?.moduleId === nextState.moduleId) return previous;
      const nextHistory = [...trimmed, nextState];
      return { history: nextHistory, index: nextHistory.length - 1 };
    });
  };

  const resetNavState = () => {
    setNavigationState({
      history: [{ collectionId: null, moduleId: null }],
      index: 0,
    });
  };

  const navigateToCollection = (collectionId) => {
    setSelectedCollectionId(collectionId);
    setSelectedModuleId(null);
    pushNavState(collectionId, null);
  };

  const navigateToModule = (moduleId) => {
    setSelectedModuleId(moduleId);
    pushNavState(selectedCollectionId, moduleId);
  };

  const handleNavBack = () => {
    if (navigationState.index <= 0) return;
    const nextIndex = navigationState.index - 1;
    const target = navigationState.history[nextIndex];
    setNavigationState((previous) => ({ ...previous, index: nextIndex }));
    setSelectedCollectionId(target?.collectionId ?? null);
    setSelectedModuleId(target?.moduleId ?? null);
  };

  const handleNavForward = () => {
    if (navigationState.index >= navigationState.history.length - 1) return;
    const nextIndex = navigationState.index + 1;
    const target = navigationState.history[nextIndex];
    setNavigationState((previous) => ({ ...previous, index: nextIndex }));
    setSelectedCollectionId(target?.collectionId ?? null);
    setSelectedModuleId(target?.moduleId ?? null);
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(FORMS_VIEW_MODE_STORAGE_KEY, viewMode);
    } catch {
      // no-op
    }
  }, [viewMode]);

  useEffect(() => {
    if (!availableAudiences.length) {
      setSelectedAudience(null);
      return;
    }
    if (!selectedAudience || !availableAudiences.includes(selectedAudience)) {
      setSelectedAudience(availableAudiences[0]);
    }
  }, [availableAudiences, selectedAudience]);

  const filteredCollections = useMemo(() => {
    if (!selectedAudience) return [];
    return collections.filter((collection) => collection.audience === selectedAudience);
  }, [collections, selectedAudience]);

  useEffect(() => {
    if (!selectedCollectionId) return;
    if (!filteredCollections.some((collection) => collection.collectionId === selectedCollectionId)) {
      setSelectedCollectionId(null);
      setSelectedModuleId(null);
      updateCurrentNavigationState(null, null);
    }
  }, [filteredCollections, selectedCollectionId]);

  const selectedCollection = useMemo(
    () => filteredCollections.find((collection) => collection.collectionId === selectedCollectionId) || null,
    [filteredCollections, selectedCollectionId]
  );

  const modules = useMemo(() => {
    if (!selectedCollection) return [];
    return buildModulesFromCollectionForms(selectedCollection.forms, lang);
  }, [selectedCollection, lang]);

  useEffect(() => {
    if (!selectedModuleId) return;
    if (!modules.some((module) => module.id === selectedModuleId)) {
      setSelectedModuleId(null);
      updateCurrentNavigationState(selectedCollectionId, null);
    }
  }, [modules, selectedCollectionId, selectedModuleId]);

  const selectedModule = useMemo(
    () => modules.find((module) => module.id === selectedModuleId) || null,
    [modules, selectedModuleId]
  );

  const collectionCards = filteredCollections.map((collection) => {
    const categoryKey = `therapeutic_forms.category.${collection.category}`;
    const translatedCategory = t(categoryKey);
    const collectionTitle = translatedCategory !== categoryKey
      ? translatedCategory
      : getLocalizedField(collection.representativeForm?.form, lang, 'title') || (lang === 'he' ? 'סדרת טפסים טיפוליים' : 'Therapeutic Forms Collection');

    return {
      ...collection,
      title: collectionTitle,
    };
  });

  const breadcrumbs = [
    {
      label: lang === 'he' ? 'כל הטפסים' : 'All forms',
      onClick: selectedCollection ? () => {
        setSelectedCollectionId(null);
        setSelectedModuleId(null);
        pushNavState(null, null);
      } : null,
    },
  ];

  if (selectedCollection) {
    const selectedCollectionCard = collectionCards.find((collection) => collection.collectionId === selectedCollection.collectionId);
    breadcrumbs.push({
      label: selectedCollectionCard?.title || (lang === 'he' ? 'סדרה' : 'Collection'),
      onClick: selectedModule ? () => {
        setSelectedModuleId(null);
        pushNavState(selectedCollection.collectionId, null);
      } : null,
    });
  }

  if (selectedModule) {
    breadcrumbs.push({ label: selectedModule.title });
  }

  const handleOpenForm = (fileUrl) => {
    if (!fileUrl || typeof fileUrl !== 'string') return;

    // Static /forms/... paths resolve synchronously — compute the viewer URL right here,
    // inside the trusted user-gesture, so no async gap can trigger the popup blocker.
    if (fileUrl.trim().startsWith('/forms/')) {
      const openUrl = getFormOpenUrl(fileUrl);
      if (openUrl) {
        openFile(openUrl);
        return;
      }
    }

    // Private/signed files: open a blank window synchronously during the click,
    // then point it at the resolved URL once the async work completes.
    // If window.open is blocked, openFile's same-tab fallback handles it.
    const win = typeof window !== 'undefined' ? window.open('', '_blank', 'noopener,noreferrer') : null;

    resolveWorksheetFileUrl(fileUrl, {
      coreIntegration: base44?.integrations?.Core,
      entities: base44?.entities,
    }).then(({ url: resolvedUrl }) => {
      const openUrl = getFormOpenUrl(resolvedUrl);
      if (!openUrl) throw new Error('Could not build open URL');
      if (win) {
        win.location.href = openUrl;
      } else {
        openFile(openUrl);
      }
    }).catch((error) => {
      if (win && !win.closed) win.close();
      console.error('[TherapeuticForms] Open failed:', {
        fileValue: fileUrl,
        reason: error?.message || error,
      });
      toast({
        title: 'Unable to open worksheet',
        description: 'This worksheet file could not be opened. Please try again or contact support.',
        variant: 'destructive',
      });
    });
  };

  const handleDownloadForm = async (fileUrl, fileName) => {
    try {
      const { url: resolvedUrl } = await resolveWorksheetFileUrl(fileUrl, {
        coreIntegration: base44?.integrations?.Core,
        entities: base44?.entities,
      });
      const downloadUrl = getFormDownloadUrl(resolvedUrl);
      if (!downloadUrl) throw new Error('Could not build download URL');
      await downloadPdfFile(downloadUrl, fileName);
    } catch (error) {
      console.error('[TherapeuticForms] Download failed:', {
        fileValue: fileUrl,
        reason: error?.message || error,
      });
      toast({
        title: 'Unable to download worksheet',
        description: 'This worksheet file could not be downloaded. Please try again or contact support.',
        variant: 'destructive',
      });
    }
  };

  const audienceButtons = availableAudiences.map((audience) => ({
    value: audience,
    label: t(`therapeutic_forms.audience.${audience}`),
  }));

  const calloutText = lang === 'he'
    ? 'לא בטוחים איזה טופס לבחור? אפשר לבקש מהמטפל ב־AI להמליץ על הטופס המתאים לפי הצורך.'
    : 'Not sure which form to choose? Ask the AI therapist to recommend the right worksheet based on the client’s need.';

  const canGoBack = navigationState.index > 0;
  const canGoForward = navigationState.index < navigationState.history.length - 1;

  return (
    <div className="forms-library-teal mx-auto p-4 w-full box-border md:p-8 max-w-7xl min-h-dvh safe-bottom bg-teal-100/40" dir={isRtl ? 'rtl' : 'ltr'} data-testid="therapeutic-forms-page">
      <div className="mb-8 mt-4">
        <h1 className="text-3xl md:text-4xl font-semibold mb-2 flex items-center gap-3 text-teal-600">
          <ClipboardList className="w-8 h-8 text-teal-600" />
          {t('therapeutic_forms.page_title')}
        </h1>
        <p className="text-foreground">{t('therapeutic_forms.page_subtitle')}</p>
      </div>

      <div className="mb-6 rounded-lg border border-teal-300 bg-white p-4 text-sm text-foreground" data-testid="ai-forms-callout">
        <p>
          {calloutText}{' '}
          <Link className="underline underline-offset-2 text-teal-600 hover:text-teal-500" to="/Chat">
            {lang === 'he' ? 'לצ׳אט' : 'Go to chat'}
          </Link>
        </p>
      </div>

      <FormsNavigationControls
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onBack={handleNavBack}
        onForward={handleNavForward}
        isRtl={isRtl}
        lang={lang}
      />
      <FormsBreadcrumb items={breadcrumbs} isRtl={isRtl} />

      <FormsViewModeToggle viewMode={viewMode} onChange={setViewMode} isRtl={isRtl} lang={lang} />

      <div className="mb-6 rounded-[var(--radius-card)] border border-teal-200 bg-white p-4">
        <p className="text-sm font-medium mb-2 text-teal-600">{t('therapeutic_forms.filter_audience')}</p>
        <div className="flex flex-wrap gap-2" data-testid="audience-filter">
          {audienceButtons.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={selectedAudience === option.value ? 'default' : 'outline'}
              className={selectedAudience === option.value ? 'bg-teal-600 hover:bg-teal-500 text-white border-teal-600' : 'border-teal-300 text-teal-600 hover:bg-teal-100'}
              onClick={() => {
                setSelectedAudience(option.value);
                setSelectedCollectionId(null);
                setSelectedModuleId(null);
                resetNavState();
              }}
              data-testid={`audience-filter-${option.value}`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {!selectedCollection ? (
        collectionCards.length === 0 ? (
          <div
            data-testid="empty-state"
            className="text-center py-12 surface-secondary rounded-[var(--radius-card)] border border-teal-200 bg-white shadow-[var(--shadow-md)]"
          >
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-teal-300" />
            <p className="mb-2 text-foreground">{t('therapeutic_forms.empty_state.title')}</p>
            <p className="text-sm text-muted-foreground">{t('therapeutic_forms.empty_state.message')}</p>
          </div>
        ) : (
          <div data-testid="collections-grid" className={getGridClassForViewMode(viewMode)}>
            {collectionCards.map((collection) => (
              <FormsCollectionCard
                key={collection.collectionId}
                collection={collection}
                audienceLabel={t(`therapeutic_forms.audience.${collection.audience}`)}
                languageLabel={String(collection.language || '').toUpperCase()}
                collectionTypeLabel={lang === 'he' ? (collection.collectionType === 'core' ? 'ליבה' : 'ייעודי') : (collection.collectionType === 'core' ? 'Core' : 'Specialized')}
                browseLabel={lang === 'he' ? 'עיין בסדרה' : 'Browse'}
                onBrowse={() => navigateToCollection(collection.collectionId)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )
      ) : !selectedModule ? (
        modules.length === 0 ? (
          <div data-testid="empty-state" className="text-center py-12 rounded-[var(--radius-card)] border border-teal-200 bg-white">
            <p className="text-foreground">{t('therapeutic_forms.empty_state.title')}</p>
            <p className="text-sm text-muted-foreground">{t('therapeutic_forms.empty_state.message')}</p>
          </div>
        ) : (
          <div data-testid="modules-grid" className={getGridClassForViewMode(viewMode)}>
            {modules.map((module) => (
              <FormsModuleCard
                key={module.id}
                module={{
                  ...module,
                  clinicalDomainLabel: lang === 'he' ? '' : formatClinicalDomain(module.clinicalDomain),
                  numberLabel: module.numberLabel,
                  typeLabel: lang === 'he' ? 'מודול' : 'Module',
                }}
                showClinicalDomain={lang !== 'he'}
                viewWorksheetsLabel={lang === 'he' ? 'הצג טפסים' : 'View worksheets'}
                openLabel={t('therapeutic_forms.open_form')}
                downloadLabel={t('therapeutic_forms.download_form')}
                onViewWorksheets={() => navigateToModule(module.id)}
                onOpenCombined={() => module.combinedForm && handleOpenForm(module.combinedForm.languageData.file_url)}
                onDownloadCombined={() =>
                  module.combinedForm && handleDownloadForm(module.combinedForm.languageData.file_url, module.combinedForm.languageData.file_name)
                }
                viewMode={viewMode}
              />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-6" data-testid="worksheets-view">
          {selectedModule.combinedForm ? (
            <FormsCombinedPdfCard
              lang={lang}
              viewMode={viewMode}
              onOpen={() => handleOpenForm(selectedModule.combinedForm.languageData.file_url)}
              onDownload={() => handleDownloadForm(selectedModule.combinedForm.languageData.file_url, selectedModule.combinedForm.languageData.file_name)}
            />
          ) : null}

          {selectedModule.worksheetEntries.length === 0 ? (
            <div data-testid="empty-state" className="text-center py-12 rounded-[var(--radius-card)] border border-teal-200 bg-white">
              <p className="text-foreground">{t('therapeutic_forms.empty_state.title')}</p>
              <p className="text-sm text-muted-foreground">{t('therapeutic_forms.empty_state.message')}</p>
            </div>
          ) : (
            <div data-testid="worksheets-grid" className={getGridClassForViewMode(viewMode)}>
              {selectedModule.worksheetEntries.map((worksheet) => (
                <FormsWorksheetCard
                  key={worksheet.form.id}
                  worksheet={{
                    ...worksheet,
                    tags: getWorksheetTags({ worksheet, module: selectedModule, t, lang }),
                  }}
                  openLabel={t('therapeutic_forms.open_form')}
                  downloadLabel={t('therapeutic_forms.download_form')}
                  onOpen={() => handleOpenForm(worksheet.languageData.file_url)}
                  onDownload={() => handleDownloadForm(worksheet.languageData.file_url, worksheet.languageData.file_name)}
                  viewMode={viewMode}
                  typeLabel={lang === 'he' ? 'טופס' : 'Worksheet'}
                  stageLabel={selectedModule.numberLabel}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
