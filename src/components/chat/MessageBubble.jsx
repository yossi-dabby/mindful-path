import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import MessageFeedback from './MessageFeedback';

export default function MessageBubble({ message, conversationId, messageIndex, agentName = 'cbt_therapist', context = 'chat' }) {
  // CRITICAL: Strict null/undefined/empty gating - never render incomplete messages
  if (!message || !message.role || !message.content) {
    console.warn('[MessageBubble] Skipping incomplete message:', message?.role, !!message?.content);
    return null;
  }
  
  const isUser = message.role === 'user';
  
  // CRITICAL: Strict content extraction with zero tolerance for raw data
  let content = '';
  try {
    const rawContent = message.content;
    
    // Type 1: Already a clean string
    if (typeof rawContent === 'string' && !rawContent.trim().startsWith('{') && !rawContent.trim().startsWith('[')) {
      content = rawContent.trim();
    }
    // Type 2: JSON string - extract assistant_message ONLY
    else if (typeof rawContent === 'string' && (rawContent.trim().startsWith('{') || rawContent.trim().startsWith('['))) {
      try {
        const parsed = JSON.parse(rawContent);
        if (parsed.assistant_message && typeof parsed.assistant_message === 'string') {
          content = parsed.assistant_message.trim();
          console.log('[MessageBubble] Extracted from JSON:', content.substring(0, 50));
        } else {
          // No valid assistant_message - abort rendering
          console.error('[MessageBubble] BLOCKED: JSON without assistant_message');
          return null;
        }
      } catch (jsonError) {
        // Not valid JSON - treat as plain text
        content = rawContent.trim();
      }
    }
    // Type 3: Already an object
    else if (typeof rawContent === 'object') {
      if (rawContent.assistant_message && typeof rawContent.assistant_message === 'string') {
        content = rawContent.assistant_message.trim();
      } else {
        // No valid assistant_message - abort rendering
        console.error('[MessageBubble] BLOCKED: Object without assistant_message');
        return null;
      }
    }
    else {
      // Unexpected type - abort
      console.error('[MessageBubble] BLOCKED: Unexpected content type:', typeof rawContent);
      return null;
    }
    
    // CRITICAL: Final safety check - reject if any structured data leaked through
    if (content.includes('"assistant_message"') || 
        content.includes('"tool_calls"') || 
        content.includes('"homework":{') ||
        content.includes('\\u00') ||
        content.startsWith('{') ||
        content.startsWith('[')) {
      console.error('[MessageBubble] BLOCKED: Structured data detected in final content');
      return null;
    }
    
  } catch (e) {
    console.error('[MessageBubble] Fatal error processing content:', e);
    return null;
  }
  
  // CRITICAL: Empty content = abort rendering
  if (!content || content.length === 0) {
    console.warn('[MessageBubble] Skipping empty content');
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
                  code: ({ inline, className, children, ...props }) => {
                    const safeClassName = String(className || '');
                    const safeChildren = children || '';
                    if (inline) {
                      return <code className="px-1 py-0.5 rounded bg-gray-100 text-gray-800 text-sm" {...props}>{safeChildren}</code>;
                    }
                    return (
                      <pre className="bg-gray-100 rounded-lg p-3 my-2 overflow-x-auto">
                        <code className={safeClassName} {...props}>{safeChildren}</code>
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