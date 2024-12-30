import React, { useEffect, useState } from 'react';
import { registerApi } from '../config/axios';
import {jwtDecode} from 'jwt-decode';
import OptInModal from '../Components/pp&tos'; // Import the OptInModal component

const GoogleSignInButton = ({ onSuccess, onFailure }) => {
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [idToken, setIdToken] = useState(null);

  const handleAcceptAndProceed = async (preferences) => {
    if (!preferences.acceptedTerms || !preferences.acceptedPrivacy) {
      alert('You must accept the Privacy Policy and Terms of Service to proceed.');
      return;
    }

    if (idToken && needsAcceptance) {
      try {
        const decodedToken = jwtDecode(idToken);
        const userEmail = decodedToken.email;

        if (!userEmail) {
          throw new Error('Failed to extract email from ID token.');
        }

        // Send preferences and acceptance data for new users
        const updateResponse = await registerApi.post('/google/accept-terms', {
          email: userEmail,
          hasAcceptedTermsOfService: true,
          hasAcceptedPrivacyPolicy: true,
          isOptedInForPromotions: preferences.isOptedInForPromotions,
          isOptedInForEmailUpdates: preferences.isOptedInForEmailUpdates,
        });

        console.log('Backend response from /accept-terms:', updateResponse.data);

        if (updateResponse.data.success) {
          // Proceed with login after acceptance
          const loginResponse = await registerApi.post('/google', {
            idToken,
            hasAcceptedTermsOfService: true,
            hasAcceptedPrivacyPolicy: true,
          });

          console.log('Backend response from /google:', loginResponse.data);

          if (loginResponse.data.success) {
            window.location.href = loginResponse.data.redirectUrl || import.meta.env.VITE_USER_URL;
          } else {
            console.error('Error during login:', loginResponse.data.message);
          }
        } else {
          console.error('Error updating acceptance:', updateResponse.data.message);
        }
      } catch (error) {
        console.error('Error updating acceptance or processing login:', error);
        onFailure('Google Sign-In failed.');
      }
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
          callback: handleCallbackResponse,
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

  const handleCallbackResponse = async (response) => {
    if (response.credential) {
      try {
        setIdToken(response.credential); // Save the token locally
        const backendResponse = await registerApi.post('/google/check', {
          idToken: response.credential,
        });

        console.log('Backend response from /check:', backendResponse.data);

        if (backendResponse.data.needsAcceptance) {
          // Show terms and preferences form for new users
          setNeedsAcceptance(true);
        } else {
          // Redirect if the user doesn't need to accept terms
          window.location.href = backendResponse.data.redirectUrl || import.meta.env.VITE_USER_URL;
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        onFailure('Google Sign-In failed.');
      }
    } else {
      onFailure('Google Sign-In failed.');
    }
  };

  return (
    <div>
      {needsAcceptance ? (
        <OptInModal
          onAccept={handleAcceptAndProceed}
          onClose={() => setNeedsAcceptance(false)}
        />
      ) : (
        <div id="googleSignInDiv" />
      )}
    </div>
  );
};

export default GoogleSignInButton;
