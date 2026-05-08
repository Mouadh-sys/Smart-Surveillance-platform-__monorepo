import React from 'react';
import StatCard from '../components/StatCard';

export default function Reports() {
  return (
    <section className="page">
      <h2>Reports</h2>
      <div className="page__grid">
        <StatCard label="Incidents this week" value="18" />
        <StatCard label="Average response time" value="3m 42s" />
        <StatCard label="Archived reports" value="56" />
      </div>
      <p>
        This section can host downloadable summaries, audit logs, and operational reports.
      </p>
    </section>
  );
}

