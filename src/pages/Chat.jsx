import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
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

export default function Chat() {
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSummaryPrompt, setShowSummaryPrompt] = useState(false);
  const [showTherapyFlow, setShowTherapyFlow] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const location = useLocation();
  const processedIntentRef = useRef(null);
  const inFlightIntentRef = useRef(false);
  const sessionTriggeredRef = useRef(new Set()); // Track which conversations have been triggered

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
            const conversation = await base44.agents.createConversation({
              agent_name: 'cbt_therapist',
              metadata: {
                name: intentParam === 'thought_work' ? 'Thought Journal Session' : 
                      intentParam === 'goal_work' ? 'Goal Setting Session' : 
                      intentParam === 'daily_checkin' ? 'Daily Check-in' :
                      intentParam === 'grounding' ? 'Grounding Exercise' : 
                      `Session ${conversations.length + 1}`,
                description: 'CBT Therapy Session',
                intent: intentParam
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
            const conversation = await base44.agents.createConversation({
              agent_name: 'cbt_therapist',
              metadata: {
                name: intentParam === 'thought_work' ? 'Thought Journal Session' : 
                      intentParam === 'goal_work' ? 'Goal Setting Session' : 
                      intentParam === 'daily_checkin' ? 'Daily Check-in' :
                      intentParam === 'grounding' ? 'Grounding Exercise' : 
                      `Session ${conversations.length + 1}`,
                description: 'CBT Therapy Session',
                intent: intentParam
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
  }, [location.search, currentConversationId]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!currentConversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(
      currentConversationId,
      (data) => {
        setMessages(data.messages || []);
        setIsLoading(false);
        
        // Check if AI triggered UI form
        const lastMessage = data.messages?.[data.messages.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage?.metadata?.trigger_ui_form === 'daily_checkin' && !showCheckInModal) {
          console.log('[UI Form Trigger] Opening check-in modal');
          setShowCheckInModal(true);
        }
      }
    );

    return () => unsubscribe();
  }, [currentConversationId]);

  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      try {
        const allConversations = await base44.agents.listConversations({ agent_name: 'cbt_therapist' });
        const deletedConversations = await base44.entities.UserDeletedConversations.list();
        const deletedIds = deletedConversations.map(d => d.agent_conversation_id);
        return allConversations.filter(c => !deletedIds.includes(c.id));
      } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }
    },
    initialData: []
  });

  const { data: currentConversationData } = useQuery({
    queryKey: ['currentConversation', currentConversationId],
    queryFn: () => currentConversationId ? base44.agents.getConversation(currentConversationId) : null,
    enabled: !!currentConversationId
  });

  // Check if we should show summary prompt (after 5+ messages)
  useEffect(() => {
    if (messages.length >= 6 && !isLoading && messages[messages.length - 1]?.role === 'assistant') {
      setShowSummaryPrompt(true);
    }
  }, [messages, isLoading]);

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
      
      const conversation = await base44.agents.createConversation({
        agent_name: 'cbt_therapist',
        metadata: {
          name: intentParam ? `${intentParam} session` : `Session ${conversations.length + 1}`,
          description: 'CBT Therapy Session',
          intent: intentParam
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
    const conversation = await base44.agents.getConversation(conversationId);
    setCurrentConversationId(conversationId);
    setMessages(conversation.messages || []);
    setShowSidebar(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    try {
      let convId = currentConversationId;
      if (!convId) {
        const conversation = await base44.agents.createConversation({
          agent_name: 'cbt_therapist',
          metadata: {
            name: `Session ${conversations.length + 1}`,
            description: 'Therapy session'
          }
        });
        convId = conversation.id;
        setCurrentConversationId(convId);
        refetchConversations();
        setShowSidebar(false);
      }

      const conversation = await base44.agents.getConversation(convId);
      const messageText = inputMessage;
      
      setInputMessage('');
      setShowSummaryPrompt(false);
      setIsLoading(true);

      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: messageText
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
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

  return (
    <div className="h-screen flex relative" data-testid="chat-root" style={{ 
      background: 'linear-gradient(165deg, #D4EDE8 0%, #BDE0D9 30%, #A8D4CB 60%, #9ECCC2 100%)'
    }}>
      {/* Backdrop overlay when sidebar is open */}
      {showSidebar && currentConversationId && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          onClick={() => setShowSidebar(false)}
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
        <ConversationsList
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={loadConversation}
          onNewConversation={startNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onClose={() => setShowSidebar(false)}
        />
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
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
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
                  <ProactiveCheckIn onSendMessage={async (prompt) => {
                    await startNewConversation();
                    setTimeout(() => {
                      setInputMessage(prompt);
                    }, 500);
                  }} />
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
                    <ProactiveCheckIn onSendMessage={(prompt) => setInputMessage(prompt)} />
                  </div>
                </div>
              )}

              {/* Active Chat Messages Section - Separate scrollable container */}
              <div className="flex-1 p-4 md:p-6 pb-8 space-y-6 overflow-y-auto min-h-0" style={{ backgroundColor: 'transparent' }}>
                {messages.filter(m => m && m.content).map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="h-7 w-7 flex items-center justify-center" style={{
                      borderRadius: '12px',
                      backgroundColor: 'rgba(38, 166, 154, 0.15)'
                    }}>
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#26A69A' }} />
                    </div>
                    <div className="rounded-2xl px-4 py-3" style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(38, 166, 154, 0.2)'
                    }}>
                      <p className="text-sm" style={{ color: '#5A7A72' }}>Thinking...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

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

        {/* Input Area - Always visible */}
        <div className="p-4 md:p-6" style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 246, 243, 0.8) 100%)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(38, 166, 154, 0.2)',
          boxShadow: '0 -4px 16px rgba(38, 166, 154, 0.1)'
        }}>
          <div className="max-w-4xl mx-auto flex gap-3">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              className="flex-1 min-h-[60px] max-h-[200px] resize-none"
              data-testid="chat-input"
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
              data-testid="chat-send"
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
          <p className="text-xs text-center mt-3" style={{ color: '#5A7A72' }}>
            This is AI-assisted support. In crisis, contact emergency services.
          </p>
        </div>

      {/* Enhanced Check-in Modal */}
      {showCheckInModal && (
        <EnhancedMoodCheckIn
          onClose={() => setShowCheckInModal(false)}
          onComplete={handleCheckInComplete}
        />
      )}
      </div>
    </div>
  );
}