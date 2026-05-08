import React from 'react';
import StatCard from '../components/StatCard';
import EventTable from '../components/EventTable';

export default function Dashboard() {
  return (
    <section className="page">
      <div className="page__grid">
        <StatCard label="Active cameras" value="24" trend="+3 today" />
        <StatCard label="Open alerts" value="7" trend="-2 vs yesterday" />
        <StatCard label="Verified persons" value="128" trend="96% match rate" />
      </div>
      <EventTable />
    </section>
  );
}

