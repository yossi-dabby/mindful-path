import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { FileText, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import MessageFeedback from './MessageFeedback';
import { extractThinkingContent } from '../utils/messageContentSanitizer';
import { applyFinalOutputGovernor } from '../utils/finalOutputGovernor';

const ASSISTANT_ATTACHMENT_URL_REGEX = /https?:\/\/[^\s<>"'`)\]]+/gi;

function inferAttachmentTypeFromUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return null;
  try {
    const parsed = new URL(rawUrl.trim());
    const pathname = String(parsed.pathname || '').toLowerCase();
    if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(pathname)) return 'image';
    if (pathname.endsWith('.pdf')) return 'pdf';
    return null;
  } catch {
    return null;
  }
}

function stripTrailingUrlPunctuation(rawUrl) {
  if (typeof rawUrl !== 'string') return '';
  return rawUrl.replace(/[),.;!?]+$/g, '');
}

function normalizeAttachment(attachment) {
  if (!attachment || typeof attachment !== 'object') return null;
  const type = attachment.type === 'image' || attachment.type === 'pdf' ? attachment.type : null;
  const url = typeof attachment.url === 'string' && attachment.url.trim() ? attachment.url.trim() : null;
  if (!type || !url) return null;
  const name = typeof attachment.name === 'string' && attachment.name.trim() ? attachment.name.trim() : undefined;
  return { type, url, name };
}

function detectAssistantAttachment(message) {
  const metadataAttachment = normalizeAttachment(message?.metadata?.attachment || message?.attachment);
  if (metadataAttachment) return metadataAttachment;
  const content = typeof message?.content === 'string' ? message.content : '';
  const matches = content.match(ASSISTANT_ATTACHMENT_URL_REGEX);
  if (!matches || matches.length === 0) return null;
  for (const candidate of matches) {
    const url = stripTrailingUrlPunctuation(candidate);
    const type = inferAttachmentTypeFromUrl(url);
    if (type) {
      return { type, url };
    }
  }
  return null;
}

