const mongoose = require("mongoose")

const TasteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    musicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Music"
    },

    favor: {
        type: Boolean,
        default: true
    }
})

TasteSchema.statics.toggle = async function(userId, musicId, favor){
    const Taste = this
    const taste = await Taste.findOne({userId, musicId})
    if(taste){
        if(favor === taste.favor){
            await Taste.deleteOne({_id: taste._id})
        }
        else {
            taste.favor = favor
            await taste.save()
        }
    }
    else {
        await Taste.create({userId, musicId, favor})
    }
}

module.exports = mongoose.model("Taste", TasteSchema)
