const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to build email content based on actionType
const buildEmailContent = (actionType, to, token) => {
  let subject, message, buttonText, verificationLink;

  switch (actionType) {
    case 'sign-up':
      subject = 'Email Verification';
      message = 'Thank you for registering with BakerBurns. Please verify your email address by clicking the button below:';
      buttonText = 'Verify Your Email';
      verificationLink = `${process.env.DEV_REGISTER_URL}/verify-email?email=${to}&token=${token}`;
      break;

    case 'password-reset':
      subject = 'Password Reset Request';
      message = 'You have requested to reset your password. Please click the button below to reset your password:';
      buttonText = 'Reset Password';
      verificationLink = `${process.env.DEV_REGISTER_URL}/passwordreset?email=${to}&token=${token}`;
      break;

    case 'settings-change':
      subject = 'Confirm Account Settings Change';
      message = 'You requested to change your account settings. Please click the button below to confirm:';
      buttonText = 'Confirm Settings Change';
      verificationLink = `${process.env.DEV_REGISTER_URL}/settings-change?email=${to}&token=${token}`;
      break;

    default:
      throw new Error('Invalid action type');
  }

  // Return the HTML and subject dynamically based on action type
  return {
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">${subject}</h2>
        <p style="font-size: 16px;">
          ${message}
        </p>
        <p style="font-size: 16px; text-align: center;">
          <a href="${verificationLink}" style="background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
            ${buttonText}
          </a>
        </p>
        <p style="font-size: 14px; color: #888;">
          If you did not request this, please ignore it.
        </p>
        <footer style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #aaa;">&copy; 2024 BakerBurns. All rights reserved.</p>
        </footer>
      </div>
    `
  };
};

// Main function to send the email
const sendVerificationEmail = async (to, token, actionType) => {
  // Build email content based on the action type
  const { subject, html } = buildEmailContent(actionType, to, token);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`${subject} email sent to:`, to);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = sendVerificationEmail;
