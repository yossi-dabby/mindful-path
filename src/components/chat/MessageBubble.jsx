import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import MessageFeedback from './MessageFeedback';

export default function MessageBubble({ message, conversationId, messageIndex, agentName = 'cbt_therapist', context = 'chat' }) {
  // CRITICAL GATE 1: Strict null/undefined/empty gating
  if (!message || !message.role || !message.content) {
    return null;
  }
  
  const isUser = message.role === 'user';
  
  // CRITICAL GATE 2: Content extraction with ZERO tolerance for raw/structured data
  let content = '';
  try {
    const rawContent = message.content;
    const contentStr = String(rawContent).trim();
    
    // IMMEDIATE REJECT: Any sign of structured data
    if (contentStr.includes('"assistant_message"') || 
        contentStr.includes('"tool_calls"') ||
        contentStr.includes('"homework":{') ||
        contentStr.includes('"s":') ||
        contentStr.includes('\\u00') ||
        (contentStr.startsWith('{') && contentStr.includes('"')) ||
        (contentStr.startsWith('[') && contentStr.includes('{'))) {
      console.error('[MessageBubble] ⛔ HARD BLOCK: Structured data rejected');
      return null;
    }
    
    // Type 1: Clean string (most common)
    if (typeof rawContent === 'string' && !contentStr.startsWith('{') && !contentStr.startsWith('[')) {
      content = contentStr;
    }
    // Type 2: JSON string - extract assistant_message ONLY
    else if (typeof rawContent === 'string' && (contentStr.startsWith('{') || contentStr.startsWith('['))) {
      try {
        const parsed = JSON.parse(contentStr);
        if (parsed.assistant_message && typeof parsed.assistant_message === 'string') {
          content = parsed.assistant_message.trim();
        } else {
          console.error('[MessageBubble] ⛔ HARD BLOCK: JSON without assistant_message');
          return null;
        }
      } catch {
        // Not valid JSON - use as-is
        content = contentStr;
      }
    }
    // Type 3: Object
    else if (typeof rawContent === 'object' && rawContent !== null) {
      if (rawContent.assistant_message && typeof rawContent.assistant_message === 'string') {
        content = rawContent.assistant_message.trim();
      } else {
        console.error('[MessageBubble] ⛔ HARD BLOCK: Object without assistant_message');
        return null;
      }
    }
    else {
      console.error('[MessageBubble] ⛔ HARD BLOCK: Unexpected type');
      return null;
    }
    
    // CRITICAL GATE 3: Final content validation
    if (!content || content.length < 1) {
      return null;
    }
    
    // CRITICAL GATE 4: Double-check no structured data leaked
    if (content.includes('{"') || content.includes('"}') || content.includes('[{')) {
      console.error('[MessageBubble] ⛔ HARD BLOCK: Final check failed');
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