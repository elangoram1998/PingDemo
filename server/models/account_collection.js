const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const accountSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value) || !validator.matches(value, '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')) {
                throw new Error('Email is not valid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.matches(value, '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&]).{8,}')) {
                throw new Error('Password is invalid');
            }
        }
    },
    my_chats: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChatRoom'
        },
        totalMessageCount: {
            type: Number,
            default: 0
        },
        unReadMessageCount: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error('Unread message should not be less than 0');
                }
            }
        },
        state: {
            type: String,
            default: 'Not added',
            enum: ['added', 'Not added', 'blocked'],
            required: true
        }
    }]
}, { timestamps: true });


accountSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

accountSchema.statics.findUserByCredentials = async function (username, password) {
    const user = await Account.findOne({ username });
    if (!user) {
        throw new Error('Account not found');
    }
    const decodePassword = await bcrypt.compare(password, user.password);
    if (!decodePassword) {
        throw new Error('Username/Password is wrong');
    }
    return user;
}

accountSchema.methods.toJSON = function () {
    const user = this;
    const accountObject = user.toObject();
    delete accountObject.password;

    return accountObject;
}

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;