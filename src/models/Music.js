const mongoose = require("mongoose")

const MusicSchema = new mongoose.Schema({
    path: {
        required: true,
        type: String,
        unique: true
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
    thumbnail: [
        {
            format: String,
            type: {type: String},
            description: String,
            data: String,
        }
    ],

    duration: Number,

    tags: [String],

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    libraryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    lyrics: [String]
})

// MusicSchema.statics.addMany = async function(paths, userId){
//     const Music = this
//     const scanned = await scanList(paths)
//     const music = scanned.map(e => ({...e, userId}))
//     return Music.insertMany(music)
// }

MusicSchema.statics.removeDir = function(libraryId){
    const Music = this
    return Music.deleteMany({libraryId})
}

MusicSchema.statics.sample = function(size, dislikeList){
    const Music = this
    if (dislikeList && dislikeList.length) {
        return Music.aggregate([
            {
                $match: {
                    _id: {$nin: dislikeList}
                }
            },
            {
                "$sample": {
                    "size": size
                }
            },
        ])
    }
    else {
        return Music.aggregate([{
            "$sample": {
                "size": size
            }
        }])
    }
}

module.exports = mongoose.model("Music", MusicSchema)
