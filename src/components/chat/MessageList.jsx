import React from 'react';
import MessageBubble from './MessageBubble';

/**
 * Renders the list of chat messages, passing hasPdfContext to assistant bubbles
 * that immediately follow a PDF upload so they can split long content into a
 * collapsible overflow card.
 */
export default function MessageList({ messages, visibleCount, conversationId, sessionLanguage }) {
  return messages
    .slice(Math.max(0, messages.length - visibleCount))
    .filter((m) => m && m.role && (m.content || hasUserAttachment(m)))
    .map((message, index, arr) => {
      const prevMsg = arr[index - 1];
      const prevUserMessage =
        message.role === 'assistant' && prevMsg?.role === 'user'
          ? prevMsg?.content
          : undefined;
      const hasPdfContext =
        message.role === 'assistant' &&
        prevMsg?.role === 'user' &&
        !!(
          prevMsg?.metadata?.attachment?.type === 'pdf' ||
          prevMsg?.metadata?.pdf_extracted_text
        );
      return (
        <MessageBubble
          key={index}
          message={message}
          conversationId={conversationId}
          messageIndex={index}
          agentName="cbt_therapist"
          context="chat"
          userMessage={prevUserMessage}
          sessionLanguage={sessionLanguage}
          hasPdfContext={hasPdfContext}
        />
      );
    });
}

function hasUserAttachment(message) {
  if (!message || message.role !== 'user') return false;
  const attachment =
    (message.metadata?.attachment && typeof message.metadata.attachment === 'object'
      ? message.metadata.attachment
      : null) ||
    (message.attachment && typeof message.attachment === 'object'
      ? message.attachment
      : null);
  return !!attachment;
}