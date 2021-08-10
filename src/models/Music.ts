import { Document, Model, ObjectId, Schema, model } from "mongoose"

export interface IImage {
    format?: string
    type?: string
    description: string
    data?: string
}

export interface IMusic extends Document {
    path: string
    title: string
    album: string
    artists: string[]
    artist: string
    picture: IImage[]
    thumbnail: IImage[]
    duration: number
    tags: string[]
    userId: ObjectId
    libraryId: ObjectId
    lyrics: string[]
}

export interface IMusicModel extends Model<IMusic> {
    removeDir(libraryId: ObjectId): Promise<void>
    sample(size: number, dislikeList: ObjectId[]): Promise<IMusic>
}

const MusicSchema = new Schema<IMusic, IMusicModel>({
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
            type: { type: String },
            description: String,
            data: String,
        }
    ],
    thumbnail: [
        {
            format: String,
            type: { type: String },
            description: String,
            data: String,
        }
    ],

    duration: Number,

    tags: [String],

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    libraryId: {
        type: Schema.Types.ObjectId,
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

MusicSchema.statics.removeDir = function (libraryId) {
    const Music = this
    return Music.deleteMany({ libraryId })
}

MusicSchema.statics.sample = function (size, dislikeList) {
    const Music = this
    if (dislikeList && dislikeList.length) {
        return Music.aggregate([
            {
                $match: {
                    _id: { $nin: dislikeList }
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

export default model<IMusic, IMusicModel>("Music", MusicSchema)
