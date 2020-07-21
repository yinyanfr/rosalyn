const mongoose = require("mongoose")

const PlaylistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    music: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Music"
    },

    title: {
        type: String,
        required: true
    },

    description: String,

    tags: [String],

    favorate: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("Playlist", PlaylistSchema)
