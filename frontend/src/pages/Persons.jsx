import React from 'react';
import PersonForm from '../components/PersonForm';

export default function Persons() {
  const handleSubmit = (values) => {
    console.log('Person submitted:', values);
  };

  return (
    <section className="page">
      <h2>Person registry</h2>
      <PersonForm onSubmit={handleSubmit} />
    </section>
  );
}

