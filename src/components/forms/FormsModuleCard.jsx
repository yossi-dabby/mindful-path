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
}) {
  return (
    <article
      data-testid={`module-card-${module.id}`}
      className="rounded-[var(--radius-card)] border border-border/70 bg-card shadow-[var(--shadow-md)] p-5 flex flex-col gap-3"
    >
      <h3 className="text-base font-semibold text-foreground leading-snug">{module.title}</h3>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {module.numberLabel && <span>{module.numberLabel}</span>}
        {showClinicalDomain && module.clinicalDomainLabel && <span>• {module.clinicalDomainLabel}</span>}
        <span>• {module.worksheetCount}</span>
      </div>

      {module.combinedForm ? (
        <div
          data-testid={`combined-module-action-${module.id}`}
          className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex flex-wrap gap-2"
        >
          <Button type="button" size="sm" variant="outline" onClick={onOpenCombined}>
            <ExternalLink className="w-4 h-4" />
            {openLabel}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onDownloadCombined}>
            <Download className="w-4 h-4" />
            {downloadLabel}
          </Button>
        </div>
      ) : null}

      <Button type="button" onClick={onViewWorksheets} data-testid={`view-worksheets-${module.id}`}>
        {viewWorksheetsLabel}
      </Button>
    </article>
  );
}
