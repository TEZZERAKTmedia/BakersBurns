import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../Componentcss/login.css'; // Ensure to import your styles

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/prp/forgot-password', { email });
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
        setMessage('Failed to send password reset email');
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
