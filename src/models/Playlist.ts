import { Schema, model, Document, ObjectId, Model } from "mongoose"
import Taste from "./Taste"

export interface IPlaylist extends Document {
    userId: ObjectId
    music: ObjectId[]
    title: string
    description: string
    tags: string[]
    add(musicId: ObjectId): Promise<void>
    removeMusic(musicId: ObjectId): Promise<void>
}

export interface IPlaylistModel extends Model<IPlaylist> {
    favorite(userId: ObjectId): Promise<void>
    populateMusic(playlistId: ObjectId): Promise<void>
}

const PlaylistSchema = new Schema<IPlaylist, IPlaylistModel>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    music: [{
        type: Schema.Types.ObjectId,
        ref: "Music"
    }],

    title: {
        type: String,
        required: true
    },

    description: String,

    tags: [String],
})

PlaylistSchema.statics.favorite = async function (userId) {
    const music = await Taste.aggregate([
        {
            "$match": {
                userId,
                favor: true
            },
            "$lookup": {
                from: "Music",
                localField: "musicId",
                foreignField: "_id",
                as: "music_info"
            },
        }
    ])

    return ({
        userId,
        music,
        title: "My Favorite"
    })
}

PlaylistSchema.statics.populateMusic = async function (playlistId) {
    const Playlist = this
    const playlists = await Playlist.aggregate([
        {
            "$match": {
                _id: playlistId
            }
        },
        {
            "$limit": 1
        },
        {
            "$lookup": {
                from: "Music",
                localField: "musicId",
                foreignField: "_id",
                as: "music_info"
            },
        }
    ])

    return playlists[0]
}

PlaylistSchema.methods.add = function (musicId) {
    const playlist = this
    const index = playlist.music.indexOf(musicId)
    if (index === -1) {
        playlist.music.push(musicId)
    }
    return playlist.save()
}

PlaylistSchema.methods.removeMusic = function (musicId) {
    const playlist = this
    const index = playlist.music.indexOf(musicId)
    if (index > -1) {
        playlist.music.splice(index, 1)
    }
    return playlist.save()
}

export default model<IPlaylist, IPlaylistModel>("Playlist", PlaylistSchema)
