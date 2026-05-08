import React from 'react';

export default function StatCard({ label, value, trend, note }) {
  return (
    <article className="stat-card">
      <p className="stat-card__label">{label}</p>
      <h3 className="stat-card__value">{value}</h3>
      {trend ? <p className="stat-card__trend">{trend}</p> : null}
      {note ? <p className="stat-card__note">{note}</p> : null}
    </article>
  );
}

