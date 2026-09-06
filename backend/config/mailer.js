const nodemailer = require("nodemailer");

const port = Number(process.env.EMAIL_PORT || 587);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port,
  secure: port === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  // Always validate the SMTP server certificate so an attacker cannot
  // perform a man-in-the-middle attack and capture credentials.
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "production"
  }
});

module.exports = transporter;
