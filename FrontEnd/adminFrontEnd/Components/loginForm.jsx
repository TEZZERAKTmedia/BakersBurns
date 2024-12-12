import React, { useState } from 'react';
import { adminApi } from '../config/axios';
import LoadingPage from './loading'; // Import the loading component
import '../Componentcss/login.css';
import eyeOpenIcon from '../assets/password-visibility-icon.png';
import eyeCloseIcon from '../assets/password-visibility-icon-reverse.png';

const AdminLoginForm = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [animationState, setAnimationState] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading animation
  
    try {
      const response = await adminApi.post(
        '/auth/admin-login',
        { identifier, password },
        { withCredentials: true } // Ensures the cookie is stored in the browser
      );
  
      // If login is successful, trigger the login success callback
      onLoginSuccess(response.data.role);
    } catch (error) {
      console.error('Login error:', error);
  
      // Extract error message from the response
      const errorMessage =
        error.response?.data?.error || // Check if error is nested under 'error'
        error.response?.data?.message || // Check if error is under 'message'
        'An unexpected error occurred. Please try again.'; // Fallback message
  
      setMessage(errorMessage);
    } finally {
      setLoading(false); // Stop loading after the request
    }
  };
  

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setAnimationState(!animationState);
  };

  return (
    <div className="parent-container">
      {loading ? (
        <LoadingPage />
      ) : (
        <div className="login-form-container">
          <h2 style={{ color: 'black' }}>Admin Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your username or email"
              required
              style={{ padding: '10px' }}
            />
  
            {/* Password input with visibility toggle button */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ paddingRight: '40px' }} // Add space for the eye icon
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={animationState ? eyeCloseIcon : eyeOpenIcon} // Toggle between icons
                  alt="Toggle Password Visibility"
                  style={{ width: '24px', height: '24px' }}
                />
              </button>
            </div>
  
            <button type="submit">Login</button>
          </form>
          {message && (
            <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>
          )}
        </div>
      )}
    </div>
  );
  
};

export default AdminLoginForm;
