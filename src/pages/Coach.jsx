import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, Calendar, ExternalLink, Loader2, Heart, Dumbbell, Target, TrendingUp } from 'lucide-react';
import MessageBubble from '../components/chat/MessageBubble';
import { motion } from 'framer-motion';

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

  const { data: activeGoals } = useQuery({
    queryKey: ['activeGoals'],
    queryFn: () => base44.entities.Goal.filter({ status: 'active' }, '-created_date', 3),
    initialData: []
  });

  const { data: recentMood } = useQuery({
    queryKey: ['recentMood'],
    queryFn: async () => {
      const moods = await base44.entities.MoodEntry.list('-date', 1);
      return moods[0] || null;
    }
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
    return conv.id;
  };

  const handleSendMessage = async (customMessage) => {
    const messageToSend = customMessage || inputMessage;
    if (!messageToSend.trim()) return;

    let currentConvId = conversationId;
    if (!currentConvId) {
      currentConvId = await startConversation();
    }

    const conversation = await base44.agents.getConversation(currentConvId);
    setIsLoading(true);
    setInputMessage('');

    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: messageToSend
    });
  };

  const quickActions = [
    { 
      label: 'Guide me through an exercise', 
      prompt: 'Can you guide me through a CBT exercise right now? Walk me through it step by step.',
      icon: Dumbbell,
      color: 'from-blue-400 to-blue-600'
    },
    { 
      label: 'Check my progress', 
      prompt: 'How am I doing with my goals and mood lately? Give me an encouraging update.',
      icon: TrendingUp,
      color: 'from-green-400 to-green-600'
    },
    { 
      label: 'Explain a CBT concept', 
      prompt: 'Can you explain cognitive distortions to me in simple terms?',
      icon: Sparkles,
      color: 'from-purple-400 to-purple-600'
    },
    { 
      label: 'Find a therapist', 
      prompt: 'I want to connect with a professional therapist. Can you help me with that?',
      icon: Calendar,
      color: 'from-pink-400 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <motion.div 
        className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Heart className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">AI Wellness Coach</h1>
              <p className="text-sm text-gray-500">Your on-demand support companion</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-700 border-0">Online 24/7</Badge>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-4xl mx-auto space-y-4">
          {!conversationId ? (
            <div className="space-y-6">
              {/* Welcome Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
                  <CardContent className="p-8 text-center">
                    <motion.div 
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Heart className="w-10 h-10 text-white" />
                    </motion.div>
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
              </motion.div>

              {/* User Context Cards */}
              {(activeGoals.length > 0 || recentMood) && (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {activeGoals.length > 0 && (
                    <Card className="border-0 shadow-md bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-purple-600" />
                          <p className="text-xs font-semibold text-gray-700">Active Goals</p>
                        </div>
                        <p className="text-lg font-bold text-gray-800">{activeGoals.length}</p>
                        <p className="text-xs text-gray-500">Keep up the great work!</p>
                      </CardContent>
                    </Card>
                  )}
                  {recentMood && (
                    <Card className="border-0 shadow-md bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-4 h-4 text-pink-600" />
                          <p className="text-xs font-semibold text-gray-700">Recent Mood</p>
                        </div>
                        <p className="text-lg font-bold text-gray-800 capitalize">{recentMood.mood.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">Let's keep tracking together</p>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">What can I help you with?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickActions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className="border-0 hover:shadow-xl transition-all cursor-pointer bg-white overflow-hidden"
                          onClick={() => {
                            startConversation();
                            setTimeout(() => handleSendMessage(action.prompt), 500);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-sm font-medium text-gray-800 flex-1">{action.label}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Resources Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
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
                            className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Psychology Today Directory
                          </a>
                          <a
                            href="https://www.betterhelp.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            BetterHelp (Online Therapy)
                          </a>
                          <a
                            href="https://www.talkspace.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Talkspace (Online Therapy)
                          </a>
                          <a
                            href="tel:988"
                            className="flex items-center gap-2 text-sm text-red-700 hover:text-red-800 font-semibold mt-3 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Crisis Support: Call/Text 988
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ) : (
            <>
              {messages.filter(m => m && m.content && typeof m.content === 'string').map((message, index) => (
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