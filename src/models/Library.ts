import { ObjectId, Schema, model, Document, Model } from "mongoose"
import Music from "./Music"
import StringObjectId from "bson-objectid"
import { musicScanDir } from "../tools/music-scan-dir"
import { basename, resolve } from "path"

export interface ILibrary extends Document {
    path: string
    rec: boolean
    userId: ObjectId
    name: string
    description: string
    lastModified: number
    count(libraryId: ObjectId): number
    _doc: any // campatibility
}

export interface ILibraryModel extends Model<ILibrary> {
    addDir(param:
        {
            path: string, rec: boolean, userId?: ObjectId,
            name?: string, description?: string,
        }
    ): Promise<void>
    removeDir(libraryId: ObjectId): Promise<void>
}

const LibrarySchema = new Schema<ILibrary, ILibraryModel>({
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
        type: Schema.Types.ObjectId,
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

LibrarySchema.statics.addDir = async function (
    { path, rec, userId, name, description }
        : {
            path: string, rec: boolean, userId: ObjectId,
            name: string, description: string,
        }
) {
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

    return musicScanDir(dir, userId, libraryId, rec)
}

LibrarySchema.statics.removeDir = async function (libraryId: ObjectId) {
    const Library = this
    await Music.removeDir(libraryId)
    return Library.deleteOne({ _id: libraryId })
}

LibrarySchema.methods.count = async function (libraryId: string) {
    const library = this
    const res = await Music.aggregate([
        {
            $project: {
                libraryId: 1
            },
        },
        {
            $match: {
                libraryId: new StringObjectId(libraryId)
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

export default model<ILibrary, ILibraryModel>("Library", LibrarySchema)
