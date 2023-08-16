const io = require("socket.io")(5000, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

io.on("connection", (socket) => {
  socket.on("send-message", (message) => {
    socket.broadcast.emit("recieve-message", message);
  });
});
