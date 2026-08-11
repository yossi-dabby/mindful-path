export function resolveFeedbackMessageIndex(message, visibleIndex) {
  if (Number.isInteger(message?.__rawIndex)) {
    return message.__rawIndex;
  }
  return visibleIndex;
}
