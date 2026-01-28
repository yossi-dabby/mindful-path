import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import MessageFeedback from './MessageFeedback';

export default function MessageBubble({ message, conversationId, messageIndex, agentName = 'cbt_therapist', context = 'chat' }) {
  if (!message || !message.content) return null;
  
  const isUser = message.role === 'user';
  
  // Safely handle content conversion with JSON detection and sanitization
  let content = '';
  try {
    const rawContent = message.content || '';
    
    // CRITICAL: Detect and prevent JSON rendering
    // If content looks like JSON, attempt to extract assistant_message
    if (typeof rawContent === 'string' && rawContent.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(rawContent);
        // If it's structured output, use assistant_message only
        if (parsed.assistant_message) {
          content = String(parsed.assistant_message).trim();
        } else if (parsed.content) {
          // Nested content field (fallback)
          content = String(parsed.content).trim();
        } else {
          // No valid message field - show error fallback
          content = '[Unable to display message]';
          console.warn('[MessageBubble] Raw JSON detected without assistant_message:', rawContent.substring(0, 100));
        }
      } catch (jsonError) {
        // Failed to parse as JSON, treat as regular text
        content = String(rawContent).trim();
      }
    } else if (typeof rawContent === 'object') {
      // Content is already an object (shouldn't happen, but handle it)
      if (rawContent.assistant_message) {
        content = String(rawContent.assistant_message).trim();
      } else {
        content = '[Unable to display message]';
        console.warn('[MessageBubble] Object content without assistant_message:', rawContent);
      }
    } else {
      content = String(rawContent).trim();
    }
    
    // Additional safety: Remove any remaining JSON-like fragments or escaped sequences
    if (content.includes('\\u') || content.includes('"s":') || content.includes('"homework"')) {
      console.warn('[MessageBubble] Potential JSON fragment detected, sanitizing');
      content = '[Unable to display message - invalid format]';
    }
    
  } catch (e) {
    console.error('Error processing message content:', e);
    return null;
  }
  
  if (!content) return null;
  
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