import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { FileText, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import MessageFeedback from './MessageFeedback';
import { extractThinkingContent } from '../utils/messageContentSanitizer';
import { applyFinalOutputGovernor } from '../utils/finalOutputGovernor';
import { PDF_ANALYSIS_OVERFLOW_METADATA_KEY } from '../utils/validateAgentOutput.jsx';

const ASSISTANT_ATTACHMENT_URL_REGEX = /https?:\/\/\S+/gi;
const FILE_EXTENSIONS = new Set(['doc', 'docx', 'txt', 'csv', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'json', 'md', 'rtf']);

function inferAttachmentTypeFromUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return null;
  try {
    const parsed = new URL(rawUrl.trim());
    const pathname = String(parsed.pathname || '').toLowerCase();
    if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(pathname)) return 'image';
    if (pathname.endsWith('.pdf')) return 'pdf';
    const extensionMatch = pathname.match(/\.([a-z0-9]+)$/);
    const extension = extensionMatch?.[1] || '';
    if (FILE_EXTENSIONS.has(extension)) return 'file';
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
  const type = attachment.type === 'image' || attachment.type === 'pdf' || attachment.type === 'file' ? attachment.type : null;
  const url = typeof attachment.url === 'string' && attachment.url.trim() ? attachment.url.trim() : null;
  if (!type || !url) return null;
  const name = typeof attachment.name === 'string' && attachment.name.trim() ? attachment.name.trim() : undefined;
  return { type, url, name };
}

function detectAssistantAttachments(message) {
  const found = [];
  const seen = new Set();
  const addAttachment = (candidate) => {
    if (!candidate || !candidate.type || !candidate.url) return;
    const normalizedUrl = stripTrailingUrlPunctuation(String(candidate.url || '').trim());
    if (!normalizedUrl) return;
    const key = `${candidate.type}:${normalizedUrl}`;
    if (seen.has(key)) return;
    seen.add(key);
    found.push({
      type: candidate.type,
      url: normalizedUrl,
      name: typeof candidate.name === 'string' && candidate.name.trim() ? candidate.name.trim() : undefined,
    });
  };

  const metadataAttachment = normalizeAttachment(message?.metadata?.attachment || message?.attachment);
  if (metadataAttachment) addAttachment(metadataAttachment);

  const content = typeof message?.content === 'string' ? message.content : '';
  for (const match of content.matchAll(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/gi)) {
    const url = match[2];
    const type = inferAttachmentTypeFromUrl(url);
    if (type === 'image') {
      addAttachment({ type: 'image', url, name: match[1] || undefined });
    }
  }

  for (const match of content.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gi)) {
    const url = match[2];
    const type = inferAttachmentTypeFromUrl(url);
    if (type) {
      addAttachment({ type, url, name: match[1] || undefined });
    }
  }

  const matches = content.match(ASSISTANT_ATTACHMENT_URL_REGEX);
  if (!matches || matches.length === 0) return found;
  for (const candidate of matches) {
    const url = stripTrailingUrlPunctuation(candidate);
    const type = inferAttachmentTypeFromUrl(url);
    if (type) {
      addAttachment({ type, url });
    }
  }
  return found;
}

function sanitizeAssistantContentForAttachmentSurfaces(content, attachments) {
  if (typeof content !== 'string' || !content || !Array.isArray(attachments) || attachments.length === 0) {
    return content;
  }
  const attachmentUrls = new Set(
    attachments
      .map((attachment) => stripTrailingUrlPunctuation(String(attachment?.url || '').trim()))
      .filter(Boolean)
  );
  if (attachmentUrls.size === 0) return content;

  const keptLines = content.split('\n').filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true;

    const imageMatch = trimmed.match(/^!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)$/i);
    const linkMatch = trimmed.match(/^\[[^\]]+\]\((https?:\/\/[^)\s]+)\)$/i);
    if (imageMatch && attachmentUrls.has(stripTrailingUrlPunctuation(imageMatch[1]))) return false;
    if (linkMatch && attachmentUrls.has(stripTrailingUrlPunctuation(linkMatch[1]))) return false;
    if (attachmentUrls.has(stripTrailingUrlPunctuation(trimmed))) return false;
    return true;
  });

  return keptLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function PdfFullTextCard({ text, pageCount }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  return (
    <div className="mt-2 rounded-lg border border-primary-foreground/20 overflow-hidden text-sm">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors text-left"
      >
        <FileText className="w-4 h-4 shrink-0 opacity-80" />
        <span className="flex-1 font-medium opacity-90">
          View full document{pageCount ? ` (${pageCount} page${pageCount !== 1 ? 's' : ''})` : ''}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 opacity-70" /> : <ChevronDown className="w-4 h-4 opacity-70" />}
      </button>
      {expanded && (
        <div className="px-3 py-3 max-h-96 overflow-y-auto bg-primary-foreground/5">
          <pre className="whitespace-pre-wrap text-xs leading-relaxed opacity-90 font-sans">{text}</pre>
        </div>
      )}
    </div>
  );
}

