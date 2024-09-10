import React, { useState } from 'react';
import { userApi } from '../config/axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../Pagecss/Settings.css'; // Optional CSS file for styling

const Settings = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otherSetting, setOtherSetting] = useState('');
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // Track email verification
  const navigate = useNavigate(); // Initialize useNavigate

  // Request verification email
  const handleVerificationRequest = async () => {
    try {
      const actionType = 'settings-change';  // Use settings-change for this scenario
      const response = await userApi.post('/verification/email', { email, actionType });
      alert('Verification email sent. Please check your inbox.');
      setVerificationRequested(true);
    } catch (error) {
      alert('Error sending verification email.');
    }
  };

  // Function to verify email
  const verifyEmail = async () => {
    try {
      const response = await userApi.get('/verification/verify', { params: { email, actionType: 'settings-change' } });
      if (response.data.verified) {
        setIsVerified(true); // If verified, unlock the settings
        alert('Email verified! Redirecting to settings...');
        navigate('/settings'); // Redirect to the settings page
      } else {
        alert('Email not yet verified.');
      }
    } catch (error) {
      alert('Error verifying email.');
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    try {
      const response = await userApi.post('/profile/change-email', { newEmail: email });
      alert(response.data.message);
    } catch (error) {
      alert('Error updating email.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const response = await userApi.post('/profile/change-password', { newPassword: password });
      alert(response.data.message);
    } catch (error) {
      alert('Error updating password.');
    }
  };

  const handleOtherSettingChange = (e) => {
    e.preventDefault();
    alert('Other settings updated!');
  };

  return (
    <div className="settings-container">
      <h1>Profile Settings</h1>

      {!isVerified && (
        <section className="verification-section">
          <h2>Verify Your Email</h2>
          {!verificationRequested ? (
            <>
              <p>Please verify your email to access your profile settings.</p>
              <label>
                Enter Your Email:
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <button onClick={handleVerificationRequest}>Request Verification Email</button>
            </>
          ) : (
            <>
              <p>A verification email has been sent. Please check your inbox.</p>
              <button onClick={verifyEmail}>I've Verified My Email</button>
            </>
          )}
        </section>
      )}

      {isVerified && (
        <>
          <section className="settings-section">
            <h2>Change Email</h2>
            <form onSubmit={handleEmailChange}>
              <label>
                New Email:
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Update Email</button>
            </form>
          </section>

          <section className="settings-section">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <label>
                New Password:
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Update Password</button>
            </form>
          </section>

          <section className="settings-section">
            <h2>Other Settings</h2>
            <form onSubmit={handleOtherSettingChange}>
              <label>
                Custom Setting:
                <input
                  type="text"
                  value={otherSetting}
                  onChange={(e) => setOtherSetting(e.target.value)}
                />
              </label>
              <button type="submit">Update Other Setting</button>
            </form>
          </section>
        </>
      )}
    </div>
  );
};

export default Settings;
