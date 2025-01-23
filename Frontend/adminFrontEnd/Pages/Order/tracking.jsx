import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { adminApi } from '../../config/axios';
import editIcon from '../../assets/Icons/edit.png';

const TrackingNumber = ({
  orderId,
  initialTrackingNumber = '',
  initialCarrier = '',
  onTrackingUpdated,
}) => {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);
  const [carrier, setCarrier] = useState(initialCarrier);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!trackingNumber || !carrier) {
      setError('Both carrier and tracking number are required.');
      return;
    }
    setError('');

    try {
      await adminApi.put(`/orders/update-tracking/${orderId}`, {
        trackingNumber,
        carrier,
      });

      if (onTrackingUpdated) {
        onTrackingUpdated(trackingNumber, carrier);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating tracking number:', error);
      setError('Failed to update tracking number. Please try again.');
    }
  };

  if (!trackingNumber && !isEditing) {
    return (
      <button onClick={() => setIsEditing(true)} style={styles.addTrackingButton}>
        Add Tracking Number
      </button>
    );
  }

  if (isEditing) {
    return (
      <div style={styles.trackingEditor}>
        <input
          type="text"
          placeholder="Tracking Number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          style={styles.input}
        />
        <select
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          style={styles.input}
        >
          <option value="">Select Carrier</option>
          <option value="UPS">UPS</option>
          <option value="FedEx">FedEx</option>
          <option value="USPS">USPS</option>
          <option value="DHL">DHL</option>
        </select>
        <button onClick={handleSave} style={styles.saveButton}>
          Save
        </button>
        <button onClick={() => setIsEditing(false)} style={styles.cancelButton}>
          Cancel
        </button>
        {error && <p style={styles.errorText}>{error}</p>}
      </div>
    );
  }

  const getTrackingLink = (carrier, trackingNumber) => {
    switch (carrier) {
      case 'UPS':
        return `https://www.ups.com/track?tracknum=${trackingNumber}`;
      case 'FedEx':
        return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`;
      case 'USPS':
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
      case 'DHL':
        return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
      default:
        return null;
    }
  };

  return (
    <div>
      <p style={{ padding: '10px' }}>
        <strong>Tracking Number:</strong> {trackingNumber}
        <button
          onClick={() => setIsEditing(true)}
          style={styles.editButton}
          title="Edit"
        >
          <img
            src={editIcon} // Replace this with the correct path to your PNG
            alt="Edit"
            style={styles.icon}
            />
        </button>
      </p>
      <a
        href={getTrackingLink(carrier, trackingNumber)}
        target="_blank"
        rel="noopener noreferrer"
        style={styles.link}
      >
        Track your order
      </a>
    </div>
  );
};

TrackingNumber.propTypes = {
  orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  initialTrackingNumber: PropTypes.string,
  initialCarrier: PropTypes.string,
  onTrackingUpdated: PropTypes.func.isRequired,
};

const styles = {
  addTrackingButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '5px 10px',
    cursor: 'pointer',
  },
  trackingEditor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  input: {
    padding: '5px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  saveButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '5px 10px',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '5px 10px',
    cursor: 'pointer',
  },
  errorText: {
    color: 'red',
    fontSize: '0.9rem',
  },
  icon: {
    width: '20px',
    height: '20px',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    cursor: 'pointer',
    backgroundColor: 'black',
    padding: '5px',
    borderRadius: '10px',
  },
  editButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '1rem',
    marginLeft: '10px',
  },
};

export default TrackingNumber;
