import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '../utils/formatDate';
import { API_BASE_URL } from '../utils/constants';

interface EventDetailsModalProps {
  event: any;
  onClose: () => void;
  onVerify: (code: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose, onVerify }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded flex flex-col w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-[#0d0d0f] shrink-0">
          <h2 className="text-[12px] font-bold text-white uppercase tracking-widest">Forensic Detail Report</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          <div className="flex justify-between items-start">
             <div>
                <h3 className="text-[14px] font-bold text-white uppercase tracking-widest">{event.person_name || 'UNKNOWN_SUBJECT'}</h3>
                <p className="text-neutral-500 font-mono text-[10px] mt-1">REF: {event.event_code}</p>
             </div>
             <StatusBadge status={event.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
               <div>
                  <h4 className="text-[10px] uppercase font-bold text-neutral-400 mb-2 tracking-widest">Analysis Matrix</h4>
                  <div className="bg-black border border-neutral-800 rounded p-3 space-y-2">
                     <div className="flex justify-between border-b border-neutral-800/50 pb-2">
                       <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest">Confidence</span>
                       <span className="text-white text-[10px] font-mono">{(event.confidence * 100).toFixed(1)}%</span>
                     </div>
                     <div className="flex justify-between border-b border-neutral-800/50 pb-2">
                       <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest">Verification Status</span>
                       <StatusBadge status={event.verification_status || 'PENDING'} />
                     </div>
                     <div className="flex justify-between">
                       <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest">Timestamp (UTC)</span>
                       <span className="text-white text-[10px] font-mono">{formatDate(event.created_at)}</span>
                     </div>
                  </div>
               </div>
               
               <div>
                  <h4 className="text-[10px] uppercase font-bold text-neutral-400 mb-2 tracking-widest">Node Information</h4>
                  <div className="bg-black border border-neutral-800 rounded p-3 space-y-2">
                     <div className="flex justify-between">
                       <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest">Camera ID</span>
                       <span className="text-white text-[10px] font-mono">CAM_{event.camera_id}</span>
                     </div>
                  </div>
               </div>

               <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => onVerify(event.event_code)}
                    className="flex-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Execute Verification
                  </button>
               </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-[10px] uppercase font-bold text-neutral-400 mb-2 tracking-widest">Watermarked Capture</h4>
                {event.watermarked_image_path ? (
                  <div className="bg-black border border-neutral-800 rounded overflow-hidden flex items-center justify-center p-2 relative group">
                     <div className="absolute inset-0 border border-indigo-500/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <img 
                           src={event.watermarked_image_path.startsWith('http') ? event.watermarked_image_path : `${API_BASE_URL}/data/${event.watermarked_image_path}`}
                       alt="Watermarked Event" 
                       className="max-w-full max-h-64 object-contain rounded brightness-90 contrast-125"
                     />
                  </div>
                ) : (
                  <div className="bg-black border border-neutral-800 rounded h-48 flex items-center justify-center text-neutral-600 text-[10px] uppercase font-bold tracking-widest">
                     IMAGE_DATA_UNAVAILABLE
                  </div>
                )}
                
                <div className="bg-black border border-neutral-800 rounded p-3">
                  <span className="text-neutral-500 text-[9px] uppercase font-bold tracking-widest block mb-1">Image Hash Signature</span>
                  <div className="font-mono text-[9px] text-neutral-300 break-all bg-neutral-900 p-2 rounded border border-neutral-800">
                    {event.image_hash || 'HASH_GENERATION_FAILED'}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
