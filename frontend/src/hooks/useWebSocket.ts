import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export const useWebSocket = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { accessToken, isAuthenticated } = useAuth();
  
  // Clean up URL for WS
  const wsBaseUrl = API_BASE_URL.replace(/^http/, 'ws');

  const connect = useCallback(() => {
    if (!isAuthenticated) return;
    
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = `${wsBaseUrl}/api/monitoring/ws${accessToken ? `?token=${accessToken}` : ''}`;
      const ws = new WebSocket(wsUrl);

      // assign ref early so cleanup/closures reference the instance
      wsRef.current = ws;

      ws.onopen = () => {
        console.info('WebSocket opened', wsUrl);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setEvents(prev => [data, ...prev].slice(0, 50)); // Keep last 50
        } catch (e) {
          console.error("Failed to parse WS message", e);
        }
      };

      ws.onclose = (event: CloseEvent) => {
        console.warn('WebSocket closed', { code: event?.code, reason: event?.reason });
        setIsConnected(false);
        // Reconnect after 3 seconds (unless unmounted - cleanup nulls handlers)
        setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        // close will trigger onclose where we log code/reason
        try { ws.close(); } catch (e) { console.error('Failed to close WS after error', e); }
      };

    } catch (e) {
      console.error("WebSocket connection failed", e);
    }
  }, [accessToken, isAuthenticated, wsBaseUrl]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect loop on unmount
        wsRef.current.onerror = null; // Prevent StrictMode error logging
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { events, isConnected };
};
