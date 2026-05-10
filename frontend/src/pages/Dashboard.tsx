import React, { useEffect, useState } from 'react';
import { Camera, AlertTriangle, CheckCircle, ShieldAlert, Play, Square } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatDate';
import { monitoringApi } from '../api/monitoringApi';
import { reportsApi } from '../api/reportsApi';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [monitoringStatus, setMonitoringStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, monitorData] = await Promise.all([
        reportsApi.getSummary().catch(() => null),
        monitoringApi.getStatus().catch(() => null),
      ]);
      setSummary(summaryData);
      setMonitoringStatus(monitorData);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStartAll = async () => {
    try {
      await monitoringApi.startAll();
      fetchDashboardData();
    } catch (error) {
       console.error(error);
    }
  };

  const handleStopAll = async () => {
    try {
      await monitoringApi.stopAll();
      fetchDashboardData();
    } catch (error) {
       console.error(error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-[12px] font-bold text-white uppercase tracking-widest">Dashboard Overview</h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Real-time status and operational metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleStartAll}
            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-colors"
          >
            <Play className="w-3 h-3" />
            <span>Engage All</span>
          </button>
          <button 
             onClick={handleStopAll}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-colors"
          >
            <Square className="w-3 h-3" />
            <span>Halt All</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Events" 
          value={summary?.total_events || 0} 
          icon={Camera}
        />
        <StatCard 
          title="Authorized" 
          value={summary?.authorized_events || 0} 
          icon={CheckCircle}
          colorClass="text-emerald-500"
        />
        <StatCard 
          title="Unknown" 
          value={summary?.unknown_events || 0} 
          icon={ShieldAlert}
          colorClass="text-rose-500"
        />
        <StatCard 
          title="Non-Auth" 
          value={summary?.unauthorized_events || 0} 
          icon={AlertTriangle}
          colorClass="text-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col overflow-hidden">
          <div className="p-3 border-b border-neutral-800 bg-neutral-800/30">
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">System Parameters</h2>
          </div>
          <div className="p-4 grid gap-4 grid-cols-2">
             <div className="bg-black border border-neutral-800 rounded p-3 text-center">
                <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Process Core</span>
                <span className={cn(
                  "font-mono text-sm",
                  monitoringStatus?.is_running ? 'text-emerald-500' : 'text-neutral-500'
                )}>
                  {monitoringStatus?.is_running ? 'ONLINE' : 'OFFLINE'}
                </span>
             </div>
             <div className="bg-black border border-neutral-800 rounded p-3 text-center">
                <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Active Nodes</span>
                <span className="font-mono text-sm text-indigo-400">
                  {monitoringStatus?.active_cameras?.length || 0}
                </span>
             </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col">
          <div className="p-3 border-b border-neutral-800 bg-neutral-800/30">
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Recent Telemetry</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
             {summary?.recent_events?.length > 0 ? (
                <div className="space-y-px">
                  {summary.recent_events.map((event: any, i: number) => (
                     <div key={i} className="p-3 bg-[#0a0a0c] border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                           <p className="text-[10px] font-mono text-white">{event.person_name || 'UNKNOWN_SUBJECT'}</p>
                           <StatusBadge status={event.status} />
                        </div>
                        <div className="flex justify-between text-[10px] text-neutral-500">
                           <span className="font-mono">CAM_{event.camera_id}</span>
                           <span>{formatDate(event.created_at)}</span>
                        </div>
                     </div>
                  ))}
                </div>
             ) : (
                <div className="p-6 text-center text-neutral-600 text-xs uppercase tracking-widest font-bold">
                   No telemetry available.
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
