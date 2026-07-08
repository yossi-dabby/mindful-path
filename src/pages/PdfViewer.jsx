import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { downloadPdfFile } from '@/components/chat/utils/downloadPdfFile';
import { getFormDownloadUrl, resolvePdfViewerFileParam } from '@/components/chat/utils/formFileUrls.js';
import { resolveWorksheetFileUrl } from '@/components/chat/utils/worksheetFileResolver';

export default function PdfViewer() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [blobUrl, setBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [resolvedFileUrl, setResolvedFileUrl] = useState(null);

  const requestedFile = searchParams.get('file') || '';
  const normalizedRequestedFile = useMemo(
    () => resolvePdfViewerFileParam(requestedFile),
    [requestedFile]
  );

  useEffect(() => {
    let isCancelled = false;
    let nextBlobUrl = null;

    async function loadPdf() {
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
        setBlobUrl(null);
        setResolvedFileUrl(null);
        setHasError(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        const { url: fileUrl } = await resolveWorksheetFileUrl(fileRef);
        setResolvedFileUrl(fileUrl);
        const response = await fetch(fileUrl, { credentials: 'same-origin' });
        if (!response.ok) {
          throw new Error(`[PdfViewer] Fetch failed: ${response.status}`);
        }

        const fetchedBlob = await response.blob();
        const pdfBlob = fetchedBlob.type === 'application/pdf'
          ? fetchedBlob
          : new Blob([fetchedBlob], { type: 'application/pdf' });
        nextBlobUrl = URL.createObjectURL(pdfBlob);

        if (isCancelled) return;
        setBlobUrl(nextBlobUrl);
        setHasError(false);
      } catch (error) {
        console.error('[PdfViewer] Failed to load PDF inline:', {
          fileValue: fileRef,
          reason: error?.message || error,
        });
        toast({
          title: 'Unable to open worksheet',
          description: 'This worksheet file could not be opened. Please try again or contact support.',
          variant: 'destructive',
        });
        if (isCancelled) return;
        setBlobUrl(null);
        setResolvedFileUrl(null);
        setHasError(true);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
      if (nextBlobUrl) {
        URL.revokeObjectURL(nextBlobUrl);
      }
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
        description: 'This worksheet file could not be opened. Please try again or contact support.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    if (window.opener && !window.opener.closed) {
      window.close();
      return;
    }

    try {
      if (document.referrer && new URL(document.referrer).origin === window.location.origin) {
        navigate(-1);
        return;
      }
    } catch {
      // no-op
    }

    navigate('/Chat');
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

      <div className="flex min-h-0 flex-1 items-center justify-center bg-muted/20">
        {isLoading && (
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" aria-label={t('common.loading', 'Loading...')} />
        )}

        {!isLoading && blobUrl && (
          <iframe
            title={t('chat.generated_file.type_label', 'PDF')}
            src={blobUrl}
            className="h-full w-full border-0"
          />
        )}

        {!isLoading && !blobUrl && (
          <div className="flex flex-col items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => window.location.reload()}>
              {t('common.retry', 'Retry')}
            </Button>
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
          </div>
        )}
      </div>
    </div>
  );
}
