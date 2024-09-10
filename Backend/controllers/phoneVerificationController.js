// controllers/phoneVerificationController.js
const twilio = require('twilio'); // Twilio package (or similar service)
const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

exports.sendPhoneVerification = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Generate a verification code (for example, a 6-digit code)
    const verificationCode = Math.floor(100000 + Math.random() * 900000);  // Random 6-digit code

    // Store the code in the database (you should have a way to track it)
    await User.update({ phoneVerificationCode: verificationCode }, { where: { phoneNumber } });

    // Send the SMS using Twilio (or another service)
    await client.messages.create({
      body: `Your verification code is: ${verificationCode}`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return res.status(200).json({ message: 'Verification code sent via SMS!' });
  } catch (error) {
    return res.status(500).json({ message: 'Error sending verification code.', error: error.message });
  }
};
