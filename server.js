const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const startChatServer = require('./utils/sockets');
const dotenv = require('dotenv');
const app = express();
const server = http.createServer(app);
const io = socketio(server, {rejectUnauthorized: false});
dotenv.config();
io.set('origins', process.env.CLIENT_URL);

startChatServer(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
