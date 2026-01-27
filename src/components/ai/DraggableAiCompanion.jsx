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
  const messagesEndRef = useRef(null);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
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
    if (isOpen && !conversation) {
      (async () => {
        try {
          // Fetch recent memories to provide context
          const memories = await base44.entities.CompanionMemory.filter(
            { is_active: true },
            '-importance',
            10
          );
          
          const memoryContext = memories.length > 0
            ? `\n\n[User Context from Previous Sessions]\n${memories.map(m => `- ${m.content}`).join('\n')}`
            : '';

          const conv = await base44.agents.createConversation({
            agent_name: 'ai_coach',
            metadata: {
              name: 'AI Companion Chat',
              type: 'companion',
              persistent: true,
              memory_context: memoryContext
            }
          });
          
          setConversation(conv);
          setMessages(conv.messages || []);
        } catch (error) {
          console.error('Failed to create conversation:', error);
        }
      })();
    }
  }, [isOpen, conversation]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [conversation?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    
    const deltaX = dragRef.current.startX - clientX;
    const deltaY = clientY - dragRef.current.startY;
    
    const newPos = constrainPosition({
      right: dragRef.current.initialRight + deltaX,
      bottom: dragRef.current.initialBottom + deltaY
    });
    
    setPosition(newPos);
  };

  const handleDragEnd = () => {
    if (isDragging && position) {
      setIsDragging(false);
      savePosition(position);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, position]);

  const sendMessage = async () => {
    if (!message.trim() || !conversation) return;

    const userMessage = message;
    setMessage('');
    setIsLoading(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });
      queryClient.invalidateQueries(['proactiveReminders']);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    "How am I doing?",
    "I'm feeling anxious",
    "Help me with goals",
    "Suggest an exercise"
  ];

  const handleQuickPrompt = (prompt) => {
    setMessage(prompt);
    setTimeout(() => sendMessage(), 100);
  };

  if (!isOpen && !shouldShow) {
    return null;
  }

  if (!position) {
    return null; // Wait for position to initialize
  }

  const positionStyle = {
    position: 'fixed',
    right: `${position.right}px`,
    bottom: `${position.bottom}px`,
    zIndex: 45
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={positionStyle}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className={cn("cursor-move", isDragging && "cursor-grabbing")}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
            >
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
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
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-purple-50/30 to-blue-50/30 min-h-0" style={{ maxHeight: 'calc(100vh - 350px)' }}>
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
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 rounded-xl"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            I remember our conversations and your wellness journey
          </p>
        </div>
      </Card>
    </motion.div>
  );
}