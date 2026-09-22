const transporter = require("../config/mailer");

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    return await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM || "Placement Portal"}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
  } catch (error) {
    console.error("Email send failed:", error.message);
    return null;
  }
};

module.exports = sendEmail;