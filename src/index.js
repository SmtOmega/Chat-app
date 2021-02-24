const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocation } = require("./utils/message");
const { addUser, removeUser, getUser, getUserInRoom } = require("./utils/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirPath = path.join("__dirname__", "../public");

app.use(express.static(publicDirPath));
let message = "Welcome to the chat ";
io.on("connection", (socket) => {
  console.log("New web socket connection");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    socket.emit("welcomeMessage", generateMessage("Admin", "Welcome!!!"));

    socket.broadcast
      .to(user.room)
      .emit(
        "welcomeMessage",
        generateMessage("Admin", `${user.username}  has joined`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });
  });

  // emiting chat messages

  socket.on("chatMessage", (sendMessage, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(sendMessage)) {
      return callback("profanity is not allowed!");
    }
    if (user) {
      io.to(user.room).emit(
        "welcomeMessage",
        generateMessage(user.username, sendMessage)
      );
    }
    callback();
  });

  // location emition from the server

  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "locationMessage",
        generateLocation(
          user.username,
          `https://google.com/maps?q=${location.lat},${location.long}`
        )
      );
    }
    callback("");
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "welcomeMessage",
        generateMessage("Admin", `${user.username} left the room`)
      );
      io.to(user.room).emit("roomData", {
          room: user.room,
          users: getUserInRoom(user.room)
      });
    }
  });
  // socket.emit('updatedCount', count)

  // socket.on('increment', () => {
  //     count++

  //     //socket.emit('updatedCount', count)
  //     io.emit('updatedCount', count)
  // })
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
