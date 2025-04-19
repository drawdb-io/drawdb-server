import { Request, Response } from 'express';
import { sendEmail } from '../utils/send-email';
import { config } from '../config';
import { emailStyles } from '../styles/email-styles';

async function send(req: Request, res: Response) {
  const { subject, message, attachments } = req.body;

  if (!req.body || !subject || !message) {
    res.status(400).json({
      success: false,
      message: 'Incorrect body',
    });
  }

  try {
    await sendEmail(
      subject,
      `<html><head>${emailStyles}</head><body>${message}</body></html>`,
      config.mail.username,
      config.mail.username,
      attachments,
    );
    res.status(200).json({
      success: true,
      message: `Email sent to ${config.mail.username}`,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Something went wrong.',
    });
  }
}

export { send };
