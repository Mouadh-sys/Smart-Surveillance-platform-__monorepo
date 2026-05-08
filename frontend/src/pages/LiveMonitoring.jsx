import React from 'react';
import CameraStream from '../components/CameraStream';
import AlertCard from '../components/AlertCard';

export default function LiveMonitoring() {
  return (
    <section className="page page--split">
      <CameraStream title="Entrance camera" status="Live" />
      <div className="page__stack">
        <AlertCard
          title="Motion detected"
          severity="High"
          message="Unusual movement has been detected near the north entrance."
        />
        <AlertCard
          title="Verification passed"
          severity="Low"
          message="Staff member verification completed successfully."
        />
      </div>
    </section>
  );
}

