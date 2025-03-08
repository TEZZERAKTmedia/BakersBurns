import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerApi } from '../../config/axios';
import LoadingPage from '../../Components/loading'; // Import the loading component
import GoogleSignInButton from '../Signup/googleSignup'; // Import GoogleSignInButton
import './login.css';
import eyeOpenIcon from '../../assets/password-visibility-icon.gif';
import eyeCloseIcon from '../../assets/password-visibility-icon-reverse.gif';

const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [animationState, setAnimationState] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state



  const handleGoogleFailure = (error) => {
    console.error('Google Sign-In failed:', error);
    setMessage('Google Sign-In failed.');
  };

  const handleSubmit = async (e) => {
    const guestSessionId = localStorage.getItem("sessionId");
    e.preventDefault();
    setLoading(true); // Start loading animation
    try {
      await registerApi.post('/auth/login', { identifier, password, guestSessionId });
      // Redirect to the user URL upon success
      window.location.href = import.meta.env.VITE_USER_URL;
    } catch (error) {
      console.error('Login error:', error);
      setMessage(
        'Error logging in: ' +
          (error.response ? error.response.data.message : error.message)
      );
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    setAnimationState(!animationState);
  };

  return (
    <div className="log-in-container">
      {loading ? (
        <LoadingPage />
      ) : (
        <>
          <h2 className="login-title">Login</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your username or email"
              required
              className="login-input"
            />
            <div className="password-container">
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="login-input password-input"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="toggle-password"
              >
                <img
                  src={animationState ? eyeCloseIcon : eyeOpenIcon}
                  alt="Toggle Password Visibility"
                  className="login-animation"
                />
              </button>
            </div>

            <button type="submit" className="login-button">
              Login
            </button>

            <Link to="/forgotpassword" className="forgot-password-link">
              Forgot Password?
            </Link>
            <Link to="/sign-up" className="sign-up-link">
              Don't have an account? Click here to sign up
            </Link>
          </form>

          <div style={{ marginTop: '1rem', width: '100%' }} >
            <GoogleSignInButton
              
              onFailure={handleGoogleFailure}
            />
          </div>

          {message && <p className="login-message">{message}</p>}
        </>
      )}
    </div>
  );
};

export default LoginForm;
