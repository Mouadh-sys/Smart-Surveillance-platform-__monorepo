import React from 'react';

const CAMERAS = [
  { id: 'cam-01', name: 'Gate A', status: 'Online' },
  { id: 'cam-02', name: 'Lobby', status: 'Online' },
  { id: 'cam-03', name: 'Parking', status: 'Maintenance' },
];

export default function Cameras() {
  return (
    <section className="page">
      <h2>Cameras</h2>
      <div className="card-list">
        {CAMERAS.map((camera) => (
          <article key={camera.id} className="info-card">
            <h3>{camera.name}</h3>
            <p>{camera.status}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

