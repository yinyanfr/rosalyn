import { Schema, model, ObjectId, Document, Model } from "mongoose"

export interface ITaste extends Document {
    userId: ObjectId
    musicId: ObjectId
    favor: boolean
}

export interface ITasteModel extends Model<ITaste> {
    toggle(userId: ObjectId, musicId: ObjectId, favor: boolean): Promise<void>
}

const TasteSchema = new Schema<ITaste, ITasteModel>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    musicId: {
        type: Schema.Types.ObjectId,
        ref: "Music"
    },

    favor: {
        type: Boolean,
        default: true
    }
})

TasteSchema.statics.toggle = async function (userId, musicId, favor) {
    const Taste = this
    const taste = await Taste.findOne({ userId, musicId })
    if (taste) {
        if (favor === taste.favor) {
            await Taste.deleteOne({ _id: taste._id })
        }
        else {
            taste.favor = favor
            await taste.save()
        }
    }
    else {
        await Taste.create({ userId, musicId, favor })
    }
}

export default model<ITaste, ITasteModel>("Taste", TasteSchema)
