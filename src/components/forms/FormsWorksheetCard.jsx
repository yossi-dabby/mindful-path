import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';

export default function FormsWorksheetCard({ worksheet, openLabel, downloadLabel, onOpen, onDownload }) {
  return (
    <article
      data-testid={`worksheet-card-${worksheet.form.id}`}
      className="rounded-[var(--radius-card)] border border-border/70 bg-card shadow-[var(--shadow-md)] p-5 flex flex-col gap-3"
      dir={worksheet.languageData?.rtl ? 'rtl' : 'ltr'}
    >
      <h3 className="text-base font-semibold text-foreground leading-snug">{worksheet.languageData.title}</h3>
      {worksheet.languageData.description ? (
        <p className="text-sm text-muted-foreground leading-relaxed">{worksheet.languageData.description}</p>
      ) : null}
      <div className="flex flex-wrap gap-2 text-xs">
        {worksheet.form.formNumber ? (
          <span className="px-2.5 py-0.5 rounded-full bg-secondary border border-border/50 text-secondary-foreground">
            {worksheet.form.formNumber}
          </span>
        ) : null}
        {(worksheet.tags || []).map((tag) => (
          <span key={tag} className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex gap-2 mt-auto">
        <Button type="button" size="sm" className="flex-1" onClick={onOpen} data-testid={`open-form-${worksheet.form.id}`}>
          <ExternalLink className="w-4 h-4" />
          {openLabel}
        </Button>
        <Button type="button" size="sm" variant="secondary" className="flex-1" onClick={onDownload} data-testid={`download-form-${worksheet.form.id}`}>
          <Download className="w-4 h-4" />
          {downloadLabel}
        </Button>
      </div>
    </article>
  );
}
