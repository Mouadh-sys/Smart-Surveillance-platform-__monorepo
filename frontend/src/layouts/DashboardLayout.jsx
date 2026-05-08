import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout({
  children,
  title,
  userName,
  sidebarItems,
  activeItem,
  onNavigate,
  onLogout,
}) {
  return (
    <div className="dashboard-layout">
      <Sidebar items={sidebarItems} activeItem={activeItem} onNavigate={onNavigate} />
      <div className="dashboard-layout__content">
        <Navbar title={title} userName={userName} onLogout={onLogout} />
        <main className="dashboard-layout__main">{children}</main>
      </div>
    </div>
  );
}

