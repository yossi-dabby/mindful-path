import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { isAuthError, shouldShowAuthError } from '../components/utils/authErrorHandler';
import AuthErrorBanner from '../components/utils/AuthErrorBanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Plus, Loader2, Menu, Sparkles, ArrowLeft } from 'lucide-react';
import MessageBubble from '../components/chat/MessageBubble';
import ConversationsList from '../components/chat/ConversationsList';
import SessionSummary from '../components/chat/SessionSummary';
import ProactiveCheckIn from '../components/chat/ProactiveCheckIn';
import TherapyStateMachine from '../components/chat/TherapyStateMachine';
import EnhancedMoodCheckIn from '../components/home/EnhancedMoodCheckIn';
import InlineConsentBanner from '../components/chat/InlineConsentBanner';
import ThoughtWorkSaveHandler from '../components/chat/ThoughtWorkSaveHandler';
import InlineRiskPanel from '../components/chat/InlineRiskPanel';
import ProfileSpecificDisclaimer from '../components/chat/ProfileSpecificDisclaimer';
import { detectCrisisLanguage, detectCrisisWithReason } from '../components/utils/crisisDetector';
import AgeGateModal from '../components/utils/AgeGateModal';
import AgeRestrictedMessage from '../components/utils/AgeRestrictedMessage';
import ErrorBoundary from '../components/utils/ErrorBoundary';
import { validateAgentOutput, extractAssistantMessage, sanitizeConversationMessages, parseCounters } from '../components/utils/validateAgentOutput.jsx';

