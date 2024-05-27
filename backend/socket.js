const { Server } = require('socket.io');

const userSocketMap = {};

function getUserSocketId(userId) {
  return userSocketMap[userId];
}

let io; // Declare io variable outside the function

function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`A User Connected Id: ${socket.id}`);

    const id = socket.handshake.query.userId;
    if (id) {
      userSocketMap[id] = socket.id;
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    }

    socket.on("disconnect", () => {
      delete userSocketMap[id];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      console.log(`A User Disconnected With Id: ${socket.id}`);
    });
  });
}

function getIo(){
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
}

// Export io object here
module.exports = { setupSocket, getUserSocketId, getIo };
