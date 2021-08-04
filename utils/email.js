const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transport
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // Define email Options
  const mailOprions = {
    from: 'pradum@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // Actually send email

  await transporter.sendMail(mailOprions);
};

module.exports = sendEmail;
