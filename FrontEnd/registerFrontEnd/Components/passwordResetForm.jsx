import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Componentcss/login.css';

const PasswordReset = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [requirements, setRequirements] = useState({
    length: false,
    upperLowerCase: false,
    specialChar: false,
    digit: false
  });
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (!requirements.length || !requirements.upperLowerCase || !requirements.specialChar || !requirements.digit) {
      setMessage('Password does not meet all requirements');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/prp/reset-password', { token, password });
      setMessage('Password reset successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage('Failed to reset password');
    }
  };

  useEffect(() => {
    const length = password.length >= 8;
    const upperLowerCase = /(?=.*[a-z])(?=.*[A-Z])/.test(password);
    const specialChar = /(?=.*[@$!%*?&])/.test(password);
    const digit = /(?=.*\d)/.test(password);

    setRequirements({
      length,
      upperLowerCase,
      specialChar,
      digit
    });
  }, [password]);

  useEffect(() => {
    setPasswordsMatch(password !== '' && password === confirmPassword);
  }, [password, confirmPassword]);

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <label>
          New Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        
        <ul>
          <li className={requirements.length ? 'valid' : 'invalid'}>
            Password must be at least 8 characters long
          </li>
          <li className={requirements.upperLowerCase ? 'valid' : 'invalid'}>
            Requires at least one uppercase letter & one lowercase letter
          </li>
          <li className={requirements.specialChar ? 'valid' : 'invalid'}>
            Requires at least one special character
          </li>
          <li className={requirements.digit ? 'valid' : 'invalid'}>
            Requires at least one digit
          </li>
\
        </ul>
            
        <label>
          Confirm Password:
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </label>
        <ul>
        <li className={passwordsMatch ? 'valid' : 'invalid'}>
            {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
          </li>
        </ul>
        <br />
        <button type="submit">Reset Password</button>
        <p>{message}</p>
      </form>
    </div>
  );
};

export default PasswordReset;
