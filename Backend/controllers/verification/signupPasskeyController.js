const webauthnService = require('../../utils/signupWebquthnServices');
const Passkey = require('../../models/passkey');  // Import the Passkey model
const User = require('../../models/user');        // Import the User model for association

// Generate a registration challenge for WebAuthn
const generateRegistrationChallenge = async (req, res) => {
  try {
    console.log('Generating registration challenge for user:', req.user.email);

    // Fetch the challenge options from the service
    const options = await webauthnService.generateRegistrationChallenge(req.user.email);
    console.log('Challenge options successfully generated:', options);

    // Send challenge options to the frontend
    res.status(200).json(options);
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error generating registration challenge:', {
      userEmail: req.user.email,
      errorMessage: error.message,
      stack: error.stack,
      errorDetails: error,
    });

    res.status(500).json({ message: 'Failed to generate registration challenge.', error: error.message });
  }
};

// Verify the WebAuthn registration response
const verifyRegistration = async (req, res) => {
  try {
    const { credential } = req.body;
    console.log('Received credential from frontend:', credential);

    // Step 1: Verify the WebAuthn credential
    const { credentialId, publicKey } = await webauthnService.verifyRegistrationResponse(credential);
    console.log('WebAuthn verification result:', { credentialId, publicKey });

    if (!credentialId || !publicKey) {
      // If either credentialId or publicKey is missing, log the issue
      console.error('Verification failed: Missing credentialId or publicKey.', { credentialId, publicKey });
      return res.status(400).json({ message: 'Failed to verify passkey registration.' });
    }

    // Step 2: Check if the user exists in the database before creating a passkey
    const user = await User.findByPk(req.user.id);
    if (!user) {
      console.error('User not found for passkey registration:', req.user.id);
      return res.status(404).json({ message: 'User not found for passkey registration.' });
    }

    // Step 3: Store the verified passkey in the database
    await Passkey.create({
      userId: req.user.id,
      credentialId,
      publicKey,
      counter: 0,  // Initialize counter
    });
    console.log('Passkey successfully saved for user:', req.user.id);

    // Respond with success
    res.status(200).json({ message: 'Passkey registration successful' });

  } catch (error) {
    // Log error details for debugging
    console.error('Error verifying passkey registration:', {
      userId: req.user.id,
      credential: req.body.credential,
      errorMessage: error.message,
      stack: error.stack,
      errorDetails: error,
    });

    res.status(500).json({ message: 'Error verifying passkey registration.', error: error.message });
  }
};

module.exports = {
  generateRegistrationChallenge,
  verifyRegistration
};
