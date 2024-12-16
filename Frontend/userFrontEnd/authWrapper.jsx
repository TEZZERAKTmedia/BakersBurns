import React, { useEffect } from 'react';
import { userApi } from './config/axios';

const AuthWrapper = ({ children }) => {
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Check if the user session is valid
        await userApi.get('/user/verify-session');
        console.log('User session verified successfully.');
      } catch (error) {
        console.error('User session invalid, redirecting to register app...');
        // Redirect to the registration app if not authenticated
        window.location.href = import.meta.env.VITE_LOG_OUT_REDIRECTION;
      }
    };

    verifySession();
  }, []);

  return <>{children}</>;
};

export default AuthWrapper;
