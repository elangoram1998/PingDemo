const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    messages: [{
        messageCount: {
            type: Number,
            required: true,
            unique: true,
            validate(value) {
                if (value < 1) {
                    throw new Error('Message count is wrong');
                }
            }
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true
        },
        text: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true,
            default: 'unread',
            enum: ['read', 'unread']
        },
        created_At: {
            type: Date,
            required: true,
            default: Date.now()
        }
    }]
}, { timestamps: true });

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;