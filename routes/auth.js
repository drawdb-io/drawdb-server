const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcryptjs");
const UserModel = require("../models/user");

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
    });

    await user.save();

    res.status(200).json({ message: "Successfully sign up." });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "No user by this email found." });
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
