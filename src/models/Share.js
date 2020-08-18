const mongoose = require("mongoose")
const Music = require("./Music")

const ShareSchema = new mongoose.Schema({
    musicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Music"
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },  

    timeShared: {
        type: Number,
        default: 0,
    }
})

ShareSchema.statics.getMusic = async function(shareId) {
    const Share = this
    const share = await Share.findById(shareId)
    if(!share){
        throw "share not found"
    }
    const {musicId} = share
    const music = await Music.findById(musicId)
    if(!music){
        throw "Music not find"
    }
    return music
}

module.exports = mongoose.model("Share", ShareSchema)
