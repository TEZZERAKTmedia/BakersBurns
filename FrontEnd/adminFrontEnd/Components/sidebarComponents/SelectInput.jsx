import React from 'react';

const SelectInput = ({ label, value, options, onChange }) => (
  <div className="input-group">
    <label>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default SelectInput;
