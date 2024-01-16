const express = require("express");
const sendEmail = require("../utils/sendEmail");
const { emailStyles } = require("../data/emailStyles");

const emailRouter = express.Router();

emailRouter.post("/send_email", async (req, res) => {
  const { subject, message, attachments } = req.body;

  try {
    await sendEmail(
      subject,
      `<html><head>${emailStyles}</head><body>${message}</body></html>`,
      process.env.EMAIL_REPORT,
      process.env.EMAIL_USER,
      attachments
    );
    res.status(200).json({ message: "Report submitted!" });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

module.exports = emailRouter;
