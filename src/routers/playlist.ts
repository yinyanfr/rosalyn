import express from "express"
import { authOpt } from "../middlewares"
import { Collection, Playlist } from "../models"

const app = express()
const auth = authOpt()

app.post("/add", auth, async (req, res) => {
    const { title, description, tags } = req.body
    const user = req.user!
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

app.delete("/remove", auth, async (req, res) => {
    const { playlistId } = req.body
    const user = req.user!
    try {
        await Playlist.deleteOne({ userId: user._id, _id: playlistId })
        res.send("OK")
    } catch (err) {
        res.status(400).send(err)
    }
})

app.get("/get/:playlistId", auth, async (req, res) => {
    const { playlistId } = req.params
    try {
        const playlist = await Playlist.populateMusic(<any>playlistId)
        res.send(playlist)
    } catch (err) {
        res.status(400).send(err)
    }
})

app.post("/collect/:playlistId", auth, async (req, res) => {
    const { playlistId } = req.params
    const user = req.user!

    try {
        const playlist = await Playlist.findById(playlistId)
        if (!playlist || playlist.userId === user._id) {
            throw "playlist invalid"
        }
        const existingCollection = await Collection.findOne(<any>{ userId: user._id, playlistId })
        if (existingCollection) {
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
    const { playlistId } = req.params
    const user = req.user!

    try {
        const playlist = await Playlist.findById(playlistId)
        if (!playlist || playlist.userId === user._id) {
            throw "playlist invalid"
        }
        await Collection.deleteOne(<any>{ userId: user._id, playlistId })
        res.send("OK")
    } catch (err) {
        res.status(400).send(err)
    }
})

export default app
