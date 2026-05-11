import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '../api/eventsApi';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EventDetailsModal } from '../components/EventDetailsModal';
import { formatDate } from '../utils/formatDate';

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Use backend filtering for better performance
      const unknownAlerts = await eventsApi.getEventsByStatus('UNKNOWN');
      const nonAuthAlerts = await eventsApi.getEventsByStatus('KNOWN_NON_AUTHORIZED');

      const unknownList = Array.isArray(unknownAlerts) ? unknownAlerts : unknownAlerts.items || [];
      const nonAuthList = Array.isArray(nonAuthAlerts) ? nonAuthAlerts : nonAuthAlerts.items || [];

      const allAlerts = [...unknownList, ...nonAuthList];
      // Sort by date descending
      allAlerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAlerts(allAlerts);
    } catch (error) {
      console.error('Failed to fetch alerts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleVerify = (code: string) => {
    navigate(`/verification?code=${code}`);
  };

  if (loading && alerts.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-[12px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" /> Security Alerts
          </h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Review critical security incidents and unauthorized access attempts.</p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col">
        <div className="p-3 border-b border-neutral-800 bg-neutral-800/30 flex justify-between">
           <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Active Anomalies</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] uppercase font-bold text-neutral-500 border-b border-neutral-800 bg-[#0d0d0f]">
              <tr>
                <th className="px-4 py-2">Timestamp (UTC)</th>
                <th className="px-4 py-2">Subject / Target</th>
                <th className="px-4 py-2">Anomaly Status</th>
                <th className="px-4 py-2">Camera Node</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs text-neutral-400 font-mono">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <tr 
                    key={alert.id || alert.event_code} 
                    className="border-b border-neutral-800/50 hover:bg-neutral-800/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-neutral-500">{formatDate(alert.created_at)}</td>
                    <td className="px-4 py-3 text-white">{alert.person_name || 'UNKNOWN_SUBJECT'}</td>
                    <td className="px-4 py-3"><StatusBadge status={alert.status} /></td>
                    <td className="px-4 py-3 text-neutral-500">CAM_{alert.camera_id}</td>
                    <td className="px-4 py-3 text-right space-x-3">
                       <button 
                          onClick={() => setSelectedEvent(alert)}
                          className="text-indigo-400 hover:text-white uppercase text-[10px] font-bold tracking-widest transition-colors"
                       >
                          Details
                       </button>
                       <button 
                          onClick={() => handleVerify(alert.event_code)}
                          className="text-rose-500 hover:text-white uppercase text-[10px] font-bold tracking-widest transition-colors"
                       >
                          Verify
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-600 text-[10px] uppercase tracking-widest font-bold">
                    No active alerts found. All clear.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEvent && (
        <EventDetailsModal 
           event={selectedEvent} 
           onClose={() => setSelectedEvent(null)}
           onVerify={handleVerify}
        />
      )}
    </div>
  );
}
