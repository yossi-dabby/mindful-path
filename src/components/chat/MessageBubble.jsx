import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

export default function MessageBubble({ message }) {
  if (!message) return null;
  
  const isUser = message.role === 'user';
  
  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-purple-400 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm">AI</span>
        </div>
      )}
      <div className={cn('max-w-[85%] md:max-w-[70%]', isUser && 'flex flex-col items-end')}>
        {message.content && (
          <div
            className={cn(
              'rounded-2xl px-5 py-3',
              isUser
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
            )}
          >
            {isUser ? (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown
                className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  code: ({ inline, className, children, ...props }) => {
                    if (inline) {
                      return <code className="px-1 py-0.5 rounded bg-gray-100 text-gray-800 text-sm" {...props}>{children}</code>;
                    }
                    return (
                      <pre className="bg-gray-100 rounded-lg p-3 my-2 overflow-x-auto">
                        <code className={className} {...props}>{children}</code>
                      </pre>
                    );
                  },
                  p: ({ children }) => (
                    <p className="my-2 leading-relaxed text-[15px]">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => <li className="my-1">{children}</li>,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-green-300 pl-4 my-3 italic text-gray-600">
                      {children}
                    </blockquote>
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <span className="text-gray-600 text-sm">You</span>
        </div>
      )}
    </div>
  );
}