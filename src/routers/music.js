const express = require("express")
const Music = require("../models/Music")
const Taste = require("../models/Taste")
const Playlist = require("../models/Playlist")
const Review = require("../models/Review")
const authOpt = require("../middlewares/auth-opt")
const multer = require("multer")
const {upload_destination} = require("../config/general.json")
const authRank = require("../middlewares/auth-rank")
const User = require("../models/User")
const Share = require("../models/Share")

const app = express.Router()
const auth = authOpt()
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, upload_destination)
    },
    filename: (req, file, cb) => {
        cb(null, file.filename)
    }
})
const upload = multer({dest: upload_destination})

// app.post("/upload", [auth, upload.array("music", 100)], async (req, res) => {
//     const {user, files} = req
//     try {
//         await Music.addMany(files.map(e => e.path), user._id)
//     } catch (err) {
//         res.status(400).send(err)
//     }
// })

app.delete("/remove", authRank("Moderator"), async (req, res) => {
    const {musicId} = req.body
    try {
        await Music.findByIdAndDelete(musicId)
        res.send("OK")
    } catch (err) {
        res.status(400).send(err)
    }
})

app.get("/info/:musicId", auth, async (req, res) => {
    const {musicId} = req.params
    try {
        const music = await Music.findById(music)
        if(!music){
            throw "music not found"
        }
        res.send(music)
    } catch (err) {
        res.status(400).send(err)
    }
})

app.get("/download/:token/:musicId", async (req, res) => {
    const {musicId, token} = req.params
    try {
        const user = await User.findByToken(token)
        if(!user) throw "Unauthorized"
        const music = await Music.findById(musicId)
        if(!music){
            throw "music not found"
        }
        res.sendFile(music.path)
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

app.get("/all", auth, async (req, res) => {
    try {
        // FIXME: this aggregation
        const music = await Music.aggregate([
            {
                "$project": {
                    _id: 1,
                    path: 1,
                    title: 1,
                    album: 1,
                    artists: 1,
                    artist: 1,
                    duration: 1,
                    tags: 1,
                    userId: 1,
                    libraryId: 1,
                    lyrics: 1,
                    picture: "$thumbnail"
                }
            }
        ])
        res.send(music)
    } catch (err) {
        res.status(400).send(err)
    }
})

app.get("/precise", auth, async (req, res) => {
    const {album, artist} = req.query
    const query = {}
    if(album) query.album = album
    if(artist) query.artist = artist
    try {
        const music = await Music.find(query)
        res.send(music)
    } catch (err) {
        res.status(400).send(err)
    }
})

app.get("/sample/:size", auth, async (req, res) => {
    const {size} = req.params
    const {user} = req

    try {
        const dislikes = await Taste.find({
            userId: user._id,
            favor: false,
        })
        const sample = await Music.sample(parseInt(size), dislikes.map(e => e.musicId))
        res.send(sample)
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

app.post("/taste", auth, async (req, res) => {
    const {musicId, favor} = req.body
    const {user} = req
    try {
        await Taste.toggle(user._id, musicId, favor)
        res.send({musicId})
    } catch (err) {
        res.status(400).send(err)
    }
})

app.get("/favorite", auth, async (req, res) => {
    const {user} = req
    try {
        const data = await Taste.find({
            userId: user.id,
            favor: true,
        })
        res.send(data.map(e => e.musicId))
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
        res.send({musicId, playlistId})
    } catch (err) {
        res.status(400).send(err)
    }
})

app.delete("/remove_from_playlist", auth, async (req, res) => {
    const {musicId, playlistId} = req.body
    const {user} = req
    try {
        const playlist = await Playlist.findOne({_id: playlistId, userId: user._id})
        if(!playlist){
            throw "playlist not found, or auth failed"
        }
        await playlist.removeMusic(musicId)
        res.send({musicId, playlistId})
    } catch (err) {
        res.status(400).send(err)
    }
})

app.post("/review", auth, async (req, res) => {
    const {user} = req
    const {value, musicId, album, artist, comment} = req.body
    const query = {musicId, album, artist}
    const filter = {}
    for (let key in query){
        if(query[key]){
            filter[key] = query[key]
            return 0
        }
    }
    try {
        if(Object.keys(filter).length !== 1){
            throw "query invalid"
        }
        const existingReview = await Review.findOne({...filter, userId: user._id})
        if(existingReview){
            if(value) existingReview.value = value
            if(comment) existingReview.comment = comment
            await existingReview.save()
        }
        else {
            const review = new Review({
                userId: user._id,
                ...filter,
            })
            if(value) review.value = value
            if(comment) review.comment = comment
            await review.save()
        }
        res.send("OK")
    } catch (err) {
        res.status(400).send(err)
    }
})

app.delete("/review", auth, async (req, res) => {
    const {user} = req
    const {reviewId} = req.body
    
    try {
        await Review.findOneAndDelete({
            userId: user._id,
            _id: reviewId,
        })
        res.send("OK")
    } catch (err) {
        res.status(400).send(err)
    }
})

app.post("/share", auth, async (req, res) => {
    const {musicId} = req.body
    const {user} = req
    const userId = user._id

    try {
        const shared = await Share.findOne({musicId, userId})
        if(shared){
            res.send({
                shareId: shared._id
            })
        }
        else {
            const share = new Share({musicId, userId})
            await share.save()
            res.send({
                shareId: share._id
            })
        }
    } catch (err) {
        res.status(400).send(err)
    }
})

app.get("/share/:shareId", async (req, res) => {
    const {shareId} = req.params
    try {
        const music = await Share.getMusic(shareId)
        res.send(music)
    } catch (err) {
        res.status(400).send(err)
    }
})

app.get("/shared_file/:shareId", async (req, res) => {
    const {shareId} = req.params
    try {
        const music = await Share.getMusic(shareId)
        res.sendFile(music.path)
    } catch (err) {
        res.status(400).send(err)
    }
})

module.exports = app
