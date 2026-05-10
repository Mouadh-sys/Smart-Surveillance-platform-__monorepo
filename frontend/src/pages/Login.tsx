import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 text-neutral-300 font-sans">
      <div className="w-full max-w-sm bg-neutral-900 rounded-lg p-6 border border-neutral-800 z-10 overflow-hidden">
        <div className="flex flex-col items-center mb-6 border-b border-neutral-800 pb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-sm font-bold text-white tracking-wide uppercase">Sentinel OS</h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Authentication Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs p-3 rounded flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Operator ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-neutral-600" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black border border-neutral-800 text-neutral-300 text-sm rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 p-2 transition-colors font-mono"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Passcode</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-neutral-600" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black border border-neutral-800 text-neutral-300 text-sm rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 p-2 transition-colors font-mono"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white bg-indigo-600 hover:bg-indigo-700 flex justify-center items-center rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Authenticating...' : 'Initialize Session'}
          </button>
        </form>
      </div>
    </div>
  );
};
