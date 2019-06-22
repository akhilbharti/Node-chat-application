const express = require("express");
const http = require("http");
const app = express();
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocation } = require("./utils/messages");
const {
  addUsers,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./utils/users");
//creating server outside express
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;
// const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static("public"));

//server (emit)->client(recieve) countUpdated
//client(emit)->server(recieve) increment

io.on("connection", socket => {
  console.log("New WebSocket connection");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUsers({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    socket.emit("message", generateMessage(user.username, "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(user.username, `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const fl = new Filter();
    if (fl.isProfane(message)) {
      return callback("profanity not allowed");
    }
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback("delivered");
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocation(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
