const mongoose = require("mongoose")
const validator = require("validator")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { salt } = require("../config/auth.json")
const ranks = require("../config/rank")

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: "{VALUE} is not a valid email"
        }
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    username: {
        type: String,
        trim: true,
        default: "Anonymous"
    },

    rank: {
        type: String,
        default: "User"
    },

    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

UserSchema.methods.toJSON = function () {
    var user = this
    const {
        _id, email, username
    } = user.toObject()
    return {_id, email, username}
}

UserSchema.methods.generateToken = function (access) {
    var user = this
    access = access || "auth"
    const token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, salt).toString()
    user.tokens.push({ access, token })
    return user.save().then(() => token)
}

UserSchema.methods.removeToken = function (token) {
    var user = this
    return user.updateOne({
        $pull: {
            tokens: { token }
        }
    })
}

UserSchema.methods.cleanToken = function (token) {
    var user = this
    user.tokens = []
    return user.save()
}

UserSchema.statics.findByToken = function (token, mild) {
    var User = this
    var decoded

    try {
        decoded = jwt.verify(token, salt)
    }
    catch (err) {
        if(!mild){
            return Promise.reject()
        }
        return Promise.resolve()
    }

    return User.findOne({
        "_id": decoded._id,
        "tokens.token": token
    })
}

UserSchema.statics.findByInfo = function (email, password) {
    var User = this

    return User.findOne({ email })
        .then(user => {
            if (!user) return Promise.reject("User not found")

            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    if (res) resolve(user)
                    else reject("Wrong password")
                })
            })
        })
}

UserSchema.methods.outrank = function (rank) {
    const user = this
    return ranks.indexOf(user.rank) >= ranks.indexOf(rank)
}

UserSchema.pre("save", function (next) {
    var user = this
    if (user.isModified("password")) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash
                user.tokens = []
                next()
            })
        })
    }
    else next()
})

module.exports = mongoose.model("User", UserSchema)
