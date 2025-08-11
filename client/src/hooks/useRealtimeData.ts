import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

interface RealtimeConfig {
  queryKey: string[];
  refetchInterval?: number;
  enabled?: boolean;
}

export function useRealtimeData<T>(config: RealtimeConfig) {
  const [isRealtime, setIsRealtime] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const query = useQuery<T>({
    queryKey: config.queryKey,
    refetchInterval: isRealtime ? (config.refetchInterval || 30000) : false,
    enabled: config.enabled !== false,
  });

  // Use effect to track updates
  useEffect(() => {
    if (query.data) {
      setLastUpdate(new Date());
    }
  }, [query.data]);

  const toggleRealtime = useCallback(() => {
    setIsRealtime(prev => !prev);
  }, []);

  const forceRefresh = useCallback(() => {
    query.refetch();
  }, [query.refetch]);

  return {
    ...query,
    isRealtime,
    lastUpdate,
    toggleRealtime,
    forceRefresh
  };
}

// Hook específico para métricas financeiras
export function useFinancialMetrics() {
  return useRealtimeData({
    queryKey: ['/api/analytics/realtime-metrics'],
    refetchInterval: 30000
  });
}

// Hook específico para dados de gráficos
export function useChartData() {
  return useRealtimeData({
    queryKey: ['/api/analytics/chart-data'],
    refetchInterval: 60000
  });
}

// Hook para status de conectividade
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date());
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, lastSync };
}