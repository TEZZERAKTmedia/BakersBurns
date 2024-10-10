const { Fido2Lib } = require('fido2-lib');

const fido2 = new Fido2Lib({
  timeout: 60000,
  challengeSize: 32,
  attestation: 'direct',
  authenticatorAttachment: 'platform',
  authenticatorRequireResidentKey: false,
  authenticatorUserVerification: 'required',
  rpId: process.env.RP_ID || 'localhost',  // Use localhost as RP ID
  rpOrigin: process.env.DEV_REGISTER_URL || 'http://localhost:3010',  // Use DEV_REGISTER_URL for dev
});

// Example function to generate a registration challenge
exports.generateRegistrationChallenge = async (email) => {
  const options = await fido2.attestationOptions();
  options.user = {
    id: Buffer.from(email).toString('base64'), // Convert email to base64 as user ID
    name: email,
    displayName: email,
  };
  options.challenge = Buffer.from(options.challenge).toString('base64'); // Convert challenge to base64
  return options;
};
