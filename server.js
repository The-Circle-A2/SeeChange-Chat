const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const startChatServer = require('./utils/sockets');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
io.set('origins', 'http://localhost:8080');

startChatServer(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
