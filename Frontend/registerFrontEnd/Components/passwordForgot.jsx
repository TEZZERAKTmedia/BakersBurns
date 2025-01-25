import React, { useState } from 'react';
import { registerApi } from '../config/axios'; // Ensure axios is configured properly to hit your backend
import { Link } from 'react-router-dom';
import '../Componentcss/login.css'; // Import your styles

const ForgotPassword = () => {
  const [email, setEmail] = useState(''); // User email state
  const [message, setMessage] = useState(''); // Message state for success/error
  const [success, setSuccess] = useState(false); // Track if email was sent successfully
  const [notFound, setNotFound] = useState(false); // Track if email was not found
  
  // Submit form handler
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form reload

    try {
      // Send password reset request to backend
      const response = await registerApi.post('/verification/email', { email, actionType: 'password-reset' });
      
      // If successful, show a success message
      setSuccess(true);
      setNotFound(false);
      setMessage('Password reset email sent successfully. Please check your email.');
    } catch (error) {
      setSuccess(false);
      // If the email is not found, show a "not found" message
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
    <div className="container">
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <br />
        <button type="submit">Send Reset Email</button>
        {message && (
          <p className={success ? "success-message" : "error-message"}>
            {message} {notFound && <Link to="/signup">Sign up</Link>}
          </p>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
