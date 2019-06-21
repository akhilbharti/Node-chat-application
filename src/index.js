const express = require("express");
const http = require("http");
const app = express();
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocation } = require("./utils/messages");
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

  socket.emit("message", generateMessage("Welcome!"));
  socket.broadcast.emit("message", generateMessage("A new user has joined!"));

  socket.on("sendMessage", (message, callback) => {
    const fl = new Filter();
    if (fl.isProfane(message)) {
      return callback("profanity not allowed");
    }
    io.emit("message", generateMessage(message));
    callback("delivered");
  });

  socket.on("sendLocation", (coords, callback) => {
    io.emit(
      "locationMessage",
      generateLocation(
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left!"));
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
