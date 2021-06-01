const Account = require('./models/account_collection');
const ChatRoom = require('./models/charRoom_collection');
const { addUser, getUser } = require('./users');

class WebSocket {

    connection(socket) {

        console.log("websocket connected");

        socket.on('join', ({ roomId }) => {
            console.log("join event: " + roomId);
            socket.join(roomId);
        });

        socket.on('sendMessage', async ({ roomId, userId, text }) => {
            const chatRoom = await ChatRoom.findOne({ roomId });
            //console.log(chatRoom)
            const messagesSize = chatRoom.messages.length;
            const message = {
                messageCount: messagesSize + 1,
                userId,
                text,
            }
            chatRoom.messages.push(message);
            await chatRoom.save();

            global.io.to(roomId).emit('message', chatRoom.messages[messagesSize]);
        });

        socket.on('call', ({ id, myId, peerId }) => {
            const getUserDetails = getUser(id);
            if (getUserDetails) {
                global.io.to(getUserDetails.socket).emit('getting-call', { myId, peerId });
            }
        });

        socket.on('answer-call', ({ id, peerId }) => {
            const getUserDetails = getUser(id);
            if (getUserDetails) {
                global.io.to(getUserDetails.socket).emit('call-picked', { peerId });
            }
        });

        socket.on('disconnect-call', ({ id, peerId }) => {

        });

        socket.on('disconnect', () => {
            console.log("websocket disconnected");
        });
    }
}

module.exports = new WebSocket();