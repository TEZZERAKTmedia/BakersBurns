const crypto = require('crypto');
const { verifyRegistrationResponse, verifyAuthenticationResponse } = require('@simplewebauthn/server');

// Generate WebAuthn Challenge
exports.generateWebAuthnChallenge = () => {
  // Generate a random challenge string that will be sent to the client
  const challenge = crypto.randomBytes(32).toString('base64');
  return challenge;
};

// Verifies WebAuthn Registration Response
exports.verifyWebAuthnRegistrationResponse = async (credential, expectedChallenge, expectedRPID, expectedOrigin) => {
  try {
    const { id, rawId, type, response, clientExtensionResults } = credential;

    const verification = await verifyRegistrationResponse({
      credential: {
        id,
        rawId,
        type,
        response,
        clientExtensionResults,
      },
      expectedChallenge, // The challenge stored earlier in session or database
      expectedOrigin, // For example, 'https://yourdomain.com'
      expectedRPID,   // Usually your domain, like 'yourdomain.com'
    });

    return verification;
  } catch (error) {
    console.error('WebAuthn Registration Verification Error:', error);
    throw error;
  }
};

// Verifies WebAuthn Login/Authentication Response
exports.verifyWebAuthnLoginResponse = async (credential, expectedChallenge, storedPublicKey, storedCredentialID, storedSignCount, expectedRPID, expectedOrigin) => {
  try {
    const verification = await verifyAuthenticationResponse({
      credential,
      expectedChallenge,  // The challenge stored earlier
      expectedOrigin,     // Your origin, like 'https://yourdomain.com'
      expectedRPID,       // Your domain, like 'yourdomain.com'
      authenticator: {
        credentialPublicKey: storedPublicKey,   // Public key stored during registration
        credentialID: storedCredentialID,       // Credential ID stored during registration
        counter: storedSignCount,               // Sign count stored from the last login
      },
    });

    return verification;
  } catch (error) {
    console.error('WebAuthn Login Verification Error:', error);
    throw error;
  }
};
