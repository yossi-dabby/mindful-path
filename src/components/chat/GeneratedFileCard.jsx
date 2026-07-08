import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, ExternalLink, Download, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { normalizeGeneratedFile } from './utils/normalizeGeneratedFile';
import { downloadPdfFile } from './utils/downloadPdfFile';
import { openFile } from './utils/openFile';
import { getFormDownloadUrl, getFormOpenUrl } from './utils/formFileUrls';
import { resolveWorksheetFileUrl } from './utils/worksheetFileResolver';

export { normalizeGeneratedFile };

export default function GeneratedFileCard({ generatedFile }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [openFallbackUrl, setOpenFallbackUrl] = useState(null);

  const normalized = normalizeGeneratedFile(generatedFile);
  if (!normalized) return null;

  const displayTitle = normalized.title || normalized.name;
  const description = normalized.description;
  const isBusy = isDownloading || isResolvingUrl;

  // For static /forms/... URLs the open URL is known synchronously at render time.
  const staticOpenUrl = normalized.url?.trim().startsWith('/forms/')
    ? getFormOpenUrl(normalized.url)
    : null;

  const resolveUrl = async () => {
    const { url } = await resolveWorksheetFileUrl(normalized.url, {
      sourceRecord: generatedFile,
      coreIntegration: base44?.integrations?.Core,
      entities: base44?.entities,
    });
    return url;
  };

  const handleOpen = () => {
    if (isBusy) return;
    setOpenFallbackUrl(null);

    // Static /forms/... paths — navigate synchronously inside the trusted user gesture.
    // No async gap means no popup blocker on Android Chrome or installed PWA.
    if (staticOpenUrl) {
      openFile(staticOpenUrl);
      return;
    }

    // Private/signed files — open a blank window synchronously during the click,
    // then point it at the resolved URL once the async signing completes.
    const win = typeof window !== 'undefined' ? window.open('', '_blank', 'noopener,noreferrer') : null;

    setIsResolvingUrl(true);
    resolveUrl()
      .then((resolvedUrl) => {
        const openUrl = getFormOpenUrl(resolvedUrl);
        if (!openUrl) throw new Error('Could not build open URL');
        if (win) {
          win.location.href = openUrl;
        } else {
          openFile(openUrl);
        }
      })
      .catch((error) => {
        if (win && !win.closed) win.close();
        console.error('[GeneratedFileCard] Open failed:', {
          fileValue: normalized.url,
          reason: error?.message || error,
        });
        // Surface a fallback link for static forms so the user can still tap to open.
        if (staticOpenUrl) setOpenFallbackUrl(staticOpenUrl);
        toast({
          title: 'Unable to open worksheet',
          description: 'This worksheet file could not be opened. Please try again or contact support.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setIsResolvingUrl(false);
      });
  };

  const handleDownload = async () => {
    if (isBusy) return;
    setIsDownloading(true);
    try {
      const resolvedUrl = await resolveUrl();
      const downloadUrl = getFormDownloadUrl(resolvedUrl);
      if (!downloadUrl) throw new Error('Could not build download URL');
      await downloadPdfFile(downloadUrl, normalized.name);
    } catch (error) {
      console.error('[GeneratedFileCard] Download failed:', {
        fileValue: normalized.url,
        reason: error?.message || error,
      });
      toast({
        title: 'Unable to download worksheet',
        description: 'This worksheet file could not be downloaded. Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      data-testid="generated-file-card"
      data-language={normalized.language || ''}
      data-form-id={normalized.form_id || ''}
      data-is-combined-pdf={normalized.isCombinedPdf ? 'true' : 'false'}
      className="mt-3 rounded-xl border border-primary-foreground/25 bg-primary-foreground/10 overflow-hidden"
    >
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
      {/* Fallback direct link shown when the Open action is blocked */}
      {openFallbackUrl && (
        <div className="px-4 py-2 border-t border-primary-foreground/20 text-xs text-primary-foreground/80">
          <a
            href={openFallbackUrl}
            rel="noopener noreferrer"
            className="underline underline-offset-2"
            data-testid="generated-file-open-fallback-link"
          >
            {t('chat.generated_file.open_fallback_link', 'Tap here to open the worksheet PDF')}
          </a>
        </div>
      )}
      {/* Action buttons */}
      <div className="flex border-t border-primary-foreground/20">
        <button
          type="button"
          data-testid="generated-file-open"
          onClick={handleOpen}
          disabled={isBusy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-foreground/15 hover:bg-primary-foreground/20 transition-colors text-sm font-medium text-primary-foreground border-e border-primary-foreground/20 disabled:opacity-60"
        >
          {isResolvingUrl ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{t('chat.generated_file.opening', 'Opening...')}</span>
            </>
          ) : (
            <>
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t('chat.generated_file.open_button', 'Open')}</span>
            </>
          )}
        </button>
        <button
          type="button"
          data-testid="generated-file-download"
          onClick={handleDownload}
          disabled={isBusy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-foreground/15 hover:bg-primary-foreground/20 transition-colors text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{t('chat.generated_file.downloading', 'Downloading...')}</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>{
                normalized.category === 'workbook_series'
                  ? t('chat.generated_file.download_workbook_button', 'Download Workbook')
                  : t('chat.generated_file.download_button', 'Download')
              }</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