// Collapsible card for the overflow portion of a long PDF analysis response.
// Shown below the short acknowledgment in the assistant bubble.
function PdfAnalysisOverflowCard({ overflow }) {
  const [expanded, setExpanded] = useState(false);
  if (!overflow) return null;
  return (
    <div className="mt-3 rounded-lg border border-primary-foreground/20 overflow-hidden text-sm">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors text-left"
      >
        <FileText className="w-4 h-4 shrink-0 opacity-80" />
        <span className="flex-1 font-medium opacity-90">View full PDF analysis</span>
        {expanded ? <ChevronUp className="w-4 h-4 opacity-70" /> : <ChevronDown className="w-4 h-4 opacity-70" />}
      </button>
      {expanded && (
        <div className="px-3 py-3 max-h-[480px] overflow-y-auto bg-primary-foreground/5">
          <ReactMarkdown
            className="prose prose-sm max-w-none text-primary-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            components={{
              p: ({ children }) => <p className="my-2 leading-relaxed text-[14px]">{children}</p>,
              ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
              li: ({ children }) => <li className="my-1">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            }}
          >
            {overflow}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message, conversationId, messageIndex, agentName = 'cbt_therapist', context = 'chat', userMessage, sessionLanguage, hasPdfContext }) {
  // Stage 1 runtime-path lock:
  // Shared bubble renderer used by multiple surfaces.
  // Therapist /Chat runtime reaches this component via pages/Chat.jsx -> MessageList.jsx.
  const { t, i18n } = useTranslation();
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [signingPdfUrl, setSigningPdfUrl] = useState(null);
  // CRITICAL GATE 1: Strict null/undefined/empty gating
  if (!message || !message.role) {
    return null;
  }

  const isUser = message.role === 'user';
  const assistantAttachments = isUser ? [] : detectAssistantAttachments(message);
  const attachment = isUser ?
  normalizeAttachment(message.metadata?.attachment || message.attachment) :
  assistantAttachments[0] || null;

  // Resolve PDF full-text: prefer metadata field (set at send time),
  // fall back to scanning content for the [PDF_TEXT] marker (set by sanitizeConversationMessages).
  const pdfFullText = message.metadata?.pdf_extracted_text || null;
  const pdfPageCount = message.metadata?.pdf_page_count || null;
  const attachmentType = attachment?.type;
  const attachmentUrl = typeof attachment?.url === 'string' ? attachment.url : null;
  const attachmentName = typeof attachment?.name === 'string' && attachment.name.trim() ? attachment.name : null;
  const isImageAttachment = attachmentType === 'image' && !!attachmentUrl;
  const isPdfAttachment = attachmentType === 'pdf' && !!attachmentUrl;
  const isGenericFileAttachment = attachmentType === 'file' && !!attachmentUrl;
  const hasRenderableAttachment = isImageAttachment || isPdfAttachment || isGenericFileAttachment;
  if (!message.content && !hasRenderableAttachment) {
    return null;
  }

  // CRITICAL GATE 2: TYPE CHECK - Content MUST be a string
  if (typeof message.content !== 'string' && !hasRenderableAttachment) {
    console.error('[MessageBubble] ⛔ FATAL: Content is not a string, type:', typeof message.content);
    return null;
  }

  // CRITICAL GATE 3: Content extraction with ZERO tolerance for raw/structured data
  let content = '';
  let thinkingContent = null;
  try {
    const rawContent = typeof message.content === 'string' ? message.content : '';
    // Strip [ATTACHMENT_CONTEXT] block from user messages — it's an AI-facing context
    // block that must never appear in the visible chat. Strip everything from the marker
    // to end-of-string (the block is always appended after the human-visible text).
    const contentStr = isUser
      ? rawContent.replace(/\n?\[ATTACHMENT_CONTEXT\][\s\S]*$/, '').trim()
      : rawContent.trim();

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
    content = !isUser ? sanitizeAssistantContentForAttachmentSurfaces(sanitized, assistantAttachments) : sanitized;

    // CRITICAL GATE 4: Final content validation
    if ((!content || content.length < 1) && !hasRenderableAttachment) {
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

  const pdfOverflow = !isUser &&
  hasPdfContext &&
  typeof message?.metadata?.[PDF_ANALYSIS_OVERFLOW_METADATA_KEY] === 'string' &&
  message.metadata[PDF_ANALYSIS_OVERFLOW_METADATA_KEY].trim() ?
  message.metadata[PDF_ANALYSIS_OVERFLOW_METADATA_KEY].trim() :
  null;

  const dir = i18n.language === 'he' ? 'rtl' : 'ltr';
  const handleAssistantPdfDownload = async (url) => {
    if (isUser || !url || signingPdfUrl) return;
    setSigningPdfUrl(url);
    try {
      const signed = await base44.integrations.Core.CreateFileSignedUrl({ file_url: url });
      const signedUrl = signed?.signed_url || signed?.url || signed?.file_url;
      if (!signedUrl) throw new Error('Failed to generate secure URL for PDF');
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('[MessageBubble] Failed to create signed PDF URL:', error);
    } finally {
      setSigningPdfUrl(null);
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
                {/* Collapsible full PDF text — stored in metadata.pdf_extracted_text at send time */}
                {isPdfAttachment && pdfFullText &&
            <PdfFullTextCard text={pdfFullText} pageCount={pdfPageCount} />
            }
              </> :

          <>
                {assistantAttachments.length > 0 &&
             <div className="mb-3">
                    {assistantAttachments.map((assistantAttachment, index) => {
                  const attachmentKey = `assistant-attachment-${assistantAttachment.url}-${index}`;
                  const isAttachmentImage = assistantAttachment.type === 'image';
                  const isAttachmentPdf = assistantAttachment.type === 'pdf';
                  const isAttachmentFile = assistantAttachment.type === 'file';
                  const isThisPdfSigning = signingPdfUrl === assistantAttachment.url;

                  if (isAttachmentImage) {
                    return (
                      <a key={attachmentKey} href={assistantAttachment.url} target="_blank" rel="noopener noreferrer" className="inline-block my-1">
                        <img
                  src={assistantAttachment.url}
                  alt={assistantAttachment.name || t('chat.attachments.image_preview_alt')}
                  className="max-w-[220px] max-h-[220px] rounded-lg object-cover border border-primary-foreground/20" />
                      </a>
                    );
                  }

                  if (isAttachmentPdf) {
                    const chipLabel = assistantAttachment.name || t('chat.attachments.pdf_chip_label');
                    return (
                      <button
                key={attachmentKey}
                type="button"
                onClick={() => handleAssistantPdfDownload(assistantAttachment.url)}
                disabled={!!signingPdfUrl}
                className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/20 px-3 py-2 text-sm hover:bg-primary-foreground/10 transition-colors disabled:opacity-70 my-1">
                        <FileText className="w-4 h-4" />
                        <span className="max-w-[220px] truncate">{isThisPdfSigning ? t('chat.attachments.opening_pdf', 'Opening PDF...') : chipLabel}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </button>
                    );
                  }

                  if (isAttachmentFile) {
                    const chipLabel = assistantAttachment.name || assistantAttachment.url;
                    return (
                      <a
                key={attachmentKey}
                href={assistantAttachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/20 px-3 py-2 text-sm hover:bg-primary-foreground/10 transition-colors my-1">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="max-w-[220px] truncate">{chipLabel}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80 flex-shrink-0" />
                      </a>
                    );
                  }

                  return null;
                })}
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
              // Render inline images from the AI (e.g. ![alt](url))
              img: ({ src, alt }) => {
                if (!src) return null;
                return (
                  <a href={src} target="_blank" rel="noopener noreferrer" className="inline-block my-2">
                    <img src={src} alt={alt || ''} className="max-w-[260px] max-h-[260px] rounded-lg object-cover border border-primary-foreground/20" />
                  </a>
                );
              },
              // Render links — detect file links and show appropriate UI
              a: ({ href, children }) => {
                if (!href) return <span>{children}</span>;
                const fileType = inferAttachmentTypeFromUrl(href);
                if (fileType === 'image') {
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block my-2">
                      <img src={href} alt={String(children || '')} className="max-w-[260px] max-h-[260px] rounded-lg object-cover border border-primary-foreground/20" />
                    </a>
                  );
                }
                if (fileType === 'pdf') {
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/20 px-3 py-2 text-sm hover:bg-primary-foreground/10 transition-colors my-1">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="max-w-[200px] truncate">{String(children || href)}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80 flex-shrink-0" />
                    </a>
                  );
                }
                if (fileType === 'file') {
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/20 px-3 py-2 text-sm hover:bg-primary-foreground/10 transition-colors my-1">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="max-w-[200px] truncate">{String(children || href)}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80 flex-shrink-0" />
                    </a>
                  );
                }
                return <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 transition-opacity">{children}</a>;
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
                  {/* PDF analysis overflow — only shown when the assistant response was
                   truncated because it follows a PDF upload and was too long */}
                  {pdfOverflow && <PdfAnalysisOverflowCard overflow={pdfOverflow} />}
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
