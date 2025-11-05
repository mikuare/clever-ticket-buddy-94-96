import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ConnectionStatusProps {
  isConnected: boolean;
  lastConnected?: Date | null;
  reconnectAttempts?: number;
}

export const ConnectionStatus = ({ 
  isConnected, 
  lastConnected, 
  reconnectAttempts = 0 
}: ConnectionStatusProps) => {
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Show status when disconnected or during reconnect attempts
    setShowStatus(!isConnected || reconnectAttempts > 0);
  }, [isConnected, reconnectAttempts]);

  if (!showStatus) return null;

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"}
      className="flex items-center gap-1 text-xs"
    >
      {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      {isConnected ? 'Connected' : `Reconnecting... (${reconnectAttempts})`}
    </Badge>
  );
};

export default ConnectionStatus;