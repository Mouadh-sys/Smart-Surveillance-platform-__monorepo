import React, { useEffect, useState } from 'react';
import { Video, Plus, Trash2, Edit, Play, Square } from 'lucide-react';
import { camerasApi } from '../api/camerasApi';
import { monitoringApi } from '../api/monitoringApi';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function Cameras() {
  const [cameras, setCameras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const data = await camerasApi.getCameras();
      setCameras(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this camera?")) {
       try {
         await camerasApi.deleteCamera(id);
         fetchCameras();
       } catch (error) {
         console.error(error);
       }
    }
  };

  const toggleStatus = async (id: number, isActive: boolean) => {
     try {
        if (isActive) {
           await monitoringApi.stopCamera(id);
        } else {
           await monitoringApi.startCamera(id);
        }
        await fetchCameras();
     } catch(e) {
        console.error(e);
     }
  };

  if (loading && cameras.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-[12px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Video className="w-4 h-4 text-indigo-500" /> Camera Management
          </h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Configure and monitor surveillance endpoints.</p>
        </div>
        <button className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors">
           <Plus className="w-3 h-3" />
           <span>Add Node</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {cameras.length === 0 ? (
            <div className="col-span-full text-center p-8 text-neutral-600 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] uppercase font-bold tracking-widest">
               No node configured. Engage "Add Node" protocol.
            </div>
         ) : cameras.map((camera) => (
            <div key={camera.id} className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col hover:border-neutral-700 transition-colors">
               <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded bg-black border ${camera.is_active ? 'border-emerald-500/30 text-emerald-500' : 'border-neutral-800 text-neutral-600'}`}>
                           <Video className="w-4 h-4" />
                        </div>
                        <div>
                           <h3 className="text-[12px] font-bold text-white tracking-widest uppercase">{camera.name}</h3>
                           <p className="text-[10px] text-neutral-500 font-mono mt-0.5">ID:{camera.camera_code}</p>
                        </div>
                     </div>
                     <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase border ${camera.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-neutral-800 border-neutral-700 text-neutral-500'}`}>
                        {camera.is_active ? 'ONLINE' : 'OFFLINE'}
                     </span>
                  </div>
                  
                  <div className="space-y-2 text-[10px] text-neutral-400 font-mono uppercase">
                     <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                        <span className="text-neutral-500">Location</span>
                        <span className="font-bold text-neutral-300 text-right">{camera.location || 'UNASSIGNED'}</span>
                     </div>
                     <div className="flex justify-between pt-1">
                        <span className="text-neutral-500">Source feed</span>
                        <span className="truncate max-w-[150px] text-right cursor-help text-indigo-400" title={camera.source}>{camera.source}</span>
                     </div>
                  </div>
               </div>
               
               <div className="bg-black border-t border-neutral-800 p-2.5 flex justify-between items-center">
                  <div className="flex gap-2">
                     <button className="p-1 text-neutral-500 hover:text-white transition-colors" title="Modify Configuration">
                        <Edit className="w-3.5 h-3.5" />
                     </button>
                     <button onClick={() => handleDelete(camera.id)} className="p-1 text-rose-500 hover:text-rose-400 transition-colors" title="Decommission Node">
                        <Trash2 className="w-3.5 h-3.5" />
                     </button>
                  </div>
                  <button 
                     onClick={() => toggleStatus(camera.id, camera.is_active)}
                     className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] uppercase font-bold tracking-widest transition-colors ${
                        camera.is_active 
                        ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'
                     }`}
                  >
                     {camera.is_active ? (
                        <><Square className="w-3 h-3" /> Terminate</>
                     ) : (
                        <><Play className="w-3 h-3" /> Initialize</>
                     )}
                  </button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
