import { model, ObjectId, Schema } from "mongoose"

export interface ICollection extends Document {
    userId: ObjectId
    playlistId: ObjectId
}

const CollectionSchema = new Schema<ICollection>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    playlistId: {
        type: Schema.Types.ObjectId,
        ref: "Playlist"
    }
})

export default model<ICollection>("Favor", CollectionSchema)
