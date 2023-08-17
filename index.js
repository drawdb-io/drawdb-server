const io = require("socket.io")(5000, {
  cors: {
    origin: ["http://localhost:3000"],
  },
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
