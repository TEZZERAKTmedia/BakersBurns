import React, { useState } from 'react';
import PrivacyPolicy from './Privacy&Terms/privacyPolicy';
import TermsOfService from './Privacy&Terms/termsOfService';
import '../Componentcss/PrivacyPolicyAndToS.css';

const OptInModal = ({ onAccept, onClose }) => {
  const [childModalContent, setChildModalContent] = useState(null);
  const [preferences, setPreferences] = useState({
    acceptedTerms: false,
    acceptedPrivacy: false,
    isOptedInForPromotions: false,
    isOptedInForEmailUpdates: false,
  });

  const handleToggle = (key) => (e) => {
    setPreferences({ ...preferences, [key]: e.target.checked });
  };

  const handleOpenChildModal = (content) => {
    setChildModalContent(content);
  };

  const handleCloseChildModal = () => {
    setChildModalContent(null);
  };

  const handleAcceptAndProceed = (e) => {
    e.preventDefault();
    console.log('handleAcceptAndProceed invoked with preferences:', preferences);
    if (!preferences.acceptedTerms || !preferences.acceptedPrivacy) {
      alert('You must accept the Privacy Policy and Terms of Service to proceed.');
      return;
    }
    // Pass preferences to the parent component via onAccept
    onAccept(preferences);
  };

  return (
    <div>
      <div className="google-modal-overlay">
        <div className="google-modal-content">
          <div
            style={{
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.6)',
              padding: '20px',
              backgroundColor: 'black',
              color: 'white',
            }}
          >
            <h3>Welcome! Please Review and Set Your Preferences</h3>
          </div>
          <form>
            {/* Terms of Service Checkbox */}
            <div
              className="check-boxes"
              style={{
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.6)',
                padding: '10px',
              }}
            >
              <input
                type="checkbox"
                id="termsOfService"
                checked={preferences.acceptedTerms}
                onChange={handleToggle('acceptedTerms')}
                className="checkbox-input"
              />
              <label htmlFor="termsOfService" className="checkbox-label">
                <p style={{ color: 'black' }}></p>
                  I agree to the{' '}
                  <span
                    onClick={() => handleOpenChildModal(<TermsOfService />)}
                    className="modal-link"
                  >
                    <div
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '10px',
                        margin: '10px',
                      }}
                    >
                      Terms of Service
                    </div>
                  </span>
                
              </label>
            </div>

            {/* Privacy Policy Checkbox */}
            <div
              className="check-boxes"
              style={{
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.6)',
                padding: '10px',
              }}
            >
              <input
                type="checkbox"
                id="privacyPolicy"
                checked={preferences.acceptedPrivacy}
                onChange={handleToggle('acceptedPrivacy')}
                className="checkbox-input"
              />
              <label htmlFor="privacyPolicy" className="checkbox-label">
                <p style={{ color: 'black' }}></p>
                  I agree to the{' '}
                  <span
                    onClick={() => handleOpenChildModal(<PrivacyPolicy />)}
                    className="modal-link"
                  >
                    <div
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '10px',
                        margin: '10px',
                      }}
                    >
                      Privacy Policy
                    </div>
                  </span>
                
              </label>
            </div>

            {/* Opt-in for Promotions */}
            <div
              className="check-boxes"
              style={{
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.6)',
                padding: '10px',
              }}
            >
              <input
                type="checkbox"
                id="optInPromotions"
                checked={preferences.isOptedInForPromotions}
                onChange={handleToggle('isOptedInForPromotions')}
                className="checkbox-input"
              />
              <label htmlFor="optInPromotions" className="checkbox-label">
                <p style={{ color: 'black' }}>Opt-in for Promotions</p>
              </label>
            </div>

            {/* Opt-in for Email Updates */}
            <div
              className="check-boxes"
              style={{
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.6)',
                padding: '10px',
                marginBottom: '50px',
              }}
            >
              <input
                type="checkbox"
                id="optInEmailUpdates"
                checked={preferences.isOptedInForEmailUpdates}
                onChange={handleToggle('isOptedInForEmailUpdates')}
                className="checkbox-input"
              />
              <label htmlFor="optInEmailUpdates" className="checkbox-label">
                <p style={{ color: 'black' }}>Opt-in for Email Updates</p>
              </label>
            </div>
            <div className="check-boxes">
              <button onClick={handleAcceptAndProceed} className="google-modal-close-button">
                Accept and Proceed
              </button>
              <button onClick={onClose} className="google-modal-close-button">
                Close
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Child Modal */}
      {childModalContent && (
        <div className="google-modal-overlay">
          <div className="google-modal-content">
            {childModalContent}
            <button onClick={handleCloseChildModal} className="google-modal-close-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptInModal;
