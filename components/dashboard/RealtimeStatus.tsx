import { Wifi, WifiOff, Bell, AlertTriangle } from 'lucide-react';

interface RealtimeStatusProps {
  isConnected: boolean;
  lastUpdate?: Date | null;
  notifications?: number;
  alerts?: number;
  onClearNotifications?: () => void;
  onClearAlerts?: () => void;
}

export default function RealtimeStatus({
  isConnected,
  lastUpdate,
  notifications = 0,
  alerts = 0,
  onClearNotifications,
  onClearAlerts
}: RealtimeStatusProps) {
  return (
    <div className="flex items-center space-x-4">
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">Offline</span>
          </>
        )}
      </div>

      {/* Notifications */}
      {notifications > 0 && (
        <div className="flex items-center space-x-2">
          <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg px-3 py-1 flex items-center space-x-2">
            <Bell className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-400">
              {notifications} notification{notifications > 1 ? 's' : ''}
            </span>
          </div>
          {onClearNotifications && (
            <button
              onClick={onClearNotifications}
              className="text-xs text-gray-400 hover:text-gold transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Alerts */}
      {alerts > 0 && (
        <div className="flex items-center space-x-2">
          <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg px-3 py-1 flex items-center space-x-2">
            <AlertTriangle className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-yellow-400">
              {alerts} alert{alerts > 1 ? 's' : ''}
            </span>
          </div>
          {onClearAlerts && (
            <button
              onClick={onClearAlerts}
              className="text-xs text-gray-400 hover:text-gold transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Last Update Time */}
      {lastUpdate && (
        <div className="text-xs text-gray-400">
          Updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}