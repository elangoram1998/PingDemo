const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

require('./mongoose');
const WebSocket = require('./WebSocket');
const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cors());

global.io = socketio(server, {
    cors: {
        origin: "http://localhost:4200"
    }
});

io.on('connection', WebSocket.connection);

server.listen(3000, () => {
    console.log("<=======application is running=====>");
})