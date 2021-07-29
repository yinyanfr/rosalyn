const mongoose = require("mongoose")
const Music = require("./Music")
const ObjectId = require("bson-objectid")
const { musicScanDir } = require("../tools/music-scan-dir")
const {basename, resolve} = require("path")

const LibrarySchema = new mongoose.Schema({
    path: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },

    rec: {
        type: Boolean,
        default: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    name: {
        type: String,
        default: "My Music"
    },

    description: String,

    lastModified: {
        type: Date,
        default: Date.now
    }
})

LibrarySchema.statics.addDir = async function ({ path, rec, userId, name, description }) {
    const Library = this
    const dir = resolve(path)
    const library = await Library.findOne({ path: dir })
    let libraryId
    if (library) {
        libraryId = library._id
        library.lastModified = Date.now()
        await library.save()
    }
    else {
        const { _id } = await Library.create({
            path: dir, rec, userId,
            name: name ? name : basename(dir),
            description,
        })
        libraryId = _id
    }

    return musicScanDir(dir, rec, userId, libraryId)
}

LibrarySchema.statics.removeDir = async function (libraryId) {
    const Library = this
    await Music.removeDir(libraryId)
    return Library.deleteOne({ _id: libraryId })
}

LibrarySchema.methods.count = async function (libraryId) {
    const library = this
    const res = await Music.aggregate([
        {
            $project: {
                libraryId: 1
            },
        },
        {
            $match: {
                libraryId: ObjectId(libraryId)
            }
        },
        {
            $count: "libraryId" // and this is a number
        }
    ])

    if (res[0]) {
        return res[0].libraryId
    }
    return 0
}

module.exports = mongoose.model("Library", LibrarySchema)
