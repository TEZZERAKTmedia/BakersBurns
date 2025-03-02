import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { adminApi } from '../../config/axios';
import editIcon from '../../assets/Icons/edit.webp';

import './tracking.css'; // <-- Import the new CSS

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

  if (!trackingNumber && !isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="tn-add-button"
      >
        Add Tracking Number
      </button>
    );
  }

  if (isEditing) {
    return (
      <div className="tn-tracking-editor">
        <input
          type="text"
          placeholder="Tracking Number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="tn-input"
        />
        <select
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          className="tn-input"
        >
          <option value="">Select Carrier</option>
          <option value="UPS">UPS</option>
          <option value="FedEx">FedEx</option>
          <option value="USPS">USPS</option>
          <option value="DHL">DHL</option>
        </select>
        <button
          onClick={handleSave}
          className="tn-save-button"
        >
          Save
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="tn-cancel-button"
        >
          Cancel
        </button>
        {error && <p className="tn-error-text">{error}</p>}
      </div>
    );
  }

  // If we have a tracking number and we're not editing, show read-only view
  return (
    <div className="tn-tracking-readonly">
      <p className="tn-tracking-text">
        <strong>Tracking Number:</strong> {trackingNumber}
        <button
          onClick={() => setIsEditing(true)}
          className="tn-edit-button"
          title="Edit"
        >
          <img
            src={editIcon}
            alt="Edit"
            className="tn-icon"
          />
        </button>
      </p>
      <a
        href={getTrackingLink(carrier, trackingNumber)}
        target="_blank"
        rel="noopener noreferrer"
        className="tn-link"
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

export default TrackingNumber;
