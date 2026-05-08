import React from 'react';

export default function Navbar({ title = 'Dashboard', userName = 'Operator', onLogout }) {
  return (
    <header className="navbar">
      <div>
        <p className="navbar__eyebrow">Security operations</p>
        <h1 className="navbar__title">{title}</h1>
      </div>
      <div className="navbar__actions">
        <span className="navbar__user">{userName}</span>
        {onLogout ? (
          <button type="button" className="navbar__logout" onClick={onLogout}>
            Logout
          </button>
        ) : null}
      </div>
    </header>
  );
}

