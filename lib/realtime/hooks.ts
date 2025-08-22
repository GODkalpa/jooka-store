// React hooks for real-time features
import { useEffect, useState, useCallback } from 'react';
import { realtimeClient } from './client';
import { useAuth } from '@/lib/auth/firebase-auth';
import { convertFirestoreDate } from '@/lib/utils/date';
import { Conversation, Message, ConversationWithMessages } from '@/types/firebase';

// Hook for inventory updates
export function useInventoryUpdates() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    try {
      const handleUpdate = (payload: any) => {
        setUpdates(prev => [payload, ...prev.slice(0, 49)]); // Keep last 50 updates
      };

      const channel = realtimeClient.subscribeToInventoryUpdates(handleUpdate);

      // Check connection status
      const checkStatus = () => {
        try {
          const status = realtimeClient.getChannelStatus('inventory-updates');
          setIsConnected(status === 'joined');
        } catch (error) {
          console.warn('Failed to check realtime connection status:', error);
          setIsConnected(false);
        }
      };

      const interval = setInterval(checkStatus, 1000);

      return () => {
        clearInterval(interval);
        try {
          realtimeClient.unsubscribe('inventory-updates');
        } catch (error) {
          console.warn('Failed to unsubscribe from realtime updates:', error);
        }
      };
    } catch (error) {
      console.warn('Failed to set up realtime inventory updates:', error);
      setIsConnected(false);
    }
  }, []);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return { updates, isConnected, clearUpdates };
}

// Hook for order updates (customer)
export function useOrderUpdates() {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    try {
      const handleUpdate = (payload: any) => {
        setUpdates(prev => [payload, ...prev.slice(0, 19)]); // Keep last 20 updates
      };

      const channel = realtimeClient.subscribeToOrderUpdates(user.id, handleUpdate);

      // Check connection status
      const checkStatus = () => {
        try {
          const status = realtimeClient.getChannelStatus(`order-updates-${user.id}`);
          setIsConnected(status === 'joined');
        } catch (error) {
          console.warn('Failed to check order updates connection status:', error);
          setIsConnected(false);
        }
      };

      const interval = setInterval(checkStatus, 1000);

      return () => {
        clearInterval(interval);
        try {
          realtimeClient.unsubscribe(`order-updates-${user.id}`);
        } catch (error) {
          console.warn('Failed to unsubscribe from order updates:', error);
        }
      };
    } catch (error) {
      console.warn('Failed to set up realtime order updates:', error);
      setIsConnected(false);
    }
  }, [user?.id]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return { updates, isConnected, clearUpdates };
}

// Hook for admin order notifications
export function useAdminOrderNotifications() {
  const { isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    const handleNotification = (payload: any) => {
      setNotifications(prev => [payload, ...prev.slice(0, 49)]); // Keep last 50 notifications
    };

    const channel = realtimeClient.subscribeToAdminOrderNotifications(handleNotification);
    
    // Check connection status
    const checkStatus = () => {
      const status = realtimeClient.getChannelStatus('admin-order-notifications');
      setIsConnected(status === 'joined');
    };

    const interval = setInterval(checkStatus, 1000);
    
    return () => {
      clearInterval(interval);
      realtimeClient.unsubscribe('admin-order-notifications');
    };
  }, [isAdmin]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, isConnected, clearNotifications };
}

// Hook for low stock alerts
export function useLowStockAlerts(threshold: number = 10) {
  const { isAdmin } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    const handleAlert = (payload: any) => {
      setAlerts(prev => [payload, ...prev.slice(0, 29)]); // Keep last 30 alerts
    };

    const channel = realtimeClient.subscribeToLowStockAlerts(threshold, handleAlert);
    
    // Check connection status
    const checkStatus = () => {
      const status = realtimeClient.getChannelStatus('low-stock-alerts');
      setIsConnected(status === 'joined');
    };

    const interval = setInterval(checkStatus, 1000);
    
    return () => {
      clearInterval(interval);
      realtimeClient.unsubscribe('low-stock-alerts');
    };
  }, [isAdmin, threshold]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return { alerts, isConnected, clearAlerts };
}

