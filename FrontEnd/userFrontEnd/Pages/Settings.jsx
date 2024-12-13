import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../config/axios';
import '../Pagecss/Settings.css';
import { useNotification } from '../Components/notification/notification'; // Import notification contex

const Settings = () => {
  const [formData, setFormData] = useState({
    newEmail: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    upperLowerCase: false,
    specialChar: false,
    digit: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { showNotification } = useNotification(); // Use notification context

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    const length = formData.password.length >= 8;
    const upperLowerCase = /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password);
    const specialChar = /(?=.*[@$!%*?&-])/.test(formData.password);
    const digit = /(?=.*\d)/.test(formData.password);

    setPasswordRequirements({
      length,
      upperLowerCase,
      specialChar,
      digit
    });
  }, [formData.password]);

  const handlePasswordChangeRequest = async (e) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }
  
    const isValidPassword = passwordRequirements.length &&
      passwordRequirements.upperLowerCase &&
      passwordRequirements.specialChar &&
      passwordRequirements.digit;
  
    if (!isValidPassword) {
      showNotification('Password must meet the required criteria.', 'error');
      return;
    }
  
    try {
      setIsSubmitting(true);
  
      const email = localStorage.getItem('email');
      if (!email) {
        showNotification('No email found. Please verify your email first.', 'error');
        return;
      }
  
      const response = await userApi.post('/verified/update-password', {
        email: email,
        newPassword: formData.password
      });
  
      if (response.status === 200) {
        showNotification('Password updated successfully! Redirecting to login...', 'success');
        
      } else {
        showNotification('Error resetting password', 'error');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error resetting password', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChangeRequest = async (e) => {
    e.preventDefault();

    if (!formData.newEmail) {
      showNotification("Please enter a valid email.", 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await userApi.post('/verified/update-profile', {
        newEmail: formData.newEmail
      });

      if (response.status === 200) {
        showNotification('Email updated successfully.', 'success');
      } else {
        showNotification('Error updating email', 'error');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error updating email', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [preferences, setPreferences] = useState({
    isOptedInForPromotions: false,
    isOptedInForEmailUpdates: false,
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await userApi.get('/user/preferences');
        const { isOptedInForPromotions, isOptedInForEmailUpdates } = response.data;
        setPreferences({ isOptedInForPromotions, isOptedInForEmailUpdates });
      } catch (error) {
        showNotification('Error fetching preferences.', 'error');
      }
    };
    fetchPreferences();
  }, []);
  const handleDeleteAccountClick = () => {
    setIsModalOpen(true);
  };

  const updatePreferences = async () => {
    try {
      setIsSubmitting(true);
      const response = await userApi.post('/user/preferences/update', preferences);
      if (response.status === 200) {
        showNotification('Preferences updated successfully.', 'success');
      } else {
        showNotification('Error updating preferences.', 'error');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error updating preferences.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await userApi.post('/verified/delete-account');
      showNotification('Your account has been deleted. Redirecting to the homepage.', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      showNotification('An error occurred while deleting your account. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="settings-container">
       <section className="settings-section">
        <h2>Update Preferences</h2>
        <form>
          <label>
            <input
              type="checkbox"
              name="isOptedInForPromotions"
              checked={preferences.isOptedInForPromotions}
              onChange={handleChange}
            />
            Opt-in for Promotions
          </label>
          <label>
            <input
              type="checkbox"
              name="isOptedInForEmailUpdates"
              checked={preferences.isOptedInForEmailUpdates}
              onChange={handleChange}
            />
            Opt-in for Email Updates
          </label>
          <button
            type="button"
            onClick={updatePreferences}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Preferences'}
          </button>
        </form>
        <div className="links">
          <Link to="/privacy-policy" className="settings-link">Privacy Policy</Link>
          <Link to="/terms-of-service" className="settings-link">Terms of Service</Link>
        </div>
      </section>
      <h1>Profile Settings</h1>

      <section className="settings-section">
        <h2>Change Email</h2>
        <form onSubmit={handleEmailChangeRequest}>
          <label>
            New Email:
            <input 
              type="email" 
              name="newEmail" 
              value={formData.newEmail} 
              onChange={handleChange} 
              placeholder="New Email"
              required
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Email"}
          </button>
        </form>
      </section>

      <section className="settings-section">
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordChangeRequest}>
          <label>
            New Password:
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="New Password"
              required
            />
          </label>
          <ul>
            <li className={passwordRequirements.length ? 'valid' : 'invalid'}>
              Password must be at least 8 characters long
            </li>
            <li className={passwordRequirements.upperLowerCase ? 'valid' : 'invalid'}>
              Requires at least one uppercase and one lowercase letter
            </li>
            <li className={passwordRequirements.specialChar ? 'valid' : 'invalid'}>
              Requires at least one special character (including "-")
            </li>
            <li className={passwordRequirements.digit ? 'valid' : 'invalid'}>
              Requires at least one digit
            </li>
          </ul>
          <label>
            Confirm Password:
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              placeholder="Confirm Password"
              required
            />
          </label>
          <button type="submit" disabled={isSubmitting}>Change Password</button>
        </form>
      </section>

      <section className="settings-section">
        <h2>Change Phone Number</h2>
        <form>
          <label>
            Phone Number:
            <input 
              type="text" 
              name="phoneNumber" 
              value={formData.phoneNumber} 
              onChange={handleChange} 
              placeholder="Phone Number"
              required
            />
          </label>
          <button type="submit">Update Phone Number</button>
        </form>
      </section>

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handleDeleteAccountClick}
          style={{
            padding: '10px 20px',
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          Delete Account
        </button>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          fontFamily: 'Ariel, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Are you sure?</h2>
            <p style={{ fontSize: '1rem', marginBottom: '20px' }}>
              This action cannot be undone. All order history, message history, and user information will be permanently deleted.
            </p>
            <button
              onClick={handleConfirmDelete}
              style={{
                padding: '10px 20px',
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
            </button>
            <button
              onClick={handleCloseModal}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ccc',
                color: 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
