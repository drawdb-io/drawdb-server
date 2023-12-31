const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcryptjs");
const path = require("path");
const Cryptr = require("cryptr");

const UserModel = require("../models/user");
const TokenModel = require("../models/token");
const sendEmail = require("../utils/sendEmail");

const cryptr = new Cryptr(process.env.ENCRYPTION_KEY);

authRouter.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = await UserModel.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    const hashedPass = await bcrypt.hash(password, 12);

    user = new UserModel({
      username,
      email,
      password: hashedPass,
      verified: false,
    });

    await user.save();

    const token = new TokenModel({
      userId: user._id.toString(),
      token: cryptr.encrypt(user._id.toString()),
    });

    await token.save();

    const confirmLink = `${process.env.SERVER_URL}:${process.env.PORT}/confirm/${token.token}`;
    const declineLink = `${process.env.SERVER_URL}:${process.env.PORT}/decline/${token.token}`;
    sendEmail(
      "Verify Email Address",
      `<a href="${confirmLink}">Click to verify</a>
      <br/>
      <a href="${declineLink}">Click to decline</a>`,
      email,
      process.env.EMAIL_USER
    );

    res.status(200).json({ message: "Successfully sign up.", user: user });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

authRouter.get("/confirm/:token", async (req, res) => {
  try {
    const token = await TokenModel.findOne({
      token: req.params.token,
    });

    if (!token)
      res.status(400).sendFile(path.join(__dirname, "../pages/error.html"));

    const decryptedUserId = cryptr.decrypt(token.token);
    if (decryptedUserId !== token.userId)
      res.status(400).sendFile(path.join(__dirname, "../pages/error.html"));

    await UserModel.updateOne(
      { _id: token.userId },
      { $set: { verified: true } }
    );

    await TokenModel.findByIdAndDelete(token._id);

    res
      .status(200)
      .sendFile(path.join(__dirname, "../pages/account_verified.html"));
  } catch (e) {
    res.status(500).sendFile(path.join(__dirname, "../pages/error.html"));
  }
});

authRouter.get("/decline/:token", async (req, res) => {
  try {
    const token = await TokenModel.findOne({
      token: req.params.token,
    });

    if (!token)
      res.status(400).sendFile(path.join(__dirname, "../pages/error.html"));

    const decryptedUserId = cryptr.decrypt(token.token);
    if (decryptedUserId !== token.userId)
      res.status(400).sendFile(path.join(__dirname, "../pages/error.html"));

    await UserModel.findByIdAndDelete(token.userId);
    await TokenModel.findByIdAndDelete(token._id);

    res
      .status(200)
      .sendFile(path.join(__dirname, "../pages/account_declined.html"));
  } catch (e) {
    res.status(500).sendFile(path.join(__dirname, "../pages/error.html"));
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "No user by this email found." });
    }

    if (!user.verified) {
      res.status(400).json({ message: "Account not verified." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    req.session.userId = user.id;

    res.status(200).json({ session: req.session });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

authRouter.post("/logout", async (req, res) => {
  req.session.destroy((e) => {
    if (e) res.status(500).json({ error: e });

    res.clearCookie("sid");
    res.status(200).json({ message: "Successfully logged out." });
  });
});

module.exports = authRouter;
