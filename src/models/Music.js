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
            type: {type: String},
            description: String,
            data: String,
        }
    ],

    tags: [String],

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    libraryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
})

MusicSchema.statics.addDir = async function(path, rec, libraryId){
    const Music = this
    const scanned = await musicScanDir(path, rec)
    const music = scanned.map(e => ({...e, libraryId}))
    return Music.insertMany(music)
}

MusicSchema.statics.removeDir = function(libraryId){
    const Music = this
    return Music.deleteMany({libraryId})
}

MusicSchema.statics.sample = function(size){
    const Music = this
    return Music.aggregate([{
        "$sample": {
            "$size": size
        }
    }])
}

module.exports = mongoose.model("Music", MusicSchema)
