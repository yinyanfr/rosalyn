const User = require("../models/User")

const registerAdmin = (email, password, username) => {
    const user = new User({
        email, password, username,
        rank: "Admin"
    })

    return user.save()
}

module.exports = registerAdmin
