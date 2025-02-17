import React, { useState } from 'react';
import { registerApi } from '../../config/axios'; // Ensure axios is configured properly
import { Link } from 'react-router-dom';
import './forgot_password.css'; // Import your new uniquely-prefixed styles

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await registerApi.post('/verification/email', { 
        email, 
        actionType: 'password-reset' 
      });
      
      setSuccess(true);
      setNotFound(false);
      setMessage('Password reset email sent successfully. Please check your email.');
    } catch (error) {
      setSuccess(false);
      if (error.response && error.response.status === 404) {
        setNotFound(true);
        setMessage('Email not found in the system.');
      } else {
        console.error('Error sending password reset email:', error);
        setMessage('Failed to send password reset email.');
      }
    }
  };

  return (
    <div className="fpwd-wrapper">
      <div className="fpwd-container">
        <form onSubmit={handleSubmit} className="fpwd-form">
          <label className="fpwd-label">
            Email:
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="fpwd-input"
            />
          </label>
          <button type="submit" className="fpwd-button">Send Reset Email</button>

          {message && (
            <p className={success ? 'fpwd-success-message' : 'fpwd-error-message'}>
              {message}{' '}
              {notFound && <Link to="/signup" className="fpwd-signup-link">Sign up</Link>}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
