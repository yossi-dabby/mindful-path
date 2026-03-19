import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Send, Loader2, Target, CheckCircle2 } from 'lucide-react';
import MessageBubble from '../chat/MessageBubble';
import InlineConsentBanner from '../chat/InlineConsentBanner';
import InlineRiskPanel from '../chat/InlineRiskPanel';
import { detectCrisisWithReason } from '../utils/crisisDetector';
import ActionPlanPanel from './ActionPlanPanel';
import { triggerSessionEndSummarization } from '../../lib/sessionEndSummarization.js';

const stageLabels = {
  discovery: 'Discovery Phase',
  planning: 'Planning Phase',
  action: 'Action Phase',
  review: 'Review Phase',
  completed: 'Completed'
};

export default function CoachingChat({ session, onBack }) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const [showRiskPanel, setShowRiskPanel] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Check consent on mount
  React.useEffect(() => {
    const isTestEnv =
    window.navigator.webdriver === true ||
    window.Cypress !== undefined ||
    window.playwright !== undefined ||
    /HeadlessChrome/.test(window.navigator.userAgent);

    if (isTestEnv) {
      localStorage.setItem('chat_consent_accepted', 'true');
      return;
    }

    const consentAccepted = localStorage.getItem('chat_consent_accepted');
    if (!consentAccepted) {
      setShowConsentBanner(true);
    }
  }, []);

  const { data: currentSession, refetch: refetchSession } = useQuery({
    queryKey: ['coachingSession', session.id],
    queryFn: () => base44.entities.CoachingSession.get?.(session.id) || session,
    initialData: session
  });

  useEffect(() => {
    if (currentSession.agent_conversation_id) {
      const unsubscribe = base44.agents.subscribeToConversation(
        currentSession.agent_conversation_id,
        (data) => {
          setMessages(data.messages || []);
          setIsLoading(false);
        },
        (error) => {
          console.error('Conversation subscription error:', error);
          setIsLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [currentSession.agent_conversation_id]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 140;

    if (isNearBottom || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const updateStageMutation = useMutation({
    mutationFn: (newStage) =>
    base44.entities.CoachingSession.update(session.id, { stage: newStage }),
    onSuccess: (_, newStage) => {
      refetchSession();
      queryClient.invalidateQueries({ queryKey: ['coachingSessions'] });
      // Phase 2.1: non-blocking session-end summarization trigger.
      // Fires only when stage transitions to 'completed'. Inert when flag is off.
      // Merges newStage into currentSession so the payload reflects the
      // completed stage, not the stale pre-update value.
      if (newStage === 'completed') {
        triggerSessionEndSummarization(
          { ...currentSession, stage: newStage },
          messages,
          'stage_completed',
        );
      }
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSession.agent_conversation_id) return;

    // Crisis detection gate - check before sending
    const reasonCode = detectCrisisWithReason(inputMessage);
    if (reasonCode) {
      setShowRiskPanel(true);

      // Log crisis alert (non-blocking)
      (async () => {
        try {
          const user = await base44.auth.me();
          await base44.entities.CrisisAlert.create({
            surface: 'coach',
            conversation_id: currentSession.agent_conversation_id || 'none',
            session_id: session.id,
            reason_code: reasonCode,
            user_email: user?.email || 'unknown'
          });
        } catch (error) {
          console.error('[CRISIS ALERT] Failed to log alert:', error);
        }
      })();
      return;
    }

    try {
      const conversation = await base44.agents.getConversation(currentSession.agent_conversation_id);
      setIsLoading(true);
      setInputMessage('');

      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: inputMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      alert('Failed to send message. Please try again.');
    }
  };

  const quickPrompts = {
    discovery: [
    "Help me understand the root cause",
    "What patterns should I look for?",
    "Can you help me identify my triggers?"],

    planning: [
    "Help me create an action plan",
    "What are realistic first steps?",
    "How can I break this down?"],

    action: [
    "I completed an action, what's next?",
    "I'm facing a challenge with my plan",
    "Can you give me motivation?"],

    review: [
    "Review my progress",
    "What have I achieved?",
    "What should I focus on next?"]

  };

  const completedActions = currentSession.action_plan?.filter((a) => a.completed).length || 0;
  const totalActions = currentSession.action_plan?.length || 0;

  return (
    <div className="flex flex-col bg-transparent" style={{ position: 'fixed', inset: 0, height: '100dvh', overflow: 'hidden', zIndex: 70, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Header */}
      <div className="bg-teal-100 p-4 backdrop-blur-xl border-b border-border/70 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" onClick={onBack} className="text-teal-600 px-4 py-2 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-none hover:bg-secondary/78 hover:text-foreground active:bg-secondary/88 h-9 min-h-[44px] md:min-h-0 gap-2">
              <ChevronLeft className="w-4 h-4 rtl:scale-x-[-1]" />
              Back to Sessions
            </Button>
            <Badge variant="outline" className="bg-[hsl(var(--card)/0.82)] text-teal-600 px-2.5 py-1 font-medium tracking-[0.01em] leading-4 rounded-[var(--radius-chip)] inline-flex items-center border transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 border-border/70 gap-2">
              <Target className="w-3 h-3" />
              {stageLabels[currentSession.stage]}
            </Badge>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-teal-600 mb-1 text-xl font-bold">{currentSession.title}</h2>
              <p className="text-teal-600 text-sm">{currentSession.current_challenge}</p>
            </div>
            {totalActions > 0 &&
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActionPanel(!showActionPanel)}
              className="gap-2">

                <CheckCircle2 className="w-4 h-4" />
                {completedActions}/{totalActions}
              </Button>
            }
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex">
        {/* Chat Area */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div ref={scrollContainerRef} data-testid="coach-chat-messages" className="bg-teal-50 p-4 flex-1 min-h-0 overflow-y-auto" style={{ overscrollBehavior: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Inline Consent Banner - Non-blocking */}
              {showConsentBanner &&
              <InlineConsentBanner onAccept={() => {
                localStorage.setItem('chat_consent_accepted', 'true');
                setShowConsentBanner(false);
              }} />
              }
              {/* Inline Risk Panel - Non-blocking, shown when crisis language detected */}
              {showRiskPanel &&
              <InlineRiskPanel onDismiss={() => setShowRiskPanel(false)} />
              }
              {messages.filter((m) => m && m.content).map((message, index) =>
              <MessageBubble
                key={index}
                message={message}
                conversationId={currentSession.agent_conversation_id}
                messageIndex={index}
                agentName="ai_coach"
                context="coach" />

              )}
              {isLoading &&
              <div data-testid="coach-loading" className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-[var(--shadow-sm)]">
                    <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                  </div>
                  <div className="bg-card rounded-2xl px-4 py-3 shadow-[var(--shadow-sm)] border border-border/80">
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              }
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Prompts */}
          {quickPrompts[currentSession.stage] &&
          <div className="bg-teal-100 px-4 py-3 border-t border-border/70">
              <div className="max-w-4xl mx-auto">
                <p className="text-teal-600 mb-2 text-sm font-medium">Quick prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts[currentSession.stage].map((prompt, i) =>
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(prompt)} className="bg-teal-400 text-secondary-foreground px-3 text-xs font-medium tracking-[0.005em] rounded-3xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-8 min-h-[44px] md:min-h-0">


                      {prompt}
                    </Button>
                )}
                </div>
              </div>
            </div>
          }

          {/* Input Area */}
          <div className="bg-teal-100 p-4 border-t border-border/70 flex-shrink-0" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
            <div className="text-teal-600 mx-auto max-w-4xl flex gap-3">
              <Textarea
                data-testid="coach-chat-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Share your thoughts, progress, or ask for guidance..."
                className="flex-1 min-h-[60px] max-h-[200px] resize-none rounded-[var(--radius-card)]"
                disabled={isLoading} />

              <Button
                data-testid="coach-chat-send"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading} className="bg-teal-600 text-slate-50 px-6 py-2 font-medium tracking-[0.005em] leading-none rounded-[40px] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[var(--shadow-md)] hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 min-h-[44px] md:min-h-0 h-[60px]">


                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Plan Panel */}
        {showActionPanel &&
        <ActionPlanPanel
          session={currentSession}
          onClose={() => setShowActionPanel(false)}
          onUpdate={() => {}} />

        }
      </div>
    </div>);

}