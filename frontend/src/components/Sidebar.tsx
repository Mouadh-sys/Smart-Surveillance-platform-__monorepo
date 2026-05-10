import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MonitorPlay, 
  History, 
  BellRing, 
  Users, 
  Video, 
  ShieldCheck, 
  BarChart, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export const Sidebar: React.FC<{ isOpen: boolean, closeMobile: () => void }> = ({ isOpen, closeMobile }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/monitoring', label: 'Live Monitoring', icon: MonitorPlay },
    { to: '/events', label: 'Events', icon: History },
    { to: '/alerts', label: 'Alerts', icon: BellRing },
    { to: '/persons', label: 'Persons', icon: Users },
    { to: '/cameras', label: 'Cameras', icon: Video },
    { to: '/verification', label: 'Verification', icon: ShieldCheck },
    { to: '/reports', label: 'Reports', icon: BarChart },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}
      
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#0d0d0f] text-neutral-300 border-r border-neutral-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3 border-b border-neutral-800">
          <div className="w-8 h-8 bg-indigo-600 shrink-0 rounded flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-white uppercase text-sm">SmartSurv</span>
          <button className="lg:hidden ml-auto text-neutral-500 hover:text-white" onClick={closeMobile}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-2 pb-2 pt-2">Menu</div>
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={closeMobile}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors group",
                    isActive 
                      ? "bg-neutral-800 text-white" 
                      : "text-neutral-500 hover:bg-neutral-800 hover:text-white"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="text-[12px] uppercase tracking-wider font-semibold">{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-800 bg-[#0a0a0c]">
          <button 
            onClick={async () => {
              closeMobile();
              await logout();
            }}
            className="flex items-center gap-3 text-neutral-500 hover:text-white w-full px-3 py-2 rounded-md transition-colors hover:bg-neutral-800"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};
