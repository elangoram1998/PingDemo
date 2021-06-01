const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const { v4: uuidv4 } = require('uuid');

require('./mongoose');
const WebSocket = require('./WebSocket');
const Account = require('./models/account_collection');
const ChatRoom = require('./models/charRoom_collection');
const { addUser, getUser } = require('./users');
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

app.post('/storeId', async (req, res) => {
    try {
        const socket = req.body.socket;
        const userId = req.body.userId;
        const { error, user } = addUser({ socket, userId });
        if (error) {
            throw new Error(error);
        }
        res.status(200).send(user);
    }
    catch (e) {
        res.status(400).send(e);
    }
});

app.post('/addChat', async (req, res) => {
    try {
        const id = req.body.id;
        const myId = req.body.myId;
        const account = await Account.findById({ _id: myId });
        const chatRoom = new ChatRoom({
            roomId: uuidv4()
        });
        console.log(chatRoom)
        await chatRoom.save();
        console.log(chatRoom)

        account.my_chats.push({
            userId: id,
            roomId: chatRoom.roomId,
            state: 'added'
        });
        await account.save();

        const addedFriend = await Account.findById({ _id: id });
        addedFriend.my_chats.push({
            userId: myId,
            roomId: chatRoom.roomId,
            state: 'Not added'
        });
        await addedFriend.save();

        const getSocketId = getUser(id);

        if (getSocketId) {
            global.io.to(getSocketId.socket).emit("addChat", {
                userId: id,
                roomId: chatRoom.roomId,
                totalMessageCount: 0,
                unReadMessageCount: 0,
                state: 'Not added'
            })
        }

        res.status(200).send({
            userId: id,
            roomId: chatRoom.roomId,
            totalMessageCount: 0,
            unReadMessageCount: 0,
            state: 'added'
        });
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

app.get('/getMessages', async (req, res) => {
    try {
        const roomId = req.query.roomId;
        const chatRoom = await ChatRoom.findOne({ roomId });
        res.status(200).send(chatRoom);
    }
    catch (e) {
        res.status(400).send(e);
    }
});

app.post('/updateMsgHeight', async (req, res) => {
    try {
        const roomId = req.query.roomId;
        const message = req.body.message;
        const chatRoom = await ChatRoom.findOne({ roomId });
        chatRoom.messages[message.messageCount - 1].messageHeight = message.messageHeight;
        await chatRoom.save();
        res.status(200).send(true);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

app.post('/updateMsgState', async (req, res) => {
    try {
        const roomId = req.query.roomId;
        const messages = req.body.messages;
        const id = req.body.id;
        const chatRoom = await ChatRoom.findOne({ roomId });
        chatRoom.messages = messages;
        await chatRoom.save();
        const getSocketId = getUser(id);
        if (getSocketId) {
            global.io.to(getSocketId.socket).emit('updateReadState', messages);
        }
        res.status(200).send(true);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

app.get('/isOnline', async (req, res) => {
    try {
        const friendId = req.query.id;
        const getUserDetails = getUser(friendId);
        if (getUserDetails) {
            return res.status(200).send(true);
        }
        res.status(200).send(false);
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