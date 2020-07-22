const express = require("express")
const Playlist = require("../models/Playlist")
const Collection = require("../models/Playlist")
const authOpt = require("../middlewares/auth-opt")

const app = express()
const auth = authOpt()

app.post("/add", auth, async (req ,res) => {
    const {title, description, tags} = req.body
    const {user} = req
    try {
        const playlist = new Playlist({
            title, description, tags,
            userId: user._id
        })
        await playlist.save()
        res.send("OK")
    } catch (err) {
        res.status(400).send(err)
    }
})

app.delete("/remove", auth, async (req ,res) => {
    const {playlistId} = req.body
    const {user} = req
    try {
        await Playlist.deleteOne({userId: user._id, _id: playlistId})
        res.send("OK")
    } catch (err) {
        res.status(400).send(err)
    }
})

app.get("/get/:playlistId", auth, async (req, res) => {
    const {playlistId} = req.params
    try {
        const playlist = await Playlist.populateMusic(playlistId)
        res.send(playlist)
    } catch (err) {
        res.status(400).send(err)
    }
})

app.post("/collect/:playlistId", auth, async (req, res) => {
    const {playlistId} = req.params
    const {user} = req

    try {
        const playlist = await Playlist.findById(playlistId)
        if(!playlist || playlist.userId === user._id){
            throw "playlist invalid"
        }
        const existingCollection = await Collection.findOne({userId: user._id, playlistId})
        if(existingCollection){
            throw "collection exists"
        }
        const collection = new Collection({
            userId: user._id,
            playlistId,
        })
        await collection.save()
        res.send("OK")
    } catch (err) {
        res.status(400).send(err)
    }
})

app.delete("/discard/:playlistId", auth, async (req, res) => {
    const {playlistId} = req.params
    const {user} = req

    try {
        const playlist = await Playlist.findById(playlistId)
        if(!playlist || playlist.userId === user._id){
            throw "playlist invalid"
        }
        await Collection.deleteOne({userId: user._id, playlistId})
        res.send("OK")
    } catch (err) {
        res.status(400).send(err)
    }
})

module.exports = app
