import React from 'react';

const DEFAULT_EVENTS = [
  { id: 1, type: 'Unauthorized access', camera: 'Gate A', time: '08:42', severity: 'High' },
  { id: 2, type: 'Motion detected', camera: 'Lobby', time: '09:05', severity: 'Medium' },
  { id: 3, type: 'Verification success', camera: 'Entrance', time: '09:18', severity: 'Low' },
];

export default function EventTable({ events = DEFAULT_EVENTS }) {
  return (
    <div className="event-table">
      <h2>Recent events</h2>
      <div className="event-table__wrapper">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Camera</th>
              <th>Time</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.type}</td>
                <td>{event.camera}</td>
                <td>{event.time}</td>
                <td>{event.severity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

