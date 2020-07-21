const mongoose = require("mongoose")
const musicScanDir = require("../tools/music_scan_dir")

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

MusicSchema.statics.addDir = async function(path){
    const Music = this
    const scanned = await musicScanDir(path)
    return Music.insertMany(scanned)
}

module.exports = mongoose.model("Music", MusicSchema)
