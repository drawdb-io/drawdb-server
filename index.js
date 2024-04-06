const express = require("express");
const app = express();
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyparser = require("body-parser");
const dotenv = require("dotenv").config();

const { PORT, CLIENT_URL, EMAIL_PASS, EMAIL_USER, EMAIL_REPORT } = process.env;

app.use(express.json());
app.use(bodyparser.json());
app.use(
  cors({
    origin: [CLIENT_URL],
  })
);

const emailStyles =
  "<style>.ltr{text-align:left;}.rtl{text-align:right;}.editor-text-bold{font-weight:bold;}.editor-text-italic{font-style:italic;}.editor-text-underline{text-decoration:underline;}.editor-text-strikethrough{text-decoration:line-through;}.editor-text-underlineStrikethrough{text-decoration:underlineline-through;}.editor-text-code{background-color:#ccc;padding:1px0.25rem;font-family:Menlo,Consolas,Monaco,monospace;font-size:94%;}.editor-link{color:rgb(33,111,219);text-decoration:none;}.editor-code{background-color:#ccc;font-family:Menlo,Consolas,Monaco,monospace;display:block;padding:8px 8px 8px 52px;line-height:1.53;font-size:13px;margin:0;margin-top:8px;margin-bottom:8px;tab-size:2;overflow-x:auto;position:relative;}.editor-code:before{content:attr(data-gutter);position:absolute;background-color:#ddd;left:0;top:0;border-right:1px solid #ccc;padding:8px;color:#777;white-space:pre-wrap;text-align:right;min-width:25px;}.editor-code:after{content:attr(data-highlight-language);top:0;right:3px;padding:3px;font-size:10px;text-transform:uppercase;position:absolute;color: #000;}.editor-tokenComment{color:slategray;}.editor-tokenPunctuation{color:#999;}.editor-tokenProperty{color:#905;}.editor-tokenSelector{color:#690;}.editor-tokenOperator{color:#9a6e3a;}.editor-tokenAttr{color:#07a;}.editor-tokenVariable{color:#e90;}.editor-tokenFunction{color:#dd4a68;}.editor-paragraph{margin:0;margin-bottom:8px;position:relative;}.editor-paragraph:last-child{margin-bottom:0;}.editor-heading-h1{font-size:24px;margin:0;margin-bottom:12px;padding:0;}.editor-heading-h2{font-size:16px;margin:0;margin-top:10px;padding:0;}.editor-quote{margin:0;margin-left:20px;font-size:15px;color:rgb(101,103,107);border-left-color:rgb(206,208,212);border-left-width:4px;border-left-style:solid;padding-left:16px;}.editor-list-ol{padding:0;margin:0;margin-left:16px;list-style-type:decimal;}.editor-list-ul{list-style-type:circle;padding:0;margin:0;margin-left:16px;}.editor-listitem{margin:8px 32px 8px 32px;}.editor-nested-listitem{list-style-type:none;}</style>";

let transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  service: "outlook",
  secureConnection: false,
  tls: {
    ciphers: "SSLv3",
  },
  port: 587,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
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
    }
  });
};

app.post("/send_email", async (req, res) => {
  const { subject, message, attachments } = req.body;

  try {
    await sendEmail(
      subject,
      `<html><head>${emailStyles}</head><body>${message}</body></html>`,
      EMAIL_REPORT,
      EMAIL_USER,
      attachments
    );
    res.status(200).json({ message: "Report submitted!" });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

app.listen(PORT, () => {
  console.log("Server started");
});
