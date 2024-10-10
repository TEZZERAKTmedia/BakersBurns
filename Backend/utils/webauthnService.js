const { Fido2Lib } = require('fido2-lib');

// Initialize the Fido2Lib object with settings
const fido2 = new Fido2Lib({
  timeout: 60000,
  rpId: "your-domain.com", // Replace with your domain
  rpName: "Your App Name", // Replace with your app name
  challengeSize: 32,
  attestation: "none",
  authenticatorAttachment: "platform",
  authenticatorRequireResidentKey: false,
  authenticatorUserVerification: "preferred",
});

// Generate a registration challenge
exports.generateChallenge = async () => {
  const registrationOptions = await fido2.attestationOptions();
  return registrationOptions.challenge; // Return challenge to frontend
};

// Verify registration response from the device
exports.verifyRegistrationResponse = async (attestationResponse, challenge) => {
  const attestationExpectations = {
    challenge: challenge,
    origin: "https://your-domain.com", // Replace with your app's origin
    factor: "either",
  };

  const result = await fido2.attestationResult(attestationResponse, attestationExpectations);
  
  return {
    verified: true, // Should be based on actual verification
    credentialId: result.authnrData.get('credId'),
    publicKey: result.authnrData.get('credentialPublicKeyPem'), // Public key in PEM format
    signCount: result.authnrData.get('signCount'),
    aaguid: result.authnrData.get('aaguid'),
  };
};

// Generate authentication challenge
exports.generateAuthenticationChallenge = async () => {
  const authenticationOptions = await fido2.assertionOptions();
  return authenticationOptions.challenge;
};

// Verify authentication response from the device
exports.verifyAuthenticationResponse = async (assertionResponse, challenge, publicKey) => {
  const assertionExpectations = {
    challenge: challenge,
    origin: "https://your-domain.com", // Replace with your app's origin
    publicKey: publicKey, // Stored public key from registration
    factor: "either",
  };

  const result = await fido2.assertionResult(assertionResponse, assertionExpectations);

  return {
    verified: result.audit.complete,
    signCount: result.authnrData.get('signCount'),
  };
};
