const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  service: "outlook",
  secureConnection: false,
  tls: {
    ciphers: "SSLv3",
  },
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (subject, message, to, from, attachments = []) => {
  const options = {
    from: from,
    to: to,
    subject: subject,
    html: message,
    attachments: attachments,
  };

  transporter.sendMail(options, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

module.exports = sendEmail;
