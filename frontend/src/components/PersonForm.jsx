import React from 'react';

const INITIAL_VALUES = {
  fullName: '',
  role: '',
  identifier: '',
  notes: '',
};

export default function PersonForm({ initialValues = INITIAL_VALUES, onSubmit, submitLabel = 'Save person' }) {
  const [formValues, setFormValues] = React.useState(initialValues);

  React.useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(formValues);
  };

  return (
    <form className="person-form" onSubmit={handleSubmit}>
      <label>
        Full name
        <input name="fullName" value={formValues.fullName} onChange={handleChange} />
      </label>
      <label>
        Role
        <input name="role" value={formValues.role} onChange={handleChange} />
      </label>
      <label>
        Identifier
        <input name="identifier" value={formValues.identifier} onChange={handleChange} />
      </label>
      <label>
        Notes
        <textarea name="notes" value={formValues.notes} onChange={handleChange} rows="4" />
      </label>
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

