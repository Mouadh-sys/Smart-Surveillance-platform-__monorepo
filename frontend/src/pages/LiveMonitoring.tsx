import React, { useEffect, useState } from 'react';
import { Play, Square, Activity, Video } from 'lucide-react';
import { monitoringApi } from '../api/monitoringApi';
import { useWebSocket } from '../hooks/useWebSocket';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatDate';

export default function LiveMonitoring() {
  const [cameras, setCameras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { events, isConnected } = useWebSocket();

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
    try {
      if (isActive) await monitoringApi.stopCamera(id);
      else await monitoringApi.startCamera(id);
      await fetchCameras();
    } catch (error) {
      console.error('Failed to toggle camera', error);
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

      <div className="grid grid-cols-12 gap-6 h-[600px]">
        <div className="col-span-12 lg:col-span-8 bg-black border border-neutral-800 rounded-lg relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 pointer-events-none opacity-20 border-[20px] border-black z-10">
            <div className="w-full h-[1px] bg-indigo-500 absolute top-1/2 left-0 shadow-[0_0_10px_#6366f1]"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 flex-1 relative z-0">
             {cameras.length === 0 ? (
               <div className="col-span-full flex items-center justify-center text-neutral-600 text-[10px] font-bold uppercase tracking-widest bg-neutral-900">NO CAMERAS CONFIGURED</div>
             ) : cameras.map((cam) => (
               <div key={cam.id} className="relative bg-neutral-900 flex items-center justify-center border border-neutral-800 group">
                 <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-[9px] font-mono border border-white/10 z-20 text-neutral-300 backdrop-blur-sm truncate max-w-[120px]">
                    {cam.name}
                 </div>
                 <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
                   <button
                       onClick={() => toggleCamera(cam.id, cam.is_active)}
                       className={`px-1.5 py-0.5 text-[9px] font-mono border backdrop-blur-sm transition-colors ${cam.is_active ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'}`}
                     >
                        {cam.is_active ? 'HALT' : 'ENGAGE'}
                     </button>
                   {cam.is_active && (
                     <>
                       <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                       <span className="text-[9px] font-mono text-rose-500">LIVE</span>
                     </>
                   )}
                 </div>
                 {cam.is_active ? (
                    <div className="text-neutral-700 font-mono text-[10px] uppercase">Buffer loading...</div>
                 ) : (
                    <div className="text-neutral-700 font-mono text-[10px] uppercase">Feed Offline</div>
                 )}
               </div>
             ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col h-full">
           <div className="p-3 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/30 shrink-0">
             <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Activity Log</span>
             <span className="text-[10px] font-mono text-neutral-600">WS_CONN</span>
           </div>
           <div className="flex-1 overflow-y-auto space-y-px bg-black">
             {events.length === 0 ? (
               <div className="flex items-center justify-center h-full text-neutral-600 text-[10px] font-bold uppercase tracking-widest text-center px-4">
                 Awaiting telemetry data...
               </div>
             ) : (
               <div className="space-y-px">
                 {events.map((ev, index) => (
                   <div key={index} className="p-3 bg-[#0a0a0c] hover:bg-neutral-800/50 flex flex-col gap-1 border-b border-neutral-800 transition-colors">
                     <div className="flex justify-between items-center">
                       <p className="text-[10px] font-mono text-white truncate max-w-[120px]">{ev.person_name || 'UNKNOWN_SUBJECT'}</p>
                       <span className="text-[10px] text-neutral-600">{formatDate(new Date())}</span>
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
