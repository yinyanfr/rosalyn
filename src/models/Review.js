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

    value: {
        type: Number,
        default: 0
    },

    comment: String,
})

module.exports = mongoose.model("Review", ReviewSchema)
