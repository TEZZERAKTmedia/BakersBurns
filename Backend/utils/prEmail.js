const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendPasswordResetEmail = (email, token) => {
    const resetUrl = `http://localhost:3010/resetpassword?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
        html: `<p>You requested a password reset. Click the link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
    };

    return transporter.sendMail(mailOptions)
        .then(info => {
            console.log('Email sent: ' + info.response);
        })
        .catch(error => {
            console.error('Error sending email:', error);
            throw error;
        });
};
