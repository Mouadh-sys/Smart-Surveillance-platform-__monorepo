import React from 'react';
import AlertCard from '../components/AlertCard';

export default function Alerts() {
  return (
    <section className="page">
      <h2>Alerts</h2>
      <div className="page__stack">
        <AlertCard
          title="Camera offline"
          severity="High"
          message="The parking lot camera lost connection five minutes ago."
          timestamp="09:22"
        />
        <AlertCard
          title="Suspected duplicate"
          severity="Medium"
          message="Potential duplicate face match found in the visitor queue."
          timestamp="09:35"
        />
      </div>
    </section>
  );
}

