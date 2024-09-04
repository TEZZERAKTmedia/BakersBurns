import React, { useEffect } from 'react';

const SignIn = () => {
  // Function to handle Google Sign-In
  const handleGoogleLogin = () => {
    window.location.href = 'http://your-domain.com/api/auth/google';
  };

  // Function to handle Apple Sign-In
  const handleAppleLogin = () => {
    window.location.href = 'http://your-domain.com/api/auth/apple';
  };

  useEffect(() => {
    // Load the Apple JS SDK
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.onload = () => {
      window.AppleID.auth.init({
        clientId: 'your-apple-client-id',
        scope: 'name email',
        redirectURI: 'https://your-domain.com/api/auth/apple/callback',
        state: 'some-state',
        nonce: 'some-nonce',
        usePopup: true,
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <h2>Sign In</h2>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
      <div
        id="appleid-signin"
        onClick={handleAppleLogin}
        data-color="black"
        data-border="true"
        data-type="sign in"
      ></div>
    </div>
  );
};

export default SignIn;