// Hook for user notifications
export function useUserNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const handleNotification = (payload: any) => {
      setNotifications(prev => [payload, ...prev.slice(0, 19)]); // Keep last 20 notifications
    };

    const channel = realtimeClient.subscribeToUserNotifications(user.id, handleNotification);
    
    // Check connection status
    const checkStatus = () => {
      const status = realtimeClient.getChannelStatus(`user-notifications-${user.id}`);
      setIsConnected(status === 'joined');
    };

    const interval = setInterval(checkStatus, 1000);
    
    return () => {
      clearInterval(interval);
      realtimeClient.unsubscribe(`user-notifications-${user.id}`);
    };
  }, [user?.id]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, isConnected, clearNotifications };
}

// Hook for real-time dashboard updates
export function useRealtimeDashboard() {
  const { user, isAdmin } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Combine multiple real-time subscriptions for dashboard
  const inventoryUpdates = useInventoryUpdates();
  const orderUpdates = isAdmin ? useAdminOrderNotifications() : useOrderUpdates();
  const lowStockAlerts = useLowStockAlerts();

  useEffect(() => {
    // Update dashboard data when any real-time event occurs
    if (inventoryUpdates.updates.length > 0 ||
        (orderUpdates as any).notifications?.length > 0 ||
        (orderUpdates as any).updates?.length > 0 ||
        lowStockAlerts.alerts.length > 0) {

      setDashboardData({
        inventoryUpdates: inventoryUpdates.updates,
        orderUpdates: (orderUpdates as any).notifications || (orderUpdates as any).updates,
        lowStockAlerts: lowStockAlerts.alerts,
      });
      setLastUpdate(new Date());
    }
  }, [
    inventoryUpdates.updates,
    (orderUpdates as any).notifications,
    (orderUpdates as any).updates,
    lowStockAlerts.alerts
  ]);

  const isConnected = inventoryUpdates.isConnected && 
                    (orderUpdates.isConnected || !user) &&
                    (lowStockAlerts.isConnected || !isAdmin);

  return {
    dashboardData,
    lastUpdate,
    isConnected,
    clearAll: () => {
      inventoryUpdates.clearUpdates();
      (orderUpdates as any).clearNotifications?.();
      (orderUpdates as any).clearUpdates?.();
      lowStockAlerts.clearAlerts();
      setDashboardData(null);
      setLastUpdate(null);
    }
  };
}

// Hook for messaging real-time updates
export function useMessagingRealtime(conversationId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);

  useEffect(() => {
    if (!user?.id || !conversationId) return;

    try {
      const handleNewMessage = (payload: any) => {
        const message = payload.message;
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message].sort((a, b) => {
            const aTime = convertFirestoreDate(a.created_at);
            const bTime = convertFirestoreDate(b.created_at);
            if (!aTime || !bTime) return 0;
            return new Date(aTime).getTime() - new Date(bTime).getTime();
          });
        });
        
        // Increment count if message is not from current user
        if (message.sender_id !== user.id) {
          setNewMessageCount(prev => prev + 1);
        }
      };

      const channelName = `conversation-${conversationId}`;
      const channel = realtimeClient.subscribe(channelName, {
        'new-message': handleNewMessage,
        'message-read': (payload: any) => {
          // Update message read status
          setMessages(prev => prev.map(msg => 
            msg.id === payload.messageId ? { ...msg, read: true } : msg
          ));
        }
      });

      // Check connection status
      const checkStatus = () => {
        try {
          const status = realtimeClient.getChannelStatus(channelName);
          setIsConnected(status === 'joined');
        } catch (error) {
          console.warn('Failed to check messaging connection status:', error);
          setIsConnected(false);
        }
      };

      const interval = setInterval(checkStatus, 2000);

      return () => {
        clearInterval(interval);
        try {
          realtimeClient.unsubscribe(channelName);
        } catch (error) {
          console.warn('Failed to unsubscribe from messaging updates:', error);
        }
      };
    } catch (error) {
      console.warn('Failed to set up realtime messaging:', error);
      setIsConnected(false);
    }
  }, [user?.id, conversationId]);

  const clearNewMessageCount = useCallback(() => {
    setNewMessageCount(0);
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message].sort((a, b) => {
      const aTime = convertFirestoreDate(a.created_at);
      const bTime = convertFirestoreDate(b.created_at);
      if (!aTime || !bTime) return 0;
      return new Date(aTime).getTime() - new Date(bTime).getTime();
    }));
  }, []);

  return { 
    messages, 
    isConnected, 
    newMessageCount, 
    clearNewMessageCount,
    addMessage,
    setMessages 
  };
}

