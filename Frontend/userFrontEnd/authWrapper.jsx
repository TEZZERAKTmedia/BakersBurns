import React, { useEffect } from 'react';
import { userApi } from './config/axios';

const AuthWrapper = ({ children }) => {
  // Read the environment variable to enable or disable authentication
  const isAuthEnabled = false;

  useEffect(() => {
    if (!isAuthEnabled) {
      console.log('AuthWrapper is disabled, skipping authentication.');
      return;
    }

    const verifySession = async () => {
      try {
        // Check if the user session is valid
        await userApi.get('/user/verify-session');
        console.log('User session verified successfully.');
      } catch (error) {
        console.error('User session invalid, redirecting to register app...');
        window.location.href = import.meta.env.VITE_LOG_OUT_REDIRECTION;
      }
    };

    verifySession();
  }, [isAuthEnabled]);

  return <>{children}</>;
};

export default AuthWrapper;
