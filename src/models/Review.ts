import { Schema, model, Document, ObjectId } from "mongoose"

export interface IReview extends Document {
    userId: ObjectId
    musicId: ObjectId
    album: string
    artist: string
    value: number
    comment: string
}


const ReviewSchema = new Schema<IReview>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    musicId: {
        type: Schema.Types.ObjectId,
        ref: "Music"
    },

    album: String,
    artist: String,

    value: {
        type: Number,
        default: 0
    },

    comment: String,
})

export default model<IReview>("Review", ReviewSchema)
