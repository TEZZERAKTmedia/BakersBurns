import React from 'react';

const RangeInput = ({ label, value, min, max, step, onChange }) => (
  <div className="input-group">
    <label>{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <span>{value}</span>
  </div>
);

export default RangeInput;
