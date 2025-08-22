// Mock realtime client for development
// TODO: Implement actual realtime functionality with WebSockets or Server-Sent Events

interface RealtimeClient {
  subscribeToInventoryUpdates: (callback: (payload: any) => void) => any;
  subscribeToOrderUpdates: (userId: string, callback: (payload: any) => void) => any;
  subscribeToAdminOrderNotifications: (callback: (payload: any) => void) => any;
  subscribeToLowStockAlerts: (threshold: number, callback: (payload: any) => void) => any;
  subscribeToUserNotifications: (userId: string, callback: (payload: any) => void) => any;
  subscribe: (channelName: string, events: Record<string, (payload: any) => void>) => any;
  getChannelStatus: (channelName: string) => 'joined' | 'disconnected';
  unsubscribe: (channelName: string) => void;
}

class MockRealtimeClient implements RealtimeClient {
  private channels: Map<string, any> = new Map();

  subscribeToInventoryUpdates(callback: (payload: any) => void) {
    console.log('Mock: Subscribing to inventory updates');
    this.channels.set('inventory-updates', { callback, status: 'joined' });
    return { unsubscribe: () => this.unsubscribe('inventory-updates') };
  }

  subscribeToOrderUpdates(userId: string, callback: (payload: any) => void) {
    const channelName = `order-updates-${userId}`;
    console.log(`Mock: Subscribing to order updates for user ${userId}`);
    this.channels.set(channelName, { callback, status: 'joined' });
    return { unsubscribe: () => this.unsubscribe(channelName) };
  }

  subscribeToAdminOrderNotifications(callback: (payload: any) => void) {
    console.log('Mock: Subscribing to admin order notifications');
    this.channels.set('admin-order-notifications', { callback, status: 'joined' });
    return { unsubscribe: () => this.unsubscribe('admin-order-notifications') };
  }

  subscribeToLowStockAlerts(threshold: number, callback: (payload: any) => void) {
    console.log(`Mock: Subscribing to low stock alerts (threshold: ${threshold})`);
    this.channels.set('low-stock-alerts', { callback, status: 'joined' });
    return { unsubscribe: () => this.unsubscribe('low-stock-alerts') };
  }

  subscribeToUserNotifications(userId: string, callback: (payload: any) => void) {
    const channelName = `user-notifications-${userId}`;
    console.log(`Mock: Subscribing to user notifications for user ${userId}`);
    this.channels.set(channelName, { callback, status: 'joined' });
    return { unsubscribe: () => this.unsubscribe(channelName) };
  }

  subscribe(channelName: string, events: Record<string, (payload: any) => void>) {
    console.log(`Mock: Subscribing to ${channelName} with events:`, Object.keys(events));
    this.channels.set(channelName, { events, status: 'joined' });
    return { unsubscribe: () => this.unsubscribe(channelName) };
  }

  getChannelStatus(channelName: string): 'joined' | 'disconnected' {
    const channel = this.channels.get(channelName);
    return channel ? channel.status : 'disconnected';
  }

  unsubscribe(channelName: string) {
    console.log(`Mock: Unsubscribing from ${channelName}`);
    this.channels.delete(channelName);
  }

  // Method to simulate real-time events (for testing)
  simulateEvent(channelName: string, eventType: string, payload: any) {
    const channel = this.channels.get(channelName);
    if (channel) {
      if (channel.callback) {
        // Old-style single callback
        channel.callback(payload);
      } else if (channel.events && channel.events[eventType]) {
        // New-style event-based callbacks
        channel.events[eventType](payload);
      }
    }
  }
}

export const realtimeClient = new MockRealtimeClient();
