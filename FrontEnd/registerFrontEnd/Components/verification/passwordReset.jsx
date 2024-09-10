import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { registerApi } from '../../config/axios';

const ForgotPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Add a loading state for form submission
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Extract email and token from the URL query parameters
  useEffect(() => {
    const query = new URLSearchParams(location.search); // Use `location.search`
    const emailParam = query.get('email');  // Extract email
    const tokenParam = query.get('token');  // Extract token
    
    console.log('Email:', emailParam); // Debugging
    console.log('Token:', tokenParam); // Debugging

    // Set email and token in state
    if (emailParam && tokenParam) {
      setEmail(emailParam);
      setToken(tokenParam);
    } else {
      setMessage('Invalid or missing email/token.');
    }
  }, [location.search]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
  
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
  
    // Check for minimum password strength
    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long');
      return;
    }
  
    try {
      setIsSubmitting(true);
  
      // Make the API call to reset the password
      const response = await registerApi.post('/account-settings/reset-password', {
        email,
        token,
        password: newPassword
      });
  
      console.log('Backend Response:', response); // Log the full response
  
      if (response.status === 200) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        console.error('Non-200 status:', response);
        setMessage('Error resetting password');
      }
    } catch (error) {
      console.error('Error:', error.response); // Log any caught errors
      const errorMsg = error.response?.data?.message || 'Error resetting password';
      setMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handlePasswordReset}>
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isSubmitting} // Disable input while submitting
          />
        </label>
        <label>
          Confirm New Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting} // Disable input while submitting
          />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
