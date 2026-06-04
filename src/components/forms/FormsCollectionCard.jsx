import React from 'react';
import { Button } from '@/components/ui/button';

export default function FormsCollectionCard({
  collection,
  audienceLabel,
  languageLabel,
  collectionTypeLabel,
  browseLabel,
  onBrowse,
}) {
  return (
    <article
      data-testid={`collection-card-${collection.collectionId}`}
      className="rounded-[var(--radius-card)] border border-border/70 bg-card shadow-[var(--shadow-md)] p-5 flex flex-col gap-3"
    >
      <h3 className="text-lg font-semibold text-foreground leading-snug">{collection.title}</h3>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">{audienceLabel}</span>
        <span className="px-2.5 py-0.5 rounded-full bg-secondary border border-border/50 text-secondary-foreground">{languageLabel}</span>
        <span className="px-2.5 py-0.5 rounded-full bg-teal-700/10 border border-teal-700/20 text-teal-900">{collectionTypeLabel}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {collection.moduleCount} • {collection.worksheetCount}
      </p>
      <Button type="button" onClick={onBrowse} className="mt-auto" data-testid={`browse-collection-${collection.collectionId}`}>
        {browseLabel}
      </Button>
    </article>
  );
}
