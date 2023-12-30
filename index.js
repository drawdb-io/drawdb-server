const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const bodyparser = require("body-parser");
const session = require("express-session");

const mongoose = require("mongoose");
const mongoDbSession = require("connect-mongodb-session")(session);

const authRouter = require("./routes/auth");
const emailRouter = require("./routes/email");

const { PORT, CLIENT_URL, MONGO_DB_URL, SECRET } = process.env;

const io = require("socket.io")(server, {
  cors: {
    origin: [CLIENT_URL],
  },
});

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
app.use(cors());
app.use(
  session({
    name: "sid",
    cookie: {
      maxAge: 1000 * 60 * 60,
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

server.listen(PORT, () => {
  console.log("Server started");
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
