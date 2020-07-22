const mongoose = require("mongoose")
const Taste = require("./Taste")

const PlaylistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    music: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Music"
    }],

    title: {
        type: String,
        required: true
    },

    description: String,

    tags: [String],
})

PlaylistSchema.statics.favorite = async function(userId){
    const music = await Taste.aggregate([
        {
            "$match": {
                userId,
                favor: true
            },
            "$lookup": {
                from: "Music",
                localField: "musicId",
                foreignField: "_id",
                as: "music_info"
            },
        }
    ])

    return ({
        userId,
        music,
        title: "My Favorite"
    })
}

PlaylistSchema.statics.populateMusic = async function(playlistId){
    const Playlist = this
    const playlists = await Playlist.aggregate([
        {
            "$match": {
                _id: playlistId
            }
        },
        {
            "$limit": 1
        },
        {
            "$lookup": {
                from: "Music",
                localField: "musicId",
                foreignField: "_id",
                as: "music_info"
            },
        }
    ])

    return playlists[0]
}

PlaylistSchema.methods.add = function(musicId){
    const playlist = this
    const index = playlist.music.indexOf(musicId)
    if(index === -1){
        playlist.music.push(musicId)
    }
    return playlist.save()
}

PlaylistSchema.methods.removeMusic = function(musicId){
    const playlist = this
    const index = playlist.music.indexOf(musicId)
    if(index > -1){
        playlist.music.splice(index, 1)
    }
    return playlist.save()
}

module.exports = mongoose.model("Playlist", PlaylistSchema)
