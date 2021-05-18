
class WebSocket {
    connection(socket) {

        console.log("websocket connected");

        socket.on('disconnect', () => {
            console.log("websocket disconnected");
        })
    }
}

module.exports = new WebSocket();