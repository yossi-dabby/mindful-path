import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Calendar, ExternalLink, Loader2, Heart } from 'lucide-react';
import MessageBubble from '../components/chat/MessageBubble';

export default function Coach() {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
        setMessages(data.messages || []);
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [conversationId]);

  const startConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: 'ai_coach',
      metadata: {
        name: 'AI Coach Chat',
        type: 'coaching'
      }
    });
    setConversationId(conv.id);
  };

  const handleSendMessage = async (customMessage) => {
    const messageToSend = customMessage || inputMessage;
    if (!messageToSend.trim()) return;

    if (!conversationId) {
      await startConversation();
    }

    const conversation = await base44.agents.getConversation(conversationId);
    setIsLoading(true);
    setInputMessage('');

    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: messageToSend
    });
  };

  const quickActions = [
    { label: '💪 Guide me through an exercise', prompt: 'Can you guide me through a CBT exercise right now?' },
    { label: '🎯 Check my progress', prompt: 'How am I doing with my goals and mood lately?' },
    { label: '❓ Explain a CBT concept', prompt: 'Can you explain cognitive distortions to me?' },
    { label: '🏥 Find a therapist', prompt: 'I want to connect with a professional therapist' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">AI Wellness Coach</h1>
            <p className="text-sm text-gray-500">Your on-demand support companion</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-4xl mx-auto space-y-4">
          {!conversationId ? (
            <div className="space-y-6">
              {/* Welcome Card */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    Hi {user?.full_name?.split(' ')[0] || 'there'}! 👋
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                    I'm your AI wellness coach, here to provide on-demand support whenever you need it. 
                    I can guide you through exercises, answer questions, celebrate your progress, and help you find professional support.
                  </p>
                  <Button
                    onClick={startConversation}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-6 text-lg rounded-2xl shadow-lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Chatting
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">What can I help you with?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickActions.map((action, i) => (
                    <Card
                      key={i}
                      className="border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer bg-white hover:shadow-lg"
                      onClick={() => {
                        startConversation();
                        setTimeout(() => handleSendMessage(action.prompt), 500);
                      }}
                    >
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-gray-800">{action.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Resources Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Need Professional Support?</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Connect with licensed therapists for personalized care:
                      </p>
                      <div className="space-y-2">
                        <a
                          href="https://www.psychologytoday.com/us/therapists"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Psychology Today Directory
                        </a>
                        <a
                          href="https://www.betterhelp.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                          BetterHelp (Online Therapy)
                        </a>
                        <a
                          href="https://www.talkspace.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Talkspace (Online Therapy)
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      {conversationId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 p-4 md:pl-24">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me anything..."
                className="flex-1 min-h-[50px] max-h-32 resize-none rounded-2xl border-2 border-gray-200 focus:border-purple-400"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl px-6 h-auto"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}