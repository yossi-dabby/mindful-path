import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { normalizeGeneratedFile } from './utils/normalizeGeneratedFile';

export { normalizeGeneratedFile };

export default function GeneratedFileCard({ generatedFile }) {
  const { t } = useTranslation();
  const [isSigning, setIsSigning] = useState(false);

  const normalized = normalizeGeneratedFile(generatedFile);
  if (!normalized) return null;

  const displayTitle = normalized.title || normalized.name;
  const description = normalized.description;

  const handleDownload = async () => {
    if (isSigning) return;
    setIsSigning(true);
    try {
      const signed = await base44.integrations.Core.CreateFileSignedUrl({ file_url: normalized.url });
      const signedUrl = signed?.signed_url || signed?.url || signed?.file_url;
      if (!signedUrl) throw new Error('Failed to generate secure URL for generated file');
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('[GeneratedFileCard] Failed to open generated file:', error);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-primary-foreground/25 bg-primary-foreground/10 overflow-hidden">
      {/* Card header row */}
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="mt-0.5 flex-shrink-0 rounded-lg bg-primary-foreground/15 p-2">
          <FileText className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary-foreground leading-snug truncate">
            {displayTitle}
          </p>
          {description && (
            <p className="mt-0.5 text-xs text-primary-foreground/80 leading-snug line-clamp-2">
              {description}
            </p>
          )}
          <p className="mt-1 text-xs text-primary-foreground/60 uppercase tracking-wide font-medium">
            {t('chat.generated_file.type_label', 'PDF')}
          </p>
        </div>
      </div>
      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={isSigning}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-foreground/15 hover:bg-primary-foreground/20 transition-colors text-sm font-medium text-primary-foreground disabled:opacity-60 border-t border-primary-foreground/20"
      >
        {isSigning ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{t('chat.generated_file.opening', 'Opening...')}</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            <span>{t('chat.generated_file.download_button', 'Download Worksheet')}</span>
          </>
        )}
      </button>
    </div>
  );
}
