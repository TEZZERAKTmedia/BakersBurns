const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (to, token) => {
    const verificationLink = `${process.env.BASE_URL}/auth/verify?email=${to}&token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Email Verification',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4CAF50;">Welcome to Our Service!</h2>
                <p style="font-size: 16px;">
                    Thank you for registering with BakerBurns. Please verify your email address by clicking the button below:
                </p>
                <p style="font-size: 16px; text-align: center;">
                    <a href="${verificationLink}" style="background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
                        Verify Your Email
                    </a>
                </p>
                <p style="font-size: 14px; color: #888;">
                    If you did not request this email, please ignore it.
                </p>
                <footer style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #aaa;">&copy; 2024 Your Company. All rights reserved.</p>
                </footer>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', verificationLink);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = sendVerificationEmail;
