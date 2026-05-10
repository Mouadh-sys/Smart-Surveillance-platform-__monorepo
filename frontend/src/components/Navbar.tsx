import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="h-14 border-b border-neutral-800 px-6 flex items-center justify-between bg-[#0a0a0c] shrink-0 z-30">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-neutral-500 hover:text-white mr-4 p-1"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-sm font-semibold tracking-wide text-white uppercase hidden sm:block">Control Center / Terminal</h1>
      </div>

      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
        <button className="p-1.5 text-neutral-400 hover:text-white relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-neutral-800">
          <div className="hidden md:block text-right min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.username || 'Admin'}</p>
            <p className="text-[10px] text-neutral-500 truncate">{user?.role || 'Administrator'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold text-white uppercase">
            {(user?.username?.[0] || 'A')}
          </div>
        </div>
      </div>
    </header>
  );
};
