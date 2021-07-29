const mongoose = require("mongoose")
const {uri, options, testdb} = require("../config/database.json")

mongoose.Promise = global.Promise

if (process.env.NODE_ENV === "test") {
    mongoose.connect(testdb, options)
} else {
    mongoose.connect(uri, options)
}

module.exports = mongoose
