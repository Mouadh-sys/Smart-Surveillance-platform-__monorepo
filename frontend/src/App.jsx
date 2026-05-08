import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import Persons from './pages/Persons';
import Cameras from './pages/Cameras';
import Events from './pages/Events';
import Alerts from './pages/Alerts';
import Verification from './pages/Verification';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'monitoring', label: 'Live Monitoring' },
  { key: 'persons', label: 'Persons' },
  { key: 'cameras', label: 'Cameras' },
  { key: 'events', label: 'Events' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'verification', label: 'Verification' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
];

const PAGE_COMPONENTS = {
  dashboard: Dashboard,
  monitoring: LiveMonitoring,
  persons: Persons,
  cameras: Cameras,
  events: Events,
  alerts: Alerts,
  verification: Verification,
  reports: Reports,
  settings: Settings,
};

function AppShell() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [activePage, setActivePage] = React.useState('dashboard');

  const handleLogin = (values) => {
    login(values);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    logout();
    setActivePage('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const ActivePage = PAGE_COMPONENTS[activePage] || Dashboard;

  return (
    <DashboardLayout
      title="Operations center"
      userName={user?.name || 'Operator'}
      sidebarItems={NAV_ITEMS}
      activeItem={activePage}
      onNavigate={setActivePage}
      onLogout={handleLogout}
    >
      <ActivePage />
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

