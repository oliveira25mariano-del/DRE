import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Clock, CheckCircle } from "lucide-react";

interface ConnectivityStatusProps {
  lastUpdate?: Date;
  isRealtime?: boolean;
  onToggleRealtime?: () => void;
}

export default function ConnectivityStatus({ 
  lastUpdate, 
  isRealtime = true,
  onToggleRealtime 
}: ConnectivityStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 60) {
      return `${diffSecs}s atrás`;
    } else if (diffMins < 60) {
      return `${diffMins}min atrás`;
    } else {
      return date.toLocaleTimeString('pt-BR');
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm text-blue-300">
      {/* Status de conectividade */}
      <div className="flex items-center gap-1">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-400" />
            <span>Offline</span>
          </>
        )}
      </div>

      {/* Separador */}
      <div className="w-px h-4 bg-blue-600"></div>

      {/* Status de tempo real */}
      <div 
        className="flex items-center gap-1 cursor-pointer hover:text-blue-200"
        onClick={onToggleRealtime}
      >
        <Badge 
          variant={isRealtime ? "default" : "secondary"}
          className={`text-xs ${isRealtime ? 'bg-green-600' : 'bg-gray-600'}`}
        >
          {isRealtime ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Tempo Real
            </>
          ) : (
            <>
              <Clock className="w-3 h-3 mr-1" />
              Pausado
            </>
          )}
        </Badge>
      </div>

      {/* Última atualização */}
      {lastUpdate && (
        <>
          <div className="w-px h-4 bg-blue-600"></div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatTimeAgo(lastUpdate)}</span>
          </div>
        </>
      )}
    </div>
  );
}