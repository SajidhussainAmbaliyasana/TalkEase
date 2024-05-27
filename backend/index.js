const express = require('express');
const app = express();
const port = process.env.PORT || 8070;
const dotenv = require('dotenv');
const cors = require('cors')
require('./Database')

const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"]
  }
})

dotenv.config();
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(__dirname + '/uploads'));

//routes
app.use('/api/user', require('./routes/UserRoutes'));
app.use('/api/message', require('./routes/MessageRoutes'));
app.use('/api/profile', require('./routes/Profile'))

const userSocketMap = {};

const getUserSocketId = (userId) => {
  return userSocketMap[userId];
}

//socket
io.on("connection", (socket) => {
  console.log(`A User Connected Id: ${socket.id}`);

  //receive the id from the frontend and then set it into the object
  const id = socket.handshake.query.userId;
  if (id) {
    // console.log(id);
    userSocketMap[id] = socket.id;

    // Emit the list of online users to all clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  }

  socket.on("disconnect", () => {
    delete userSocketMap[id];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log(`A User Disconnected With Id: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`The Server is Running on http://localhost:${port}`);
})


// module.exports = getUserSocketId;