export default function MessageBubble({ message, conversationId, messageIndex, agentName = 'cbt_therapist', context = 'chat', userMessage, sessionLanguage }) {
  const { t, i18n } = useTranslation();
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [isSigningPdf, setIsSigningPdf] = useState(false);
  // CRITICAL GATE 1: Strict null/undefined/empty gating
  if (!message || !message.role) {
    return null;
  }

  const isUser = message.role === 'user';
  const attachment = isUser ?
  normalizeAttachment(message.metadata?.attachment || message.attachment) :
  detectAssistantAttachment(message);
  const attachmentType = attachment?.type;
  const attachmentUrl = typeof attachment?.url === 'string' ? attachment.url : null;
  const attachmentName = typeof attachment?.name === 'string' && attachment.name.trim() ? attachment.name : null;
  const isImageAttachment = attachmentType === 'image' && !!attachmentUrl;
  const isPdfAttachment = attachmentType === 'pdf' && !!attachmentUrl;
  const hasRenderableAttachment = isImageAttachment || isPdfAttachment;
  if (!message.content && !(isUser && hasRenderableAttachment)) {
    return null;
  }

  // CRITICAL GATE 2: TYPE CHECK - Content MUST be a string
  if (typeof message.content !== 'string' && !(isUser && hasRenderableAttachment)) {
    console.error('[MessageBubble] ⛔ FATAL: Content is not a string, type:', typeof message.content);
    return null;
  }

  // CRITICAL GATE 3: Content extraction with ZERO tolerance for raw/structured data
  let content = '';
  let thinkingContent = null;
  try {
    const rawContent = typeof message.content === 'string' ? message.content : '';
    const contentStr = rawContent.trim();

    // IMMEDIATE REJECT: Any sign of structured data
    if (contentStr.includes('"assistant_message"') ||
    contentStr.includes('"tool_calls"') ||
    contentStr.includes('"homework":{') ||
    contentStr.includes('"metadata"') ||
    contentStr.includes('"s":') ||
    contentStr.includes('\\u00') ||
    contentStr.startsWith('{') && contentStr.includes('"') ||
    contentStr.startsWith('[{') && contentStr.includes('"')) {
      console.error('[MessageBubble] ⛔ HARD BLOCK: Structured data rejected:', contentStr.substring(0, 50));
      return null;
    }

    // Extract AI thinking content before sanitization (assistant only)
    if (!isUser) {
      thinkingContent = extractThinkingContent(contentStr);
    }

    // CRITICAL: Apply Final Output Governor (CP12) — last gate before render
    // For assistant messages: runs full leakage + ask-back + worksheet-drift + routing-leakage passes
    // For user messages: pass through unchanged
    // NOTE: pass sessionLanguage (locked at conversation start) as opts.lang so the
    // governor uses the correct session language rather than auto-detecting from content.
    // Auto-detection alone is unreliable for Latin-script languages that share vocabulary
    // (e.g. Portuguese/Spanish).  If sessionLanguage is not provided, the governor falls
    // back to content-based detection.
    const sanitized = isUser ? contentStr : applyFinalOutputGovernor(contentStr, {
      lang: sessionLanguage || undefined,
      userMessage: userMessage || undefined,
    });
    content = sanitized;

    // CRITICAL GATE 4: Final content validation
    if ((!content || content.length < 1) && !(isUser && hasRenderableAttachment)) {
      return null;
    }

    // CRITICAL GATE 5: Double-check no structured data leaked
    if (content.includes('{"') || content.includes('"}') || content.includes('[{') || content.includes('"content"')) {
      console.error('[MessageBubble] ⛔ HARD BLOCK: Final check failed:', content.substring(0, 50));
      return null;
    }

  } catch (e) {
    console.error('[MessageBubble] ⛔ Fatal error:', e);
    return null;
  }

  const dir = i18n.language === 'he' ? 'rtl' : 'ltr';
  const handleAssistantPdfDownload = async () => {
    if (isUser || !isPdfAttachment || !attachmentUrl || isSigningPdf) return;
    setIsSigningPdf(true);
    try {
      const signed = await base44.integrations.Core.CreateFileSignedUrl({ file_url: attachmentUrl });
      const signedUrl = signed?.signed_url || signed?.url || signed?.file_url;
      if (!signedUrl) throw new Error('missing signed url');
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('[MessageBubble] Failed to create signed PDF URL:', error);
    } finally {
      setIsSigningPdf(false);
    }
  };

  return (
    <div className="bg-teal-50 flex gap-3 justify-start" dir={dir}>
      {!isUser &&
      <div className="bg-teal-600 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 shadow-[var(--shadow-sm)]">
          <span className="bg-teal-600 text-primary-foreground text-sm">AI</span>
        </div>
      }
      <div className={cn('max-w-[85%] md:max-w-[70%]', isUser && 'flex flex-col items-end')}>
        {/* AI Thinking Process - collapsible, shown before the response */}
        {!isUser && thinkingContent &&
        <div className="mb-2 rounded-[var(--radius-control)] border border-border/70 bg-secondary/60 overflow-hidden">
            <button
            onClick={() => setThinkingExpanded((prev) => !prev)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary hover:bg-secondary transition-colors"
            aria-expanded={thinkingExpanded}>

              <span className="text-primary/70">✦</span>
              <span>{t('chat.ai_thinking.label')}</span>
              <span className="ml-auto text-primary/70">{thinkingExpanded ? '▲' : '▼'}</span>
            </button>
            {thinkingExpanded &&
          <div className="px-3 pb-3 pt-1 text-xs text-foreground whitespace-pre-wrap leading-relaxed border-t border-border/70">
                {thinkingContent}
              </div>
          }
          </div>
        }
        <div className="bg-teal-600 text-primary-foreground px-5 py-3 rounded-2xl shadow-[var(--shadow-sm)]">







            {isUser ?
          <>
                {(isImageAttachment || isPdfAttachment) &&
            <div className="mb-3">
                    {isImageAttachment &&
              <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <img
                  src={attachmentUrl}
                  alt={t('chat.attachments.image_preview_alt')}
                  className="max-w-[180px] max-h-[180px] rounded-lg object-cover border border-primary-foreground/20" />
                      </a>
              }
                    {isPdfAttachment &&
              <a
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/20 px-3 py-2 text-sm hover:bg-primary-foreground/10 transition-colors">
                        <FileText className="w-4 h-4" />
                        <span className="max-w-[180px] truncate">{attachmentName || t('chat.attachments.pdf_chip_label')}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>
              }
                  </div>
            }
                {content ?
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p> :
            null}
              </> :

          <>
                {hasRenderableAttachment &&
            <div className="mb-3">
                    {isImageAttachment &&
              <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <img
                  src={attachmentUrl}
                  alt={t('chat.attachments.image_preview_alt')}
                  className="max-w-[220px] max-h-[220px] rounded-lg object-cover border border-primary-foreground/20" />
                      </a>
              }
                    {isPdfAttachment &&
              <button
                type="button"
                onClick={handleAssistantPdfDownload}
                disabled={isSigningPdf}
                className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/20 px-3 py-2 text-sm hover:bg-primary-foreground/10 transition-colors disabled:opacity-70">
                        <FileText className="w-4 h-4" />
                        <span className="max-w-[220px] truncate">{isSigningPdf ? t('chat.attachments.opening_pdf', 'Opening PDF...') : attachmentName || t('chat.attachments.pdf_chip_label')}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </button>
              }
                  </div>
            }
                {content ?
            <ReactMarkdown
            className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            components={{
              code: ({ inline, className, children }) => {
                const safeClassName = String(className || '');
                const safeChildren = children || '';
                if (inline) {
                  return <code className="px-1 py-0.5 rounded bg-secondary text-foreground text-sm">{safeChildren}</code>;
                }
                return (
                  <pre className="bg-secondary rounded-lg p-3 my-2 overflow-x-auto">
                        <code className={safeClassName}>{safeChildren}</code>
                      </pre>);

              },
              p: ({ children }) =>
              <p className="my-2 leading-relaxed text-[15px]">{children || ''}</p>,

              ul: ({ children }) =>
              <ul className="my-2 ml-4 list-disc space-y-1">{children || ''}</ul>,

              ol: ({ children }) =>
              <ol className="my-2 ml-4 list-decimal space-y-1">{children || ''}</ol>,

              li: ({ children }) => <li className="my-1">{children || ''}</li>,
              strong: ({ children }) =>
              <strong className="font-semibold text-foreground">{children || ''}</strong>,

              em: ({ children }) => <em className="italic">{children || ''}</em>,
              blockquote: ({ children }) =>
              <blockquote className="border-l-4 border-primary/35 pl-4 my-3 italic text-muted-foreground">
                      {children || ''}
                    </blockquote>

            }}>

                  {content}
                  </ReactMarkdown> :
            null}
              </>
          }
                  
                  {/* Feedback for assistant messages */}
                  {!isUser && conversationId && messageIndex !== undefined &&
          <MessageFeedback
            conversationId={conversationId}
            messageIndex={messageIndex}
            agentName={agentName}
            context={context} />

          }
                  </div>
                  </div>
      {isUser &&
      <div className="bg-teal-600 rounded-2xl h-8 w-8 flex items-center justify-center flex-shrink-0">
          <span className="bg-teal-600 text-slate-50 text-sm font-medium">You</span>
        </div>
      }
    </div>);

}
