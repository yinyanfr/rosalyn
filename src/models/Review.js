const mongoose = require("mongoose")

const ReviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    musicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Music"
    },

    album: String,
    artist: String,
})

module.exports = mongoose.model("Review", ReviewSchema)
