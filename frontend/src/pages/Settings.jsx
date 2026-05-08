import React from 'react';

export default function Settings() {
  return (
    <section className="page">
      <h2>Settings</h2>
      <form className="simple-form">
        <label>
          Organization name
          <input type="text" defaultValue="Smart Surveillance" />
        </label>
        <label>
          Notification email
          <input type="email" defaultValue="security@example.com" />
        </label>
        <button type="submit">Save settings</button>
      </form>
    </section>
  );
}

