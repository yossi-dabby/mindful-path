import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, Plus, Loader2, Menu } from 'lucide-react';
import MessageBubble from '../components/chat/MessageBubble';
import ConversationsList from '../components/chat/ConversationsList';

export default function Chat() {
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
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

  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.agents.listConversations({ agent_name: 'cbt_therapist' }),
    initialData: []
  });

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

    if (!currentConversationId) {
      await startNewConversation();
    }

    const conversation = await base44.agents.getConversation(currentConversationId);
    
    setIsLoading(true);
    setInputMessage('');

    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: inputMessage
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar - Conversations List */}
      <div className={`${showSidebar ? 'block' : 'hidden'} md:block fixed md:relative inset-0 md:inset-auto w-80 bg-white border-r border-gray-200 z-40`}>
        <ConversationsList
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={loadConversation}
          onNewConversation={startNewConversation}
          onClose={() => setShowSidebar(false)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800">Your Therapist</h1>
            <p className="text-sm text-gray-500">A safe space to talk</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50">
          {!currentConversationId ? (
            <div className="h-full flex items-center justify-center">
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
          ) : (
            <>
              {messages.map((message, index) => (
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
            </>
          )}
        </div>

        {/* Input Area */}
        {currentConversationId && (
          <div className="bg-white border-t border-gray-200 p-4 md:p-6">
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