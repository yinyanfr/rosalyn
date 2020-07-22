const mongoose = require("mongoose")

const CollectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    playlistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist"
    }
})

module.exports = mongoose.model("Favor", CollectionSchema)
