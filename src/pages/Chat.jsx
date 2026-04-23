import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAuthError, shouldShowAuthError } from '../components/utils/authErrorHandler';
import AuthErrorBanner from '../components/utils/AuthErrorBanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Menu, Sparkles, ArrowLeft, Trash2, Paperclip, Mic, Square, Play } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from
'@/components/ui/alert-dialog';
import MessageList from '../components/chat/MessageList';
import ConversationsList from '../components/chat/ConversationsList';
import SessionSummary from '../components/chat/SessionSummary';
import ProactiveCheckIn from '../components/chat/ProactiveCheckIn';
import TherapyStateMachine from '../components/chat/TherapyStateMachine';
import EnhancedMoodCheckIn from '../components/home/EnhancedMoodCheckIn';
import InlineConsentBanner from '../components/chat/InlineConsentBanner';
import ThoughtWorkSaveHandler from '../components/chat/ThoughtWorkSaveHandler';
import InlineRiskPanel from '../components/chat/InlineRiskPanel';
import ProfileSpecificDisclaimer from '../components/chat/ProfileSpecificDisclaimer';
import { detectCrisisWithReason } from '../components/utils/crisisDetector';
import AgeGateModal from '../components/utils/AgeGateModal';
import AgeRestrictedMessage from '../components/utils/AgeRestrictedMessage';
import ErrorBoundary from '../components/utils/ErrorBoundary';
import { validateAgentOutput, sanitizeConversationMessages, parseCounters, serializeAttachmentMetadataMarker } from '../components/utils/validateAgentOutput.jsx';
import { ACTIVE_CBT_THERAPIST_WIRING } from '@/api/activeAgentWiring.js';
import { buildV6SessionStartContentAsync, buildV7SessionStartContentAsync, buildV8SessionStartContentAsync, buildV9SessionStartContentAsync, buildV10SessionStartContentAsync, buildV11SessionStartContentAsync, buildV12SessionStartContentAsync, buildActionFirstDemotedSessionContentAsync, buildRuntimeSafetySupplement } from '@/lib/workflowContextInjector.js';
// Phase 4 / Phase 5 — Conversation memory write for V7 continuity
import { triggerConversationEndSummarization, CONVERSATION_MIN_MESSAGES_FOR_MEMORY } from '@/lib/sessionEndSummarization.js';
import { MOBILE_HEADER_HEIGHT } from '../components/layout/MobileHeader';
import { BOTTOM_NAV_HEIGHT } from '../components/layout/BottomNav';
// Phase 8 — Upgraded-path UI (flag-gated; hidden in default mode)
import SessionPhaseIndicator from '../components/therapy/SessionPhaseIndicator';
import SafetyModeIndicator from '../components/therapy/SafetyModeIndicator';
// Phase 3 Deep Personalization — Session continuity cue (flag-gated; hidden in default mode)
import SessionContinuityCue from '../components/therapy/SessionContinuityCue';
import {
  buildMobileAudioDiagnosticInfo,
  extractBackendTranscriptionErrorReason,
  buildTranscriptionFailureDescription,
} from '@/utils/audioTranscriptionDiagnostics.js';
import {
  isWebmFile,
  isMp4File,
  resolveRecordedAudioMimeType,
  decodeAudioDataAsync,
  audioBufferToWavBlob,
} from '@/utils/androidAudioTranscoder.js';

// ─── MF-7: Legacy variant-profile agent names — historical conversations under
// these names must NOT receive new messages. Empty clinical stubs; fail-closed.
// Do NOT derive this list dynamically. Do NOT infer from safetyProfile metadata.
const LEGACY_VARIANT_PROFILES = Object.freeze([
'cbt_therapist_strict',
'cbt_therapist_standard',
'cbt_therapist_lenient']
);

// Maps ISO language codes to full names injected into the session-start directive.
// English is intentionally absent — the agent defaults to English with no directive.
const LANG_FULL_NAMES = {
  he: 'Hebrew',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese'
};
const IMAGE_ATTACHMENT_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg']);
const AUDIO_ATTACHMENT_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'm4a', 'aac', 'webm']);
const getSpeechRecognitionConstructor = () => window.SpeechRecognition || window.webkitSpeechRecognition || null;
const getAudioContextConstructor = () => window.AudioContext || window.webkitAudioContext || null;
const ANDROID_MEDIA_RECORDER_MIME_CANDIDATES = Object.freeze([
'audio/mp4',
'audio/ogg;codecs=opus',
'audio/ogg',
'audio/webm;codecs=opus',
'audio/webm']
);

function isAndroidRuntime() {
  if (typeof window === 'undefined') return false;
  const capacitorPlatform = typeof window.Capacitor?.getPlatform === 'function' ? window.Capacitor.getPlatform() : null;
  if (capacitorPlatform === 'android') return true;
  return /android/i.test(navigator?.userAgent || '');
}

/**
 * Returns true on mobile browsers and in-app WebView environments.
 * Used to gate enhanced transcription diagnostics to mobile code paths only.
 */
function isMobileBrowser() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /android|iphone|ipad|ipod|mobile|webos|blackberry|windows\s?phone/i.test(ua);
}

function getAndroidMediaRecorderMimeCandidates() {
  if (!isAndroidRuntime()) return [];

  if (typeof window?.MediaRecorder?.isTypeSupported !== 'function') {
    return [...ANDROID_MEDIA_RECORDER_MIME_CANDIDATES];
  }

  const supportedMimeTypes = ANDROID_MEDIA_RECORDER_MIME_CANDIDATES.filter((mimeType) =>
  window.MediaRecorder.isTypeSupported(mimeType)
  );

  return supportedMimeTypes.length > 0 ? supportedMimeTypes : [...ANDROID_MEDIA_RECORDER_MIME_CANDIDATES];
}

/**
 * Converts Android WebM and MP4/M4A voice drafts to WAV for transcription compatibility.
 * Non-Android or non-WebM/MP4 files are passed through unchanged.
 */
async function convertAndroidWebmDraftToWav(file) {
  if (!isAndroidRuntime() || (!isWebmFile(file) && !isMp4File(file))) return file;
  const AudioContextCtor = getAudioContextConstructor();
  if (!AudioContextCtor) {
    throw new Error('Audio conversion is unavailable on this Android runtime');
  }

  const audioContext = new AudioContextCtor();
  try {
    const audioBuffer = await decodeAudioDataAsync(audioContext, await file.arrayBuffer());
    const wavBlob = audioBufferToWavBlob(audioBuffer);
    const baseName = typeof file.name === 'string' && file.name.trim() ?
      file.name.replace(/\.[^.]+$/, '') :
      `voice-draft-${Date.now()}`;
    return new File([wavBlob], `${baseName}.wav`, { type: 'audio/wav' });
  } finally {
    if (typeof audioContext.close === 'function') {
      try {
        await audioContext.close();
      } catch {
        // no-op
      }
    }
  }
}

function hasUserAttachment(message) {
  if (!message || message.role !== 'user') return false;
  const attachment = message.metadata?.attachment && typeof message.metadata.attachment === 'object' ?
  message.metadata.attachment :
  message.attachment && typeof message.attachment === 'object' ?
  message.attachment :
  null;
  return !!attachment;
}

/**
 * Appends a language directive to a session-start content string.
 * When the language is English (or unknown), returns the content unchanged.
 * This tells the agent which language to use for its opening turn.
 */
function addLangDirective(sessionContent, lang) {
  const name = LANG_FULL_NAMES[lang];
  if (!name) return sessionContent;
  return sessionContent + `\n[SESSION_LANGUAGE: ${lang}. Open and respond entirely in ${name} for this session. Do not use English.]`;
}

function resolveAttachmentType(fileName) {
  const extension = typeof fileName === 'string' ? fileName.split('.').pop()?.toLowerCase() : '';
  if (IMAGE_ATTACHMENT_EXTENSIONS.has(extension)) return 'image';
  if (extension === 'pdf') return 'pdf';
  if (AUDIO_ATTACHMENT_EXTENSIONS.has(extension)) return 'audio';
  return 'file';
}

