import React, { useEffect, useState } from 'react';
import { List as EventsIcon, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '../api/eventsApi';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EventDetailsModal } from '../components/EventDetailsModal';
import { formatDate } from '../utils/formatDate';

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getEvents();
      // Assume data is an array or { items: [] } depending on FastAPI integration
      setEvents(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleVerify = (code: string) => {
    navigate(`/verification?code=${code}`);
  };

  if (loading && events.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-[12px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <EventsIcon className="w-4 h-4 text-indigo-500" /> Detection Forensic Report
          </h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Review all surveillance events, detections, and alerts.</p>
        </div>
        <div className="flex gap-4">
           <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest">TOTAL: {events.length} ENTRIES</span>
           <span className="text-[9px] text-neutral-500 underline cursor-pointer hover:text-white uppercase font-bold tracking-widest">Export CSV</span>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col">
         <div className="p-3 border-b border-neutral-800 bg-neutral-800/30 flex flex-col sm:flex-row gap-4 justify-between">
           <div className="flex gap-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
               <input 
                 type="text" 
                 placeholder="Search events..." 
                 className="bg-black border border-neutral-800 rounded pl-9 pr-4 py-1.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 w-full sm:w-64 font-mono transition-colors focus:outline-none"
               />
             </div>
             <button className="flex items-center gap-2 bg-black border border-neutral-800 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">
               <Filter className="w-3 h-3" /> Filters
             </button>
           </div>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-[10px] uppercase font-bold text-neutral-500 border-b border-neutral-800 bg-[#0d0d0f]">
                <tr>
                  <th className="px-4 py-2">Timestamp (UTC)</th>
                  <th className="px-4 py-2">Subject / Target</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Confidence</th>
                  <th className="px-4 py-2">Camera Node</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs text-neutral-400 font-mono">
                 {events.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-600 text-[10px] uppercase tracking-widest font-bold">No event data currently indexed.</td></tr>
                 ) : events.map((event) => (
                    <tr key={event.id || event.event_code} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                       <td className="px-4 py-3 whitespace-nowrap text-neutral-500">
                          {formatDate(event.created_at)}
                       </td>
                       <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-bold text-white">{event.person_name || 'UNKNOWN_SUBJECT'}</div>
                          <div className="text-[10px] text-neutral-500">REF: {event.event_code}</div>
                       </td>
                       <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={event.status} />
                       </td>
                       <td className="px-4 py-3 whitespace-nowrap text-neutral-300">
                          {(event.confidence * 100).toFixed(1)}%
                       </td>
                       <td className="px-4 py-3 whitespace-nowrap text-neutral-500">
                          CAM_{event.camera_id}
                       </td>
                       <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button 
                            onClick={() => setSelectedEvent(event)}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors text-[10px] uppercase font-bold tracking-widest"
                          >
                            Analyze
                          </button>
                       </td>
                    </tr>
                 ))}
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
