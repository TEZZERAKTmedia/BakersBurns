import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { registerApi } from '../config/axios';

const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [resendMessage, setResendMessage] = useState(''); 
  const [emailResent, setEmailResent] = useState(false);  // Track if email was resent
  const location = useLocation();

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

    // Check if email and token exist
    if (email && token) {
      // Send verification request to backend to generate cookie
      const verifyEmail = async () => {
        try {
          // Step 1: Verify email and generate cookie
          const verifyResponse = await registerApi.get(`/sign-up/verify-email`, {
            params: { email, token }, // This route verifies the user and generates the cookie
            withCredentials: true,    // Ensure the cookie is sent
          });

          if (verifyResponse.status === 200 && verifyResponse.data.verified) {
            // Step 2: Now that the cookie is set, call the protected route to move the user
            const response = await registerApi.get(`/sign-up/verify-and-move`, {
              params: { email, token },
              withCredentials: true,  // Include credentials/cookies
            });

            if (response.status === 200 && response.data.verified) {
              setVerificationStatus('success');
              setMessage('Verification successful, user moved to permanent table.');

              // Redirect to DEV_USER_URL
              const redirectUrl = import.meta.env.VITE_DEV_USER_URL || 'http://localhost:4001';
              setTimeout(() => {
                window.location.href = redirectUrl; // Redirect to user dashboard after 2 seconds
              }, 2000);
            } else {
              setVerificationStatus('failed');
              setMessage(response.data.message || 'Verification failed.');
            }
          } else {
            setVerificationStatus('failed');
            setMessage(verifyResponse.data.message || 'Verification failed.');
          }
        } catch (error) {
          setVerificationStatus('error');
          setMessage(
            error.response?.data?.message || 'Error verifying the account.'
          );
        }
      };

      verifyEmail();
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
          {message}. Redirecting to your account...
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
