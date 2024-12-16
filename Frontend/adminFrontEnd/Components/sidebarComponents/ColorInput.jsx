import React from 'react';
import '../../Componentcss/sidebar.css';

const ColorInput = ({ label, value, onChange }) => (
  <div className="input-group">
    <label>{label}</label>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <span>{value}</span>
  </div>
);

export default ColorInput;
