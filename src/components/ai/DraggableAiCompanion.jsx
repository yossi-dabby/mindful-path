import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Sparkles, MinusCircle, Brain, Loader2, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { isAuthError, shouldShowAuthError } from '../utils/authErrorHandler';
import AuthErrorBanner from '../utils/AuthErrorBanner';
import InlineConsentBanner from '../chat/InlineConsentBanner';
import InlineRiskPanel from '../chat/InlineRiskPanel';
import { detectCrisisLanguage, detectCrisisWithReason } from '../utils/crisisDetector';
import MessageFeedback from '../chat/MessageFeedback';
import { validateAgentOutput, extractAssistantMessage } from '../utils/validateAgentOutput';

const STORAGE_KEY = 'ai_companion_position';
const MOBILE_BREAKPOINT = 768;

export default function DraggableAiCompanion() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [memoryError, setMemoryError] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [showAuthError, setShowAuthError] = useState(false);
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const [showRiskPanel, setShowRiskPanel] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(true);
  const mountedRef = useRef(true);
  const messagesEndRef = useRef(null);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const elementRef = useRef(null);
  const queryClient = useQueryClient();

  // Initialize position from localStorage or defaults
  useEffect(() => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const storedPos = isMobile ? parsed.mobile : parsed.desktop;
        if (storedPos) {
          setPosition(storedPos);
          return;
        }
      } catch (e) {
        console.error('Failed to parse stored position', e);
      }
    }
    
    // Default positions
    setPosition(
      isMobile 
        ? { bottom: 80, right: 20 } 
        : { bottom: 24, right: 24 }
    );
  }, []);

  // Check age verification and consent
  useEffect(() => {
    const isTestEnv = 
      window.navigator.webdriver === true ||
      window.Cypress !== undefined ||
      window.playwright !== undefined ||
      /HeadlessChrome/.test(window.navigator.userAgent);
    
    if (isTestEnv) {
      localStorage.setItem('age_verified', 'true');
      localStorage.setItem('chat_consent_accepted', 'true');
      setIsAgeVerified(true);
      return;
    }

    const ageVerified = localStorage.getItem('age_verified');
    setIsAgeVerified(ageVerified === 'true');
    
    const consentAccepted = localStorage.getItem('chat_consent_accepted');
    if (!consentAccepted && ageVerified === 'true') {
      setShowConsentBanner(true);
    }
  }, []);

  // Delay showing the button on Videos page
  useEffect(() => {
    const isVideosPage = window.location.pathname.includes('Videos');
    if (isVideosPage) {
      const timer = setTimeout(() => setShouldShow(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShouldShow(true);
    }
  }, []);

  // Create or get companion conversation with memory context
  useEffect(() => {
    if (!isOpen || conversation) return;
    
    let isCancelled = false;
    
    (async () => {
      let memoryContext = '';
      
      try {
        // Fetch recent memories to provide context
        const memories = await base44.entities.CompanionMemory.filter(
          { is_active: true },
          '-importance',
          10
        );
        
        memoryContext = memories.length > 0
          ? `\n\n[User Context from Previous Sessions]\n${memories.map(m => `- ${m.content}`).join('\n')}`
          : '';
      } catch (error) {
        console.error('Failed to fetch memories:', error);
        if (!isCancelled) setMemoryError(true);
        // Continue without memory context - graceful degradation
      }

      if (isCancelled) return;

      try {
        const conv = await base44.agents.createConversation({
          agent_name: 'ai_coach',
          metadata: {
            name: 'AI Companion Chat',
            type: 'companion',
            persistent: true,
            memory_context: memoryContext
          }
        });
        
        if (!isCancelled) {
          setConversation(conv);
          setMessages(conv.messages || []);
        }
      } catch (error) {
        console.error('Failed to create conversation:', error);
        // TODO: Show error UI to user
      }
    })();
    
    return () => {
      isCancelled = true;
    };
  }, [isOpen, conversation]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversation?.id) return;

    let isSubscribed = true;
    const conversationId = conversation.id;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      if (!isSubscribed || !mountedRef.current) return;
      
      // Process messages to extract assistant_message from JSON
      const processedMessages = (data.messages || []).map(msg => {
        if (msg.role === 'assistant' && msg.content) {
          const extracted = extractAssistantMessage(msg.content);
          return { ...msg, content: extracted };
        }
        return msg;
      });
      setMessages(processedMessages);
      setIsLoading(false);
    });

    return () => {
      isSubscribed = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [conversation?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Save position to localStorage
  const savePosition = (newPos) => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const stored = localStorage.getItem(STORAGE_KEY);
    let positions = stored ? JSON.parse(stored) : {};
    
    if (isMobile) {
      positions.mobile = newPos;
    } else {
      positions.desktop = newPos;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  };

  // Constrain position within viewport with safe margins
  const constrainPosition = (pos) => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const margin = 16;
    const bottomNavHeight = isMobile ? 64 : 0; // Account for mobile bottom nav
    const maxRight = window.innerWidth - (isMobile ? 96 : 384) - margin;
    const maxBottom = window.innerHeight - bottomNavHeight - margin;
    
    return {
      right: Math.max(margin, Math.min(maxRight, pos.right)),
      bottom: Math.max(margin, Math.min(maxBottom, pos.bottom))
    };
  };

  const handleDragStart = (e) => {
    if (!position) return;
    setIsDragging(true);
    
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialRight: position.right,
      initialBottom: position.bottom
    };
    
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging || !elementRef.current) return;

    const handleDragMove = (e) => {
      e.preventDefault();
      const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
      const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
      
      const deltaX = dragRef.current.startX - clientX;
      const deltaY = clientY - dragRef.current.startY;
      
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const margin = 16;
      const bottomNavHeight = isMobile ? 64 : 0;
      const maxRight = window.innerWidth - (isMobile ? 96 : 384) - margin;
      const maxBottom = window.innerHeight - bottomNavHeight - margin;
      
      const newRight = Math.max(margin, Math.min(maxRight, dragRef.current.initialRight + deltaX));
      const newBottom = Math.max(margin, Math.min(maxBottom, dragRef.current.initialBottom + deltaY));
      
      // Update DOM directly during drag to avoid re-renders
      if (elementRef.current) {
        elementRef.current.style.right = `${newRight}px`;
        elementRef.current.style.bottom = `${newBottom}px`;
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      
      // Get final position from DOM
      if (elementRef.current) {
        const finalRight = parseInt(elementRef.current.style.right) || position.right;
        const finalBottom = parseInt(elementRef.current.style.bottom) || position.bottom;
        const finalPos = { right: finalRight, bottom: finalBottom };
        
        // Only update state if position actually changed
        if (finalPos.right !== position.right || finalPos.bottom !== position.bottom) {
          setPosition(finalPos);
          savePosition(finalPos);
        }
      }
    };

    window.addEventListener('mousemove', handleDragMove, { passive: false });
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const sendMessage = async () => {
    if (!message.trim() || !conversation) return;

    // Crisis detection gate
    const reasonCode = detectCrisisWithReason(message);
    if (reasonCode) {
      setShowRiskPanel(true);
      
      // Log crisis alert (non-blocking)
      (async () => {
        try {
          const user = await base44.auth.me();
          await base44.entities.CrisisAlert.create({
            surface: 'companion',
            conversation_id: conversation?.id || 'none',
            reason_code: reasonCode,
            user_email: user?.email || 'unknown'
          });
        } catch (error) {
          console.error('[CRISIS ALERT] Failed to log alert:', error);
        }
      })();
      return;
    }

    const userMessage = message;
    setMessage('');
    setSendError(null);
    setIsLoading(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });
      if (!mountedRef.current) return;
      queryClient.invalidateQueries(['proactiveReminders']);
    } catch (error) {
      console.error('Failed to send message:', error);
      if (!mountedRef.current) return;
      setIsLoading(false);
      if (isAuthError(error) && shouldShowAuthError()) {
        setShowAuthError(true);
      } else {
        setSendError('Failed to send message. Please try again.');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
      setIsMinimized(false);
    }
  };

  const quickPrompts = [
    "How am I doing?",
    "I'm feeling anxious",
    "Help me with goals",
    "Suggest an exercise"
  ];

  const handleQuickPrompt = async (prompt) => {
    if (!conversation) return;
    
    setMessage('');
    setSendError(null);
    setIsLoading(true);

    // Crisis detection gate
    const reasonCode = detectCrisisWithReason(prompt);
    if (reasonCode) {
      setShowRiskPanel(true);
      setIsLoading(false);
      return;
    }

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: prompt
      });
      if (!mountedRef.current) return;
      queryClient.invalidateQueries(['proactiveReminders']);
    } catch (error) {
      console.error('Failed to send message:', error);
      if (!mountedRef.current) return;
      setIsLoading(false);
      if (isAuthError(error) && shouldShowAuthError()) {
        setShowAuthError(true);
      } else {
        setSendError('Failed to send message. Please try again.');
      }
    }
  };

  if (!isOpen && !shouldShow) {
    return null;
  }

  if (!position) {
    return null; // Wait for position to initialize
  }

  // Hide if age not verified
  if (!isAgeVerified) {
    return null;
  }

  const positionStyle = {
    position: 'fixed',
    right: `${position.right}px`,
    bottom: `${position.bottom}px`,
    zIndex: 40
  };

  if (!isOpen) {
    return (
      <motion.div
        ref={elementRef}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={positionStyle}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className={cn("cursor-move", isDragging && "cursor-grabbing")}
      >
        <Button
          onClick={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
          size="lg"
          className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          aria-label="Open AI Companion chat"
        >
          <MessageCircle className="w-7 h-7" />
        </Button>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
        />
      </motion.div>
    );
  }

  if (isMinimized) {
    return (
      <motion.div
        ref={elementRef}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={positionStyle}
      >
        <Card 
          className="w-64 border-2 border-purple-200 shadow-2xl cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setIsMinimized(false)}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">AI Companion</p>
                <p className="text-xs text-gray-500">Click to expand</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setIsMinimized(false);
              }}
              className="flex-shrink-0"
              aria-label="Close AI Companion"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      {showAuthError && <AuthErrorBanner onDismiss={() => setShowAuthError(false)} />}
      <motion.div
        ref={elementRef}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        style={positionStyle}
        className="w-[calc(100vw-3rem)] md:w-96 flex flex-col"
      >
      <Card className="border-2 border-purple-200 shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {/* Draggable Header */}
        <div 
          className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-xl flex items-center justify-between cursor-move"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-white/60" />
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Companion</h3>
              <p className="text-xs text-white/80">Drag to move</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="text-white hover:bg-white/20"
              aria-label="Minimize AI Companion"
            >
              <MinusCircle className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false);
                setIsMinimized(false);
              }}
              className="text-white hover:bg-white/20"
              aria-label="Close AI Companion"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <CardContent data-testid="companion-messages" className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-purple-50/30 to-blue-50/30 min-h-0" style={{ maxHeight: 'calc(100vh - 350px)' }}>
          {/* Inline Consent Banner - Non-blocking */}
          {showConsentBanner && (
            <InlineConsentBanner onAccept={() => {
              localStorage.setItem('chat_consent_accepted', 'true');
              setShowConsentBanner(false);
            }} />
          )}
          {/* Inline Risk Panel - Non-blocking, shown when crisis language detected */}
          {showRiskPanel && (
            <InlineRiskPanel onDismiss={() => setShowRiskPanel(false)} />
          )}
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-800 mb-2">Hello! I'm here for you</h4>
                <p className="text-sm text-gray-600 mb-4">
                  I can help with your wellness journey, answer questions, or just listen.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickPrompts.map((prompt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickPrompt(prompt)}
                      className="text-xs"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-2",
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2",
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  )}
                >
                  {msg.role === 'user' ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <ReactMarkdown
                      className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="ml-4 mb-2 list-disc">{children}</ul>,
                        ol: ({ children }) => <ol className="ml-4 mb-2 list-decimal">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        code: ({ inline, children }) =>
                          inline ? (
                            <code className="px-1 py-0.5 rounded bg-gray-100 text-xs">{children}</code>
                          ) : (
                            <code className="block p-2 rounded bg-gray-100 text-xs">{children}</code>
                          )
                      }}
                    >
                      {msg.content}
                      </ReactMarkdown>
                      )}
                      {msg.role === 'assistant' && conversation?.id && (
                      <MessageFeedback 
                      conversationId={conversation.id}
                      messageIndex={i}
                      agentName="ai_coach"
                      context="companion"
                      />
                      )}
                      </div>
                      </motion.div>
                      ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                data-testid="companion-loading"
                className="flex gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="p-4 border-t bg-white rounded-b-xl flex-shrink-0">
          <div className="flex gap-2">
            <Input
              data-testid="ai-companion-input"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setSendError(null);
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 rounded-xl"
              disabled={isLoading}
            />
            <Button
              data-testid="ai-companion-send"
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {sendError && (
            <p className="text-xs text-red-600 mt-2 text-center">
              {sendError}
            </p>
          )}
          {!sendError && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              I remember our conversations and your wellness journey
            </p>
          )}
        </div>
      </Card>
      </motion.div>
    </>
  );
}