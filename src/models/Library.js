const mongoose = require("mongoose")
const Music = require("./Music")
const ObjectId = require("bson-objectid")

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
    },

    description: String,

    lastModified: {
        type: Date,
        default: Date.now
    }
})

LibrarySchema.statics.addDir = async function ({ path, rec, userId, name, description }) {
    const Library = this
    const library = await Library.findOne({ path })
    let libraryId
    if (library) {
        libraryId = library._id
        library.lastModified = Date.now()
        await library.save()
    }
    else {
        const { _id } = await Library.create({
            path, rec, userId,
            name: name ? name : path,
            description,
        })
        libraryId = _id
    }

    await Music.removeDir(libraryId)

    return Music.addDir(path, rec, userId, libraryId)
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

    console.log(res)

    return res[0].libraryId
}

module.exports = mongoose.model("Library", LibrarySchema)
