import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    const actionType = searchParams.get('actionType');

    const verifyEmail = async () => {
      try {
        const response = await axios.get('/verification/verify', {
          params: { email, token, actionType }
        });
        
        if (response.data.verified) {
          // Perform redirection based on the response redirectUrl
          window.location.href = response.data.redirectUrl;
        } else {
          alert('Verification failed.');
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        alert('Error verifying email.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div>
      <h2>Verifying...</h2>
    </div>
  );
};

export default VerifyEmail;
