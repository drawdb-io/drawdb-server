import { createTransport } from 'nodemailer';
import { type Attachment } from 'nodemailer/lib/mailer';
import { config } from '../config';

const transporter = createTransport({
  service: config.mail.service,
  auth: {
    user: config.mail.username,
    pass: config.mail.password,
  },
});

async function sendEmail(
  subject: string,
  message: string,
  to: string,
  from: string,
  attachments: Attachment[] = [],
) {
  const options = {
    from,
    to,
    subject,
    html: message,
    attachments,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(options, (err, info) => {
      if (err) {
        console.error('Email sending failed:', err);
        reject(new Error(err.message));
      } else {
        console.log('Email sent:', info.messageId);
        resolve(info.messageId);
      }
    });
  });
}

export { sendEmail };
