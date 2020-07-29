const express = require("express")
const Library = require("../models/Library")
const authRank = require("../middlewares/auth-rank")

const app = express.Router()

app.post("/add", authRank("Admin"), async (req, res) => {
    const {
        path, rec, userId, name, description
    } = req.body

    try {
        await Library.addDir({path, rec, userId, name, description})
        res.send("OK")
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

app.delete("/remove", authRank("Admin"), async (req, res) => {
    const {
        libraryId
    } = req.body

    try {
        await Library.removeDir(libraryId)
        res.send("OK")
    } catch (err) {
        res.status(400).send(err)
    }
})

app.get("/all", authRank("Admin"), async (req, res) => {
    try {
        const all = await Library.find({})
        const reqs = all.map(e => e.count(e._id))
        const counts = await Promise.all(reqs)
        res.send(all.map((e, i) => ({
            ...e._doc,
            count: counts[i]
        })))
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

module.exports = app
