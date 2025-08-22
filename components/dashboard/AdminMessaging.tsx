'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Clock, 
  CheckCircle2, 
  User, 
  ArrowLeft,
  Filter,
  Search,
  MoreVertical,
  UserCheck,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth/firebase-auth';
import { useMessagingRealtime, useConversationsRealtime } from '@/lib/realtime/hooks';
import { 
  Conversation, 
  Message, 
  CreateMessageData,
  UpdateConversationData,
  ConversationWithMessages 
} from '@/types/firebase';
import { formatSafeDate } from '@/lib/utils/date';

interface AdminMessagingProps {
  className?: string;
}

export default function AdminMessaging({ className = '' }: AdminMessagingProps) {
  const { user, firebaseUser } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time hooks
  const { conversations, totalUnread, updateConversation, setConversations } = useConversationsRealtime();
  const { messages, addMessage, setMessages, clearNewMessageCount } = useMessagingRealtime(selectedConversation || undefined);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id]);

  // Load conversation messages when selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      clearNewMessageCount();
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const token = await firebaseUser?.getIdToken();
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/conversations?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setConversations(result.data || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const token = await firebaseUser?.getIdToken();
      const response = await fetch(`/api/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessages(result.data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
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

  const updateConversationStatus = async (conversationId: string, updates: UpdateConversationData) => {
    try {
      const token = await firebaseUser?.getIdToken();
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const result = await response.json();
        updateConversation(conversationId, result.data);
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  const assignToMe = async (conversationId: string) => {
    await updateConversationStatus(conversationId, { 
      admin_id: user?.id,
      status: 'in-progress'
    });
  };

  const closeConversation = async (conversationId: string) => {
    await updateConversationStatus(conversationId, { status: 'closed' });
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
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

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesFilter = filter === 'all' || conv.status === filter;
    const matchesSearch = !searchTerm || 
      conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className={`bg-charcoal rounded-lg border border-gold/20 ${className}`}>
      <div className="flex h-[600px] md:h-[700px] relative">
        {/* Conversations List */}
        <div className={`${
          selectedConversation 
            ? 'hidden md:flex md:w-1/3 lg:w-1/4' 
            : 'flex w-full md:w-1/3 lg:w-1/4'
        } border-r border-gold/20 flex-col absolute md:relative h-full bg-charcoal md:bg-transparent z-10 md:z-auto`}>
          <div className="p-4 border-b border-gold/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gold flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Customer Support
                {totalUnread > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {totalUnread}
                  </span>
                )}
              </h3>
            </div>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black border border-gold/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold text-sm"
              />
            </div>
            
            {/* Filter */}
            <div className="flex flex-wrap gap-2">
              {['all', 'open', 'in-progress', 'closed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-2 text-xs rounded-full transition-colors min-h-[36px] ${
                    filter === status
                      ? 'bg-gold text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No conversations found</p>
                <p className="text-sm">Conversations will appear here when customers contact support</p>
              </div>
            ) : (
              filteredConversations.map(conversation => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 border-b border-gold/10 cursor-pointer hover:bg-gold/5 transition-colors min-h-[80px] md:min-h-auto ${
                    selectedConversation === conversation.id ? 'bg-gold/10' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{conversation.subject}</h4>
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {conversation.customer_email}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      {conversation.unread_count.admin > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unread_count.admin}
                        </span>
                      )}
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(conversation.priority)}`} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-2 truncate">
                    {conversation.last_message}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${getStatusColor(conversation.status)}`}>
                        {conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500 capitalize">{conversation.category}</span>
                    </div>
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
        <div className={`${
          selectedConversation 
            ? 'flex w-full md:flex-1' 
            : 'hidden md:flex md:flex-1'
        } flex-col absolute md:relative h-full bg-charcoal md:bg-transparent z-20 md:z-auto`}>
          {selectedConversation ? (
            <>
              {/* Messages Header */}
              <div className="p-3 md:p-4 border-b border-gold/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="md:hidden text-gray-400 hover:text-white p-1"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h3 className="font-semibold text-white truncate">
                        {conversations.find(c => c.id === selectedConversation)?.subject}
                      </h3>
                    </div>
                    <div className="hidden md:flex md:items-center md:space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span className="truncate">
                          Customer: {conversations.find(c => c.id === selectedConversation)?.customer_email}
                        </span>
                      </div>
                      <span>•</span>
                      <span className={getStatusColor(conversations.find(c => c.id === selectedConversation)?.status || '')}>
                        {conversations.find(c => c.id === selectedConversation)?.status}
                      </span>
                      <span>•</span>
                      <span className={getPriorityColor(conversations.find(c => c.id === selectedConversation)?.priority || '')}>
                        {conversations.find(c => c.id === selectedConversation)?.priority} priority
                      </span>
                    </div>
                    <div className="md:hidden flex flex-col space-y-1 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span className="truncate">
                          {conversations.find(c => c.id === selectedConversation)?.customer_email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={getStatusColor(conversations.find(c => c.id === selectedConversation)?.status || '')}>
                          {conversations.find(c => c.id === selectedConversation)?.status}
                        </span>
                        <span>•</span>
                        <span className={getPriorityColor(conversations.find(c => c.id === selectedConversation)?.priority || '')}>
                          {conversations.find(c => c.id === selectedConversation)?.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Conversation Actions */}
                  <div className="flex items-center space-x-1 md:space-x-2 ml-2">
                    {conversations.find(c => c.id === selectedConversation)?.admin_id !== user?.id && (
                      <button
                        onClick={() => assignToMe(selectedConversation)}
                        className="hidden md:flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Assign to Me
                      </button>
                    )}
                    
                    {conversations.find(c => c.id === selectedConversation)?.status !== 'closed' && (
                      <button
                        onClick={() => closeConversation(selectedConversation)}
                        className="hidden md:flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Close
                      </button>
                    )}
                    
                    {/* Mobile Actions Menu */}
                    <div className="md:hidden relative">
                      <button className="p-2 text-gray-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {/* You can add a dropdown menu here if needed */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[280px] sm:max-w-xs lg:max-w-md px-3 md:px-4 py-2 md:py-3 rounded-lg ${
                      message.sender_type === 'admin'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1">
                          {message.sender_type === 'admin' ? (
                            <UserCheck className="w-3 h-3 opacity-70" />
                          ) : (
                            <User className="w-3 h-3 opacity-70" />
                          )}
                          <span className="text-xs opacity-70 font-medium">
                            {message.sender_type === 'admin' ? 'You (Admin)' : (
                              conversations.find(c => c.id === selectedConversation)?.customer_email || 'Customer'
                            )}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                        <span>{formatMessageTime(message.created_at)}</span>
                        {message.sender_type === 'admin' && (
                          message.read ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 md:p-4 border-t border-gold/20">
                <div className="flex space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your response..."
                    className="flex-1 bg-black border border-gold/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gold resize-none min-h-[44px]"
                    rows={2}
                    disabled={isLoading || conversations.find(c => c.id === selectedConversation)?.status === 'closed'}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isLoading || conversations.find(c => c.id === selectedConversation)?.status === 'closed'}
                    className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {conversations.find(c => c.id === selectedConversation)?.status === 'closed' && (
                  <p className="text-sm text-gray-400 mt-2">This conversation has been closed.</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-4">
              <div>
                <MessageCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-base md:text-lg font-medium text-gray-400 mb-2">Select a conversation</h3>
                <p className="text-sm md:text-base text-gray-500 max-w-sm mx-auto">Choose a conversation from the list to start responding to customers</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}