const { generateChallenge, verifyRegistrationResponse, verifyAuthenticationResponse } = require('../../utils/webauthnService');
const db = require('../../models/passkey'); // Assuming you have a models directory for database operations

// Generate a registration challenge for the admin to register their passkey
exports.generateRegistrationChallenge = (req, res) => {
  const challenge = generateChallenge();
  req.session.challenge = challenge; // Save the challenge in session for later verification
  res.json({ challenge });
};

// Verify the registration response from the admin's device
exports.verifyRegistration = async (req, res) => {
  try {
    const { credential, identifier } = req.body;
    const challenge = req.session.challenge;
    const verificationResult = await verifyRegistrationResponse(credential, challenge);

    if (verificationResult.verified) {
      // Store passkey details in the Passkeys table, linking it to the admin
      await db.Passkeys.create({
        user_id: identifier, // Link passkey to the admin ID
        passkey_id: verificationResult.credentialId,
        public_key: verificationResult.publicKey,
        sign_count: verificationResult.signCount,
        authenticator_aaguid: verificationResult.aaguid
      });
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Passkey verification failed' });
    }
  } catch (error) {
    console.error('Error verifying registration:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// Generate an authentication challenge for passkey login
exports.generateAuthenticationChallenge = (req, res) => {
  const challenge = generateChallenge();
  req.session.challenge = challenge; // Save challenge in session for later verification
  res.json({ challenge });
};

// Verify the passkey login response
exports.verifyAuthentication = async (req, res) => {
  try {
    const { credential, identifier } = req.body;
    const challenge = req.session.challenge;
    
    // Retrieve the admin's stored passkey from the database
    const passkey = await db.Passkeys.findOne({ where: { user_id: identifier } });

    if (!passkey) {
      return res.status(404).json({ success: false, message: 'Passkey not found' });
    }

    // Verify the passkey using the public key stored in the database
    const verificationResult = await verifyAuthenticationResponse(credential, challenge, passkey.public_key);

    if (verificationResult.verified) {
      // Update the sign count in the database
      await passkey.update({ sign_count: verificationResult.signCount });
      res.json({ success: true, role: 'admin' });
    } else {
      res.status(400).json({ success: false, message: 'Passkey login failed' });
    }
  } catch (error) {
    console.error('Error verifying authentication:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
};
