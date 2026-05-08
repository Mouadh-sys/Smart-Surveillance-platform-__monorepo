import React from 'react';

export default function AlertCard({ title, message, severity = 'Medium', timestamp }) {
  return (
    <article className={`alert-card alert-card--${severity.toLowerCase()}`}>
      <div className="alert-card__header">
        <h3>{title}</h3>
        <span>{severity}</span>
      </div>
      <p>{message}</p>
      {timestamp ? <small>{timestamp}</small> : null}
    </article>
  );
}

