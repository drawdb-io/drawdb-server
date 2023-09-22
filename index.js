const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const bodyparser = require("body-parser");
const sendEmail = require("./utils/sendEmail");
const emailStyles = require("./data/emailStyles");

const port = process.env.PORT;
const io = require("socket.io")(server, {
  cors: {
    origin: [process.env.CLIENT_URL],
  },
});

app.use(express.json());
app.use(bodyparser.json());
app.use(cors());

app.post("/report_bug", async (req, res) => {
  const { subject, message, attachments } = req.body;
  console.log(req.bodyparser);

  try {
    await sendEmail(
      `[BUG REPORT] : ${subject}`,
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
