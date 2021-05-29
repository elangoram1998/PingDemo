const ChatRoom = require('./models/charRoom_collection');

class WebSocket {

    connection(socket) {

        console.log("websocket connected");

        socket.on('join', ({ roomId }) => {
            console.log("join event: " + roomId);
            socket.join(roomId);
        });

        socket.on('sendMessage', async ({ roomId, userId, text }) => {
            console.log(roomId + " " + userId + " " + text);
            const chatRoom = await ChatRoom.findOne({ roomId });
            console.log(chatRoom)
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

        socket.on('disconnect', () => {
            console.log("websocket disconnected");
        });
    }
}

module.exports = new WebSocket();