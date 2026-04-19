import React from 'react';
import MessageBubble from './MessageBubble';

/**
 * Renders the list of chat messages for the active therapist chat runtime.
 *
 * Stage 1 runtime-path lock:
 * Active therapist-chat message-list renderer for pages/Chat.jsx (/Chat route).
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
