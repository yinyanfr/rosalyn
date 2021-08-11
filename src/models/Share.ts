import { Document, Schema, ObjectId, Model, model } from "mongoose"
import Music, { IMusic } from "./Music"

export interface IShare extends Document {
    musicId: ObjectId
    userId: ObjectId
    timeShared: number
}

export interface IShareModel extends Model<IShare> {
    getMusic(shareId: ObjectId): Promise<IMusic>
}

const ShareSchema = new Schema<IShare, IShareModel>({
    musicId: {
        type: Schema.Types.ObjectId,
        ref: "Music"
    },

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    timeShared: {
        type: Number,
        default: 0,
    }
})

ShareSchema.statics.getMusic = async function (shareId) {
    const Share = this
    const share = await Share.findById(shareId)
    if (!share) {
        throw "share not found"
    }
    const { musicId } = share
    const music = await Music.findById(musicId)
    if (!music) {
        throw "Music not find"
    }
    return music
}

export default model<IShare, IShareModel>("Share", ShareSchema)
