const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const bodyparser = require("body-parser");
const sendEmail = require("./utils/sendEmail");
const emailStyles = require("./data/emailStyles");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const mongoDbSession = require("connect-mongodb-session")(session);

const port = process.env.PORT;
const io = require("socket.io")(server, {
  cors: {
    origin: [process.env.CLIENT_URL],
  },
});

const UserModel = require("./models/user");
const { emitKeypressEvents } = require("readline");

mongoose
  .connect("mongodb://0.0.0.0:27017/sessions", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const store = new mongoDbSession({
  uri: "mongodb://0.0.0.0:27017/sessions",
  collection: "sessions",
});

app.use(express.json());
app.use(bodyparser.json());
app.use(cors());
app.use(
  session({
    secret: "a secret key",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.post("/send_email", async (req, res) => {
  const { subject, message, attachments } = req.body;

  try {
    await sendEmail(
      subject,
      `<html><head>${emailStyles}</head><body>${message}</body></html>`,
      process.env.EMAIL_REPORT,
      process.env.EMAIL_USER,
      attachments
    );
    res.status(200).json({ success: true, message: "Report submitted!" });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = await UserModel.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ msg: "User with this email already exists." });
    }

    const hashedPass = await bcrypt.hash(password, 12);

    user = new UserModel({
      username,
      email,
      password: hashedPass,
    });

    await user.save();

    res.status(200).json({ msg: "yey" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: "Oops something went wrong." });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(400).json({ msg: "No user by this email found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password." });
    }

    req.session.authenticated = true;

    res.status(200).json({ msg: "yey" });
  } catch (e) {
    res.status(500).json({ msg: "Oops something went wrong." });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((e) => {
    if (e) res.status(500).json({ msg: "Oops something went wrong." });

    res.status(200).json({ msg: "yey" });
  });
});

server.listen(port, () => {
  console.log("server started");
});

users = {};

io.on("connection", (socket) => {
  socket.on("new-user", (name, color) => {
    users[socket.id] = { name: name, color: color };
    socket.broadcast.emit("user-connected", name);
  });

  socket.on("send-message", (message) => {
    io.emit("recieve-message", {
      message: message,
      id: socket.id,
      ...users[socket.id],
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", users[socket.id].name);
  });
});
