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
      
      ws.onopen = () => {
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

      ws.onclose = () => {
        setIsConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close();
      };
      
      wsRef.current = ws;
    } catch (e) {
      console.error("WebSocket connection failed", e);
    }
  }, [accessToken, isAuthenticated, wsBaseUrl]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect loop on unmount
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { events, isConnected };
};
