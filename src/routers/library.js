const express = require("express")
const Library = require("../models/Library")

const app = express.Router()

app.post("/add", async (req, res) => {
    const {
        path, rec, userId, name, description
    } = req.body

    try {
        await Library.addDir({path, rec, userId, name, description})
        res.send("OK")
    } catch (err) {
        res.status(400).send(err)
    }
})

app.delete("/remove", async (req, res) => {
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

module.exports = app
