const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    // Transporter setup
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Sending mail
    let info = await transporter.sendMail({
      from: `"Vishal singh Tomar" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending mail:", error.message);
    throw error; // <-- Important to throw so calling function knows
  }
};

module.exports = mailSender;
