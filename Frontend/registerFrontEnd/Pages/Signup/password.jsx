import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify'; // For sanitization
import { useNavigate } from 'react-router-dom';
import { registerApi } from '../../config/axios';
import eyeOpenIcon from '../../assets/password-visibility-icon.png';
import eyeCloseIcon from '../../assets/password-visibility-icon-reverse.png';

const PasswordSetupForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [animationState, setAnimationState] = useState(false);
  const [requirements, setRequirements] = useState({
    length: false,
    upperLowerCase: false,
    specialChar: false,
    digit: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setAnimationState(!animationState); // Toggle animation state
  };

  useEffect(() => {
    const length = password.length >= 8;
    const upperLowerCase = /(?=.*[a-z])(?=.*[A-Z])/.test(password);
    const specialChar = /(?=.*[@$!%*?&-])/.test(password);
    const digit = /(?=.*\d)/.test(password);

    setRequirements({ length, upperLowerCase, specialChar, digit });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password
    if (!requirements.length || !requirements.upperLowerCase || !requirements.specialChar || !requirements.digit) {
      setError('Password must meet all requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token'); // Token passed in the email link

      if (!token) {
        setError('Invalid or missing token.');
        return;
      }

      const sanitizedPassword = DOMPurify.sanitize(password);

      // Send password to the backend
      const response = await registerApi.post('/register-cart/guest-set-password', { password: sanitizedPassword, token });

      if (response.status === 200) {
        setSuccess('Password set successfully! Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to set password. Please try again.');
      }
    } catch (err) {
      console.error('Error setting password:', err);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Set Your Password</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <input
            type={passwordVisible ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            style={styles.input}
          />
          <img
            src={animationState ? eyeCloseIcon : eyeOpenIcon}
            alt="Toggle Password Visibility"
            onClick={togglePasswordVisibility}
            style={styles.toggleIcon}
          />
        </div>
        <ul style={styles.requirements}>
          <li className={requirements.length ? 'valid' : 'invalid'}>
            At least 8 characters long
          </li>
          <li className={requirements.upperLowerCase ? 'valid' : 'invalid'}>
            At least one uppercase and one lowercase letter
          </li>
          <li className={requirements.specialChar ? 'valid' : 'invalid'}>
            At least one special character (e.g., @, $, !)
          </li>
          <li className={requirements.digit ? 'valid' : 'invalid'}>
            At least one digit
          </li>
        </ul>
        <input
          type={passwordVisible ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          required
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <button type="submit" style={styles.button}>
          Set Password
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9f9f9',
    padding: '20px',
  },
  heading: {
    fontSize: '1.8rem',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '400px',
  },
  input: {
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    width: '100%',
  },
  toggleIcon: {
    position: 'absolute',
    top: '50%',
    right: '10px',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    width: '24px',
    height: '24px',
  },
  requirements: {
    marginBottom: '15px',
    listStyle: 'none',
    padding: 0,
  },
  error: {
    color: 'red',
    marginBottom: '15px',
    fontSize: '0.9rem',
  },
  success: {
    color: 'green',
    marginBottom: '15px',
    fontSize: '0.9rem',
  },
  button: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    background: 'linear-gradient(to right, #28a745, #218838)',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default PasswordSetupForm;
