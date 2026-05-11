import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Upload, Fingerprint, ShieldCheck, FileCheck } from 'lucide-react';
import { verificationApi } from '../api/verificationApi';
import { StatusBadge } from '../components/StatusBadge';
import { API_BASE_URL } from '../utils/constants';

export default function Verification() {
  const [searchParams] = useSearchParams();
  const [eventCode, setEventCode] = useState(searchParams.get('code') || '');
  
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const [recognizeFile, setRecognizeFile] = useState<File | null>(null);
  const [recognizeResult, setRecognizeResult] = useState<any>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [recognizeError, setRecognizeError] = useState('');

   const [modelStatus, setModelStatus] = useState<any>(null);
   const [reloading, setReloading] = useState(false);

   useEffect(() => {
     fetchModelStatus();
   }, []);

   const fetchModelStatus = async () => {
     try {
       const data = await verificationApi.getModelStatus();
       setModelStatus(data);
     } catch (e) {
       console.error(e);
     }
   };

   const handleReloadModel = async () => {
     setReloading(true);
     try {
       const data = await verificationApi.reloadModel();
       setModelStatus(data);
     } catch (e) {
       console.error('Failed to reload model', e);
     } finally {
       setReloading(false);
     }
   };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventCode) return;
    try {
      setVerifying(true);
      setVerifyError('');
      const data = await verificationApi.verifyAuthenticity(eventCode);
      setVerifyResult(data);
    } catch (e: any) {
      setVerifyError(e.response?.data?.detail || 'Verification failed');
      setVerifyResult(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleRecognize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recognizeFile) return;
    try {
      setRecognizing(true);
      setRecognizeError('');
      const formData = new FormData();
      formData.append('file', recognizeFile);
      const data = await verificationApi.recognizeImage(formData);
      setRecognizeResult(data);
    } catch (e: any) {
      setRecognizeError(e.response?.data?.detail || 'Recognition failed');
      setRecognizeResult(null);
    } finally {
      setRecognizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-[12px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" /> Forensic Verification
          </h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Verify image cryptographics and perform ad-hoc face recognition.</p>
        </div>
        <div className="bg-black border border-neutral-800 px-3 py-1.5 rounded flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Classifier:</span>
            <span className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${modelStatus?.loaded ? 'text-emerald-500' : 'text-rose-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${modelStatus?.loaded ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
              {modelStatus?.loaded ? 'LOADED' : 'UNLOADED'}
            </span>
          </div>
          <button
            onClick={handleReloadModel}
            disabled={reloading}
            className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 rounded transition-colors disabled:opacity-50"
          >
            {reloading ? 'Reloading...' : 'Reload'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Verification Panel */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col">
          <div className="p-3 border-b border-neutral-800 bg-neutral-800/30">
             <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
               <Fingerprint className="w-3.5 h-3.5 text-neutral-500" /> Cryptographic Verification
             </h2>
          </div>
          <div className="p-4 flex-1 flex flex-col">
             <form onSubmit={handleVerify} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value)}
                  placeholder="Enter Event Code (e.g. EVT-1234)" 
                  className="flex-1 bg-black border border-neutral-800 rounded px-3 py-1.5 text-[10px] text-white focus:ring-1 focus:ring-indigo-500 font-mono uppercase focus:outline-none"
                  required
                />
                <button 
                  type="submit" 
                  disabled={verifying}
                  className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  {verifying ? 'VERIFYING...' : 'VERIFY'}
                </button>
             </form>

             {verifyError && <div className="text-rose-400 text-[10px] font-mono uppercase mb-4 p-2 bg-rose-500/10 rounded border border-rose-500/20">{verifyError}</div>}

             {verifyResult ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 flex-1">
                   <div className="flex justify-between items-center bg-black border border-neutral-800 p-3 rounded">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Authenticity Engine</span>
                      <StatusBadge status={verifyResult.is_authentic ? 'VERIFIED_AUTHENTIC' : 'VERIFIED_TAMPERED'} />
                   </div>

                   <div className="bg-black border border-neutral-800 p-3 rounded space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                         <span className="text-neutral-500">Hash Integrity</span>
                         <span className={verifyResult.checks?.hash_integrity?.passed ? 'text-emerald-400' : 'text-rose-400'}>
                            {verifyResult.checks?.hash_integrity?.passed ? 'VALIDATED' : 'MISMATCH_DETECTED'}
                         </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase border-t border-neutral-800/50 pt-2">
                         <span className="text-neutral-500">Visible Watermark</span>
                         <span className={verifyResult.checks?.visible_watermark?.passed ? 'text-emerald-400' : 'text-rose-400'}>
                            {verifyResult.checks?.visible_watermark?.passed ? 'POSITIVE' : 'NEGATIVE'}
                         </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase border-t border-neutral-800/50 pt-2">
                         <span className="text-neutral-500">Invisible Watermark</span>
                         <span className={verifyResult.checks?.invisible_watermark?.passed ? 'text-emerald-400' : 'text-rose-400'}>
                            {verifyResult.checks?.invisible_watermark?.passed ? 'POSITIVE' : 'NEGATIVE'}
                         </span>
                      </div>
                      {verifyResult.checks?.invisible_watermark?.payload && (
                         <div className="border-t border-neutral-800/50 pt-2 mt-2">
                            <span className="text-neutral-600 text-[9px] font-bold block mb-1 uppercase tracking-widest">Extracted Payload</span>
                            <div className="font-mono text-[9px] text-neutral-400 bg-neutral-900 border border-neutral-800 p-2 rounded break-all">
                               {verifyResult.checks.invisible_watermark.payload}
                            </div>
                         </div>
                      )}
                      {verifyResult.verdict && (
                         <div className="border-t border-neutral-800/50 pt-2 mt-2">
                            <span className="text-neutral-600 text-[9px] font-bold block mb-1 uppercase tracking-widest">Verdict</span>
                            <div className={`font-mono text-[9px] p-2 rounded border ${verifyResult.is_authentic ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' : 'text-rose-400 bg-rose-500/5 border-rose-500/20'}`}>
                               {verifyResult.verdict}
                            </div>
                         </div>
                      )}
                   </div>
                </div>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 space-y-3 min-h-[200px]">
                   <ShieldCheck className="w-8 h-8 opacity-20" />
                   <p className="text-[10px] uppercase font-bold tracking-widest">Awaiting event code input...</p>
                </div>
             )}
          </div>
        </div>

        {/* Ad-hoc Recognition Panel */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col">
          <div className="p-3 border-b border-neutral-800 bg-neutral-800/30">
             <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
               <FileCheck className="w-3.5 h-3.5 text-neutral-500" /> Ad-Hoc Recognition
             </h2>
          </div>
          <div className="p-4 flex-1 flex flex-col">
             <form onSubmit={handleRecognize} className="space-y-4 mb-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Upload Source File</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setRecognizeFile(e.target.files?.[0] || null)}
                    className="block w-full text-[10px] font-mono text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[9px] file:font-bold file:uppercase file:tracking-widest file:bg-neutral-800 file:text-neutral-300 hover:file:bg-neutral-700 transition-colors focus:outline-none"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={recognizing || !recognizeFile}
                  className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  <Upload className="w-3 h-3" /> {recognizing ? 'PROCESSING...' : 'RUN ANALYSIS'}
                </button>
             </form>

             {recognizeError && <div className="text-rose-400 text-[10px] font-mono uppercase mb-4 p-2 bg-rose-500/10 rounded border border-rose-500/20">{recognizeError}</div>}

             {recognizeResult ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 flex-1">
                   <div className="bg-black border border-neutral-800 p-3 rounded flex items-start gap-4">
                      {recognizeResult.watermarked_image_path ? (
                         <img src={`${API_BASE_URL}/${recognizeResult.watermarked_image_path}`} alt="Analysis" className="w-20 h-20 object-cover rounded border border-neutral-800" />
                      ) : (
                         <div className="w-20 h-20 bg-neutral-900 rounded border border-neutral-800 flex items-center justify-center text-neutral-600 text-[9px] font-bold uppercase tracking-widest">No Image</div>
                      )}
                      
                      <div className="flex-1 space-y-2">
                         <div className="flex justify-between items-start">
                            <div>
                               <h3 className="text-[12px] text-white font-bold uppercase tracking-widest">{recognizeResult.person_name || 'UNKNOWN_SUBJECT'}</h3>
                               <p className="text-neutral-500 text-[9px] font-mono uppercase mt-0.5">REF: {recognizeResult.event_code || 'N/A'}</p>
                            </div>
                            <StatusBadge status={recognizeResult.status} className="text-[9px]" />
                         </div>
                         <div className="text-[10px] font-mono uppercase mt-2 pt-2 border-t border-neutral-800/50 flex justify-between">
                            <span className="text-neutral-500">Confidence</span>
                            <span className="text-neutral-300">{(recognizeResult.confidence * 100).toFixed(1)}%</span>
                         </div>
                      </div>
                   </div>
                </div>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 space-y-3 min-h-[200px]">
                   <Upload className="w-8 h-8 opacity-20" />
                   <p className="text-[10px] uppercase font-bold tracking-widest">Awaiting source file...</p>
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
