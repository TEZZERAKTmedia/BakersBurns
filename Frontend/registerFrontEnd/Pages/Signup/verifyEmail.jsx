import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerApi } from '../../config/axios';

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

  useEffect(() => {
    const { email, token } = getQueryParams();
    const sessionId = localStorage.getItem("sessionId")

    // Check if email and token exist
    if (email && token) {
      // Send verification request to backend to verify and move the user
      const verifyEmail = async () => {
        try {
          const response = await registerApi.get(`/sign-up/create-account`, {
            params: { email, token, sessionId },
          });
        
          if (response.status === 200 && response.data.verified) {
            setVerificationStatus('success');
            setMessage(`Verification successful. User ${email} moved to permanent table. You can now log in.`);
          } else if (response.status === 409) {
            // Handle case where email is already registered
            setVerificationStatus('email_registered');
            setMessage(response.data.message || `The email ${email} is already registered.`);
            setShowLoginButton(true);
          } else {
            setVerificationStatus('failed');
            setMessage(response.data.message || 'Verification failed.');
          }
        } catch (error) {
          setVerificationStatus('error');
          setMessage(error.response?.data?.message || 'Error verifying the account.');
        }
        
      };

      verifyEmail(); // Run the verification and trigger token generation
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
