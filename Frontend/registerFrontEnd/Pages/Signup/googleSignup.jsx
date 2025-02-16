import React, { useEffect, useState } from 'react';
import { registerApi } from '../../config/axios';
import OptInModal from '../../Components/pp&tos'; // Import the OptInModal component
import {jwtDecode} from 'jwt-decode';

const GoogleSignInButton = ({ onSuccess, onFailure }) => {
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [idToken, setIdToken] = useState(null);

  // Handle the response from Google Sign-In
  const handleGoogleSignIn = async (response) => {
    try {
      const { credential } = response;

      if (!credential) {
        throw new Error('Google Sign-In failed. No credentials received.');
      }

      setIdToken(credential);

      // Call /google/check to determine if the user needs to accept terms
      const checkResponse = await registerApi.post('/google/check', { idToken: credential });
      console.log('Backend /google/check response:', checkResponse.data);

      if (checkResponse.data.needsAcceptance) {
        // Show Opt-In modal for new users
        setNeedsAcceptance(true);
      } else {
        // Existing user - Call /google to log in and redirect
        const loginResponse = await registerApi.post('/google', { idToken: credential });
        console.log('Backend /google response:', loginResponse.data);

        if (loginResponse.data.success) {
          const redirectUrl = loginResponse.data.redirectUrl || import.meta.env.VITE_USER_URL;
          window.location.href = redirectUrl;
        } else {
          console.error('Login failed:', loginResponse.data.message);
          onFailure('Google Sign-In failed.');
        }
      }
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
      onFailure('Google Sign-In failed.');
    }
  };
  const handleCallback = (response) => {
    console.log('Handling callback with response:', response);
  
    if (response.data.success) {
      console.log('Redirecting to:', response.data.redirectUrl);
      window.location.href = response.data.redirectUrl; // Perform the redirect
    } else {
      console.error('Error from backend:', response.data.message || 'No message provided.');
      alert(response.data.message || 'An error occurred while processing your request.');
    }
  };
  

  // Handle the "Accept and Proceed" action for new users
  const handleAcceptAndProceed = async (preferences) => {
    console.log('handleAcceptAndProceed invoked with preferences:', preferences);
  
    if (!preferences.acceptedTerms || !preferences.acceptedPrivacy) {
      alert('You must accept the Privacy Policy and Terms of Service to proceed.');
      return;
    }
  
    try {
      const email = jwtDecode(idToken).email; // Decode email from idToken
      if (!email) {
        throw new Error('Email is missing. Unable to proceed.');
      }
  
      console.log('Sending API request to /google/accept-terms...');
      const response = await registerApi.post('/google/accept-terms', {
        email,
        hasAcceptedTermsOfService: preferences.acceptedTerms,
        hasAcceptedPrivacyPolicy: preferences.acceptedPrivacy,
        isOptedInForPromotions: preferences.isOptedInForPromotions || false,
        isOptedInForEmailUpdates: preferences.isOptedInForEmailUpdates || false,
      });
  
      console.log('API Response:', response);
      handleCallback(response); // Handle the response
    } catch (error) {
      console.error('Error during preferences update:', error.response?.data || error.message);
      alert('An error occurred while updating preferences. Please try again.');
    }
  };
  
  
  
  
  
  
  

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error('Google Client ID is not defined.');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleSignIn,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          { theme: 'outline', size: 'large' }
        );
      } else {
        console.error('Failed to initialize Google Identity Services.');
      }
    };
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script.');
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div>
      {needsAcceptance ? (
        <OptInModal
          
          isVisible={needsAcceptance}
          onAccept={handleAcceptAndProceed}
          onClose={() => setNeedsAcceptance(false)}
        />
      ) : (
        <div id="googleSignInDiv" style={{width: '100%'}} />
      )}
    </div>
  );
};

export default GoogleSignInButton;