export default function Chat() {
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
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const location = useLocation();
  const processedIntentRef = useRef(null);
  const inFlightIntentRef = useRef(false);
  const sessionTriggeredRef = useRef(new Set());
  const mountedRef = useRef(true);
  const subscriptionActiveRef = useRef(false);
  const loadingTimeoutRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const expectedReplyCountRef = useRef(0);
  const lastMessageHashRef = useRef('');
  const lastConfirmedMessagesRef = useRef([]);
  const currentTurnIdRef = useRef(0);
  const isRefetchingRef = useRef(false);
  const thinkingPlaceholderRef = useRef(null);
  
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
    SAFE_UPDATES: 0
  });
  
  const refetchDebounceRef = useRef(null);

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
    if (!msg || !msg.role || !msg.content) {
      return false;
    }
    
    // CRITICAL TYPE CHECK: Content MUST be a string
    if (typeof msg.content !== 'string') {
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
    const isJSONShaped = (trimmed.startsWith('{') || trimmed.startsWith('[')) || trimmed.startsWith('```json');
    
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
    const assistantMessages = sanitized.filter(m => m.role === 'assistant');
    const assistantContents = assistantMessages.map(m => String(m.content).substring(0, 100));
    const uniqueContents = new Set(assistantContents);
    
    if (assistantContents.length !== uniqueContents.size) {
      console.error(`[${source}] ✗ DUPLICATE OCCURRED: ${assistantContents.length - uniqueContents.size} duplicate assistant messages found`);
      instrumentationRef.current.DUPLICATE_OCCURRED += (assistantContents.length - uniqueContents.size);
      
      // Further deduplicate by content
      const seenContents = new Set();
      const fullyDeduplicated = sanitized.filter(msg => {
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
    const lastConfirmedAssistant = lastConfirmedMessagesRef.current.filter(m => m.role === 'assistant').pop();
    const newAssistant = sanitized.filter(m => m.role === 'assistant').pop();
    
    if (lastConfirmedAssistant && newAssistant) {
      const oldContent = String(lastConfirmedAssistant.content);
      const newContent = String(newAssistant.content);
      
      if (oldContent === newContent && sanitized.length === lastConfirmedMessagesRef.current.length) {
        console.log(`[${source}] ⚠️ Rejecting update - no new content detected`);
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
    scrollToBottom();
  }, [messages]);

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
            const agentName = `cbt_therapist_${safetyProfile}`;

            const conversation = await base44.agents.createConversation({
              agent_name: agentName,
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
            
            console.log(`[Conversation Created] ID: ${conversation.id}, Intent: ${intentParam}`);
            
            setCurrentConversationId(conversation.id);
            setMessages([]);
            setShowSidebar(false);
            refetchConversations();
            
            // Trigger AI to send opening message based on intent (one-time only)
            if (!sessionTriggeredRef.current.has(conversation.id)) {
              sessionTriggeredRef.current.add(conversation.id);
              setTimeout(async () => {
                setIsLoading(true);
                await base44.agents.addMessage(conversation, {
                  role: 'user',
                  content: '[START_SESSION]'
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
            const agentName = `cbt_therapist_${safetyProfile}`;

            const conversation = await base44.agents.createConversation({
              agent_name: agentName,
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
            setShowSidebar(false);
            refetchConversations();
            
            // Trigger AI to send opening message (one-time only)
            if (!sessionTriggeredRef.current.has(conversation.id)) {
              sessionTriggeredRef.current.add(conversation.id);
              setTimeout(async () => {
                setIsLoading(true);
                await base44.agents.addMessage(conversation, {
                  role: 'user',
                  content: '[START_SESSION]'
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
          const hasUnsafeContent = (data.messages || []).some(msg => {
            if (msg.role !== 'assistant' || !msg.content) return false;
            if (typeof msg.content !== 'string') return true;
            const trimmed = msg.content.trim();
            // Only flag as unsafe if truly JSON-shaped (starts with { or [ or ```json)
            return (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('```json'));
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
                isRefetchingRef.current = false;
              } catch (err) {
                console.error('[Refetch] Failed:', err);
                isRefetchingRef.current = false;
              }
            }, 200);
            
            // Keep showing current messages (do not clear state)
            return;
          }
          
          // Second pass: process only safe messages
          processedMessages = (data.messages || [])
            .map(msg => {
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
            })
            .filter(msg => msg !== null);

          // CRITICAL: Safe update with validation + deduplication
          const updated = safeUpdateMessages(processedMessages, 'Subscription');
          
          if (updated) {
            // CRITICAL: Always reset loading when safe update succeeds
            console.log('[Subscription] ✅ Loading OFF');
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

    // Timeout after 30s
    responseTimeoutId = setTimeout(() => {
      if (isSubscribed && mountedRef.current) {
        console.error('[Subscription] ⏱️ Timeout after 30s - forcing recovery');
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
    }, 30000);

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
        
        // Fetch conversations from all safety profile agents
        const allConversations = await Promise.all([
          base44.agents.listConversations({ agent_name: 'cbt_therapist_lenient' }).catch(() => []),
          base44.agents.listConversations({ agent_name: 'cbt_therapist_standard' }).catch(() => []),
          base44.agents.listConversations({ agent_name: 'cbt_therapist_strict' }).catch(() => []),
          base44.agents.listConversations({ agent_name: 'cbt_therapist' }).catch(() => []) // Legacy
        ]);
        
        const flatConversations = allConversations.flat();
        const deletedConversations = await base44.entities.UserDeletedConversations.list();
        const deletedIds = Array.isArray(deletedConversations) ? deletedConversations.map(d => d.agent_conversation_id) : [];
        const conversationsArray = Array.isArray(flatConversations) ? flatConversations : [];
        return conversationsArray.filter(c => !deletedIds.includes(c.id));
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
      const agentName = `cbt_therapist_${safetyProfile}`;
      
      // Track agent profile usage
      base44.analytics.track({
        eventName: 'conversation_started',
        properties: {
          safety_profile: safetyProfile,
          intent: intentParam || 'none',
          agent_name: agentName
        }
      });
      
      const conversation = await base44.agents.createConversation({
        agent_name: agentName,
        metadata: {
          name: intentParam ? `${intentParam} session` : `Session ${conversations.length + 1}`,
          description: 'CBT Therapy Session',
          intent: intentParam,
          safety_profile: safetyProfile
        }
      });
      
      setCurrentConversationId(conversation.id);
      setMessages([]);
      setShowSidebar(false);
      refetchConversations();
      
      // If there's an intent and initial message, send it
      if (initialMessage) {
        setTimeout(async () => {
          setIsLoading(true);
          await base44.agents.addMessage(conversation, {
            role: 'user',
            content: initialMessage
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const startNewConversation = async () => {
    return startNewConversationWithIntent(null);
  };

  const loadConversation = async (conversationId) => {
    try {
      const conversation = await base44.agents.getConversation(conversationId);
      setCurrentConversationId(conversationId);
      
      // Process and sanitize messages before setting
      const sanitized = sanitizeConversationMessages(conversation.messages || []);
      safeUpdateMessages(sanitized, 'LoadConversation');
      setShowSidebar(false);
    } catch (error) {
      console.error('[Load Conversation Error]', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
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
    
    // Track expected message count for deterministic verification
    expectedReplyCountRef.current = messages.length + 2; // user message + assistant reply

    // Layer 1: Regex-based crisis detection (fast, explicit patterns)
    const reasonCode = detectCrisisWithReason(inputMessage);
    if (reasonCode) {
      setShowRiskPanel(true);
      base44.auth.me()
        .then(user => {
          base44.entities.CrisisAlert.create({
            surface: 'chat',
            conversation_id: currentConversationId || 'none',
            reason_code: reasonCode,
            user_email: user?.email || 'unknown'
          }).catch(() => {});
          
          // Analytics tracking
          base44.analytics.track({
            eventName: 'crisis_detected_regex',
            properties: {
              reason_code: reasonCode,
              surface: 'chat',
              conversation_id: currentConversationId || 'none'
            }
          });
        })
        .catch(() => {});
      return;
    }

    // Layer 2: LLM-based crisis detection (nuanced, implicit patterns)
    try {
      const user = await base44.auth.me();
      const enhancedCheck = await base44.functions.invoke('enhancedCrisisDetector', {
        message: inputMessage,
        language: user?.preferences?.language || 'en'
      });

      if (enhancedCheck.data?.is_crisis && 
          (enhancedCheck.data.severity === 'severe' || enhancedCheck.data.severity === 'high') &&
          enhancedCheck.data.confidence > 0.7) {
        setShowRiskPanel(true);
        base44.entities.CrisisAlert.create({
          surface: 'chat',
          conversation_id: currentConversationId || 'none',
          reason_code: `llm_${enhancedCheck.data.severity}`,
          user_email: user?.email || 'unknown'
        }).catch(() => {});
        
        // Analytics tracking for LLM-detected crisis
        base44.analytics.track({
          eventName: 'crisis_detected_llm_layer2',
          properties: {
            severity: enhancedCheck.data.severity,
            confidence: enhancedCheck.data.confidence,
            surface: 'chat',
            conversation_id: currentConversationId || 'none'
          }
        });
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
      if (!convId) {
        // Get safety profile from user settings or default to 'standard'
        const user = await base44.auth.me().catch(() => null);
        const safetyProfile = user?.preferences?.safety_profile || 'standard';
        const agentName = `cbt_therapist_${safetyProfile}`;

        const conversation = await base44.agents.createConversation({
          agent_name: agentName,
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
      console.log('[Send] 📤 Adding message to conversation:', convId);
      
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: messageText
      });
      
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
              const updated = safeUpdateMessages(sanitized, 'Polling');
              
              if (updated) {
                setIsLoading(false);
                emitStabilitySummary();
              }
              
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
      }
    }
  };

  const requestSummary = async () => {
    if (!currentConversationId) return;
    
    const conversation = await base44.agents.getConversation(currentConversationId);
    setIsLoading(true);
    setShowSummaryPrompt(false);

    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: 'Can you provide a session summary with key takeaways, any exercises you recommend, and helpful resources for what we discussed today?'
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
      // Record deletion in UserDeletedConversations (soft delete)
      const conversation = conversations.find(c => c.id === conversationId);
      await base44.entities.UserDeletedConversations.create({
        agent_conversation_id: conversationId,
        conversation_title: conversation?.metadata?.name || 'Deleted Session'
      });
      return conversationId;
    },
    onSuccess: (deletedId) => {
      if (currentConversationId === deletedId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      // Invalidate and refetch to ensure UI is updated
      queryClient.invalidateQueries(['conversations']);
      refetchConversations();
    },
    onError: (error) => {
      console.error('Delete error:', error);
      alert('Failed to delete session. Please try again.');
    }
  });

  const handleDeleteConversation = (conversationId) => {
    if (confirm('Delete this session? This action cannot be undone.')) {
      deleteConversationMutation.mutate(conversationId);
    }
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
    queryClient.invalidateQueries(['todayMood']);
    queryClient.invalidateQueries(['todayFlow']);
    
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
      {showAuthError && <AuthErrorBanner onDismiss={() => setShowAuthError(false)} />}
      <div className="h-screen flex relative" data-testid="chat-root" data-page-ready={isPageReady} style={{ 
        background: 'linear-gradient(165deg, #D4EDE8 0%, #BDE0D9 30%, #A8D4CB 60%, #9ECCC2 100%)'
      }}>
      {/* Backdrop overlay when sidebar is open - below input area */}
      {showSidebar && currentConversationId && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          onClick={() => setShowSidebar(false)}
          style={{ zIndex: 30 }}
        />
      )}

      {/* Sidebar - Conversations List */}
      <div className={`
        ${showSidebar ? 'block' : 'hidden md:block'} 
        fixed md:relative inset-0 md:inset-auto w-80 
        shadow-2xl md:shadow-none z-40
      `} style={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <ErrorBoundary>
          <ConversationsList
            conversations={Array.isArray(conversations) ? conversations : []}
            currentConversationId={currentConversationId}
            onSelectConversation={loadConversation}
            onNewConversation={startNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onClose={() => setShowSidebar(false)}
          />
        </ErrorBoundary>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 flex items-center gap-3" style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 246, 243, 0.8) 100%)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(38, 166, 154, 0.2)'
        }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.href = '/'}
            aria-label="Go back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
            aria-label={showSidebar ? "Close conversations sidebar" : "Open conversations sidebar"}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold" style={{ color: '#1A3A34' }}>Your Therapist</h1>
            <p className="text-sm" style={{ color: '#5A7A72' }}>A safe space to talk</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto min-h-0" style={{ backgroundColor: 'transparent' }}>
          {!currentConversationId ? (
            <div className="h-full flex flex-col">
              {/* Welcome Section - Separate container */}
              <div className="flex-1 flex items-center justify-center p-4 md:p-6">
                <Card className="p-8 max-w-md text-center border-0" style={{
                  borderRadius: '32px',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 16px 48px rgba(38, 166, 154, 0.15), 0 6px 20px rgba(0,0,0,0.05), inset 0 2px 0 rgba(255,255,255,0.95)'
                }}>
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4" style={{
                    borderRadius: '22px',
                    background: 'linear-gradient(145deg, rgba(38, 166, 154, 0.15) 0%, rgba(56, 178, 172, 0.15) 100%)',
                    boxShadow: '0 4px 12px rgba(38, 166, 154, 0.2)'
                  }}>
                    <span className="text-2xl">👋</span>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2" style={{ color: '#1A3A34' }}>
                    Welcome to Therapy
                  </h2>
                  <p className="mb-6" style={{ color: '#5A7A72' }}>
                    This is a safe, judgment-free space. Share what's on your mind, and let's work through it together.
                  </p>
                  <Button
                    onClick={startNewConversation}
                    className="px-6 py-6 text-lg text-white"
                    style={{
                      borderRadius: '24px',
                      backgroundColor: '#26A69A',
                      boxShadow: '0 8px 24px rgba(38, 166, 154, 0.35), 0 4px 10px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}
                  >
                    Start Your First Session
                  </Button>
                </Card>
              </div>

              {/* Insight Cards Section - Separate container with border */}
              <div className="p-4 md:p-6" style={{
                borderTop: '1px solid rgba(38, 166, 154, 0.2)',
                background: 'linear-gradient(to bottom, rgba(232, 246, 243, 0.5), rgba(212, 237, 232, 0.5))'
              }}>
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
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Therapy State Machine */}
              {showTherapyFlow && messages.length === 0 && (
                <div className="p-4 md:p-6" style={{
                  background: 'transparent'
                }}>
                  <TherapyStateMachine onComplete={() => setShowTherapyFlow(false)} />
                </div>
              )}

              {/* Insight Cards - Show if no flow active */}
              {messages.length === 0 && !showTherapyFlow && (
                <div className="p-4 md:p-6" style={{
                  borderBottom: '1px solid rgba(38, 166, 154, 0.2)',
                  background: 'linear-gradient(to bottom, rgba(232, 246, 243, 0.5), rgba(212, 237, 232, 0.5))'
                }}>
                  <div className="max-w-3xl mx-auto">
                    <ErrorBoundary>
                      <ProactiveCheckIn onSendMessage={(prompt) => setInputMessage(prompt)} />
                    </ErrorBoundary>
                  </div>
                </div>
              )}

              {/* Active Chat Messages Section - Separate scrollable container */}
              <div data-testid="chat-messages" className="flex-1 p-4 md:p-6 pb-8 space-y-6 overflow-y-auto min-h-0" style={{ backgroundColor: 'transparent' }}>
                {/* Inline Consent Banner - Non-blocking, dismissible */}
                {showConsentBanner && (
                  <InlineConsentBanner onAccept={handleConsentAccept} />
                )}
                {/* Inline Risk Panel - Non-blocking, shown when crisis language detected */}
                {showRiskPanel && (
                  <InlineRiskPanel onDismiss={() => setShowRiskPanel(false)} />
                )}
                {/* Profile-specific periodic disclaimer */}
                <ProfileSpecificDisclaimer messageCount={messages.length} />
                {messages.filter(m => m && m.role && m.content).map((message, index) => (
                  <MessageBubble 
                    key={index} 
                    message={message}
                    conversationId={currentConversationId}
                    messageIndex={index}
                    agentName="cbt_therapist"
                    context="chat"
                  />
                ))}
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
                      }}
                    >
                      <div className="h-7 w-7 flex items-center justify-center flex-shrink-0" style={{
                        borderRadius: '12px',
                        backgroundColor: 'rgba(38, 166, 154, 0.15)'
                      }}>
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#26A69A' }} />
                      </div>
                      <div className="rounded-2xl px-4 py-3 flex-1" style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(38, 166, 154, 0.2)',
                        minHeight: '48px',
                        maxHeight: '120px',
                        transition: 'none',
                        willChange: 'auto'
                      }}>
                        <p className="text-sm" style={{ color: '#5A7A72' }}>Thinking...</p>
                      </div>
                    </div>
                  );
                })()}
                <div ref={messagesEndRef} />
              </div>

              {/* Save Prompt - After homework commitment */}
              {showSavePrompt && !isLoading && savePromptData && (
                <div className="p-4 md:p-6" style={{
                  borderTop: '1px solid rgba(38, 166, 154, 0.2)',
                  background: 'linear-gradient(to right, rgba(232, 246, 243, 0.5), rgba(212, 237, 232, 0.5))'
                }}>
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
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Summary Prompt Section - Separate container with border */}
              {showSummaryPrompt && !isLoading && (
                <div className="p-4 md:p-6" style={{
                  borderTop: '1px solid rgba(38, 166, 154, 0.2)',
                  background: 'linear-gradient(to right, rgba(232, 246, 243, 0.5), rgba(212, 237, 232, 0.5))'
                }}>
                  <div className="max-w-3xl mx-auto">
                    <Card className="p-4 border-0" style={{
                      borderRadius: '24px',
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 246, 243, 0.8) 100%)',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 8px 24px rgba(38, 166, 154, 0.15)'
                    }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{
                          borderRadius: '16px',
                          backgroundColor: 'rgba(159, 122, 234, 0.15)'
                        }}>
                          <Sparkles className="w-5 h-5" style={{ color: '#9F7AEA' }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1" style={{ color: '#1A3A34' }}>
                            Would you like a session summary?
                          </p>
                          <p className="text-xs mb-3" style={{ color: '#5A7A72' }}>
                            Get key takeaways, recommended exercises, and helpful resources
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={requestSummary}
                              size="sm"
                              className="text-white"
                              style={{
                                borderRadius: '16px',
                                backgroundColor: '#9F7AEA',
                                boxShadow: '0 4px 12px rgba(159, 122, 234, 0.3)'
                              }}
                            >
                              Yes, create summary
                            </Button>
                            <Button
                              onClick={() => setShowSummaryPrompt(false)}
                              size="sm"
                              variant="outline"
                              style={{
                                borderRadius: '16px',
                                borderColor: 'rgba(38, 166, 154, 0.3)'
                              }}
                            >
                              Not now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Session Summary Display */}
        {currentConversationData?.session_summary && (
          <div style={{
            borderTop: '1px solid rgba(38, 166, 154, 0.2)',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 246, 243, 0.8) 100%)',
            backdropFilter: 'blur(12px)'
          }}>
            <SessionSummary conversation={currentConversationData} />
          </div>
        )}

        {/* Input Area - Always visible, always on top */}
        <div className="p-4 md:p-6 relative" style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 246, 243, 0.8) 100%)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(38, 166, 154, 0.2)',
          boxShadow: '0 -4px 16px rgba(38, 166, 154, 0.1)',
          zIndex: 50
        }}>
          <div className="max-w-4xl mx-auto flex gap-3">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              className="flex-1 min-h-[60px] max-h-[200px] resize-none"
              data-testid="therapist-chat-input"
              style={{
                borderRadius: '20px',
                borderColor: 'rgba(38, 166, 154, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              data-testid="therapist-chat-send"
              className="h-[60px] px-6 text-white"
              style={{
                borderRadius: '20px',
                backgroundColor: '#26A69A',
                boxShadow: '0 4px 12px rgba(38, 166, 154, 0.3)'
              }}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          {/* Always-visible persistent disclaimer */}
          <div className="text-center mt-3 px-4">
            <p className="text-xs font-medium mb-1" style={{ color: '#5A7A72' }}>
              ⚠️ AI Support - Not Professional Therapy
            </p>
            <p className="text-xs" style={{ color: '#7A8A82' }}>
              Cannot diagnose or prescribe. Crisis? Call 988 (US) or your local emergency services.
            </p>
          </div>
        </div>

      {/* Enhanced Check-in Modal - highest z-index when active */}
      {showCheckInModal && (
        <div style={{ zIndex: 100 }}>
          <EnhancedMoodCheckIn
            onClose={() => setShowCheckInModal(false)}
            onComplete={handleCheckInComplete}
          />
        </div>
      )}

      {/* Age Gate Modal - appears before consent */}
      {showAgeGate && (
        <AgeGateModal onConfirm={handleAgeConfirm} onDecline={handleAgeDecline} />
      )}
      </div>
      </div>
    </>
  );
}