const Account = require('./models/account_collection');
const ChatRoom = require('./models/charRoom_collection');
const { addUser, getUser, removeUser } = require('./users');

class WebSocket {

    connection(socket) {

        console.log("websocket connected");

        socket.on('join', ({ roomId }) => {
            console.log("join event: " + roomId);
            socket.join(roomId);
            console.log(socket.rooms);
        });

        socket.on('leave-Room', ({ roomId }) => {
            console.log("leave event " + roomId);
            socket.leave(roomId);
        });

        socket.on('sendMessage', async ({ roomId, userId, text }) => {
            try {
                const chatRoom = await ChatRoom.findOne({ roomId });
                const messagesSize = chatRoom.messages.length;
                const message = {
                    messageCount: messagesSize + 1,
                    userId,
                    text,
                }
                console.log(message);
                chatRoom.messages.push(message);
                console.log(chatRoom);
                await chatRoom.save();

                global.io.to(roomId).emit('message', chatRoom.messages[messagesSize]);
            }
            catch (e) {
                console.log(e);
            }
        });

        socket.on('call', ({ id, myId, peerId }) => {
            const getUserDetails = getUser(id);
            if (getUserDetails) {
                global.io.to(getUserDetails.socket).emit('getting-call', myId, peerId);
            }
        });

        socket.on('answer-call', ({ id, peerId }) => {
            const getUserDetails = getUser(id);
            if (getUserDetails) {
                global.io.to(getUserDetails.socket).emit('call-picked', peerId);
            }
        });

        socket.on('disconnect-call', ({ id, peerId }) => {
            const getUserDetails = getUser(id);
            if (getUserDetails) {
                global.io.to(getUserDetails.socket).emit('user-disconnected', peerId);
            }
        });

        socket.on('disconnect', () => {
            console.log("websocket disconnected");
            const users = removeUser(socket.id);
            console.log(users);
        });
    }
}

module.exports = new WebSocket();