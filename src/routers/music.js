const express = require("express")
const Music = require("../models/Music")

const app = express.Router()

app.get("/all", async (req, res) => {
    try {
        const music = await Music.find({})
        res.send("music")
    } catch (err) {
        res.status(400).send(err)
    }
})

app.get("/query", async (req, res) => {
    
})

module.exports = app

