const mongoose = require("mongoose")

const MusicSchema = new mongoose.Schema({
    path: {
        required: true,
        type: String
    },
    title: String,
    album: String,
    artists: [String],
    artist: String,
    picture: [
        {
            format: String,
            type: String,
            description: String,
            data: String,
        }
    ],

    tags: [String],

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

module.exports = mongoose.model("Music", MusicSchema)
