const { Server } = require('socket.io');
const http = require('http');
const express = require('express');

const app = express();


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"]
    }
})


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

module.exports = {io,server,app};