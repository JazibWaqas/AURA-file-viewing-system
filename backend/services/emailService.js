const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendApprovalEmail = async (newUser) => {
  const { email, displayName, uid } = newUser;
  const approveUrl = `${process.env.BACKEND_URL}/api/users/approve/${uid}`;
  const denyUrl = `${process.env.BACKEND_URL}/api/users/deny/${uid}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'auraxkhidmat@gmail.com',
    subject: 'New User Requesting Access to AURA',
    html: `
      <h2>New User Request</h2>
      <p>A new user has signed up and is waiting for approval.</p>
      <p><strong>Name:</strong> ${displayName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <hr />
      <p>Please approve or deny their access:</p>
      <a href="${approveUrl}" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Approve</a>
      <a href="${denyUrl}" style="background-color: #dc3545; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Deny</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Approval email sent successfully.');
  } catch (error) {
    console.error('Error sending approval email:', error);
  }
};

module.exports = { sendApprovalEmail }; 