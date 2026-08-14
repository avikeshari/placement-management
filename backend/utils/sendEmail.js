const transporter = require("../config/mailer");

const sendEmail = async ({ to, subject, text, html }) => {
  return transporter.sendMail({
    from: `"${process.env.EMAIL_FROM || "Placement Portal"}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  });
};

module.exports = sendEmail;
