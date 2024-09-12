import React, { useState, useEffect } from 'react';
import { userApi } from '../config/axios'; // Use registerApi if needed for consistency
import '../Pagecss/Settings.css';

const Settings = () => {
  const [formData, setFormData] = useState({
    newEmail: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    upperLowerCase: false,
    specialChar: false,
    digit: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Validate password requirements
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

  // Handle password change request
  const handlePasswordChangeRequest = async (e) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
  
    const isValidPassword = passwordRequirements.length &&
      passwordRequirements.upperLowerCase &&
      passwordRequirements.specialChar &&
      passwordRequirements.digit;
  
    if (!isValidPassword) {
      setErrorMessage('Password must meet the required criteria.');
      return;
    }
  
    try {
      setIsSubmitting(true);
  
      // Retrieve email from localStorage
      const email = localStorage.getItem('email');
  
      // If email is not found in localStorage, throw an error
      if (!email) {
        setErrorMessage('No email found. Please verify your email first.');
        return;
      }
  
      // Send the email and new password in the request
      const response = await userApi.post('/verified/update-password', {
        email: email, // Include email in the request
        newPassword: formData.password // New password
      });
  
      if (response.status === 200) {
        setSuccessMessage('Password updated successfully! Redirecting to login...');
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        setErrorMessage('Error resetting password');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error resetting password');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // Handle email change request (optional verification for new email)
  const handleEmailChangeRequest = async (e) => {
    e.preventDefault();

    if (!formData.newEmail) {
      setErrorMessage("Please enter a valid email.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await userApi.post('/verified/update-profile', {
        newEmail: formData.newEmail
      });

      if (response.status === 200) {
        setSuccessMessage('Email updated successfully.');
      } else {
        setErrorMessage('Error updating email');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error updating email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="settings-container">
      <h1>Profile Settings</h1>

      {/* Email Change Section */}
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
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </section>

      {/* Password Change Section */}
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
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </section>

      {/* Phone Number Change Section */}
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
    </div>
  );
};

export default Settings;
