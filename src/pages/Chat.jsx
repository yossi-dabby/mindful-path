import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Plus, Loader2, Menu, Sparkles } from 'lucide-react';
import MessageBubble from '../components/chat/MessageBubble';
import ConversationsList from '../components/chat/ConversationsList';
import SessionSummary from '../components/chat/SessionSummary';
import ProactiveCheckIn from '../components/chat/ProactiveCheckIn';

export default function Chat() {
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSummaryPrompt, setShowSummaryPrompt] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!currentConversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(
      currentConversationId,
      (data) => {
        setMessages(data.messages || []);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentConversationId]);

  // Get deleted sessions from localStorage
  const getDeletedSessions = () => {
    try {
      const deleted = localStorage.getItem('deleted_chat_sessions');
      return deleted ? JSON.parse(deleted) : [];
    } catch {
      return [];
    }
  };

  const addDeletedSession = (sessionId) => {
    const deleted = getDeletedSessions();
    if (!deleted.includes(sessionId)) {
      deleted.push(sessionId);
      localStorage.setItem('deleted_chat_sessions', JSON.stringify(deleted));
    }
  };

  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const allConversations = await base44.agents.listConversations({ agent_name: 'cbt_therapist' });
      const deletedIds = getDeletedSessions();
      return allConversations.filter(c => !deletedIds.includes(c.id));
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

  const startNewConversation = async () => {
    const conversation = await base44.agents.createConversation({
      agent_name: 'cbt_therapist',
      metadata: {
        name: `Session ${conversations.length + 1}`,
        description: 'Therapy session'
      }
    });
    setCurrentConversationId(conversation.id);
    setMessages([]);
    refetchConversations();
    setShowSidebar(false);
  };

  const loadConversation = async (conversationId) => {
    const conversation = await base44.agents.getConversation(conversationId);
    setCurrentConversationId(conversationId);
    setMessages(conversation.messages || []);
    setShowSidebar(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

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
    
    setIsLoading(true);
    setInputMessage('');
    setShowSummaryPrompt(false);

    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: messageText
    });
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId) => {
      // Mark as deleted in localStorage for permanent UI removal
      addDeletedSession(conversationId);
      // Also call backend delete (even if it doesn't cascade to messages)
      await base44.agents.deleteConversation(conversationId);
      return conversationId;
    },
    onSuccess: (deletedId) => {
      if (currentConversationId === deletedId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      refetchConversations();
      queryClient.invalidateQueries(['conversations']);
      queryClient.invalidateQueries(['currentConversation', deletedId]);
    }
  });

  const handleDeleteConversation = async (conversationId) => {
    if (confirm('Delete this session? This action cannot be undone.')) {
      deleteConversationMutation.mutate(conversationId);
    }
  };

  return (
    <div className="h-screen flex relative">
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
        bg-white border-r-2 border-gray-200 
        shadow-2xl md:shadow-none z-40
      `}>
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
        <div className="bg-white border-b-2 border-gray-100 px-4 md:px-6 py-4 flex items-center gap-3 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">Your Therapist</h1>
            <p className="text-sm text-gray-500">A safe space to talk</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {!currentConversationId ? (
            <div className="h-full flex flex-col">
              {/* Welcome Section - Separate container */}
              <div className="flex-1 flex items-center justify-center p-4 md:p-6 bg-white">
                <Card className="p-8 max-w-md text-center border-0 shadow-lg">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-purple-400 flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">👋</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Welcome to Therapy
                  </h2>
                  <p className="text-gray-600 mb-6">
                    This is a safe, judgment-free space. Share what's on your mind, and let's work through it together.
                  </p>
                  <Button
                    onClick={startNewConversation}
                    className="bg-green-600 hover:bg-green-700 px-6 py-6 text-lg rounded-xl"
                  >
                    Start Your First Session
                  </Button>
                </Card>
              </div>

              {/* Insight Cards Section - Separate container with border */}
              <div className="border-t-4 border-gray-200 bg-gradient-to-b from-blue-50 to-purple-50 p-4 md:p-6">
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
              {/* Insight Cards Section - Only show at conversation start */}
              {messages.length === 0 && (
                <div className="bg-gradient-to-b from-blue-50 to-purple-50 border-b-4 border-gray-200 p-4 md:p-6">
                  <div className="max-w-3xl mx-auto">
                    <ProactiveCheckIn onSendMessage={(prompt) => setInputMessage(prompt)} />
                  </div>
                </div>
              )}

              {/* Active Chat Messages Section - Separate scrollable container */}
              <div className="flex-1 p-4 md:p-6 space-y-6 bg-gray-50">
                {messages.filter(m => m && m.content).map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <p className="text-sm text-gray-500">Thinking...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Summary Prompt Section - Separate container with border */}
              {showSummaryPrompt && !isLoading && (
                <div className="border-t-4 border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4 md:p-6">
                  <div className="max-w-3xl mx-auto">
                    <Card className="p-4 bg-white border-purple-200 shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 mb-1">
                            Would you like a session summary?
                          </p>
                          <p className="text-xs text-gray-600 mb-3">
                            Get key takeaways, recommended exercises, and helpful resources
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={requestSummary}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Yes, create summary
                            </Button>
                            <Button
                              onClick={() => setShowSummaryPrompt(false)}
                              size="sm"
                              variant="outline"
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
          <div className="border-t-2 border-gray-200 bg-white">
            <SessionSummary conversation={currentConversationData} />
          </div>
        )}

        {/* Input Area */}
        {currentConversationId && (
          <div className="bg-white border-t-2 border-gray-200 p-4 md:p-6 shadow-lg">
            <div className="max-w-4xl mx-auto flex gap-3">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind..."
                className="flex-1 min-h-[60px] max-h-[200px] resize-none rounded-2xl border-gray-300 focus:border-green-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-green-600 hover:bg-green-700 h-[60px] px-6 rounded-2xl"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              This is AI-assisted support. In crisis, contact emergency services.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}