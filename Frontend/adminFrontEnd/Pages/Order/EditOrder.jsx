import React from 'react';
import PropTypes from 'prop-types';

const EditOrderForm = ({
  editingOrder,
  setEditingOrder,
  updateOrder,
  deleteOrder,
  onCancel,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingOrder((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      {['quantity', 'shippingAddress', 'billingAddress', 'trackingNumber', 'total'].map((field) => (
        <div key={field} style={styles.inputGroup}>
          <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
          <input
            type="text"
            name={field}
            value={editingOrder[field] || ''}
            onChange={handleInputChange}
            style={styles.input}
          />
        </div>
      ))}
      <div style={styles.inputGroup}>
        <label style={styles.formLabel}>Carrier:</label>
        <select
          name="carrier"
          value={editingOrder.carrier || ''}
          onChange={handleInputChange}
          style={styles.input}
        >
          <option value="">Select Carrier</option>
          <option value="UPS">UPS</option>
          <option value="FedEx">FedEx</option>
          <option value="USPS">USPS</option>
          <option value="DHL">DHL</option>
        </select>
      </div>
      <div style={styles.buttonContainer}>
        <button onClick={() => deleteOrder(editingOrder.id)} style={styles.closeButton}>
          Delete
        </button>
        <button onClick={() => updateOrder(editingOrder.id)} style={styles.createButton}>
          Save
        </button>
        <button onClick={onCancel} style={styles.closeButton}>
          Cancel
        </button>
      </div>
    </div>
  );
};

EditOrderForm.propTypes = {
  editingOrder: PropTypes.object.isRequired,
  setEditingOrder: PropTypes.func.isRequired,
  updateOrder: PropTypes.func.isRequired,
  deleteOrder: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

const styles = {
  inputGroup: {
    marginBottom: '10px',
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  formLabel: {
    display: 'block',
    marginBottom: '5px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  createButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '10px',
    cursor: 'pointer',
  },
  closeButton: {
    backgroundColor: 'red',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '10px',
    cursor: 'pointer',
  },
};

export default EditOrderForm;
