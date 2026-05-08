import React from 'react';

export default function Verification() {
  const [result, setResult] = React.useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    setResult('Verification submitted successfully.');
  };

  return (
    <section className="page">
      <h2>Verification</h2>
      <form className="simple-form" onSubmit={handleSubmit}>
        <label>
          Person identifier
          <input type="text" placeholder="Enter person ID" />
        </label>
        <button type="submit">Run verification</button>
      </form>
      {result ? <p>{result}</p> : null}
    </section>
  );
}

