import React from 'react';

export default function Login({ onLogin }) {
  const [formValues, setFormValues] = React.useState({ email: '', password: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin?.({
      name: formValues.email.split('@')[0] || 'Operator',
      email: formValues.email,
    });
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-card__eyebrow">Welcome back</p>
        <h1>Sign in to the surveillance platform</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input name="email" type="email" value={formValues.email} onChange={handleChange} />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={formValues.password}
              onChange={handleChange}
            />
          </label>
          <button type="submit">Sign in</button>
        </form>
      </section>
    </main>
  );
}

