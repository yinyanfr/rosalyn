const User = require("../models/User")

const authOpt = optional => (req, res, next) => {
    const token = req.header("x-auth")

    if(!token && optional) return next()

    User.findByToken(token)
        .then(user => {
            if(!user) return Promise.reject()
            req.user = user
            req.token = token
            next()
        })
        .catch(e => {
            res.status(401).send() 
            // 401 Unauthorized
        })
}

module.exports = authOpt
