import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/constants';
import axiosClient from '../api/axiosClient';

export default function Settings() {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const { data } = await axiosClient.get('/health', { timeout: 3000 });
        setHealth(data);
      } catch (e) {
        console.error('Health check failed', e);
        setHealth({ status: 'unreachable' });
      } finally {
        setChecking(false);
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-[12px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-indigo-500" /> Platform Configuration
          </h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">System connection diagnostics and operator profile.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* System Config */}
         <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col">
            <div className="p-3 border-b border-neutral-800 bg-neutral-800/30">
               <h2 className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">System Core</h2>
            </div>
            <div className="p-4 space-y-4">
               <div>
                 <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">API Base URI</p>
                 <div className="bg-black border border-neutral-800 rounded p-3 text-neutral-400 font-mono text-xs flex items-center justify-between overflow-x-auto">
                    {API_BASE_URL}
                 </div>
               </div>
               
               <div>
                 <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Telemetry Health</p>
                 <div className="bg-black border border-neutral-800 rounded p-3 flex items-center justify-between text-xs font-mono uppercase tracking-widest font-bold">
                    {checking ? (
                       <span className="text-neutral-500 animate-pulse">Running Diagnostics...</span>
                    ) : health?.status === 'ok' || health?.status === 'healthy' ? (
                       <div className="flex items-center text-emerald-500">
                          <CheckCircle className="w-4 h-4 mr-2" /> ONLINE & HEALTHY
                       </div>
                    ) : (
                       <div className="flex items-center text-rose-500">
                          <XCircle className="w-4 h-4 mr-2" /> OFFLINE / CRITICAL
                       </div>
                    )}
                 </div>
               </div>
            </div>
         </div>

         {/* Account Info */}
         <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col">
            <div className="p-3 border-b border-neutral-800 bg-neutral-800/30">
               <h2 className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Operator Profile</h2>
            </div>
            <div className="p-4 space-y-4">
               <div>
                 <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Designation</p>
                 <div className="text-white font-mono text-sm">{user?.username || 'admin'}</div>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Clearance Level</p>
                 <div className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded inline-block font-bold text-[10px] uppercase tracking-widest">
                    {user?.role || 'Administrator'}
                 </div>
               </div>
               
               <div className="pt-4 border-t border-neutral-800">
                 <button 
                   onClick={logout}
                   className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 px-4 py-2 rounded text-[10px] font-bold uppercase transition-colors"
                 >
                   <LogOut className="w-4 h-4" /> Terminate Session
                 </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
