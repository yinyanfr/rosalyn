import { IUser } from './../models/User';
import express from "express"
import { authOpt } from "../middlewares"
import { User } from "../models"
import sendMail from "../tools/send-mail"
import { register, reset_password } from "../config/mail.json"

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
app.post("/login", async (req, res) => {
    const { email, password } = req.body

    try {
        const user: IUser | void = await User.findByInfo(email, password)
        if (user) {
            const { username, rank } = user
            const token = await user.generateToken("auth")
            res.header("x-auth", token).send({
                _id: user._id,
                email, username, rank,
                token
            })
        }
        else {
            throw "User not found"
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

// DELETE /logout
app.delete("/logout", auth, async (req, res) => {
    const user = req.user!
    const token = req.token!

    try {
        await user.removeToken(token)
        res.send()
    } catch (error) {
        res.status(400).send(error)
    }
})

// GET /me
app.get("/me", auth, async (req, res) => {
    const user = req.user!
    const { _id, email, username, rank } = user.getInfo()

    try {
        res.send({
            _id, email, username, rank
        })
    } catch (err) {
        res.status(400).send(err)
    }
})

// POST /iforgot
app.post("/iforgot", async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) throw "user not found"
        const token = await user.generateToken()
        await sendMail(reset_password, email, { token })
        res.send("OK")
    }
    catch (err) {
        res.status(400).send(err)
    }
})

export default app
