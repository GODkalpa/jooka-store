'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Clock, CheckCircle2, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth/firebase-auth';
import { useMessagingRealtime, useConversationsRealtime } from '@/lib/realtime/hooks';
import { 
  Conversation, 
  Message, 
  CreateConversationData, 
  CreateMessageData,
  ConversationWithMessages 
} from '@/types/firebase';
import { formatSafeDate } from '@/lib/utils/date';

interface CustomerMessagingProps {
  className?: string;
}

export default function CustomerMessaging({ className = '' }: CustomerMessagingProps) {
  const { user, firebaseUser } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time hooks
  const { conversations, totalUnread, addConversation, setConversations } = useConversationsRealtime();
  const { messages, addMessage, setMessages, clearNewMessageCount } = useMessagingRealtime(selectedConversation || undefined);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Hydration fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    if (user?.id && isClient) {
      loadConversations();
    }
  }, [user?.id, isClient]);

  // Load conversation messages when selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      clearNewMessageCount();
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    if (!isClient || !firebaseUser) return;
    
    try {
      const token = await firebaseUser?.getIdToken();
      if (!token) {
        console.error('No auth token available');
        return;
      }
      
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const conversations = result.data || [];
        setConversations(conversations);
        
        // If we have a selected conversation that's no longer in the list, clear it
        if (selectedConversation && !conversations.find((c: any) => c.id === selectedConversation)) {
          console.warn('Selected conversation no longer exists, clearing selection');
          setSelectedConversation(null);
          setMessages([]);
        }
      } else {
        console.error('Failed to load conversations:', response.status, response.statusText);
        if (response.status === 401) {
          console.error('Authentication failed - user may need to sign in again');
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!isClient || !firebaseUser) return;
    
    try {
      const token = await firebaseUser?.getIdToken();
      if (!token) {
        console.error('No auth token available for loading messages');
        return;
      }
      
      console.log(`Loading messages for conversation: ${conversationId}`);
      const response = await fetch(`/api/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessages(result.data.messages || []);
      } else if (response.status === 404) {
        console.warn('Conversation not found:', conversationId);
        // Clear the selected conversation if it doesn't exist
        setSelectedConversation(null);
        // Reload conversations to get fresh list
        loadConversations();
      } else if (response.status === 500) {
        console.error('Server error loading conversation:', conversationId);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        // Don't clear conversation on 500 - might be temporary
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Only clear selected conversation on non-500 errors
      if (!error.message?.includes('500')) {
        setSelectedConversation(null);
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isLoading) return;

    setIsLoading(true);
    try {
      const token = await firebaseUser?.getIdToken();
      const messageData: CreateMessageData = {
        conversation_id: selectedConversation,
        content: newMessage.trim()
      };

      const response = await fetch(`/api/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const result = await response.json();
        addMessage(result.data);
        setNewMessage('');
        
        // Refresh conversations to update last message
        loadConversations();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async (data: CreateConversationData) => {
    setIsLoading(true);
    try {
      const token = await firebaseUser?.getIdToken();
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        addConversation(result.data);
        setSelectedConversation(result.data.id);
        setShowNewConversation(false);
        loadConversations(); // Refresh the list
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-400';
      case 'in-progress': return 'text-yellow-400';
      case 'closed': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const formatMessageTime = (timestamp: any) => {
    try {
      return formatSafeDate(timestamp, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  if (!isClient) {
    return (
      <div className={`bg-charcoal rounded-lg border border-gold/20 ${className} flex items-center justify-center`}>
        <div className="text-gray-400">Loading messaging system...</div>
      </div>
    );
  }

  if (showNewConversation) {
    return (
      <NewConversationForm 
        onSubmit={createNewConversation}
        onCancel={() => setShowNewConversation(false)}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className={`bg-charcoal rounded-lg border border-gold/20 ${className}`}>
      <div className="flex h-[600px]">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gold/20 flex flex-col">
          <div className="p-4 border-b border-gold/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gold flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Messages
                {totalUnread > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {totalUnread}
                  </span>
                )}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedConversation(null);
                    setMessages([]);
                    loadConversations();
                  }}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="bg-gold text-black px-3 py-1 rounded text-sm hover:bg-gold/90 transition-colors"
                >
                  New
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Click "New" to start a conversation</p>
              </div>
            ) : (
              conversations.map(conversation => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 border-b border-gold/10 cursor-pointer hover:bg-gold/5 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-gold/10' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white truncate">{conversation.subject}</h4>
                    {conversation.unread_count.customer > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                        {conversation.unread_count.customer}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-2 truncate">
                    {conversation.last_message}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-medium ${getStatusColor(conversation.status)}`}>
                      {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
                    </span>
                    <span className="text-gray-500">
                      {formatSafeDate(conversation.last_message_time, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Messages Header */}
              <div className="p-4 border-b border-gold/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">
                      {conversations.find(c => c.id === selectedConversation)?.subject}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Status: <span className={getStatusColor(conversations.find(c => c.id === selectedConversation)?.status || '')}>
                        {conversations.find(c => c.id === selectedConversation)?.status}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="sm:hidden text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_type === 'customer'
                        ? 'bg-gold text-black'
                        : 'bg-gray-700 text-white'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                        <span>{formatMessageTime(message.created_at)}</span>
                        {message.sender_type === 'customer' && (
                          message.read ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gold/20">
                <div className="flex space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 bg-black border border-gold/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gold resize-none"
                    rows={2}
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    className="bg-gold text-black px-4 py-2 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// New Conversation Form Component
interface NewConversationFormProps {
  onSubmit: (data: CreateConversationData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function NewConversationForm({ onSubmit, onCancel, isLoading }: NewConversationFormProps) {
  const [formData, setFormData] = useState<CreateConversationData>({
    subject: '',
    category: 'general',
    priority: 'medium',
    initial_message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.subject.trim() && formData.initial_message.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-charcoal rounded-lg border border-gold/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gold">Start New Conversation</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Subject *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full px-3 py-2 bg-black border border-gold/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold"
            placeholder="What can we help you with?"
            required
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
              className="w-full px-3 py-2 bg-black border border-gold/20 rounded-lg text-white focus:outline-none focus:border-gold"
              disabled={isLoading}
            >
              <option value="general">General Question</option>
              <option value="order">Order Issue</option>
              <option value="technical">Technical Support</option>
              <option value="billing">Billing Question</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full px-3 py-2 bg-black border border-gold/20 rounded-lg text-white focus:outline-none focus:border-gold"
              disabled={isLoading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Message *
          </label>
          <textarea
            value={formData.initial_message}
            onChange={(e) => setFormData(prev => ({ ...prev, initial_message: e.target.value }))}
            className="w-full px-3 py-2 bg-black border border-gold/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold"
            placeholder="Please describe your question or issue in detail..."
            rows={4}
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={!formData.subject.trim() || !formData.initial_message.trim() || isLoading}
            className="bg-gold text-black px-6 py-2 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
          >
            {isLoading ? 'Creating...' : 'Start Conversation'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="border border-gold/20 text-gold px-6 py-2 rounded-lg hover:bg-gold/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}