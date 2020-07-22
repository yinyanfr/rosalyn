const express = require("express")
const Music = require("../models/Music")
const Taste = require("../models/Taste")
const Playlist = require("../models/Playlist")
const authOpt = require("../middlewares/auth-opt")

const app = express.Router()
const auth = authOpt()

app.get("/all", auth, async (req, res) => {
    try {
        const music = await Music.find({})
        res.send("music")
    } catch (err) {
        res.status(400).send(err)
    }
})

// app.get("/query", auth, async (req, res) => {
//     const {
//         title, artist, album
//     } = req.query


// })

// app.get("/search/:words", auth, async (req, res) => {
//     const {words} = req.params

// }) 

app.get("/sample/:size", auth, async (req, res) => {
    const {size} = req.params
    try {
        const sample = await Music.sample(size)
        res.send(sample)
    } catch (err) {
        res.status(400).send(err)
    }
})

app.patch("/taste", auth, async (req, res) => {
    const {musicId, favor} = req.body
    const {user} = req
    try {
        await Taste.toggle(user._id, musicId, favor)
    } catch (err) {
        res.status(400).send(err)
    }
})

app.post("/add_to_playlist", auth, async (req, res) => {
    const {musicId, playlistId} = req.body
    const {user} = req
    try {
        const playlist = await Playlist.findOne({_id: playlistId, userId: user._id})
        if(!playlist){
            throw "playlist not found, or auth failed"
        }
        await playlist.add(musicId)
        res.send("OK")
    } catch (err) {
        res.status(400).send(err)
    }
})

app.post("/remove_from_playlist", auth, async (req, res) => {
    const {musicId, playlistId} = req.body
    const {user} = req
    try {
        const playlist = await Playlist.findOne({_id: playlistId, userId: user._id})
        if(!playlist){
            throw "playlist not found, or auth failed"
        }
        await playlist.remove(musicId)
        res.send("OK")
    } catch (err) {
        res.status(400).send(err)
    }
})

module.exports = app

