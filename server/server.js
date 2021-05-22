const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

require('./mongoose');
const WebSocket = require('./WebSocket');
const Account = require('./models/account_collection');
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

app.post('/login', async (req, res) => {
    try {
        console.log(req.body);
        const username = req.body.username;
        const account = await Account.findOne({ username });
        res.status(200).send(account);
    }
    catch (e) {
        res.status(404).send(e);
    }
});

app.get('/search', async (req, res) => {
    try {
        const name = req.query.search;
        console.log(name);
        const response = await Account.find({
            username:
            {
                $regex: new RegExp(name),
                $options: 'i'
            }
        }).select('username email');
        console.log(response);
        res.status(200).send(response);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

/*(async () => {
    const account = new Account({
        username: "selvamrat",
        email: "elangoram@gmail.com",
        password: "Test@123"
    });
    await account.save();
    console.log(account)
})()*/

server.listen(3000, () => {
    console.log("<=======application is running=====>");
})