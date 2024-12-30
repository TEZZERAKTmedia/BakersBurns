import React, { useState, useEffect } from 'react';
import { userApi } from '../config/axios';
import { Link } from 'react-router-dom';

const OptPreferences = () => {
  const [preferences, setPreferences] = useState({
    isOptedInForPromotions: false,
    isOptedInForEmailUpdates: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch user's current preferences on mount
    const fetchPreferences = async () => {
      try {
        const response = await userApi.get('/user/preferences');
        setPreferences({
          isOptedInForPromotions: response.data.isOptedInForPromotions,
          isOptedInForEmailUpdates: response.data.isOptedInForEmailUpdates,
        });
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    };

    fetchPreferences();
  }, []);

  const handleCheckboxChange = (key) => (e) => {
    setPreferences({
      ...preferences,
      [key]: e.target.checked,
    });
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const response = await userApi.put('/user/preferences', preferences);
      if (response.status === 200) {
        setMessage('Preferences updated successfully!');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage('Error updating preferences. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>Manage Your Preferences</h2>
      <form>
        <div>
          <label>
            <input
              type="checkbox"
              checked={preferences.isOptedInForPromotions}
              onChange={handleCheckboxChange('isOptedInForPromotions')}
            />
            Opt-in for Promotions
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={preferences.isOptedInForEmailUpdates}
              onChange={handleCheckboxChange('isOptedInForEmailUpdates')}
            />
            Opt-in for Email Updates
          </label>
        </div>
      </form>
      <button
        onClick={handleSavePreferences}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          marginTop: '1rem',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
      {message && <p style={{ marginTop: '1rem', color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
      <div style={{ marginTop: '2rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
        <h3>Important Notice</h3>
        <p>
          If you wish to change your stance on accepting our{' '}
          <Link to="/settings">
            <strong>Privacy Policy</strong>
          </Link>{' '}
          or{' '}
          <Link to="/settings">
            <strong>Terms of Service</strong>
          </Link>, please note that this will result in the termination of your account. Certain records will be retained
          for legal reasons.
        </p>
        <p>
          Visit the <Link to="/settings">Settings Page</Link> to request a verification code for making sensitive changes.
        </p>
      </div>
    </div>
  );
};

export default OptPreferences;
