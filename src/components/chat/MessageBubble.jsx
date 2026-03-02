import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import MessageFeedback from './MessageFeedback';
import { sanitizeMessageContent, extractThinkingContent } from '../utils/messageContentSanitizer';

export default function MessageBubble({ message, conversationId, messageIndex, agentName = 'cbt_therapist', context = 'chat' }) {
  const { t } = useTranslation();
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
        (contentStr.startsWith('{') && contentStr.includes('"')) ||
        (contentStr.startsWith('[{') && contentStr.includes('"'))) {
      console.error('[MessageBubble] ⛔ HARD BLOCK: Structured data rejected:', contentStr.substring(0, 50));
      return null;
    }
    
    // Extract AI thinking content before sanitization (assistant only)
    if (!isUser) {
      thinkingContent = extractThinkingContent(contentStr);
    }
    
    // CRITICAL: Sanitize reasoning leakage (THOUGHT:, PLAN:, etc.)
    // This is the last line of defense before rendering
    const sanitized = isUser ? contentStr : sanitizeMessageContent(contentStr, 'auto');
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
  
  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end flex-row-reverse' : 'justify-start')} dir="ltr">
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-purple-400 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm">AI</span>
        </div>
      )}
      <div className={cn('max-w-[85%] md:max-w-[70%]', isUser && 'flex flex-col items-end')}>
        {/* AI Thinking Process - collapsible, shown before the response */}
        {!isUser && thinkingContent && (
          <div className="mb-2 rounded-xl border border-purple-200 bg-purple-50/60 overflow-hidden">
            <button
              onClick={() => setThinkingExpanded(prev => !prev)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-100/60 transition-colors"
              aria-expanded={thinkingExpanded}
            >
              <span className="text-purple-400">✦</span>
              <span>{t('chat.ai_thinking.label')}</span>
              <span className="ml-auto text-purple-400">{thinkingExpanded ? '▲' : '▼'}</span>
            </button>
            {thinkingExpanded && (
              <div className="px-3 pb-3 pt-1 text-xs text-purple-800 whitespace-pre-wrap leading-relaxed border-t border-purple-200">
                {thinkingContent}
              </div>
            )}
          </div>
        )}
        <div
            className={cn(
              'rounded-2xl px-5 py-3',
              isUser
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
            )}
          >
            {isUser ? (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
            ) : (
              <ReactMarkdown
                className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  code: ({ inline, className, children }) => {
                    const safeClassName = String(className || '');
                    const safeChildren = children || '';
                    if (inline) {
                      return <code className="px-1 py-0.5 rounded bg-gray-100 text-gray-800 text-sm">{safeChildren}</code>;
                    }
                    return (
                      <pre className="bg-gray-100 rounded-lg p-3 my-2 overflow-x-auto">
                        <code className={safeClassName}>{safeChildren}</code>
                      </pre>
                    );
                  },
                  p: ({ children }) => (
                    <p className="my-2 leading-relaxed text-[15px]">{children || ''}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-2 ml-4 list-disc space-y-1">{children || ''}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-2 ml-4 list-decimal space-y-1">{children || ''}</ol>
                  ),
                  li: ({ children }) => <li className="my-1">{children || ''}</li>,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">{children || ''}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children || ''}</em>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-green-300 pl-4 my-3 italic text-gray-600">
                      {children || ''}
                    </blockquote>
                  )
                  }}
                  >
                  {content}
                  </ReactMarkdown>
                  )}
                  
                  {/* Feedback for assistant messages */}
                  {!isUser && conversationId && messageIndex !== undefined && (
                    <MessageFeedback 
                      conversationId={conversationId}
                      messageIndex={messageIndex}
                      agentName={agentName}
                      context={context}
                    />
                  )}
                  </div>
                  </div>
      {isUser && (
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <span className="text-gray-600 text-sm">You</span>
        </div>
      )}
    </div>
  );
}