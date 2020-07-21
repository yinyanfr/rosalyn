const User = require("../models/User")

const user1 = {
    email: "user1@yinyan.fr",
    password: "111111",
    username: "yan"
}

const user2 = {
    email: "user2@yinyan.fr",
    password: "222222",
    username: "user2"
}

const addUser = async (user) => {
    const _user = await new User(user).save()
    const token = await _user.generateToken()
    return token
}

module.exports = {
    user1, user2,
    addUser
}
