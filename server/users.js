const users = [];

const addUser = ({ socket, userId }) => {
    const checkUser = users.find(user => {
        return user.userId === userId;
    });

    if (checkUser) {
        return {
            'error': 'user already connected'
        }
    }

    const user = { socket, userId }
    users.push(user);
    console.log(users);
    return { user };
}

const getUser = (id) => {
    const user = users.find(user => user.userId === id);
    return user;
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.socket === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

module.exports = {
    addUser,
    getUser,
    removeUser
}