export default function Chat() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSummaryPrompt, setShowSummaryPrompt] = useState(false);
  const [showTherapyFlow, setShowTherapyFlow] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showAuthError, setShowAuthError] = useState(false);
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const [showRiskPanel, setShowRiskPanel] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [isAgeRestricted, setIsAgeRestricted] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [savePromptData, setSavePromptData] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [audioDraftStatus, setAudioDraftStatus] = useState('idle');
  const [audioDraftUrl, setAudioDraftUrl] = useState(null);
  const [audioDraftFile, setAudioDraftFile] = useState(null);
  const [audioDraftTranscript, setAudioDraftTranscript] = useState('');
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioDraftPlayerRef = useRef(null);
  const audioDraftUrlRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const speechTranscriptRef = useRef('');
  // MF-7: true when the loaded conversation belongs to a legacy variant-profile agent
  const [variantProfileBlocked, setVariantProfileBlocked] = useState(false);
  // Phase 8 — Upgraded-path UI state (only relevant when V5 wiring is active)
  // safetyModeActive becomes true and stays true once the upgraded safety supplement
  // fires for any turn in this session.  Resets when a new conversation starts.
  const [safetyModeActive, setSafetyModeActive] = useState(false);
  // Session language — locked at conversation start from the active UI locale.
  // Separate from i18n.language (UI locale) so that UI locale changes mid-session
  // do not corrupt the response language used by the Final Output Governor.
  // Stored as a ref so MessageBubble renders do not trigger on locale changes.
  const sessionLanguageRef = useRef(i18n.language || 'en');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(50);
  const subscriptionActiveRef = useRef(false);
  const loadingTimeoutRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const expectedReplyCountRef = useRef(0);
  const lastMessageHashRef = useRef('');
  const lastConfirmedMessagesRef = useRef([]);
  const currentTurnIdRef = useRef(0);
  const isRefetchingRef = useRef(false);
  const thinkingPlaceholderRef = useRef(null);
  // Tracks whether the subscription already delivered a confirmed final response for
  // the current send cycle. When true, polling must not overwrite subscription content.
  const subscriptionSucceededRef = useRef(false);

  // INSTRUMENTATION: Track hard render gate enforcement + send cycle proof
  const instrumentationRef = useRef({
    SEND_COUNT: 0,
    WEB_SENDS_PASS: 0,
    MOBILE_SENDS_PASS: 0,
    HARD_GATE_BLOCKED_OBJECT: 0,
    HARD_GATE_BLOCKED_JSON_STRING: 0,
    HARD_GATE_FALSE_POSITIVE_PREVENTED: 0,
    REFETCH_TRIGGERED: 0,
    DUPLICATE_BLOCKED: 0,
    DUPLICATE_OCCURRED: 0,
    PLACEHOLDER_RENDERED: 0,
    PLACEHOLDER_BECAME_MESSAGE: 0,
    THINKING_OVER_10S: 0,
    UI_FLASHES_DETECTED: 0,
    SAFE_UPDATES: 0,
    TOTAL_MESSAGES_PROCESSED: 0,
    STUCK_THINKING_TIMEOUTS: 0
  });

  const refetchDebounceRef = useRef(null);
  const mountedRef = useRef(true);
  const processedIntentRef = useRef(null);
  const sessionTriggeredRef = useRef(new Set());
  const inFlightIntentRef = useRef(false);
  // Phase 5 — Dedup Set: tracks conversationIds that have already had a
  // conversation-end memory write triggered (from any path: switch, requestSummary).
  // Prevents double-writes when both a switch trigger and requestSummary fire for
  // the same conversation.
  const conversationMemoryWrittenRef = useRef(new Set());

  // Reset visible window when conversation changes
  useEffect(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    audioChunksRef.current = [];
    setVisibleCount(50);
    setVariantProfileBlocked(false); // MF-7: reset block state whenever conversation switches
    setAudioDraftStatus('idle');
    setAudioDraftFile(null);
    setAudioDraftTranscript('');
    speechTranscriptRef.current = '';
    setIsTranscribingAudio(false);
    setAudioDraftUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return null;
    });
  }, [currentConversationId]);

  useEffect(() => {
    audioDraftUrlRef.current = audioDraftUrl;
  }, [audioDraftUrl]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioDraftUrlRef.current) {
        URL.revokeObjectURL(audioDraftUrlRef.current);
      }
    };
  }, []);

  // Load more messages when user scrolls to top
  const handleMessagesScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollTop < 80 && visibleCount < messages.length) {
      const prevScrollHeight = el.scrollHeight;
      setVisibleCount((prev) => Math.min(prev + 30, messages.length));
      // Preserve scroll position after prepending older messages
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight - prevScrollHeight;
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Emit mandatory one-line stability proof after each send cycle
  const emitStabilitySummary = () => {
    const counters = instrumentationRef.current;
    console.log(
      `FINAL STABILITY SUMMARY | send=${counters.SEND_COUNT} | ` +
      `parse_failed=${parseCounters.PARSE_FAILED} | ` +
      `dup_occurred=${counters.DUPLICATE_OCCURRED} | ` +
      `placeholder_became_msg=${counters.PLACEHOLDER_BECAME_MESSAGE} | ` +
      `thinking_over_10s=${counters.THINKING_OVER_10S}`
    );
  };

  // Print final stability report
  const printFinalStabilityReport = () => {
    const counters = instrumentationRef.current;
    const parseErrors = parseCounters.PARSE_FAILED;
    const duplicates = counters.DUPLICATE_OCCURRED;
    const placeholderIssues = counters.PLACEHOLDER_BECAME_MESSAGE;
    const thinkingIssues = counters.THINKING_OVER_10S;

    console.log('\n═══════════════════════════════════════════════════');
    console.log('[CHAT STABILITY REPORT]');
    console.log('═══════════════════════════════════════════════════');
    console.log(`Web sends: ${counters.WEB_SENDS_PASS}/30 ${counters.WEB_SENDS_PASS >= 30 ? 'PASS' : 'FAIL'}`);
    console.log(`Mobile sends: ${counters.MOBILE_SENDS_PASS}/15 ${counters.MOBILE_SENDS_PASS >= 15 ? 'PASS' : 'FAIL'}`);
    console.log(`UI flashes detected: ${counters.UI_FLASHES_DETECTED === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`Parse errors: ${parseErrors === 0 ? 'PASS' : 'FAIL'} (${parseErrors})`);
    console.log(`Duplicates occurred: ${duplicates === 0 ? 'PASS' : 'FAIL'} (${duplicates})`);
    console.log(`Placeholder became message: ${placeholderIssues === 0 ? 'PASS' : 'FAIL'} (${placeholderIssues})`);
    console.log(`Thinking >10s: ${thinkingIssues === 0 ? 'PASS' : 'FAIL'} (${thinkingIssues})`);
    console.log('───────────────────────────────────────────────────');
    console.log('Summary counters:');
    console.log(`  PARSE_ATTEMPTS: ${parseCounters.PARSE_ATTEMPTS}`);
    console.log(`  PARSE_SKIPPED_NOT_JSON: ${parseCounters.PARSE_SKIPPED_NOT_JSON}`);
    console.log(`  SANITIZE_EXTRACT_OK: ${parseCounters.SANITIZE_EXTRACT_OK}`);
    console.log(`  HARD_GATE_BLOCKED_OBJECT: ${counters.HARD_GATE_BLOCKED_OBJECT}`);
    console.log(`  HARD_GATE_BLOCKED_JSON_STRING: ${counters.HARD_GATE_BLOCKED_JSON_STRING}`);
    console.log(`  HARD_GATE_FALSE_POSITIVE_PREVENTED: ${counters.HARD_GATE_FALSE_POSITIVE_PREVENTED}`);
    console.log(`  REFETCH_TRIGGERED: ${counters.REFETCH_TRIGGERED}`);
    console.log(`  DUPLICATE_BLOCKED: ${counters.DUPLICATE_BLOCKED}`);
    console.log('═══════════════════════════════════════════════════\n');
  };

  // CRITICAL: HARD RENDER GATE - validate message is 100% render-safe (NO FALSE POSITIVES)
  const isMessageRenderSafe = (msg) => {
    if (!msg || !msg.role) {
      return false;
    }

    const hasAttachment = hasUserAttachment(msg);
    if (!msg.content && !hasAttachment) {
      return false;
    }

    // Backward compatibility: allow historical user attachment messages with
    // null/legacy non-string content to render via attachment surfaces.
    if (typeof msg.content !== 'string') {
      if (hasAttachment) {
        return true;
      }
      console.error('[HARD GATE] ⛔ Object blocked');
      instrumentationRef.current.HARD_GATE_BLOCKED_OBJECT++;
      return false;
    }

    const content = msg.content;
    const trimmed = content.trim();

    // Block placeholder/thinking messages
    if ((content.toLowerCase().includes('thinking') || content === '...') && content.length < 20) {
      instrumentationRef.current.PLACEHOLDER_BECAME_MESSAGE++;
      return false;
    }

    // Block ONLY if truly JSON-shaped (not just containing keywords)
    const isJSONShaped = trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('```json');

    if (isJSONShaped) {
      // This is actual JSON structure - block it
      console.error('[HARD GATE] ⛔ JSON structure blocked');
      instrumentationRef.current.HARD_GATE_BLOCKED_JSON_STRING++;
      return false;
    }

    // Plain text that just contains keywords like "assistant_message" is ALLOWED
    // This prevents false positives on Hebrew/English text
    if (trimmed.includes('"assistant_message"') && !isJSONShaped) {
      instrumentationRef.current.HARD_GATE_FALSE_POSITIVE_PREVENTED++;
    }

    // Block suspiciously short for assistant
    if (msg.role === 'assistant' && trimmed.length < 3) {
      return false;
    }

    return true;
  };

  // CRITICAL: Deduplicate using stable message IDs (no content hashing)
  const deduplicateMessages = (newMessages) => {
    const seen = new Set();
    const deduplicated = [];
    let duplicatesBlocked = 0;

    for (let i = 0; i < newMessages.length; i++) {
      const msg = newMessages[i];

      // Use deterministic key: msg.id > created_at+role+index > generated turn_id
      let msgKey;
      if (msg.id) {
        msgKey = msg.id;
      } else if (msg.created_at) {
        msgKey = `${msg.role}-${msg.created_at}-${i}`;
      } else {
        // Generate stable turn_id for this conversation turn
        if (msg.role === 'assistant' && !msg._turn_id) {
          currentTurnIdRef.current++;
          msg._turn_id = currentTurnIdRef.current;
        }
        msgKey = msg._turn_id ? `turn-${msg._turn_id}` : `idx-${i}-${msg.role}`;
      }

      if (!seen.has(msgKey)) {
        seen.add(msgKey);
        deduplicated.push(msg);
      } else {
        console.warn(`[Dedup] BLOCKED duplicate:`, msgKey);
        duplicatesBlocked++;
        instrumentationRef.current.DUPLICATE_BLOCKED++;
      }
    }

    if (duplicatesBlocked > 0) {
      console.log(`[Dedup] ✅ Duplicates blocked: ${duplicatesBlocked}`);
    }

    return deduplicated;
  };

  // CRITICAL: Pre-validate + sanitize messages before allowing state update
  const validateAndSanitizeMessages = (msgs) => {
    const validated = msgs.filter(isMessageRenderSafe);

    if (validated.length < msgs.length) {
      console.log(`[Validation] ✅ BLOCKED ${msgs.length - validated.length} unsafe messages`);
    }

    return deduplicateMessages(validated);
  };

  // CRITICAL: Safe state update with duplicate detection
  const safeUpdateMessages = (newMessages, source) => {
    const sanitized = validateAndSanitizeMessages(newMessages);
    instrumentationRef.current.TOTAL_MESSAGES_PROCESSED += newMessages.length;

    // Compare with last confirmed state
    if (sanitized.length < lastConfirmedMessagesRef.current.length) {
      console.log(`[${source}] ⚠️ Rejecting update - fewer messages than confirmed state`);
      return false;
    }

    // CRITICAL: Check for duplicate assistant messages in new batch
    const assistantMessages = sanitized.filter((m) => m.role === 'assistant');
    const assistantContents = assistantMessages.map((m) => String(m.content).substring(0, 100));
    const uniqueContents = new Set(assistantContents);

    if (assistantContents.length !== uniqueContents.size) {
      console.error(`[${source}] ✗ DUPLICATE OCCURRED: ${assistantContents.length - uniqueContents.size} duplicate assistant messages found`);
      instrumentationRef.current.DUPLICATE_OCCURRED += assistantContents.length - uniqueContents.size;

      // Further deduplicate by content
      const seenContents = new Set();
      const fullyDeduplicated = sanitized.filter((msg) => {
        if (msg.role !== 'assistant') return true;
        const contentKey = String(msg.content).substring(0, 100);
        if (seenContents.has(contentKey)) {
          console.warn('[Dedup] Removing duplicate assistant message');
          return false;
        }
        seenContents.add(contentKey);
        return true;
      });

      // Update with fully deduplicated version
      lastConfirmedMessagesRef.current = fullyDeduplicated;
      setMessages(fullyDeduplicated);
      instrumentationRef.current.SAFE_UPDATES++;
      return true;
    }

    // Check if this is actually new content
    const lastConfirmedAssistant = lastConfirmedMessagesRef.current.filter((m) => m.role === 'assistant').pop();
    const newAssistant = sanitized.filter((m) => m.role === 'assistant').pop();

    if (lastConfirmedAssistant && newAssistant) {
      const oldContent = String(lastConfirmedAssistant.content);
      const newContent = String(newAssistant.content);

      if (oldContent === newContent && sanitized.length === lastConfirmedMessagesRef.current.length) {
        console.log(`[${source}] ⚠️ Rejecting update - no new content detected`);
        return false;
      }

      // CONTENT REGRESSION GUARD: reject any update where the new assistant
      // message is materially shorter than the already-confirmed one.
      // This prevents polling snapshots (which may be a stored/processed version
      // shorter than what was streamed) from overwriting the full response.
      //
      // CRITICAL: Only apply this guard when the incoming batch has the SAME
      // message count as the confirmed baseline AND the message IDs agree (when
      // available).  If the new batch contains MORE messages, the last assistant
      // entry is a genuinely new reply from a different turn — not a shorter
      // overwrite of the previous reply.  Applying the guard in that case would
      // silently block the new reply and cause the stuck-response bug (reply
      // stored in the backend but never shown live without exit/re-entry).
      const isSameMessageCount = sanitized.length === lastConfirmedMessagesRef.current.length;
      // When either message lacks an id we conservatively assume they could be
      // the same message (fail-closed: keep protection when uncertain).  The
      // primary gate is isSameMessageCount — a growing batch always bypasses
      // the guard regardless of ids.
      const isSameMessageId =
      !lastConfirmedAssistant.id || !newAssistant.id ||
      lastConfirmedAssistant.id === newAssistant.id;
      const isSameTurn = isSameMessageCount && isSameMessageId;
      const oldLen = oldContent.length;
      const newLen = newContent.length;
      if (isSameTurn && oldLen > 80 && newLen < oldLen * 0.75) {
        console.warn(`[${source}] ⚠️ CONTENT REGRESSION BLOCKED: new(${newLen}) < old(${oldLen})*0.75 — rejecting`);
        return false;
      }
    }

    // Update is safe - commit to state
    console.log(`[${source}] ✅ SAFE UPDATE: ${sanitized.length} messages`);
    instrumentationRef.current.SAFE_UPDATES++;
    lastConfirmedMessagesRef.current = sanitized;
    setMessages(sanitized);
    return true;
  };

  useEffect(() => {
    const container = document.querySelector('[data-testid="chat-messages"]');
    if (!container) {
      scrollToBottom();
      return;
    }

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 140;

    if (isNearBottom || isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Handle intent from URL parameters - create conversation with intent metadata
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const intentParam = urlParams.get('intent');

    // Prevent duplicate processing of the same intent
    if (intentParam && processedIntentRef.current !== intentParam) {
      processedIntentRef.current = intentParam;

      const handleIntent = async () => {
        // Debounce guard - prevent duplicate triggers
        if (inFlightIntentRef.current) {
          console.log('[Intent Guard] Already processing intent, skipping');
          return;
        }

        inFlightIntentRef.current = true;

        try {
          console.log(`[Intent Detected] ${intentParam}`);

          if (!currentConversationId) {
            // No active conversation - start new one with intent in metadata
            // Get safety profile from user settings or default to 'standard'
            const user = await base44.auth.me().catch(() => null);
            const safetyProfile = user?.preferences?.safety_profile || 'standard';
            const agentName = ACTIVE_CBT_THERAPIST_WIRING.name;

            const conversation = await base44.agents.createConversation({
              agent_name: agentName,
              tool_configs: ACTIVE_CBT_THERAPIST_WIRING.tool_configs,
              metadata: {
                name: intentParam === 'thought_work' ? 'Thought Journal Session' :
                intentParam === 'goal_work' ? 'Goal Setting Session' :
                intentParam === 'daily_checkin' ? 'Daily Check-in' :
                intentParam === 'grounding' ? 'Grounding Exercise' :
                `Session ${conversations.length + 1}`,
                description: 'CBT Therapy Session',
                intent: intentParam,
                safety_profile: safetyProfile
              }
            });

            setCurrentConversationId(conversation.id);
            setMessages([]);
            clearLocalAudioDraft();
            setShowSidebar(false);
            // Lock session language at conversation start (separate from UI locale).
            sessionLanguageRef.current = i18n.language || 'en';
            refetchConversations();

            // Trigger AI to send opening message based on intent (one-time only)
            if (!sessionTriggeredRef.current.has(conversation.id)) {
              sessionTriggeredRef.current.add(conversation.id);
              setTimeout(async () => {
                setIsLoading(true);
                const sessionStartContent = await buildActionFirstDemotedSessionContentAsync(ACTIVE_CBT_THERAPIST_WIRING, base44.entities, base44);
                await base44.agents.addMessage(conversation, {
                  role: 'user',
                  content: addLangDirective(sessionStartContent, sessionLanguageRef.current)
                });
                inFlightIntentRef.current = false;
              }, 100);
            } else {
              inFlightIntentRef.current = false;
            }
          } else {
            // Active conversation exists - create new conversation with intent instead
            // Get safety profile from user settings or default to 'standard'
            const user = await base44.auth.me().catch(() => null);
            const safetyProfile = user?.preferences?.safety_profile || 'standard';
            const agentName = ACTIVE_CBT_THERAPIST_WIRING.name;

            const conversation = await base44.agents.createConversation({
              agent_name: agentName,
              tool_configs: ACTIVE_CBT_THERAPIST_WIRING.tool_configs,
              metadata: {
                name: intentParam === 'thought_work' ? 'Thought Journal Session' :
                intentParam === 'goal_work' ? 'Goal Setting Session' :
                intentParam === 'daily_checkin' ? 'Daily Check-in' :
                intentParam === 'grounding' ? 'Grounding Exercise' :
                `Session ${conversations.length + 1}`,
                description: 'CBT Therapy Session',
                intent: intentParam,
                safety_profile: safetyProfile
              }
            });

            setCurrentConversationId(conversation.id);
            setMessages([]);
            clearLocalAudioDraft();
            setShowSidebar(false);
            // Lock session language at conversation start (separate from UI locale).
            sessionLanguageRef.current = i18n.language || 'en';
            refetchConversations();

            // Trigger AI to send opening message (one-time only)
            if (!sessionTriggeredRef.current.has(conversation.id)) {
              sessionTriggeredRef.current.add(conversation.id);
              setTimeout(async () => {
                setIsLoading(true);
                const sessionStartContent = await buildActionFirstDemotedSessionContentAsync(ACTIVE_CBT_THERAPIST_WIRING, base44.entities, base44);
                await base44.agents.addMessage(conversation, {
                  role: 'user',
                  content: addLangDirective(sessionStartContent, sessionLanguageRef.current)
                });
                inFlightIntentRef.current = false;
              }, 100);
            } else {
              inFlightIntentRef.current = false;
            }
          }
        } catch (error) {
          console.error('[Intent Error]', error);
          setIsLoading(false);
          inFlightIntentRef.current = false;
        }
      };

      handleIntent();
    }
  }, [location.search]);

  // Handle visibility changes - force check when page becomes visible
  useEffect(() => {
    if (!currentConversationId) return;

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log('[Visibility] Page now visible');

        // If we're loading, force a check for updates
        if (isLoading) {
          console.log('[Visibility] Still loading - forcing refetch');
          try {
            const conversation = await base44.agents.getConversation(currentConversationId);
            const sanitized = sanitizeConversationMessages(conversation.messages || []);

            // Check if we have new messages
            if (sanitized.length > messages.length) {
              const updated = safeUpdateMessages(sanitized, 'VisibilityRefetch');
              if (updated) {
                setIsLoading(false);
                emitStabilitySummary();
              }
            }
          } catch (err) {
            console.error('[Visibility] Refetch failed:', err);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also handle focus events
    const handleFocus = () => {
      if (isLoading && currentConversationId) {
        console.log('[Focus] Window focused while loading - checking updates');
        handleVisibilityChange();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentConversationId, isLoading, messages.length]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!currentConversationId) {
      console.log('[Subscription] No conversation ID, skipping');
      subscriptionActiveRef.current = false;
      return;
    }

    // CRITICAL: Prevent duplicate subscriptions
    if (subscriptionActiveRef.current) {
      console.log('[Subscription] ⚠️ Already subscribed, skipping duplicate');
      return;
    }

    subscriptionActiveRef.current = true;
    let responseTimeoutId = null;
    let isSubscribed = true;

    console.log('[Subscription] Creating subscription for:', currentConversationId);

    const unsubscribe = base44.agents.subscribeToConversation(
      currentConversationId,
      (data) => {
        if (!isSubscribed || !mountedRef.current) {
          console.log('[Subscription] Ignoring update - unsubscribed or unmounted');
          return;
        }

        // CRITICAL: Process updates even if page is hidden
        // Browser may pause event loop, but we still need to process when it fires
        console.log('[Subscription] ✅ DATA RECEIVED, messages:', data.messages?.length, 'hidden:', document.hidden);

        // Clear timeout immediately
        if (responseTimeoutId) {
          clearTimeout(responseTimeoutId);
          responseTimeoutId = null;
        }

        // Clear loading timeout
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }

        // HARD RENDER GATE: Block unsafe messages BEFORE they reach React state
        let processedMessages = [];
        let lastStructuredData = null;

        try {
          // First pass: identify truly unsafe content (objects or JSON-shaped strings)
          const hasUnsafeContent = (data.messages || []).some((msg) => {
            if (msg.role !== 'assistant' || !msg.content) return false;
            if (typeof msg.content !== 'string') return true;
            const trimmed = msg.content.trim();
            // Only flag as unsafe if truly JSON-shaped (starts with { or [ or ```json)
            return trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('```json');
          });

          // If unsafe content detected, trigger debounced refetch (don't spam)
          if (hasUnsafeContent && !isRefetchingRef.current) {
            console.error('[HARD GATE] ⛔ UNSAFE CONTENT - Triggering refetch');
            instrumentationRef.current.REFETCH_TRIGGERED++;
            isRefetchingRef.current = true;

            // Debounced refetch (prevent spam)
            if (refetchDebounceRef.current) clearTimeout(refetchDebounceRef.current);
            refetchDebounceRef.current = setTimeout(async () => {
              try {
                const refetched = await base44.agents.getConversation(currentConversationId);
                const sanitized = sanitizeConversationMessages(refetched.messages || []);
                safeUpdateMessages(sanitized, 'Refetch');
                // Phase 2 fix: clear loading after refetch completes.  The subscription
                // returned early (no setIsLoading call) when unsafe content was detected.
                // The refetch is the recovery path — loading must always clear here so
                // the chat is not stuck when a JSON-shaped agent reply is sanitized away.
                setIsLoading(false);
                isRefetchingRef.current = false;
              } catch (err) {
                console.error('[Refetch] Failed:', err);
                setIsLoading(false);
                isRefetchingRef.current = false;
              }
            }, 200);

            // Keep showing current messages (do not clear state)
            return;
          }

          // Second pass: process only safe messages.
          // IMPORTANT: run the full conversation sanitizer first so user attachment
          // metadata is recovered from the send-contract marker during live updates.
          const sanitizedIncomingMessages = sanitizeConversationMessages(data.messages || []);
          processedMessages = sanitizedIncomingMessages.
          map((msg) => {
            if (msg.role === 'assistant' && msg.content) {
              // Skip if not render-safe
              if (!isMessageRenderSafe(msg)) {
                return null;
              }

              // Validate and extract structured data (non-blocking)
              const validated = validateAgentOutput(msg.content);
              if (validated) {
                lastStructuredData = validated;
                return {
                  ...msg,
                  content: validated.assistant_message || msg.content,
                  metadata: {
                    ...(msg.metadata || {}),
                    structured_data: validated
                  }
                };
              }

              return msg;
            }
            return msg;
          }).
          filter((msg) => msg !== null);

          // CRITICAL: Safe update with validation + deduplication
          const updated = safeUpdateMessages(processedMessages, 'Subscription');

          if (updated) {
            // CRITICAL: Always reset loading when safe update succeeds
            console.log('[Subscription] ✅ Loading OFF');
            // Mark subscription as having delivered confirmed content for this send
            // cycle. Polling must not overwrite subscription-confirmed content.
            subscriptionSucceededRef.current = true;
            setIsLoading(false);

            // Emit FINAL STABILITY SUMMARY for this send cycle
            emitStabilitySummary();

            // Check if we should offer save (homework + emotion baseline present)
            if (lastStructuredData?.journal_save_candidate?.should_offer_save) {
              console.log('[Save Prompt] Triggering save offer');
              setSavePromptData({
                structuredData: lastStructuredData,
                conversationId: currentConversationId,
                messages: processedMessages
              });
              setShowSavePrompt(true);
            }

            // Stop polling if active - subscription worked
            if (pollingIntervalRef.current) {
              console.log('[Subscription] Stopping polling - subscription successful');
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          } else {
            console.log('[Subscription] Update rejected - keeping current state');
          }
        } catch (err) {
          console.error('[Subscription] ❌ Processing error:', err);
          setIsLoading(false);
        }
      },
      (error) => {
        if (!isSubscribed || !mountedRef.current) return;

        console.error('[Subscription] ❌ Stream error:', error);
        if (responseTimeoutId) {
          clearTimeout(responseTimeoutId);
          responseTimeoutId = null;
        }
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
        setIsLoading(false);
        subscriptionActiveRef.current = false;
        emitStabilitySummary();
      }
    );

    // Verify subscription created
    if (!unsubscribe || typeof unsubscribe !== 'function') {
      console.error('[Subscription] ❌ Failed to create subscription');
      setIsLoading(false);
      subscriptionActiveRef.current = false;
      return;
    }

    console.log('[Subscription] ✅ Subscription active');

    // Timeout after 60s
    responseTimeoutId = setTimeout(() => {
      if (isSubscribed && mountedRef.current) {
        console.error('[Subscription] ⏱️ Timeout after 60s - forcing recovery');
        instrumentationRef.current.THINKING_OVER_10S++;
        setIsLoading(false);
        subscriptionActiveRef.current = false;

        // Cancel any pending polls
        if (pollingIntervalRef.current) {
          clearTimeout(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        emitStabilitySummary();
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      }
    }, 60000);

    return () => {
      console.log('[Subscription] Cleanup - unsubscribing');
      isSubscribed = false;
      subscriptionActiveRef.current = false;
      if (responseTimeoutId) {
        clearTimeout(responseTimeoutId);
        responseTimeoutId = null;
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (pollingIntervalRef.current) {
        clearTimeout(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (typeof unsubscribe === 'function') {
        try {
          unsubscribe();
          console.log('[Subscription] ✅ Unsubscribed successfully');
        } catch (err) {
          console.error('[Subscription] Cleanup error:', err);
        }
      }
    };
  }, [currentConversationId]);

  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      try {
        // In test environment, return empty array immediately
        if (window.__TEST_APP_ID__ || document.body.getAttribute('data-test-env') === 'true') {
          return [];
        }

        // Fetch conversations sequentially to avoid rate-limit bursts
        const allConversations = [];
        for (const agentName of ['cbt_therapist_lenient', 'cbt_therapist_standard', 'cbt_therapist_strict', 'cbt_therapist']) {
          const result = await base44.agents.listConversations({ agent_name: agentName }).catch(() => []);
          allConversations.push(result);
        }

        const flatConversations = allConversations.flat();
        const deletedConversations = await base44.entities.UserDeletedConversations.list();
        const deletedIds = Array.isArray(deletedConversations) ? deletedConversations.map((d) => d.agent_conversation_id) : [];
        const conversationsArray = Array.isArray(flatConversations) ? flatConversations : [];
        return conversationsArray.filter((c) => !deletedIds.includes(c.id));
      } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }
    },
    initialData: [],
    refetchOnWindowFocus: false,
    retry: false // Don't retry in test mode
  });

  const { data: currentConversationData } = useQuery({
    queryKey: ['currentConversation', currentConversationId],
    queryFn: () => currentConversationId ? base44.agents.getConversation(currentConversationId) : null,
    enabled: !!currentConversationId,
    refetchOnWindowFocus: false
  });

  // Check if we should show summary prompt (after 5+ messages, only once)
  useEffect(() => {
    if (messages.length >= 6 && messages[messages.length - 1]?.role === 'assistant' && !showSummaryPrompt && currentConversationId) {
      // Only set once per conversation
      setShowSummaryPrompt(true);
    }
  }, [currentConversationId, messages.length]);

  const startNewConversationWithIntent = async (intentParam) => {
    try {
      // Phase 5 — Fire a non-blocking memory write for the conversation the user
      // is leaving before starting a new one. Capture current id/meta/messages
      // synchronously so values are stable. Inert when flags are off or messages
      // are below the meaningful-exchange threshold.
      const leavingId = currentConversationId;
      const leavingMeta = conversations?.find((c) => c.id === leavingId)?.metadata || {};
      maybeTriggerEndWrite(leavingId, leavingMeta, messages);

      const intentMessages = {
        'daily_checkin': 'User clicked: Daily Check-in. Start daily_checkin flow.',
        'thought_work': 'User clicked: Journal a thought. Start thought_work flow.',
        'journal': 'User clicked: Thought Journal. Start thought_work flow.',
        'goal_work': 'User clicked: Set a Goal. Start goal_work flow.',
        'set_goal': 'User clicked: Set a Goal. Start goal_work flow.',
        'grounding': 'User clicked: Grounding exercise. Start grounding flow.',
        'calming_exercise': 'User clicked: Calming help. Start grounding flow.',
        'anxiety_help': 'User clicked: Anxiety help. Start grounding flow.'
      };

      const initialMessage = intentParam ? intentMessages[intentParam] || 'Hello' : undefined;

      // Get safety profile from user settings or default to 'standard'
      const user = await base44.auth.me().catch(() => null);
      const safetyProfile = user?.preferences?.safety_profile || 'standard';
      const agentName = ACTIVE_CBT_THERAPIST_WIRING.name;

      // Track agent profile usage
      if (appParams.appId) {
        base44.analytics.track({
          eventName: 'conversation_started',
          properties: {
            safety_profile: safetyProfile,
            intent: intentParam || 'none',
            agent_name: agentName
          }
        });
      }

      const conversation = await base44.agents.createConversation({
        agent_name: agentName,
        tool_configs: ACTIVE_CBT_THERAPIST_WIRING.tool_configs,
        metadata: {
          name: intentParam ? `${intentParam} session` : `Session ${conversations.length + 1}`,
          description: 'CBT Therapy Session',
          intent: intentParam,
          safety_profile: safetyProfile
        }
      });

      setCurrentConversationId(conversation.id);
      setMessages([]);
      clearLocalAudioDraft();
      lastConfirmedMessagesRef.current = []; // Reset baseline for new conversation
      setShowSidebar(false);
      setSafetyModeActive(false); // Phase 8: reset safety mode state on new session
      // Lock session language at conversation start (separate from UI locale).
      sessionLanguageRef.current = i18n.language || 'en';
      refetchConversations();

      // Always send [START_SESSION] so the agent initialises correctly on all
      // wiring paths (HYBRID and all upgrade phases).  If there is also an intent
      // message, append it to the same turn so the agent handles both together.
      setTimeout(async () => {
        setIsLoading(true);
        const sessionStartContent = await buildActionFirstDemotedSessionContentAsync(ACTIVE_CBT_THERAPIST_WIRING, base44.entities, base44);
        await base44.agents.addMessage(conversation, {
          role: 'user',
          content: initialMessage ?
          addLangDirective(sessionStartContent, sessionLanguageRef.current) + '\n\n' + initialMessage :
          addLangDirective(sessionStartContent, sessionLanguageRef.current)
        });
      }, 100);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const startNewConversation = async () => {
    return startNewConversationWithIntent(null);
  };

  const loadConversation = async (conversationId) => {
    try {
      // Phase 5 — Fire a non-blocking memory write for the conversation the user
      // is switching AWAY from before loading the new one. Capture the current
      // id/meta/messages synchronously (before any state updates) so the correct
      // values are used in the trigger call. Inert when flags are off or messages
      // are below the meaningful-exchange threshold. Deduped via
      // conversationMemoryWrittenRef to prevent double-writes if requestSummary
      // was already called for the same conversation.
      const leavingId = currentConversationId;
      const leavingMeta = conversations?.find((c) => c.id === leavingId)?.metadata || {};
      maybeTriggerEndWrite(leavingId, leavingMeta, messages);
      clearLocalAudioDraft();

      const conversation = await base44.agents.getConversation(conversationId);
      setCurrentConversationId(conversationId);

      // CRITICAL: Reset confirmed-messages baseline when switching conversations.
      // Without this reset, safeUpdateMessages rejects the new conversation's messages
      // if it has fewer messages than the previous conversation, causing replies to
      // appear invisible (never rendered) on the newly loaded conversation.
      lastConfirmedMessagesRef.current = [];

      // Lock session language for this conversation.
      // Prefer the SESSION_LANGUAGE directive embedded in the first user message.
      // Directive format (injected by addLangDirective in Chat.jsx):
      //   "[SESSION_LANGUAGE: <iso2>. Open and respond entirely in <name> ...]"
      // Fall back to the current UI locale so the governor never defaults to English
      // for a non-English session loaded from history.
      const firstUserMsg = (conversation.messages || []).find((m) => m.role === 'user' && m.content);
      const embeddedLang = firstUserMsg?.content?.match(/\[SESSION_LANGUAGE:\s*([a-zA-Z]{2})\b/)?.[1]?.toLowerCase();
      sessionLanguageRef.current = embeddedLang || i18n.language || 'en';

      // Process and sanitize messages before setting
      const sanitized = sanitizeConversationMessages(conversation.messages || []);
      safeUpdateMessages(sanitized, 'LoadConversation');
      setShowSidebar(false);
    } catch (error) {
      console.error('[Load Conversation Error]', error);
      lastConfirmedMessagesRef.current = [];
      setMessages([]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFile(file);
    e.target.value = '';
  };

  const clearLocalAudioDraft = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.abort();
      } catch (_) {}
      speechRecognitionRef.current = null;
    }
    if (audioDraftPlayerRef.current) {
      audioDraftPlayerRef.current.pause();
      audioDraftPlayerRef.current.currentTime = 0;
    }
    setAudioDraftUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return null;
    });
    setAudioDraftStatus('idle');
    setAudioDraftFile(null);
    setAudioDraftTranscript('');
    speechTranscriptRef.current = '';
    setIsTranscribingAudio(false);
    audioChunksRef.current = [];
  };

  const stopLocalRecordingStream = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onerror = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    if (!navigator?.mediaDevices?.getUserMedia || typeof window.MediaRecorder === 'undefined') {
      toast({
        title: 'Voice recording is unavailable',
        description: 'This browser or device does not support local microphone recording.',
        variant: 'destructive'
      });
      clearLocalAudioDraft();
      return;
    }

    try {
      clearLocalAudioDraft();
      stopLocalRecordingStream();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      speechTranscriptRef.current = '';
      setAudioDraftTranscript('');

      const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
      if (SpeechRecognitionCtor) {
        try {
          const speechRecognition = new SpeechRecognitionCtor();
          speechRecognition.continuous = true;
          speechRecognition.interimResults = true;
          speechRecognition.lang = i18n.language || 'en';
          speechRecognition.onresult = (event) => {
            const nextFinalSegments = [];
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const result = event.results[i];
              if (result?.isFinal && typeof result?.[0]?.transcript === 'string') {
                nextFinalSegments.push(result[0].transcript.trim());
              }
            }
            if (nextFinalSegments.length > 0) {
              const joined = [speechTranscriptRef.current, ...nextFinalSegments].filter(Boolean).join(' ').trim();
              speechTranscriptRef.current = joined;
              setAudioDraftTranscript(joined);
            }
          };
          speechRecognition.onerror = (event) => {
            console.warn('[Voice Draft] speech recognition error:', event);
          };
          speechRecognitionRef.current = speechRecognition;
          speechRecognition.start();
        } catch (speechError) {
          console.warn('[Voice Draft] speech recognition unavailable:', speechError);
          speechRecognitionRef.current = null;
        }
      }

      const androidMediaRecorderMimeCandidates = getAndroidMediaRecorderMimeCandidates();
      let requestedAndroidMimeType = null;
      let recorder = null;

      for (const mimeType of androidMediaRecorderMimeCandidates) {
        try {
          recorder = new window.MediaRecorder(stream, { mimeType });
          requestedAndroidMimeType = mimeType;
          break;
        } catch (error) {
          console.warn('[Voice Draft] MediaRecorder mime candidate rejected:', { mimeType, error });
        }
      }

      if (!recorder) {
        recorder = new window.MediaRecorder(stream);
      }
      mediaRecorderRef.current = recorder;
      setAudioDraftStatus('recording');

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error('[Voice Draft] recorder error:', event);
        stopLocalRecordingStream();
        clearLocalAudioDraft();
        toast({
          title: 'Voice recording failed',
          description: 'Recording stopped unexpectedly. Please retry and check microphone/browser permissions.',
          variant: 'destructive'
        });
      };

      recorder.onstop = () => {
        stopLocalRecordingStream();

        if (audioChunksRef.current.length === 0) {
          clearLocalAudioDraft();
          toast({
            title: 'No audio captured',
            description: 'Please record again and make sure your microphone is picking up sound.',
            variant: 'destructive'
          });
          return;
        }

        const firstChunkMimeType = audioChunksRef.current.find((chunk) =>
          typeof chunk?.type === 'string' && chunk.type.trim() !== ''
        )?.type;
        const blobType = resolveRecordedAudioMimeType({
          chunkMimeType: firstChunkMimeType,
          recorderMimeType: recorder.mimeType,
          requestedMimeType: requestedAndroidMimeType
        });
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
        const extension = blobType.includes('ogg') ? 'ogg' : blobType.includes('mp4') ? 'm4a' : 'webm';
        const file = new File([audioBlob], `voice-draft-${Date.now()}.${extension}`, { type: blobType });
        const localAudioUrl = URL.createObjectURL(audioBlob);
        setAudioDraftUrl((prevUrl) => {
          if (prevUrl) {
            URL.revokeObjectURL(prevUrl);
          }
          return localAudioUrl;
        });
        setAudioDraftFile(file);
        setAudioDraftStatus('recorded');
      };

      recorder.start();
    } catch (err) {
      console.error('[Voice Draft] start recording failed:', err);
      stopLocalRecordingStream();
      clearLocalAudioDraft();
      const denied = err?.name === 'NotAllowedError' || err?.name === 'SecurityError';
      toast({
        title: denied ? 'Microphone permission denied' : 'Microphone access failed',
        description: denied ?
        'Microphone permission is blocked. Allow microphone access in your browser/device settings and retry.' :
        'Unable to start local recording on this device. Please retry.',
        variant: 'destructive'
      });
    }
  };

  const handleStopRecording = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (error) {
        console.warn('[Voice Draft] speech recognition stop failed:', error);
      }
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('[Voice Draft] stop recording failed:', error);
        stopLocalRecordingStream();
        clearLocalAudioDraft();
        toast({
          title: 'Voice recording failed',
          description: 'Could not stop recording cleanly. Please retry.',
          variant: 'destructive'
        });
      }
    }
  };

  const handlePlayRecording = async () => {
    if (!audioDraftUrl || !audioDraftPlayerRef.current) return;
    try {
      audioDraftPlayerRef.current.currentTime = 0;
      await audioDraftPlayerRef.current.play();
    } catch (err) {
      console.error('[Voice Draft] playback failed:', err);
      toast({
        title: 'Playback failed',
        description: 'Unable to play this local voice draft.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRecording = () => {
    stopLocalRecordingStream();
    clearLocalAudioDraft();
  };

  const extractTranscriptText = (result) => {
    const getTranscriptCandidate = (value) => {
      if (typeof value !== 'string') return '';
      return value.trim() ? value : '';
    };

    const extractFromObjectShape = (value) => {
      if (!value || typeof value !== 'object') return '';

      const directCandidates = [
        value.transcript,
        value.transcription,
        value.text,
        value.output_text,
        value.content
      ];

      for (const directValue of directCandidates) {
        const candidate = getTranscriptCandidate(directValue);
        if (candidate) return candidate;
      }

      if (Array.isArray(value.output)) {
        for (const item of value.output) {
          const candidate = getTranscriptCandidate(item?.text);
          if (candidate) return candidate;
        }
      }

      return '';
    };

    if (typeof result === 'string') return getTranscriptCandidate(result);
    if (!result || typeof result !== 'object') return '';

    return (
      extractFromObjectShape(result) ||
      getTranscriptCandidate(result.data) ||
      extractFromObjectShape(result.data) ||
      ''
    );
  };

  const buildNormalizedAudioDraftForTranscriptionRetry = (file) => {
    if (!file) return null;
    const originalType = typeof file.type === 'string' ? file.type : '';
    if (!originalType) return null;

    const sanitizedType = originalType.split(';')[0].trim().toLowerCase();
    if (!sanitizedType) return null;

    let normalizedType = sanitizedType;
    if (sanitizedType.startsWith('video/')) {
      normalizedType = sanitizedType.replace(/^video\//, 'audio/');
    }

    if (normalizedType === originalType.toLowerCase()) return null;

    const baseName = typeof file.name === 'string' && file.name.trim()
      ? file.name.replace(/\.[^.]+$/, '')
      : `voice-draft-${Math.random().toString(36).slice(2, 10)}`;

    let extension = 'webm';
    if (normalizedType.includes('ogg')) {
      extension = 'ogg';
    } else if (normalizedType.includes('wav')) {
      extension = 'wav';
    } else if (normalizedType.includes('mp4')) {
      extension = 'm4a';
    }

    return new File([file], `${baseName}.${extension}`, { type: normalizedType });
  };

  const handleTranscribeRecording = async () => {
    if (!audioDraftFile || isTranscribingAudio) return;
    const localTranscript = typeof audioDraftTranscript === 'string' ? audioDraftTranscript.trim() : '';
    if (localTranscript) {
      setInputMessage((prev) => {
        if (!prev.trim()) return localTranscript;
        return `${prev}${prev.endsWith('\n') ? '' : '\n'}${localTranscript}`;
      });
      if (isAndroidRuntime()) {
        clearLocalAudioDraft();
      }
      toast({ title: 'Transcript added to composer.' });
      return;
    }

    // Early guard: 0-byte file cannot be transcribed — surface a clear error immediately.
    if (typeof audioDraftFile.size === 'number' && audioDraftFile.size === 0) {
      console.error('[Audio] Transcription blocked: audio draft is 0 bytes.', {
        name: audioDraftFile.name,
        type: audioDraftFile.type,
        ua: typeof navigator !== 'undefined' ? navigator.userAgent : '(unknown)',
      });
      toast({
        title: 'No audio captured',
        description: 'The recording is empty (0 bytes). Check microphone permissions and speak clearly before stopping.',
        variant: 'destructive',
      });
      return;
    }

    setIsTranscribingAudio(true);

    // Collect diagnostic info on mobile to enrich failure messages.
    // Fired eagerly (before upload) so the DOM canPlayType check and UA read run in parallel
    // with the conversion/upload steps. The promise is only awaited when a failure path is reached.
    const onMobile = isMobileBrowser();
    const diagInfoPromise = onMobile ? buildMobileAudioDiagnosticInfo(audioDraftFile) : Promise.resolve(null);
    let conversionError = null;

    try {
      let transcriptionSourceFile;
      try {
        transcriptionSourceFile = await convertAndroidWebmDraftToWav(audioDraftFile);
      } catch (convertErr) {
        conversionError = convertErr;
        console.error('[Audio] WebM/M4A→WAV conversion failed, falling back to original file:', convertErr);
        transcriptionSourceFile = audioDraftFile;
      }

      if (onMobile) {
        const diagInfo = await diagInfoPromise;
        console.log('[Audio] Mobile transcription diagnostic (pre-upload):', {
          original: { name: audioDraftFile.name, type: audioDraftFile.type, size: audioDraftFile.size },
          source: { name: transcriptionSourceFile.name, type: transcriptionSourceFile.type, size: transcriptionSourceFile.size },
          canPlayType: diagInfo?.canPlayType,
          conversionError: conversionError?.message ?? null,
          ua: diagInfo?.ua,
        });
      }

      let file_url = '';
      try {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: transcriptionSourceFile });
        file_url = uploadResult?.file_url;
        if (!file_url) throw new Error('Upload returned no file_url');
      } catch (uploadError) {
        console.error('[Audio] Upload failed before transcription:', uploadError);
        toast({
          title: 'Audio upload failed',
          description: 'Could not upload this voice draft. Retry or delete the draft.',
          variant: 'destructive'
        });
        return;
      }

      let result;
      const basePrompt = 'Transcribe this audio to plain text. Return only the spoken words with natural punctuation.';
      const runTranscription = async (targetFileUrl) => {
        const canRetryWithoutPrompt = (requestError) => {
          const haystack = [requestError?.message, requestError?.statusText, requestError?.data ? JSON.stringify(requestError.data) : '']
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
          return haystack.includes('prompt') && (haystack.includes('not supported') || haystack.includes('unsupported') || haystack.includes('invalid'));
        };

        const transcriptionRequests = [
        {
          prompt: basePrompt,
          file_urls: [targetFileUrl]
        },
        {
          file_urls: [targetFileUrl]
        }];

        let lastError = null;
        for (let index = 0; index < transcriptionRequests.length; index += 1) {
          const transcriptionRequest = transcriptionRequests[index];
          try {
            console.log('[Audio] Transcription request payload:', {
              file_url: targetFileUrl,
              file_name: transcriptionSourceFile.name,
              mime_type: transcriptionSourceFile.type || 'unknown',
              file_size: typeof transcriptionSourceFile.size === 'number' ? transcriptionSourceFile.size : null,
              request: transcriptionRequest
            });
            return await base44.integrations.Core.InvokeLLM(transcriptionRequest);
          } catch (requestError) {
            lastError = requestError;
            const hasFallback = index < transcriptionRequests.length - 1;
            if (!hasFallback) break;
            if (!canRetryWithoutPrompt(requestError)) break;
            console.warn('[Audio] Primary transcription payload rejected, retrying with fallback payload.', {
              message: requestError?.message,
              status: requestError?.status,
              code: requestError?.code,
              data: requestError?.data
            });
          }
        }

        throw lastError || new Error('Audio transcription request failed');
      };

      try {
        result = await runTranscription(file_url);
      } catch (transcriptionError) {
        const normalizedRetryFile = buildNormalizedAudioDraftForTranscriptionRetry(transcriptionSourceFile);
        if (normalizedRetryFile) {
          try {
            const retryUploadResult = await base44.integrations.Core.UploadFile({ file: normalizedRetryFile });
            const retryFileUrl = retryUploadResult?.file_url;
            if (!retryFileUrl) throw new Error('Retry upload returned no file_url');
            result = await runTranscription(retryFileUrl);
          } catch (retryError) {
            const diagInfo = onMobile ? await diagInfoPromise : null;
            const backendReason = extractBackendTranscriptionErrorReason(retryError) ||
              extractBackendTranscriptionErrorReason(transcriptionError);
            console.error('[Audio] Transcription retry failed:', {
              first_attempt: {
                message: transcriptionError?.message,
                status: transcriptionError?.status,
                code: transcriptionError?.code,
                data: transcriptionError?.data
              },
              retry_attempt: {
                message: retryError?.message,
                status: retryError?.status,
                code: retryError?.code,
                data: retryError?.data
              },
              ...(onMobile && { diagnostic: { ...diagInfo, conversionError: conversionError?.message ?? null, backendReason } }),
            });
            const description = onMobile
              ? buildTranscriptionFailureDescription({ diagInfo, backendReason, conversionError })
              : 'The upload succeeded, but transcription failed. Retry or delete this draft.';
            toast({
              title: 'Audio transcription failed',
              description,
              variant: 'destructive'
            });
            return;
          }
        } else {
          const diagInfo = onMobile ? await diagInfoPromise : null;
          const backendReason = extractBackendTranscriptionErrorReason(transcriptionError);
          console.error('[Audio] Transcription request failed:', {
            message: transcriptionError?.message,
            status: transcriptionError?.status,
            code: transcriptionError?.code,
            data: transcriptionError?.data,
            ...(onMobile && { diagnostic: { ...diagInfo, conversionError: conversionError?.message ?? null, backendReason } }),
          });
          const description = onMobile
            ? buildTranscriptionFailureDescription({ diagInfo, backendReason, conversionError })
            : 'The upload succeeded, but transcription failed. Retry or delete this draft.';
          toast({
            title: 'Audio transcription failed',
            description,
            variant: 'destructive'
          });
          return;
        }
      }

      const transcript = extractTranscriptText(result);
      if (!transcript) throw new Error('No transcript returned');

      setInputMessage((prev) => {
        if (!prev.trim()) return transcript;
        return `${prev}${prev.endsWith('\n') ? '' : '\n'}${transcript}`;
      });
      if (isAndroidRuntime()) {
        clearLocalAudioDraft();
      }
      toast({ title: 'Transcript added to composer.' });
    } catch (error) {
      const diagInfo = onMobile ? await diagInfoPromise : null;
      const backendReason = extractBackendTranscriptionErrorReason(error);
      console.error('[Audio] Transcription failed:', error, onMobile ? { diagnostic: diagInfo, backendReason } : {});
      const description = onMobile
        ? buildTranscriptionFailureDescription({ diagInfo, backendReason, conversionError })
        : 'No transcript text was returned. Retry or delete this draft.';
      toast({
        title: 'Audio transcription failed',
        description,
        variant: 'destructive'
      });
    } finally {
      setIsTranscribingAudio(false);
    }
  };

  const handleSendMessage = async () => {
    const hasRecordedAudioDraft = audioDraftStatus === 'recorded' && !!audioDraftFile;
    const isAndroidVoiceDraftSend =
    isAndroidRuntime() && !attachedFile && !!audioDraftFile && !!inputMessage.trim();
    const isVoiceDerivedSend = !attachedFile && !!inputMessage.trim() && (hasRecordedAudioDraft || isAndroidVoiceDraftSend);
    const attachmentToUpload = attachedFile || (!isVoiceDerivedSend ? audioDraftFile : null);
    if (!inputMessage.trim() && !attachmentToUpload) {
      console.log('[Send] ❌ Blocked - empty message');
      return;
    }

    if (isLoading) {
      console.log('[Send] ⚠️ Already loading, ignoring duplicate send');
      return;
    }

    // Increment send counter for this cycle
    instrumentationRef.current.SEND_COUNT++;
    console.log('[Send] 📤 Starting send #', instrumentationRef.current.SEND_COUNT);
    // Reset subscription-confirmed flag for this new send cycle.
    subscriptionSucceededRef.current = false;

    // Track expected message count for deterministic verification
    expectedReplyCountRef.current = messages.length + 2; // user message + assistant reply

    // Layer 1: Regex-based crisis detection (fast, explicit patterns)
    const reasonCode = detectCrisisWithReason(inputMessage);
    if (reasonCode) {
      setShowRiskPanel(true);
      setInputMessage('');
      setIsLoading(false);
      return;
    }

    // Layer 2: LLM-based crisis detection (nuanced, implicit patterns)
    try {
        const user = await base44.auth.me().catch(() => null);
        let enhancedCheck = { data: { is_crisis: false, severity: 'none', confidence: 0 } };
        try {
          enhancedCheck = await base44.functions.invoke('enhancedCrisisDetector', {
            message: inputMessage,
            language: user?.preferences?.language || 'en'
          });
      } catch (err) {
        console.warn('[Enhanced Crisis Detection] Function invoke failed:', err?.message);
      }

      if (enhancedCheck.data?.is_crisis && (
      enhancedCheck.data.severity === 'severe' || enhancedCheck.data.severity === 'high') &&
      enhancedCheck.data.confidence > 0.7) {
        setShowRiskPanel(true);
        base44.entities.CrisisAlert.create({
          surface: 'chat',
          conversation_id: currentConversationId || 'none',
          reason_code: `llm_${enhancedCheck.data.severity}`,
          user_email: user?.email || 'unknown'
        }).catch(() => {});

        // Analytics tracking for LLM-detected crisis
        if (appParams.appId) {
          base44.analytics.track({
            eventName: 'crisis_detected_llm_layer2',
            properties: {
              severity: enhancedCheck.data.severity,
              confidence: enhancedCheck.data.confidence,
              surface: 'chat'
            }
          });
        }
        return;
      }
    } catch (error) {
      console.warn('[Enhanced Crisis Detection] Failed, continuing with message:', error);
      // Non-blocking: if enhanced detection fails, continue with message send
    }

    const messageText = inputMessage;
    setInputMessage('');
    setShowSummaryPrompt(false);
    setIsLoading(true);

    // Phase 7.1 — Explicit safety layer precedence (documented and enforced):
    //   Layer 1 (regex crisis detector)  → HARD_STOP, already returned above if triggered
    //   Layer 2 (LLM crisis detector)    → HARD_STOP, already returned above if triggered
    //   Layer 3 (upgraded safety mode)   → CONSTRAIN_ONLY, V5 path only (see below)
    //   Layer 4 (post-LLM safety filter) → OUTPUT_FILTER, always active on agent output
    //
    // Layer 3 only executes here because Layers 1 and 2 did NOT trigger a hard-stop.
    // Layers 1 and 2 are authoritative — this layer is subordinate.

    // Phase 7.1 Layer 3: Per-turn safety mode supplement (V5 wiring only, flag-gated).
    // Returns null for default HYBRID wiring — no change to default behavior.
    const runtimeSupplement = buildRuntimeSafetySupplement(
      ACTIVE_CBT_THERAPIST_WIRING,
      messageText,
      i18n?.language ?? 'en'
    );
    // Phase 8: track safety mode activation for the upgraded UI indicator.
    // Once triggered, the indicator persists for the rest of the session.
    if (runtimeSupplement !== null) {
      setSafetyModeActive(true);
    }

    // CRITICAL: Add loading timeout failsafe (10s)
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    loadingTimeoutRef.current = setTimeout(() => {
      console.error('[Send] ⏱️ Loading timeout after 10s - forcing recovery');
      instrumentationRef.current.THINKING_OVER_10S++;
      setIsLoading(false);
      emitStabilitySummary();
      loadingTimeoutRef.current = null;
    }, 10000);

    try {
      let convId = currentConversationId;
      let isNewConversation = false;
      if (!convId) {
        isNewConversation = true;
        // Get safety profile from user settings or default to 'standard'
        const user = await base44.auth.me().catch(() => null);
        const safetyProfile = user?.preferences?.safety_profile || 'standard';
        const agentName = ACTIVE_CBT_THERAPIST_WIRING.name;

        const conversation = await base44.agents.createConversation({
          agent_name: agentName,
          tool_configs: ACTIVE_CBT_THERAPIST_WIRING.tool_configs,
          metadata: {
            name: `Session ${conversations?.length + 1 || 1}`,
            description: 'Therapy session',
            safety_profile: safetyProfile
          }
        });
        convId = conversation.id;
        setCurrentConversationId(convId);
        refetchConversations();
        setShowSidebar(false);
      }

      const conversation = await base44.agents.getConversation(convId);

      // MF-7: Fail-closed guard — block continuation of legacy variant-profile conversations.
      // Only block when agent_name is EXPLICITLY a known legacy variant.
      // Absent agent_name (Preview platform may not return it) is treated as the primary agent
      // to avoid incorrectly blocking all conversations in environments where the field is omitted.
      const conversationAgentName = conversation?.agent_name;
      if (conversationAgentName && LEGACY_VARIANT_PROFILES.includes(conversationAgentName)) {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
        setIsLoading(false);
        setVariantProfileBlocked(true);
        return;
      }

      console.log('[Send] 📤 Adding message to conversation:', convId);

      // When the user types their first message without clicking "Start Session",
      // prepend the [START_SESSION] block so the agent initialises on all wiring paths.
      let messageContent = runtimeSupplement ?
      runtimeSupplement + '\n\n' + messageText :
      messageText;
      if (isNewConversation) {
        const sessionStartContent = addLangDirective(
          await buildActionFirstDemotedSessionContentAsync(ACTIVE_CBT_THERAPIST_WIRING, base44.entities, base44),
          sessionLanguageRef.current
        );
        messageContent = sessionStartContent + '\n\n' + messageContent;
      }

      // Upload file attachment if present
      let attachmentMeta = undefined;
      let pdfAttachmentMetadata = {};
      let usedAudioDraftAttachment = false;
      if (attachmentToUpload) {
        setIsUploadingFile(true);
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: attachmentToUpload });
          const type = attachmentToUpload === audioDraftFile ? 'audio' : resolveAttachmentType(attachmentToUpload.name);
          attachmentMeta = { type, url: file_url, name: attachmentToUpload.name };
          usedAudioDraftAttachment = attachmentToUpload === audioDraftFile;

          if (type === 'pdf') {
            try {
              const extractionResult = await base44.functions.invoke('extractPdfText', {
                file_url,
                file_name: attachmentToUpload.name
              });
              const extractionData = extractionResult?.data || extractionResult || {};
              if (typeof extractionData.text === 'string' && extractionData.text.trim()) {
                pdfAttachmentMetadata.pdf_extracted_text = extractionData.text;
              }
              if (Number.isFinite(extractionData.page_count) && extractionData.page_count > 0) {
                pdfAttachmentMetadata.pdf_page_count = extractionData.page_count;
              }
            } catch (err) {
              console.warn('[Upload] PDF text extraction failed:', err?.message || err);
            }
          }
        } catch (err) {
          console.error('[Upload] File upload failed:', err);
          toast({
            title: 'File upload failed',
            description: 'Attachment upload failed. You can retry sending or remove the file.',
            variant: 'destructive'
          });
        } finally {
          setIsUploadingFile(false);
          setAttachedFile(null);
        }
      }

      // Stage 4 voice send contract:
      // If no regular file is attached, persist the recorded audio draft as the
      // user attachment while keeping the edited transcript as message text.
      let shouldClearAudioDraftAfterSend = false;
      if (!isVoiceDerivedSend && !attachmentMeta && audioDraftStatus === 'recorded' && audioDraftFile) {
        setIsUploadingFile(true);
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: audioDraftFile });
          if (file_url) {
            attachmentMeta = {
              type: 'audio',
              url: file_url,
              name: audioDraftFile.name,
              size: typeof audioDraftFile.size === 'number' ? audioDraftFile.size : undefined
            };
            shouldClearAudioDraftAfterSend = true;
          }
        } catch (err) {
          console.error('[Upload] Audio draft upload failed:', err);
          toast({
            title: 'Audio upload failed',
            description: 'Voice draft upload failed. You can retry sending or delete the recording.',
            variant: 'destructive'
          });
        } finally {
          setIsUploadingFile(false);
        }
      }

      // Runtime-safe attachment contract for addMessage:
      // - AI delivery fields go in [ATTACHMENT_CONTEXT] within content.
      // - Round-trip recovery stays in [ATTACHMENT_METADATA] marker.
      // - Do not send custom metadata fields (runtime 422s on attachment metadata).
      const attachmentContextBlock = attachmentMeta ? (() => {
        const lines = [
        '[ATTACHMENT_CONTEXT]',
        `type: ${attachmentMeta.type}`,
        `url: ${attachmentMeta.url}`];
        if (attachmentMeta.name) lines.push(`name: ${attachmentMeta.name}`);
        if (typeof pdfAttachmentMetadata.pdf_page_count === 'number') {
          lines.push(`pdf_page_count: ${pdfAttachmentMetadata.pdf_page_count}`);
        }
        if (typeof pdfAttachmentMetadata.pdf_extracted_text === 'string' && pdfAttachmentMetadata.pdf_extracted_text.trim()) {
          lines.push(`pdf_extracted_text: ${pdfAttachmentMetadata.pdf_extracted_text.replace(/\s+/g, ' ').trim()}`);
        }
        return '\n' + lines.join('\n');
      })() : '';
      const marker = attachmentMeta ? '\n' + serializeAttachmentMetadataMarker(attachmentMeta) : '';
      const finalContent = messageContent + attachmentContextBlock + marker;

      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: finalContent,
        ...(attachmentMeta ? {
          file_urls: [attachmentMeta.url]
        } : {})
      });
      if (isVoiceDerivedSend) {
        clearLocalAudioDraft();
      }
      if (usedAudioDraftAttachment) {
        clearLocalAudioDraft();
      }

      if (shouldClearAudioDraftAfterSend) {
        clearLocalAudioDraft();
      }

      console.log('[Send] ✅ Message sent - starting authoritative polling');

      // CRITICAL: Start authoritative polling with exponential backoff
      // This ensures we get the reply even if subscription fails
      let pollAttempts = 0;
      const maxPollAttempts = 5;
      const pollDelays = [500, 1000, 2000, 4000, 8000]; // Exponential backoff

      const pollWithBackoff = (attemptIndex) => {
        const delay = pollDelays[Math.min(attemptIndex, pollDelays.length - 1)];

        pollingIntervalRef.current = setTimeout(async () => {
          pollAttempts++;
          console.log(`[Polling] Attempt ${pollAttempts}/${maxPollAttempts} (delay: ${delay}ms, hidden: ${document.hidden})`);

          try {
            const updatedConv = await base44.agents.getConversation(convId);
            const sanitized = sanitizeConversationMessages(updatedConv.messages || []);

            console.log(`[Polling] Retrieved ${sanitized.length} messages, expected ${expectedReplyCountRef.current}`);

            // Check if we have the expected reply
            if (sanitized.length >= expectedReplyCountRef.current) {
              console.log('[Polling] ✅ Reply found - stopping polling');

              // CRITICAL: Safe update with validation
              // Skip overwrite if subscription already confirmed content — polling
              // snapshot can be shorter than the streamed response and must not win.
              const updated = subscriptionSucceededRef.current ?
              false :
              safeUpdateMessages(sanitized, 'Polling');
              if (subscriptionSucceededRef.current) {
                console.log('[Polling] ⏭️ Skipping overwrite — subscription already confirmed content');
              }

              // emitStabilitySummary is intentionally inside `if (updated)`: it
              // reports a SUCCESSFUL message delivery cycle and should only fire
              // when the state was actually updated (i.e., new content reached the
              // UI).  If the update was rejected (safeUpdateMessages returned false),
              // there is nothing meaningful to report for this cycle.
              if (updated) {
                emitStabilitySummary();
              }

              // Phase 2 fix: always clear loading when polling confirms enough messages
              // exist, even if safeUpdateMessages rejected the update (e.g. because a
              // JSON-shaped agent reply was blocked by the hard render gate and the
              // refetch already advanced lastConfirmedMessagesRef).  Without this guard
              // the loading timeout is cleared below while isLoading stays true, causing
              // a perpetual stall until the 60-second subscription timeout fires.
              //
              // setIsLoading(false) is intentionally OUTSIDE `if (updated)`: clearing
              // the loading spinner is a UX concern, not a data-integrity concern.
              // The server has confirmed enough messages exist — the user's message was
              // received and the agent responded.  We must unblock the input regardless
              // of whether the reply could be rendered (it may be retried or shown later).
              setIsLoading(false);

              if (pollingIntervalRef.current) {
                clearTimeout(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
                loadingTimeoutRef.current = null;
              }
            } else if (pollAttempts >= maxPollAttempts) {
              console.error('[Polling] ⏱️ Timeout - no reply after max attempts');
              instrumentationRef.current.STUCK_THINKING_TIMEOUTS++;

              // CRITICAL: Safe update with validation
              safeUpdateMessages(sanitized, 'Polling-Timeout');
              setIsLoading(false);
              emitStabilitySummary();

              if (pollingIntervalRef.current) {
                clearTimeout(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
                loadingTimeoutRef.current = null;
              }
            } else {
              // Continue polling with next backoff delay
              pollWithBackoff(pollAttempts);
            }
          } catch (err) {
            console.error('[Polling] ❌ Error:', err);
            if (pollAttempts >= maxPollAttempts) {
              instrumentationRef.current.THINKING_OVER_10S++;
              setIsLoading(false);
              emitStabilitySummary();
              if (pollingIntervalRef.current) {
                clearTimeout(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
            } else {
              // Retry with next backoff delay
              pollWithBackoff(pollAttempts);
            }
          }
        }, delay);
      };

      pollWithBackoff(0);
    } catch (error) {
      console.error('[Send] ❌ SEND ERROR:', error);
      // Force recovery on send error
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setIsLoading(false);
      subscriptionActiveRef.current = false;

      // Emit summary even on error path
      emitStabilitySummary();

      if (isAuthError(error) && shouldShowAuthError()) {
        setShowAuthError(true);
      } else {
        toast({
          title: 'Message send failed',
          description: 'Please retry sending your message.',
          variant: 'destructive'
        });
      }
    }
  };

  // Phase 5 — Conversation-switch memory write trigger.
  // Fires triggerConversationEndSummarization for `convId` if:
  //   (a) convId is a non-empty string,
  //   (b) messages had at least CONVERSATION_MIN_MESSAGES_FOR_MEMORY entries
  //       (ensures a real exchange happened before the session ended),
  //   (c) convId has NOT already been written (dedup via conversationMemoryWrittenRef).
  // The call is non-blocking and fail-closed (errors are caught inside
  // triggerConversationEndSummarization). Inert when flags are off.
  const maybeTriggerEndWrite = (convId, convMeta, msgList) => {
    if (!convId) return;
    if (!Array.isArray(msgList) || msgList.length < CONVERSATION_MIN_MESSAGES_FOR_MEMORY) return;
    if (conversationMemoryWrittenRef.current.has(convId)) return;
    conversationMemoryWrittenRef.current.add(convId);
    triggerConversationEndSummarization(convId, convMeta || {}, 'chat_conversation_switch', base44.entities);
  };

  const requestSummary = async () => {
    if (!currentConversationId) return;

    const conversation = await base44.agents.getConversation(currentConversationId);
    setIsLoading(true);
    setShowSummaryPrompt(false);

    // Phase 4 — Trigger non-blocking conversation-end memory write for V7
    // continuity. Gated by isSummarizationEnabled(); inert in default mode.
    // The metadata lookup uses the in-memory conversations list to avoid an
    // extra network round-trip; falls back to empty metadata when unavailable.
    const convForMemory = conversations?.find((c) => c.id === currentConversationId);
    // Phase 5 — Mark as written before calling so that any concurrent
    // conversation-switch trigger (maybeTriggerEndWrite) de-dupes against it.
    conversationMemoryWrittenRef.current.add(currentConversationId);
    triggerConversationEndSummarization(
      currentConversationId,
      convForMemory?.metadata || {},
      'chat_request_summary',
      base44.entities
    );

    // Build a language-aware summary request
    const userLang = i18n.language || 'en';
    const summaryPromptByLang = {
      he: 'אנא ספק סיכום מפגש מקיף הכולל: (1) נקודות דיון מרכזיות, (2) תובנות ניתנות לפעולה, (3) צעדים הבאים מומלצים או תרגילים. אנא כתוב את הסיכום בעברית בצורה מובנית וברורה.',
      es: 'Por favor proporciona un resumen completo de la sesión que incluya: (1) puntos clave discutidos, (2) perspectivas accionables, (3) próximos pasos recomendados o ejercicios. Escribe el resumen en español de forma estructurada y clara.',
      fr: 'Veuillez fournir un résumé complet de la séance comprenant: (1) les points clés discutés, (2) des insights actionnables, (3) les prochaines étapes recommandées ou exercices. Rédigez le résumé en français de manière structurée et claire.',
      de: 'Bitte gib eine umfassende Sitzungszusammenfassung, die enthält: (1) besprochene Hauptpunkte, (2) umsetzbare Erkenntnisse, (3) empfohlene nächste Schritte oder Übungen. Schreibe die Zusammenfassung auf Deutsch in strukturierter und klarer Form.',
      it: 'Per favore fornisci un riassunto completo della sessione che includa: (1) punti chiave discussi, (2) intuizioni attuabili, (3) prossimi passi consigliati o esercizi. Scrivi il riassunto in italiano in modo strutturato e chiaro.',
      pt: 'Por favor forneça um resumo abrangente da sessão incluindo: (1) pontos-chave discutidos, (2) insights acionáveis, (3) próximos passos recomendados ou exercícios. Escreva o resumo em português de forma estruturada e clara.',
      en: 'Please provide a comprehensive session summary including: (1) key discussion points, (2) actionable insights, (3) recommended next steps or exercises. Write the summary in English in a structured and easy-to-understand format.'
    };
    const summaryPrompt = summaryPromptByLang[userLang] || summaryPromptByLang['en'];

    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: summaryPrompt
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId) => {
      const conversation = conversations.find((c) => c.id === conversationId);
      await base44.entities.UserDeletedConversations.create({
        agent_conversation_id: conversationId,
        conversation_title: conversation?.metadata?.name || 'Deleted Session'
      });
      return conversationId;
    },
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      const previousConversations = queryClient.getQueryData(['conversations']);
      const previousConversationId = currentConversationId;
      const previousMessages = messages;
      queryClient.setQueryData(['conversations'], (old = []) => old.filter((conversation) => conversation.id !== conversationId));
      if (currentConversationId === conversationId) {
        setAttachedFile(null);
        clearLocalAudioDraft();
        setCurrentConversationId(null);
        setMessages([]);
        lastConfirmedMessagesRef.current = []; // Reset baseline when deleting active conversation
      }
      return { previousConversations, previousConversationId, previousMessages };
    },
    onSuccess: () => {
      refetchConversations();
    },
    onError: (error, _conversationId, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(['conversations'], context.previousConversations);
      }
      if (context?.previousConversationId) {
        setCurrentConversationId(context.previousConversationId);
        setMessages(context.previousMessages || []);
      }
      console.error('Delete error:', error);
      toast({ title: t('chat.delete_error', 'Failed to delete session'), description: t('chat.delete_error_desc', 'Please try again.'), variant: 'destructive' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const handleDeleteConversation = (conversationId) => {
    setPendingDeleteId(conversationId);
  };

  const handleBulkDeleteConversations = async (ids) => {
    if (!ids?.length) return;

    queryClient.setQueryData(['conversations'], (old = []) =>
      old.filter((c) => !ids.includes(c.id))
    );

    if (ids.includes(currentConversationId)) {
      setAttachedFile(null);
      clearLocalAudioDraft();
      setCurrentConversationId(null);
      setMessages([]);
      lastConfirmedMessagesRef.current = [];
    }

    await Promise.all(
      ids.map((id) =>
        base44.entities.UserDeletedConversations.create({
          agent_conversation_id: id,
          conversation_title: conversations.find((c) => c.id === id)?.metadata?.name || 'Deleted Session'
        }).catch(() => {})
      )
    );
    refetchConversations();
  };
  const handleCheckInComplete = async (checkinData) => {
    if (!currentConversationId) return;

    const conversation = await base44.agents.getConversation(currentConversationId);
    setIsLoading(true);

    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: "I've completed my Daily Check-in.",
      metadata: { checkin_data: checkinData }
    });

    // Invalidate queries to update Home page
    queryClient.invalidateQueries({ queryKey: ['todayMood'] });
    queryClient.invalidateQueries({ queryKey: ['todayFlow'] });

    setShowCheckInModal(false);
  };

  const [isPageReady, setIsPageReady] = useState(false);

  useEffect(() => {
    // Signal page is ready for E2E tests
    document.body.setAttribute('data-page-ready', 'true');
    setIsPageReady(true);

    // Expose report function globally for testing
    window.printChatStabilityReport = printFinalStabilityReport;

    // Detect test environment (Playwright, Cypress, etc.)
    const isTestEnv =
    window.location.search.includes('e2e-test') ||
    document.body.getAttribute('data-test-env') === 'true' ||
    window.navigator.webdriver === true ||
    window.Cypress !== undefined ||
    window.playwright !== undefined ||
    /HeadlessChrome/.test(window.navigator.userAgent);

    if (isTestEnv) {
      localStorage.setItem('chat_consent_accepted', 'true');
      localStorage.setItem('age_verified', 'true');
      // Disable analytics in test environment
      window.__DISABLE_ANALYTICS__ = true;
      return;
    }

    // Check age verification first
    const ageVerified = localStorage.getItem('age_verified');
    if (ageVerified === 'false') {
      setIsAgeRestricted(true);
      return;
    }
    if (!ageVerified) {
      setShowAgeGate(true);
      return;
    }

    // Check if user has already accepted consent
    const consentAccepted = localStorage.getItem('chat_consent_accepted');
    if (!consentAccepted) {
      setShowConsentBanner(true);
    }

    // Run retention cleanup on app start (non-blocking)
    (async () => {
      if (!appParams.appId) return;
      try {
        const lastCleanup = localStorage.getItem('last_retention_cleanup');
        const now = Date.now();
        const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours

        if (!lastCleanup || now - parseInt(lastCleanup) > cleanupInterval) {
          await base44.functions.invoke('retentionCleanup', {});
          localStorage.setItem('last_retention_cleanup', now.toString());
        }
      } catch (error) {
        console.error('Retention cleanup failed:', error);
        // Non-blocking: log but don't interrupt user
      }
    })();
  }, []);

  const handleConsentAccept = () => {
    localStorage.setItem('chat_consent_accepted', 'true');
    setShowConsentBanner(false);
  };

  const handleAgeConfirm = () => {
    localStorage.setItem('age_verified', 'true');
    setShowAgeGate(false);
  };

  const handleAgeDecline = () => {
    localStorage.setItem('age_verified', 'false');
    setShowAgeGate(false);
    setIsAgeRestricted(true);
  };

  // Show age restriction message if user is under 18
  if (isAgeRestricted) {
    return <AgeRestrictedMessage />;
  }

  return (
    <>
      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => {if (!open) setPendingDeleteId(null);}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Trash2 className="w-5 h-5 text-destructive" />{t('chat.delete_session_title', 'Delete this session?')}</AlertDialogTitle>
            <AlertDialogDescription>{t('chat.delete_session_desc', 'This action cannot be undone.')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => {if (pendingDeleteId) deleteConversationMutation.mutate(pendingDeleteId);setPendingDeleteId(null);}}>{t('common.delete', 'Delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {showAuthError && <AuthErrorBanner onDismiss={() => setShowAuthError(false)} />}
      {/* Chat root: explicit dvh-based height so the flex-1/min-h-0 scroll chain works.
                                                `h-full` would resolve to `auto` because the parent motion.div uses min-h-full
                                                (not a fixed height), breaking the inner overflow-y-auto messages scroll. */}
      <div className="bg-teal-100 rounded-2xl flex relative"

      data-testid="chat-root"
      data-page-ready={isPageReady}
      style={{
        height: `calc(100dvh - ${MOBILE_HEADER_HEIGHT}px - ${BOTTOM_NAV_HEIGHT}px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))`
      }}>

        {/* On tablet/desktop (≥768px) there is no fixed mobile header or bottom nav,
                                                  so we only subtract the safe-area insets (mirrors AppContent.jsx logic). */}
        <style>{`
          @media (min-width: 768px) {
            [data-testid="chat-root"] {
              height: calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) !important;
            }
          }
        `}</style>
      {/* Backdrop overlay when sidebar is open - below input area */}
      {showSidebar && currentConversationId &&
        <div
          className="fixed inset-0 bg-[hsl(var(--overlay)/0.18)] backdrop-blur-sm z-30"
          onClick={() => setShowSidebar(false)}
          style={{ zIndex: 30 }} />

        }

      {/* Sidebar - Conversations List */}
      <div className={`
        ${showSidebar ? 'block' : 'hidden md:block'} 
        fixed md:relative inset-0 md:inset-auto w-full sm:w-80 
        border-r border-border/70 bg-[hsl(var(--sidebar-background)/0.9)] backdrop-blur-2xl shadow-[var(--shadow-lg)] md:shadow-none z-40
      `}>
        <ErrorBoundary>
          <ConversationsList
              conversations={Array.isArray(conversations) ? conversations : []}
              currentConversationId={currentConversationId}
              onSelectConversation={loadConversation}
              onNewConversation={startNewConversation}
              onDeleteConversation={handleDeleteConversation}
              onBulkDeleteConversations={handleBulkDeleteConversations}
              onClose={() => setShowSidebar(false)} />

        </ErrorBoundary>
      </div>

      {/* Main Chat Area */}
      <div className="rounded-2xl flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-teal-50 px-4 py-1 rounded-2xl md:px-6 flex items-center gap-3 border-b border-border/70 backdrop-blur-xl">
          <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              aria-label={t('chat.go_back_aria')} className="text-teal-600 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-none hover:bg-secondary/78 hover:text-foreground active:bg-secondary/88 h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0">

            <ArrowLeft className="w-5 h-5 rtl:scale-x-[-1]" />
          </Button>
          <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
              aria-label={showSidebar ? t('chat.close_sidebar_aria') : t('chat.open_sidebar_aria')} className="text-teal-600 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-none hover:bg-secondary/78 hover:text-foreground active:bg-secondary/88 h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0">

            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-teal-600 text-xl font-semibold">{t('chat.title')}</h1>
            <p className="text-teal-600 text-sm">{t('chat.subtitle')}</p>
          </div>
        </div>

        {/* Risk Panel — rendered outside conversation gate so it shows even before a conversation is created */}
        {showRiskPanel && !currentConversationId &&
          <div className="px-4 md:px-6 pt-3">
            <InlineRiskPanel onDismiss={() => setShowRiskPanel(false)} />
          </div>
          }

        {/* Messages Area */}
        <div className="bg-teal-400 text-slate-50 my-1 px-1 py-1 rounded-3xl flex-1 min-h-0 overflow-hidden flex flex-col" style={{ backgroundColor: 'transparent' }}>
          {!currentConversationId ?
            <div className="my-8 h-full overflow-y-auto">
              {/* Welcome Section - Separate container */}
              <div className="bg-teal-100 p-4 flex-1 flex items-center justify-center md:p-6">
                <Card className="bg-teal-50 text-teal-600 p-8 text-center rounded-2xl backdrop-blur-[10px] max-w-md border border-border/80 shadow-[var(--shadow-lg)]">
                  <div className="bg-teal-600 text-primary mr-20 ml-24 rounded-[40px] w-16 h-16 flex items-center justify-center shadow-[var(--shadow-sm)]">
                    <span className="mx-1 my-1 text-4xl">👋</span>
                  </div>
                  <h2 className="text-teal-600 mb-2 text-2xl font-semibold">
                    {t('chat.welcome.title', 'Welcome to Therapy')}
                  </h2>
                  <p className="text-teal-600 mb-6">
                    {t('chat.welcome.message', "This is a safe, judgment-free space. Share what's on your mind, and let's work through it together.")}
                  </p>
                  <Button
                    onClick={startNewConversation} className="bg-teal-600 text-primary-foreground px-6 py-6 text-lg font-medium tracking-[0.005em] rounded-2xl inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[var(--shadow-md)] hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-9 min-h-[44px] md:min-h-0">


                    {t('chat.welcome.start_session', 'Start Your First Session')}
                  </Button>
                </Card>
              </div>

              {/* Insight Cards Section - Separate container with border */}
              <div className="bg-teal-100 p-4 md:p-6 border-t border-border/70">
                <div className="max-w-2xl mx-auto">
                  <ErrorBoundary>
                    <ProactiveCheckIn onSendMessage={async (prompt) => {
                      await startNewConversation();
                      setTimeout(() => {
                        setInputMessage(prompt);
                      }, 500);
                    }} />
                  </ErrorBoundary>
                </div>
              </div>
            </div> :

            <div data-testid="chat-messages" ref={messagesContainerRef} onScroll={handleMessagesScroll} className="my-5 flex-1 min-h-0 overflow-y-auto" style={{ backgroundColor: 'transparent', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
              {/* Therapy State Machine */}
              {showTherapyFlow && messages.length === 0 &&
              <div className="p-4 md:p-6" style={{ background: 'transparent' }}>
                  <TherapyStateMachine onComplete={() => setShowTherapyFlow(false)} />
                </div>
              }

              {/* Insight Cards - Show if no flow active */}
              {messages.length === 0 && !showTherapyFlow &&
              <div className="bg-teal-50 p-4 md:p-6 border-b border-border/70">
                  <div className="max-w-3xl mx-auto">
                    <ErrorBoundary>
                      <ProactiveCheckIn onSendMessage={(prompt) => setInputMessage(prompt)} />
                    </ErrorBoundary>
                  </div>
                </div>
              }

              {/* Active Chat Messages */}
              <div className="bg-teal-50 pb-8 p-4 md:p-6 space-y-6">
                {/* Inline Consent Banner - Non-blocking, dismissible */}
                {showConsentBanner &&
                <InlineConsentBanner onAccept={handleConsentAccept} />
                }
                {/* Inline Risk Panel - Non-blocking, shown when crisis language detected */}
                {showRiskPanel &&
                <InlineRiskPanel onDismiss={() => setShowRiskPanel(false)} />
                }
                {/* Profile-specific periodic disclaimer */}
                <ProfileSpecificDisclaimer messageCount={messages.length} />
                {/* Phase 8 — Upgraded-path UI indicators (flag-gated, hidden in default mode).
                             SafetyModeIndicator is SUBORDINATE to InlineRiskPanel/CrisisSafetyPanel.
                             Neither component renders when the upgrade flags are off. */}
                <ErrorBoundary>
                  <SafetyModeIndicator
                    wiring={ACTIVE_CBT_THERAPIST_WIRING}
                    isActive={safetyModeActive} />
                  
                </ErrorBoundary>
                <ErrorBoundary>
                  <SessionPhaseIndicator
                    wiring={ACTIVE_CBT_THERAPIST_WIRING}
                    hasActiveSession={!!currentConversationId} />
                  
                </ErrorBoundary>
                {/* Phase 3 Deep Personalization — Session continuity cue (flag-gated) */}
                <ErrorBoundary>
                  <SessionContinuityCue
                    wiring={ACTIVE_CBT_THERAPIST_WIRING}
                    hasActiveSession={!!currentConversationId}
                    messageCount={messages.length} />
                  
                </ErrorBoundary>
                {messages.length > visibleCount &&
                <div className="text-center py-2">
                    <button
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 30, messages.length))}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1 rounded-full border border-border/50">
                      Load earlier messages
                    </button>
                  </div>
                }
                <MessageList
                  messages={messages}
                  visibleCount={visibleCount}
                  conversationId={currentConversationId}
                  sessionLanguage={sessionLanguageRef.current}
                />
                {isLoading && messages.length > 0 && (() => {
                  instrumentationRef.current.PLACEHOLDER_RENDERED++;
                  return (
                    <div
                      data-testid="chat-loading"
                      ref={thinkingPlaceholderRef}
                      className="flex gap-3"
                      style={{
                        minHeight: '60px',
                        transition: 'opacity 0.2s ease-in-out'
                      }}>

                      <div className="h-7 w-7 flex items-center justify-center flex-shrink-0 rounded-[var(--radius-nested)] bg-secondary">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                      <div className="rounded-2xl px-4 py-3 flex-1 bg-card border border-border/80" style={{
                        minHeight: '48px',
                        maxHeight: '120px',
                        transition: 'none',
                        willChange: 'auto'
                      }}>
                        <p className="text-sm text-muted-foreground">{t('chat.thinking')}</p>
                      </div>
                    </div>);

                })()}
                <div ref={messagesEndRef} />
              </div>

              {/* Save Prompt - After homework commitment */}
              {showSavePrompt && !isLoading && savePromptData &&
              <div className="p-4 md:p-6 border-t border-border/70 bg-secondary/35">
                  <div className="max-w-3xl mx-auto">
                    <ThoughtWorkSaveHandler
                    conversationId={savePromptData.conversationId}
                    conversationMessages={savePromptData.messages}
                    onSaveComplete={() => {
                      setShowSavePrompt(false);
                      setSavePromptData(null);
                    }}
                    onCancel={() => {
                      setShowSavePrompt(false);
                      setSavePromptData(null);
                    }} />

                  </div>
                </div>
              }

              {/* Summary Prompt Section - Separate container with border */}
              {showSummaryPrompt && !isLoading &&
              <div className="bg-teal-50 p-4 md:p-6 border-t border-border/70">
                  <div className="max-w-3xl mx-auto">
                    <Card className="p-4 border border-border/80 bg-card shadow-[var(--shadow-md)]">
                      <div className="flex items-start gap-3">
                        <div className="bg-teal-600 text-primary rounded-[var(--radius-control)] w-10 h-10 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="text-slate-50 lucide lucide-sparkles w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-teal-600 mb-1 text-sm font-medium">
                            {t('chat.summary_prompt.title')}
                          </p>
                          <p className="text-teal-600 mb-3 text-xs">
                            {t('chat.summary_prompt.description')}
                          </p>
                          <div className="flex gap-2">
                            <Button
                            onClick={requestSummary}
                            size="sm" className="bg-teal-600 text-primary-foreground px-3 text-xs font-medium tracking-[0.005em] rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[var(--shadow-md)] hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-8 min-h-[44px] md:min-h-0">

                              {t('chat.summary_prompt.yes')}
                            </Button>
                            <Button
                            onClick={() => setShowSummaryPrompt(false)}
                            size="sm"
                            variant="outline" className="bg-teal-600 text-slate-50 px-3 text-xs font-medium tracking-[0.005em] rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-8 min-h-[44px] md:min-h-0">

                              {t('chat.summary_prompt.not_now')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              }
            </div>
            }
        </div>

        {/* Session Summary Display */}
        {currentConversationData?.session_summary &&
          <div className="border-t border-border/70 bg-card/85 backdrop-blur-xl">
            <SessionSummary conversation={currentConversationData} />
          </div>
          }

        {/* Input Area - Always visible, always on top */}
        <div className="bg-teal-50 text-teal-600 pr-4 pl-2 rounded-2xl md:px-6 md:pt-3 md:pb-3 relative border-t border-border/70 backdrop-blur-xl shadow-[var(--shadow-md)]" style={{
            zIndex: 50
          }}>
          <div className="text-teal-600 mx-auto max-w-4xl flex gap-2">
            {variantProfileBlocked ?
              <div className="flex-1 flex flex-col gap-3">
                <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                  {t('chat.variant_blocked.message', 'This past conversation can no longer be continued. You can still read it here.')}
                </div>
                <Button
                  onClick={startNewConversation}
                  className="bg-teal-600 text-primary-foreground font-medium rounded-[var(--radius-card)] border border-transparent transition-all duration-200 shadow-[var(--shadow-md)] hover:bg-primary/92 min-h-[44px] md:min-h-0 h-[48px] w-full">
                  {t('chat.variant_blocked.start_new', 'Start a new conversation')}
                </Button>
              </div> :

              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt,.csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="flex flex-col flex-1 gap-1">
                  {attachedFile && (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-700">
                      <Paperclip className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate max-w-[160px]">{attachedFile.name}</span>
                      <button onClick={() => setAttachedFile(null)} className="ml-auto text-teal-500 hover:text-teal-700 flex-shrink-0">✕</button>
                    </div>
                  )}
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('chat.message_placeholder')} className="bg-[hsl(var(--surface-nested)/0.9)] text-foreground px-3 font-normal tracking-[0.001em] leading-6 rounded-[var(--radius-card)] flex w-full border border-input/90 shadow-[var(--shadow-sm)] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[48px] max-h-[160px] resize-none"
                    data-testid="therapist-chat-input"
                    disabled={isLoading || isUploadingFile} />
                  <div className="flex items-center flex-wrap gap-2 px-1 py-1">
                    {audioDraftStatus === 'idle' &&
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleStartRecording}
                          disabled={isLoading || isUploadingFile || isTranscribingAudio}
                          aria-label="Record voice draft"
                          className="text-teal-700 hover:bg-teal-100 min-h-[44px] min-w-[44px] px-3">
                        <Mic className="w-4 h-4 mr-1" />
                        Record
                      </Button>
                    }
                    {audioDraftStatus === 'recording' &&
                      <>
                        <span className="inline-flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          Recording
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleStopRecording}
                          aria-label="Stop recording"
                          className="text-red-700 hover:bg-red-100 min-h-[44px] min-w-[44px] px-3">
                          <Square className="w-4 h-4 mr-1" />
                          Stop
                        </Button>
                      </>
                    }
                    {audioDraftStatus === 'recorded' && audioDraftUrl &&
                      <>
                        <span className="inline-flex items-center gap-1 text-xs text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded-full">
                          Voice draft ready
                        </span>
                        <audio ref={audioDraftPlayerRef} src={audioDraftUrl} className="hidden" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handlePlayRecording}
                          disabled={isLoading || isUploadingFile || isTranscribingAudio}
                          aria-label="Play recording"
                          className="text-teal-700 hover:bg-teal-100 min-h-[44px] min-w-[44px] px-3">
                          <Play className="w-4 h-4 mr-1" />
                          Play
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleTranscribeRecording}
                          disabled={isLoading || isUploadingFile || isTranscribingAudio}
                          aria-label="Transcribe recording"
                          className="text-teal-700 hover:bg-teal-100 min-h-[44px] min-w-[44px] px-3">
                          {isTranscribingAudio ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                          {isTranscribingAudio ? 'Transcribing...' : 'Transcribe'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleDeleteRecording}
                          disabled={isLoading || isUploadingFile || isTranscribingAudio}
                          aria-label="Delete recording"
                          className="text-red-700 hover:bg-red-100 min-h-[44px] min-w-[44px] px-3">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    }
                  </div>
                </div>

                <div className="flex flex-col gap-1 flex-shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploadingFile || isTranscribingAudio}
                    aria-label="Attach file"
                    className="text-teal-600 h-[48px] w-[48px] min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 hover:bg-teal-50">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={(!inputMessage.trim() && !attachedFile) || isLoading || isUploadingFile || isTranscribingAudio}
                    data-testid="therapist-chat-send" className="bg-teal-600 text-primary-foreground px-4 py-2 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-card)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[var(--shadow-md)] hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 min-h-[44px] md:min-h-0 h-[48px] flex-shrink-0">
                    {isUploadingFile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>
              </>
              }
          </div>
          {/* Compact disclaimer */}
          <p className="text-center mt-1 text-xs text-muted-foreground">
            {t('chat.disclaimer.title')} — {t('chat.disclaimer.message')}
          </p>
        </div>

      {/* Enhanced Check-in Modal - highest z-index when active */}
      {showCheckInModal &&
          <div style={{ zIndex: 100 }}>
          <EnhancedMoodCheckIn
              onClose={() => setShowCheckInModal(false)}
              onComplete={handleCheckInComplete} />

        </div>
          }

      {/* Age Gate Modal - appears before consent */}
      {showAgeGate &&
          <AgeGateModal onConfirm={handleAgeConfirm} onDecline={handleAgeDecline} />
          }
      </div>
      </div>
    </>);

}
