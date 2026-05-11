import React, { useEffect, useState } from 'react';
import { Play, Square, Activity, Video } from 'lucide-react';
import { monitoringApi } from '../api/monitoringApi';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatDate';
import { API_BASE_URL } from '../utils/constants';

const normalizeMonitoringEvent = (rawEvent: any) => {
  if (!rawEvent) return null;

  // The backend sends monitoring events as { type: 'monitoring_event', data: {...} }
  // while control messages like { type: 'connected' } and { type: 'pong' } should
  // not be shown in the activity log.
  const payload = rawEvent.type === 'monitoring_event' && rawEvent.data ? rawEvent.data : rawEvent;

  if (rawEvent.type && rawEvent.type !== 'monitoring_event') {
    return null;
  }

  const confidenceValue = Number(payload.confidence);
  const safeConfidence = Number.isFinite(confidenceValue) ? confidenceValue : 0;

  return {
    id: payload.event_code || payload.id || `${payload.camera_id ?? 'camera'}-${payload.timestamp ?? Date.now()}`,
    person_name: payload.person_name || 'UNKNOWN_SUBJECT',
    camera_id: payload.camera_id ?? 'N/A',
    confidence: safeConfidence,
    status: payload.status || 'UNKNOWN',
    timestamp: payload.timestamp || payload.created_at || new Date().toISOString(),
  };
};

export default function LiveMonitoring() {
  const [cameras, setCameras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { events, isConnected } = useWebSocket();
  const { accessToken } = useAuth();
  const activityEvents = events.map(normalizeMonitoringEvent).filter(Boolean);

  const fetchCameras = async () => {
    try {
      const data = await monitoringApi.getCamerasStatus();
      setCameras(data.cameras || []);
    } catch (error) {
      console.error('Failed to fetch camera statuses', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
    const interval = setInterval(fetchCameras, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleCamera = async (id: number, isActive: boolean) => {
    setError(null);
    try {
      if (isActive) await monitoringApi.stopCamera(id);
      else await monitoringApi.startCamera(id);
      await fetchCameras();
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Failed to toggle camera';
      setError(`Camera ${id}: ${message}`);
      console.error('Failed to toggle camera', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
        <div className="flex items-center gap-3">
           <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
           <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mt-0.5">Real-time Event Stream {isConnected ? '(WS_ACTIVE)' : '(WS_DISCONNECTED)'}</h2>
        </div>
        <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest font-bold">Nodes: {cameras.length}</div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg text-rose-500 text-[10px] uppercase tracking-widest font-bold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-400">
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 h-[600px]">
        <div className="col-span-12 lg:col-span-8 bg-black border border-neutral-800 rounded-lg relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 pointer-events-none opacity-20 border-[20px] border-black z-10">
            <div className="w-full h-[1px] bg-indigo-500 absolute top-1/2 left-0 shadow-[0_0_10px_#6366f1]"></div>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 flex-1 relative z-0">
              {cameras.length === 0 ? (
                <div className="col-span-full flex items-center justify-center text-neutral-600 text-[10px] font-bold uppercase tracking-widest bg-neutral-900">NO CAMERAS CONFIGURED</div>
              ) : cameras.map((cam) => {
                const isStreaming = cam.stream_status?.is_running === true;
                return (
                <div key={cam.id} className="relative bg-neutral-900 flex items-center justify-center border border-neutral-800 group overflow-hidden">
                  {isStreaming && (
                    <img
                      src={`${API_BASE_URL}/api/monitoring/stream/${cam.id}?token=${accessToken}`}
                      alt={cam.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={() => console.error(`Failed to stream camera ${cam.id}`)}
                    />
                  )}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-[9px] font-mono border border-white/10 z-20 text-neutral-300 backdrop-blur-sm truncate max-w-[120px]">
                     {cam.name}
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
                    <button
                        onClick={() => toggleCamera(cam.id, isStreaming)}
                        className={`px-1.5 py-0.5 text-[9px] font-mono border backdrop-blur-sm transition-colors ${isStreaming ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'}`}
                      >
                         {isStreaming ? 'HALT' : 'ENGAGE'}
                      </button>
                    {isStreaming && (
                      <>
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-mono text-rose-500">LIVE</span>
                      </>
                    )}
                  </div>
                  {!isStreaming && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                      <div className="text-neutral-400 font-mono text-[10px] uppercase">Feed Offline</div>
                    </div>
                  )}
                </div>
                );
              })}
           </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col h-full">
           <div className="p-3 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/30 shrink-0">
             <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Activity Log</span>
             <span className="text-[10px] font-mono text-neutral-600">WS_CONN</span>
           </div>
           <div className="flex-1 overflow-y-auto space-y-px bg-black">
             {activityEvents.length === 0 ? (
               <div className="flex items-center justify-center h-full text-neutral-600 text-[10px] font-bold uppercase tracking-widest text-center px-4">
                 Awaiting telemetry data...
               </div>
             ) : (
               <div className="space-y-px">
                 {activityEvents.map((ev: any) => (
                   <div key={ev.id} className="p-3 bg-[#0a0a0c] hover:bg-neutral-800/50 flex flex-col gap-1 border-b border-neutral-800 transition-colors">
                     <div className="flex justify-between items-center">
                       <p className="text-[10px] font-mono text-white truncate max-w-[120px]">{ev.person_name || 'UNKNOWN_SUBJECT'}</p>
                       <span className="text-[10px] text-neutral-600">{formatDate(ev.timestamp)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-neutral-500 truncate">Cam: {ev.camera_id} • Conf: {(ev.confidence * 100).toFixed(0)}%</span>
                        <StatusBadge status={ev.status} />
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
