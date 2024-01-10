const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyparser = require("body-parser");
const session = require("express-session");

const mongoose = require("mongoose");
const mongoDbSession = require("connect-mongodb-session")(session);

const authRouter = require("./routes/auth");
const emailRouter = require("./routes/email");

const { PORT, CLIENT_URL, MONGO_DB_URL, SECRET } = process.env;

mongoose
  .connect(MONGO_DB_URL, {
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
  uri: MONGO_DB_URL,
  collection: "sessions",
});

app.use(express.json());
app.use(bodyparser.json());
app.use(express.static("public"));
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(
  session({
    cookie: {
      maxAge: 1000 * 60 * 60 * 3,
      sameSite: true,
      secure: false,
    },
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(authRouter);
app.use(emailRouter);

app.get("/sup", (req, res) => {
  console.log(req.sessionID);
  console.log(req.session.userId);
  if (req.session.userId) {
    res.status(200).json({ msg: "sup" });
  } else {
    res.status(400).json({ msg: "f u" });
  }
});

const server = app.listen(PORT, () => {
  console.log("Server started");
});

const io = require("socket.io")(server, {
  cors: {
    origin: [CLIENT_URL],
  },
});

// users = {};

// io.on("connection", (socket) => {
//   socket.on("new-user", (name, color) => {
//     users[socket.id] = { name: name, color: color };
//     socket.broadcast.emit("user-connected", name);
//   });

//   socket.on("send-message", (message) => {
//     io.emit("recieve-message", {
//       message: message,
//       id: socket.id,
//       ...users[socket.id],
//     });
//   });

//   socket.on("disconnect", () => {
//     socket.broadcast.emit("user-disconnected", users[socket.id].name);
//   });
// });

io.on("connect", (socket) => {
  socket.on("send-changes", (delta) => {
    console.log(delta);
    socket.broadcast.emit("recieve-changes", delta);
  });
  socket.on("send-reversed-changes", (delta) => {
    console.log(delta);
    socket.broadcast.emit("recieve-reversed-changes", delta);
  });
  console.log("connected");
});
