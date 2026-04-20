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
          key={getMessageRenderKey(message, index, conversationId)}
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

function getMessageRenderKey(message, index, conversationId) {
  const convKey = conversationId || 'no-conversation';
  const roleKey = typeof message?.role === 'string' ? message.role : 'unknown';
  const idKey = typeof message?.id === 'string' && message.id ? `id:${message.id}` : null;
  if (idKey) return `${convKey}:${idKey}`;

  const createdKey =
    typeof message?.created_at === 'string' && message.created_at
      ? message.created_at
      : typeof message?.created_date === 'string' && message.created_date
        ? message.created_date
        : null;
  const attachmentUrl =
    (typeof message?.metadata?.attachment?.url === 'string' && message.metadata.attachment.url) ||
    (typeof message?.attachment?.url === 'string' && message.attachment.url) ||
    'no-attachment';
  const contentPreview =
    typeof message?.content === 'string' && message.content
      ? message.content.slice(0, 48)
      : 'no-content';

  if (createdKey) return `${convKey}:ts:${createdKey}:${roleKey}:${attachmentUrl}:${index}`;
  return `${convKey}:idx:${index}:${roleKey}:${attachmentUrl}:${contentPreview}`;
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
