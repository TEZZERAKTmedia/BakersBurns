import React, { useState } from 'react';
import { adminApi } from '../config/axios';
import LoadingPage from './loading';
import '../Componentcss/login.css';
import eyeOpenIcon from '../assets/password-visibility-icon.png';
import eyeCloseIcon from '../assets/password-visibility-icon-reverse.png';

const AdminLoginForm = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [animationState, setAnimationState] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminApi.post(
        '/auth/admin-login',
        { identifier, password },
        { withCredentials: true }
      );

      // Pass the admin role to the parent
      onLoginSuccess(response.data.role);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'An unexpected error occurred. Please try again.';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const redirectToUserApp = () => {
    const userAppUrl = `${import.meta.env.VITE_USER}`;

    // Redirect to the user app with admin credentials
    window.location.href = userAppUrl;
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
          <h2>Admin Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your username or email"
              required
            />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ paddingRight: '40px' }}
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
                  src={animationState ? eyeCloseIcon : eyeOpenIcon}
                  alt="Toggle Password Visibility"
                  style={{ width: '24px', height: '24px' }}
                />
              </button>
            </div>
            <button type="submit">Login</button>
          </form>
          {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}

          {/* Button to redirect to user app */}
          <button
            onClick={redirectToUserApp}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Access User App
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminLoginForm;
