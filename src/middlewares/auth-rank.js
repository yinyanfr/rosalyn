const User = require("../models/User")

const authRank = rank => (req, res, next) => {
    const token = req.header("x-auth")

    User.findByToken(token)
        .then(user => {
            if(!user || !user.outrank(rank)) return Promise.reject()
            req.user = user
            req.token = token
            next()
        })
        .catch(e => {
            res.status(401).send() 
            // 401 Unauthorized
        })
}

module.exports = authRank
