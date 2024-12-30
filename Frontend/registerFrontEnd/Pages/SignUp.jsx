import React from 'react';
import SignUpForm from '../Components/signupForm';
import GoogleSignInButton from '../Components/googleSignup';
import {registerApi} from '../config/axios'; // Ensure this is the correct import
import PrivacyPolicyAndToS from '../Components/pp&tos';

const Signup = () => {
  console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const handleGoogleSuccess = async (token) => {
    console.log('Google Sign-In successful! Token:', token);

    try {
      // Send token to backend for verification and user creation
      const response = await registerApi.post('/google', { idToken: token });

      // Check if the response contains a redirect URL or success message
      if (response.data.success) {
        console.log('User authenticated successfully:', response.data);

        // Redirect the user to the dashboard
        window.location.href = import.meta.env.VITE_USER_URL; // Redirect to your dashboard URL
      }
    } catch (error) {
      console.error('Error authenticating user:', error);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google Sign-In failed:', error);
  };

  return (
    <div>
      <div style={{ marginTop: '200px' }}>
        <GoogleSignInButton
          onSuccess={handleGoogleSuccess}
          onFailure={handleGoogleFailure}
        />
      </div>
      <SignUpForm />
    </div>
  );
};

export default Signup;
