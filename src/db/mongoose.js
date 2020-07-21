const mongoose = require("mongoose")
const {uri, options} = require("../config/database.json")

mongoose.Promise = global.Promise

mongoose.connect(uri, options)
