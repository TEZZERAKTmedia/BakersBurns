import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerApi } from '../config/axios';
import * as webauthn from '../utils/webauthn';

const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [emailResent, setEmailResent] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the email and token from the query parameters
  const getQueryParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      email: searchParams.get('email'),
      token: searchParams.get('token'),
    };
  };

  // Passkey registration (using cookie instead of email in the request)
  const handlePasskeyRegistration = async () => {
    console.log('Initiating passkey registration...');
    try {
      const options = await registerApi.get('/sign-up/generate-registration-challenge');
      console.log('Passkey challenge options received:', options.data);

      const publicKeyCredential = await webauthn.create(options.data);
      console.log('PublicKeyCredential created:', publicKeyCredential);

      const response = await registerApi.post('/sign-up/verify-registration', {
        credential: publicKeyCredential,
      });

      console.log('Passkey verification response:', response);

      if (response.status === 200) {
        console.log('Passkey registration successful.');
        setMessage('Passkey registration successful. Redirecting...');
        const redirectUrl = import.meta.env.VITE_DEV_USER_URL || 'http://localhost:4001';
        window.location.href = redirectUrl;
      } else {
        setMessage('Failed to register passkey.');
        console.log('Failed to register passkey:', response);
      }
    } catch (error) {
      setMessage('Error during passkey registration: ' + error.message);
      console.error('Error during passkey registration:', error);
    }
  };

  // Generate login token and set the cookie
  const generateLoginTokenAndSetCookie = async (email) => {
    if (!email) {
      setMessage('Email is missing. Cannot generate login token.');
      return;
    }

    console.log('Generating login token for:', email);
    try {
      const tokenResponse = await registerApi.post('/sign-up/generate-token', { email });
      console.log('Token response:', tokenResponse);

      if (tokenResponse.status === 200) {
        console.log('Token generated successfully. Proceeding with passkey registration...');
        await handlePasskeyRegistration();  // Passkey registration triggered here
      } else {
        setMessage('Failed to generate login token.');
        console.log('Token generation failed:', tokenResponse);
      }
    } catch (error) {
      setMessage('Error generating login token: ' + error.message);
      console.error('Login token generation error:', error);
    }
  };

  useEffect(() => {
    const { email, token } = getQueryParams();

    // Check if email and token exist
    if (email && token) {
      // Send verification request to backend to verify and move the user
      const verifyEmail = async () => {
        try {
          const response = await registerApi.get(`/sign-up/verify-and-move`, {
            params: { email, token },
          });

          if (response.status === 200 && response.data.verified) {
            setVerificationStatus('success');
            setMessage('Verification successful, user moved to permanent table.');

            // Once verified, generate the login token and handle passkey registration
            await generateLoginTokenAndSetCookie(email);  // This will trigger both token generation and passkey registration
            
          } else if (response.status === 409) {
            // Handle case where email is already registered
            setVerificationStatus('email_registered');
            setMessage(response.data.message || 'This email is already registered.');
            setShowLoginButton(true);
          } else {
            setVerificationStatus('failed');
            setMessage(response.data.message || 'Verification failed.');
          }
        } catch (error) {
          setVerificationStatus('error');
          setMessage(
            error.response?.data?.message || 'Error verifying the account.'
          );
        }
      };

      verifyEmail();  // Run the verification and trigger token generation
    } else {
      setMessage('Invalid or missing verification details.');
    }
  }, [location.search]);

  const resendVerificationEmail = async () => {
    const { email } = getQueryParams();

    try {
      const resendResponse = await registerApi.post('sign-up/resend-verification', { email });

      if (resendResponse.status === 200) {
        setEmailResent(true);
        setResendMessage('Verification email has been resent. Please check your inbox.');
      } else {
        setEmailResent(false);
        setResendMessage('Failed to resend verification email. Please try again.');
      }

    } catch (error) {
      setEmailResent(false);
      setResendMessage(
        error.response?.data?.message || 'Error resending verification email.'
      );
    }
  };

  return (
    <div className="verify-email-container">
      <h1>Email Verification</h1>
      {verificationStatus === 'success' && (
        <div className="success-message">
          {message}. Completing the process...
        </div>
      )}
      {verificationStatus === 'email_registered' && (
        <div className="info-message">
          {message} You can log in to your account.
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      )}
      {verificationStatus === 'failed' && (
        <div className="error-message">
          {message}. Please try again or contact support.
          <button onClick={resendVerificationEmail}>Resend Verification Email</button>
        </div>
      )}
      {verificationStatus === 'error' && (
        <div className="error-message">{message}</div>
      )}
      {!verificationStatus && (
        <div className="loading-message">Verifying your account...</div>
      )}

      {/* Show resend message */}
      {resendMessage && (
        <div className="resend-message">{resendMessage}</div>
      )}
    </div>
  );
};

export default VerifyEmail;
