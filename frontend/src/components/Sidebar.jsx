import React from 'react';

const DEFAULT_ITEMS = [
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

export default function Sidebar({ items = DEFAULT_ITEMS, activeItem, onNavigate }) {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar__brand">Smart Surveillance</div>
      <nav>
        <ul className="sidebar__menu">
          {items.map((item) => (
            <li key={item.key} className="sidebar__item">
              <button
                type="button"
                className={`sidebar__button${activeItem === item.key ? ' is-active' : ''}`}
                onClick={() => onNavigate?.(item.key)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

