const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

async function sendMail(to, subject, text, html){
  const info = await transporter.sendMail({ from: process.env.EMAIL_FROM || 'no-reply@example.com', to, subject, text, html });
  return info;
}

module.exports = { sendMail };
