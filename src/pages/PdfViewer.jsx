import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { downloadPdfFile } from '@/components/chat/utils/downloadPdfFile';
import { getFormDownloadUrl, resolvePdfViewerFileParam } from '@/components/chat/utils/formFileUrls.js';
import { resolveWorksheetFileUrl } from '@/components/chat/utils/worksheetFileResolver';
import PdfJsViewer from '@/components/forms/PdfJsViewer';

export default function PdfViewer() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [resolvedFileUrl, setResolvedFileUrl] = useState(null);

  const requestedFile = searchParams.get('file') || '';
  const normalizedRequestedFile = useMemo(
    () => resolvePdfViewerFileParam(requestedFile),
    [requestedFile]
  );

  useEffect(() => {
    // Diagnostic: confirm which bundle is running on Android Production.
    console.log('[PDF_VIEWER_MOUNTED]', {
      requestedFile,
      normalized: normalizedRequestedFile,
    });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let isCancelled = false;

    async function resolveUrl() {
      let decodedRequestedFile = '';
      if (typeof requestedFile === 'string') {
        try {
          decodedRequestedFile = decodeURIComponent(requestedFile);
        } catch {
          decodedRequestedFile = requestedFile;
        }
      }
      const fileRef = normalizedRequestedFile || decodedRequestedFile;
      if (!fileRef) {
        setResolvedFileUrl(null);
        setHasError(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        const { url: fileUrl } = await resolveWorksheetFileUrl(fileRef, {
          coreIntegration: base44?.integrations?.Core,
          entities: base44?.entities,
        });
        console.log('[PDF_VIEWER_RESOLVED_URL]', { fileRef, resolvedUrl: fileUrl });
        if (isCancelled) return;
        setResolvedFileUrl(fileUrl);
        setHasError(false);
      } catch (error) {
        console.error('[PDF_VIEWER_RESOLVE_ERROR]', {
          fileRef,
          reason: error?.message || error,
        });
        toast({
          title: 'Unable to open worksheet',
          description: 'This worksheet file could not be opened. Please try again or contact support.',
          variant: 'destructive',
        });
        if (isCancelled) return;
        setResolvedFileUrl(null);
        setHasError(true);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    resolveUrl();

    return () => {
      isCancelled = true;
    };
  }, [normalizedRequestedFile, requestedFile, toast]);

  const handleDownload = async () => {
    if (!resolvedFileUrl) return;
    try {
      const downloadUrl = getFormDownloadUrl(resolvedFileUrl);
      if (!downloadUrl) throw new Error('Could not build download URL');
      await downloadPdfFile(downloadUrl);
    } catch (error) {
      console.error('[PdfViewer] Download failed:', {
        fileValue: resolvedFileUrl,
        reason: error?.message || error,
      });
      toast({
        title: 'Unable to download worksheet',
        description: 'This worksheet file could not be downloaded. Please try again or contact support.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    // Use browser history when available (same-tab SPA navigation).
    // Fall back to /Chat when the viewer was opened via direct URL or bookmark
    // and there is no in-app history to return to.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/Chat');
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background" style={{ height: '100dvh', overflow: 'hidden' }}>
      <div className="flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3">
        <div className="min-w-0 truncate text-sm font-medium text-foreground">
          {t('chat.generated_file.type_label', 'PDF')}
        </div>
        <div className="flex items-center gap-2">
          {hasError && (
            <Button type="button" variant="outline" size="sm" onClick={() => window.location.reload()}>
              {t('common.retry', 'Retry')}
            </Button>
          )}
          {resolvedFileUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              {t('chat.generated_file.download_button', 'Download')}
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
            {t('common.close', 'Close')}
          </Button>
        </div>
      </div>

      <div
        className="min-h-0 flex-1 bg-muted/20"
        style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        {isLoading && (
          <div className="flex h-full items-center justify-center" style={{ minHeight: '12rem' }}>
            <Loader2
              className="h-7 w-7 animate-spin text-muted-foreground"
              aria-label={t('common.loading', 'Loading...')}
            />
          </div>
        )}

        {!isLoading && resolvedFileUrl && (
          <PdfJsViewer fileUrl={resolvedFileUrl} />
        )}

        {!isLoading && !resolvedFileUrl && (
          <div className="flex flex-col items-center gap-3 pt-16">
            <Button type="button" variant="outline" size="sm" onClick={() => window.location.reload()}>
              {t('common.retry', 'Retry')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
