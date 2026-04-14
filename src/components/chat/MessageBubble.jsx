import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import MessageFeedback from './MessageFeedback';
import { sanitizeMessageContent, extractThinkingContent } from '../utils/messageContentSanitizer';
import { applyFinalOutputGovernor } from '../utils/finalOutputGovernor';

export default function MessageBubble({ message, conversationId, messageIndex, agentName = 'cbt_therapist', context = 'chat', userMessage, sessionLanguage }) {
  const { t, i18n } = useTranslation();
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  // CRITICAL GATE 1: Strict null/undefined/empty gating
  if (!message || !message.role || !message.content) {
    return null;
  }

  const isUser = message.role === 'user';

  // CRITICAL GATE 2: TYPE CHECK - Content MUST be a string
  if (typeof message.content !== 'string') {
    console.error('[MessageBubble] ⛔ FATAL: Content is not a string, type:', typeof message.content);
    return null;
  }

  // CRITICAL GATE 3: Content extraction with ZERO tolerance for raw/structured data
  let content = '';
  let thinkingContent = null;
  try {
    const rawContent = message.content;
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
    if (!content || content.length < 1) {
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
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p> :

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
                  </ReactMarkdown>
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