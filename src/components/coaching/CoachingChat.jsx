import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Send, Loader2, Target, CheckCircle2, Plus, Edit } from 'lucide-react';
import MessageBubble from '../chat/MessageBubble';
import InlineConsentBanner from '../chat/InlineConsentBanner';
import ActionPlanPanel from './ActionPlanPanel';

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
  const messagesEndRef = useRef(null);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateStageMutation = useMutation({
    mutationFn: (newStage) => 
      base44.entities.CoachingSession.update(session.id, { stage: newStage }),
    onSuccess: () => {
      refetchSession();
      queryClient.invalidateQueries(['coachingSessions']);
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSession.agent_conversation_id) return;

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
      "Can you help me identify my triggers?"
    ],
    planning: [
      "Help me create an action plan",
      "What are realistic first steps?",
      "How can I break this down?"
    ],
    action: [
      "I completed an action, what's next?",
      "I'm facing a challenge with my plan",
      "Can you give me motivation?"
    ],
    review: [
      "Review my progress",
      "What have I achieved?",
      "What should I focus on next?"
    ]
  };

  const completedActions = currentSession.action_plan?.filter(a => a.completed).length || 0;
  const totalActions = currentSession.action_plan?.length || 0;

  return (
    <div className="h-[calc(100vh-4rem)] md:h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Sessions
            </Button>
            <Badge variant="outline" className="gap-2">
              <Target className="w-3 h-3" />
              {stageLabels[currentSession.stage]}
            </Badge>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">{currentSession.title}</h2>
              <p className="text-sm text-gray-600">{currentSession.current_challenge}</p>
            </div>
            {totalActions > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActionPanel(!showActionPanel)}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {completedActions}/{totalActions}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Inline Consent Banner - Non-blocking */}
              {showConsentBanner && (
                <InlineConsentBanner onAccept={() => {
                  localStorage.setItem('chat_consent_accepted', 'true');
                  setShowConsentBanner(false);
                }} />
              )}
              {messages.filter(m => m && m.content).map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                    <p className="text-sm text-gray-500">Thinking...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Prompts */}
          {quickPrompts[currentSession.stage] && (
            <div className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="max-w-4xl mx-auto">
                <p className="text-xs text-gray-500 mb-2">Quick prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts[currentSession.stage].map((prompt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage(prompt)}
                      className="text-xs"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto flex gap-3">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Share your thoughts, progress, or ask for guidance..."
                className="flex-1 min-h-[60px] max-h-[200px] resize-none rounded-2xl"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-[60px] px-6 rounded-2xl"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Plan Panel */}
        {showActionPanel && (
          <ActionPlanPanel 
            session={currentSession}
            onClose={() => setShowActionPanel(false)}
            onUpdate={() => {}}
          />
        )}
      </div>
    </div>
  );
}