// Hook for conversation list real-time updates
export function useConversationsRealtime() {
  const { user, isAdmin } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    try {
      const handleConversationUpdate = (payload: any) => {
        const conversation = payload.conversation;
        setConversations(prev => {
          const existing = prev.find(c => c.id === conversation.id);
          if (existing) {
            return prev.map(c => c.id === conversation.id ? conversation : c)
              .sort((a, b) => {
                const aTime = convertFirestoreDate(a.last_message_time);
                const bTime = convertFirestoreDate(b.last_message_time);
                if (!aTime || !bTime) return 0;
                return new Date(bTime).getTime() - new Date(aTime).getTime();
              });
          } else {
            return [conversation, ...prev]
              .sort((a, b) => {
                const aTime = convertFirestoreDate(a.last_message_time);
                const bTime = convertFirestoreDate(b.last_message_time);
                if (!aTime || !bTime) return 0;
                return new Date(bTime).getTime() - new Date(aTime).getTime();
              });
          }
        });
      };

      const channelName = isAdmin ? 'admin-conversations' : `user-conversations-${user.id}`;
      const channel = realtimeClient.subscribe(channelName, {
        'conversation-updated': handleConversationUpdate,
        'new-conversation': handleConversationUpdate
      });

      // Check connection status
      const checkStatus = () => {
        try {
          const status = realtimeClient.getChannelStatus(channelName);
          setIsConnected(status === 'joined');
        } catch (error) {
          console.warn('Failed to check conversations connection status:', error);
          setIsConnected(false);
        }
      };

      const interval = setInterval(checkStatus, 2000);

      return () => {
        clearInterval(interval);
        try {
          realtimeClient.unsubscribe(channelName);
        } catch (error) {
          console.warn('Failed to unsubscribe from conversations updates:', error);
        }
      };
    } catch (error) {
      console.warn('Failed to set up realtime conversations:', error);
      setIsConnected(false);
    }
  }, [user?.id, isAdmin]);

  // Calculate total unread messages
  useEffect(() => {
    const total = conversations.reduce((sum, conv) => {
      return sum + (isAdmin ? conv.unread_count.admin : conv.unread_count.customer);
    }, 0);
    setTotalUnread(total);
  }, [conversations, isAdmin]);

  const updateConversation = useCallback((conversationId: string, updates: Partial<Conversation>) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, ...updates } : conv
    ));
  }, []);

  const addConversation = useCallback((conversation: ConversationWithMessages) => {
    setConversations(prev => [conversation, ...prev]
      .sort((a, b) => {
        const aTime = convertFirestoreDate(a.last_message_time);
        const bTime = convertFirestoreDate(b.last_message_time);
        if (!aTime || !bTime) return 0;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      })
    );
  }, []);

  return { 
    conversations, 
    isConnected, 
    totalUnread,
    updateConversation,
    addConversation,
    setConversations 
  };
}