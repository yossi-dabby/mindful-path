import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';

export default function FormsModuleCard({
  module,
  viewWorksheetsLabel,
  openLabel,
  downloadLabel,
  onViewWorksheets,
  onOpenCombined,
  onDownloadCombined,
  showClinicalDomain,
  viewMode = 'medium',
}) {
  const cardModeClasses = {
    large: 'p-6 gap-4',
    medium: 'p-5 gap-3',
    compact: 'p-3 gap-2',
    list: 'p-4 gap-3 md:flex-row md:items-center',
    tiles: 'p-3 gap-2',
  };

  const titleClasses = {
    large: 'text-lg',
    medium: 'text-base',
    compact: 'text-sm',
    list: 'text-base',
    tiles: 'text-sm',
  };

  const isList = viewMode === 'list';

  return (
    <article
      data-testid={`module-card-${module.id}`}
      className={`rounded-[var(--radius-card)] border border-teal-400 bg-white shadow-[var(--shadow-md)] hover:border-teal-500 hover:bg-teal-50/30 transition-colors flex flex-col ${cardModeClasses[viewMode] || cardModeClasses.medium}`}
    >
      <div className={isList ? 'flex-1' : ''}>
        <h3 className={`${titleClasses[viewMode] || titleClasses.medium} font-semibold text-teal-600 leading-snug`}>{module.title}</h3>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-foreground">
          {module.numberLabel && <span className="rounded-full border border-teal-300 bg-teal-100 px-2 py-0.5 text-teal-600">{module.numberLabel}</span>}
          {showClinicalDomain && module.clinicalDomainLabel && <span className="rounded-full border border-teal-300 bg-teal-100 px-2 py-0.5 text-teal-600">{module.clinicalDomainLabel}</span>}
          <span className="rounded-full border border-teal-300 bg-teal-200 px-2 py-0.5 text-teal-600">{module.worksheetCount}</span>
          {isList ? <span className="rounded-full border border-teal-300 bg-teal-100 px-2 py-0.5 text-teal-600">{module.typeLabel}</span> : null}
        </div>
      </div>

      {module.combinedForm ? (
        <div
          data-testid={`combined-module-action-${module.id}`}
          className={`rounded-lg border border-teal-400 bg-teal-100 p-3 flex flex-wrap gap-2 ${isList ? 'md:mx-2' : ''}`}
        >
          <Button type="button" size="sm" variant="outline" onClick={onOpenCombined} className="border-teal-400 text-teal-600 hover:bg-teal-200">
            <ExternalLink className="w-4 h-4" />
            {openLabel}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onDownloadCombined} className="border-teal-400 text-teal-600 hover:bg-teal-200">
            <Download className="w-4 h-4" />
            {downloadLabel}
          </Button>
        </div>
      ) : null}

      <Button
        type="button"
        onClick={onViewWorksheets}
        data-testid={`view-worksheets-${module.id}`}
        className={`bg-teal-600 hover:bg-teal-500 text-white ${isList ? 'md:ms-auto' : ''}`}
      >
        {viewWorksheetsLabel}
      </Button>
    </article>
  );
}
