const express = require("express")
const User = require("../models/User")
const authOpt = require("../middlewares/auth-opt")
const {register, reset_password} = require("../config/mail.json")
const sendMail = require("../tools/send-mail")

const app = express.Router()
const auth = authOpt()

// Auth Control
// POST /register
app.post("/register", async (req, res) => {
    const { email, password, username } = req.body

    const user = new User({
        email, password, username,
        rank: "User"
    })

    try {
        await user.save()
        const token = await user.generateToken("auth")
        
        sendMail(register, user.email).catch(err => {
            console.log(err)
        })

        res.header("x-auth", token).send({
            _id: user._id,
            email,
            username,
            rank: "User",
            token,
        })
    }
    catch (err) {
        res.status(400).send(err)
    }
})

// POST /login
app.post("/login", (req, res) => {
    const { email, password } = req.body

    User.findByInfo(email, password).then(user => {
        if (!user) return Promise.reject("User doesn't exist.")
        const {email, username, rank} = user
        return user.generateToken("auth").then(token => {
            res.header("x-auth", token).send({
                _id: user._id,
                email, username, rank,
                token
            })
        })
    }).catch(e => {
        res.status(400).send(e)
    })
})

// DELETE /logout
app.delete("/logout", auth, (req, res) => {
    req.user.removeToken(req.token).then(
        () => {
            res.send("OK")
        },
        () => {
            res.status(400).send("ERROR")
        }
    )
})

// GET /me
app.get("/me", auth, async (req, res) => {
    const { _id, email, username, rank } = req.user.toJSON()
    try {
        res.send({
            _id, email, username, rank
        })
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

// POST /iforgot
app.post("/iforgot", async (req, res) => {
    const { email } = req.body

    try {
        if (!user) throw "user not found"
        const token = await user.generateToken()
        await sendMail(reset_password, email, {token})
        res.send("OK")
    }
    catch (err) {
        res.status(400).send(err)
    }
})

module.exports = app
