import React from 'react';
import '../../Componentcss/sidebar.css';

const CheckboxInput = ({ label, checked, onChange }) => (
  <div className="input-group">
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  </div>
);

export default CheckboxInput;
